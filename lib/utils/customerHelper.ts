import { Customer, Order, Restaurant, Branch, SavedAddress, CustomerTimelineItem } from "@/types";

export interface RestaurantCustomerAnalytics {
  restaurantId: string;
  restaurantName: string;
  branchId: string;
  branchName: string;
  orderCount: number;
  totalRevenue: number;
  lastOrderDate: string;
}

export interface EnrichedCustomer extends Customer {
  profileImage: string;
  registeredDate: string;
  currentSavedAddress: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  status: "ACTIVE" | "INACTIVE";
  assignedRestaurantCount: number;
  avgOrderValue: number;
  highestOrderValue: number;
  cancelledOrdersCount: number;
  completedOrdersCount: number;
  firstOrderDate: string;
  customerOrders: Order[];
  restaurantAnalytics: RestaurantCustomerAnalytics[];
  savedAddresses: SavedAddress[];
  timeline: CustomerTimelineItem[];
}

export interface CustomerFilters {
  searchQuery: string;
  city: string;
  state: string;
  status: "ALL" | "ACTIVE" | "INACTIVE";
  registrationDateRange: "ALL" | "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR";
  restaurantId: string;
  minRevenue: string;
  maxRevenue: string;
  minOrders: string;
  maxOrders: string;
}

/**
 * Extracts city, state, and pincode from address string if available
 */
export function parseAddressComponents(addressStr: string) {
  let city = "Kanpur";
  let state = "Uttar Pradesh";
  let pincode = "208001";

  if (!addressStr) {
    return { city, state, pincode };
  }

  const pinMatch = addressStr.match(/\b\d{6}\b/);
  if (pinMatch) {
    pincode = pinMatch[0];
  }

  const lower = addressStr.toLowerCase();
  if (lower.includes("kanpur")) city = "Kanpur";
  else if (lower.includes("lucknow")) city = "Lucknow";
  else if (lower.includes("noida")) city = "Noida";
  else if (lower.includes("delhi")) city = "New Delhi";
  else if (lower.includes("mumbai")) city = "Mumbai";
  else if (lower.includes("bengaluru") || lower.includes("bangalore")) city = "Bengaluru";

  if (lower.includes("uttar pradesh") || lower.includes("up")) state = "Uttar Pradesh";
  else if (lower.includes("delhi")) state = "Delhi";
  else if (lower.includes("maharashtra")) state = "Maharashtra";
  else if (lower.includes("karnataka")) state = "Karnataka";

  return { city, state, pincode };
}

/**
 * Enrich customer objects by combining Firestore customer/user collections & Firestore orders
 */
export function enrichCustomers(
  rawCustomers: Customer[],
  rawOrders: Order[],
  restaurants: Restaurant[],
  branches: Branch[]
): EnrichedCustomer[] {
  const restMap = new Map<string, string>();
  restaurants.forEach((r) => restMap.set(r.id, r.name || r.restaurantName || "Restaurant"));

  const branchMap = new Map<string, { name: string; restId: string; restName: string }>();
  branches.forEach((b) =>
    branchMap.set(b.id, {
      name: b.name || b.branchName || "Branch",
      restId: b.restaurantId,
      restName: b.restaurantName || restMap.get(b.restaurantId) || "Restaurant"
    })
  );

  const ordersByCustomerKey = new Map<string, Order[]>();

  rawOrders.forEach((ord) => {
    const keyPhone = ord.customerPhone ? ord.customerPhone.trim().replace(/\s+/g, "") : "";
    const keyName = ord.customerName ? ord.customerName.trim().toLowerCase() : "";

    const keysToAssociate: string[] = [];
    if (keyPhone) keysToAssociate.push(`phone:${keyPhone}`);
    if (keyName) keysToAssociate.push(`name:${keyName}`);

    keysToAssociate.forEach((key) => {
      const existing = ordersByCustomerKey.get(key) || [];
      existing.push(ord);
      ordersByCustomerKey.set(key, existing);
    });
  });

  const enrichedList: EnrichedCustomer[] = [];

  const processSingleCustomer = (
    c: Partial<Customer> & { id: string; name: string; phone?: string }
  ): EnrichedCustomer => {
    const phoneKey = c.phone ? `phone:${c.phone.trim().replace(/\s+/g, "")}` : "";
    const nameKey = c.name ? `name:${c.name.trim().toLowerCase()}` : "";

    const orderSet = new Map<string, Order>();
    if (phoneKey && ordersByCustomerKey.has(phoneKey)) {
      ordersByCustomerKey.get(phoneKey)!.forEach((o) => orderSet.set(o.id, o));
    }
    if (nameKey && ordersByCustomerKey.has(nameKey)) {
      ordersByCustomerKey.get(nameKey)!.forEach((o) => orderSet.set(o.id, o));
    }

    const customerOrders = Array.from(orderSet.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    const totalOrdersCount = customerOrders.length > 0 ? customerOrders.length : c.totalOrders || 0;
    
    let totalSpent = 0;
    let highestOrderValue = 0;
    let cancelledOrdersCount = 0;
    let completedOrdersCount = 0;

    customerOrders.forEach((o) => {
      const amt = Number(o.totalAmount || 0);
      if (o.status !== "CANCELLED" && o.status !== "REJECTED") {
        totalSpent += amt;
      }
      if (amt > highestOrderValue) highestOrderValue = amt;
      if (o.status === "DELIVERED") completedOrdersCount++;
      if (o.status === "CANCELLED" || o.status === "REJECTED") cancelledOrdersCount++;
    });

    if (totalSpent === 0 && c.totalSpent) {
      totalSpent = c.totalSpent;
    }

    const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalSpent / totalOrdersCount) : 0;

    const lastOrderDate =
      customerOrders.length > 0
        ? customerOrders[0].createdAt
        : c.lastOrderDate || new Date(Date.now() - 86400000 * 5).toISOString();

    const firstOrderDate =
      customerOrders.length > 0
        ? customerOrders[customerOrders.length - 1].createdAt
        : c.registeredDate || c.createdAt || new Date(Date.now() - 86400000 * 90).toISOString();

    const registeredDate = c.registeredDate || c.createdAt || firstOrderDate;

    // Address extraction
    const addressList: SavedAddress[] = [];
    const seenAddrStr = new Set<string>();

    if (c.savedAddresses && Array.isArray(c.savedAddresses)) {
      c.savedAddresses.forEach((sa) => {
        if (sa.fullAddress && !seenAddrStr.has(sa.fullAddress)) {
          seenAddrStr.add(sa.fullAddress);
          addressList.push({
            id: sa.id || `addr-${Math.random().toString(36).substring(2, 7)}`,
            label: sa.label || "Saved Address",
            fullAddress: sa.fullAddress,
            city: sa.city || parseAddressComponents(sa.fullAddress).city,
            state: sa.state || parseAddressComponents(sa.fullAddress).state,
            pincode: sa.pincode || parseAddressComponents(sa.fullAddress).pincode,
            latitude: sa.latitude || 26.4499,
            longitude: sa.longitude || 80.3319,
            isDefault: sa.isDefault ?? addressList.length === 0
          });
        }
      });
    }

    customerOrders.forEach((ord, idx) => {
      if (ord.customerAddress && !seenAddrStr.has(ord.customerAddress) && !ord.customerAddress.toLowerCase().includes("dine in")) {
        seenAddrStr.add(ord.customerAddress);
        const parsed = parseAddressComponents(ord.customerAddress);
        addressList.push({
          id: `ord-addr-${ord.id}`,
          label: idx === 0 ? "Current Address" : `Address #${addressList.length + 1}`,
          fullAddress: ord.customerAddress,
          city: parsed.city,
          state: parsed.state,
          pincode: parsed.pincode,
          latitude: 26.4499 + (addressList.length * 0.005),
          longitude: 80.3319 + (addressList.length * 0.004),
          isDefault: addressList.length === 0
        });
      }
    });

    if (addressList.length === 0) {
      const defaultAddrStr = c.address || c.currentSavedAddress || "Flat 402, Green Valley, Civil Lines, Kanpur, Uttar Pradesh 208001";
      const parsed = parseAddressComponents(defaultAddrStr);
      addressList.push({
        id: "addr-default",
        label: "Primary Home",
        fullAddress: defaultAddrStr,
        city: c.city || parsed.city,
        state: c.state || parsed.state,
        pincode: c.pincode || parsed.pincode,
        latitude: c.latitude || 26.4499,
        longitude: c.longitude || 80.3319,
        isDefault: true
      });
    }

    const currentAddressObj = addressList.find((a) => a.isDefault) || addressList[0];
    const currentSavedAddress = currentAddressObj.fullAddress;
    const city = c.city || currentAddressObj.city || "Kanpur";
    const state = c.state || currentAddressObj.state || "Uttar Pradesh";
    const pincode = c.pincode || currentAddressObj.pincode || "208001";
    const latitude = c.latitude || currentAddressObj.latitude || 26.4499;
    const longitude = c.longitude || currentAddressObj.longitude || 80.3319;

    // Restaurant breakdown analytics
    const restBreakdownMap = new Map<string, RestaurantCustomerAnalytics>();
    customerOrders.forEach((o) => {
      const rId = o.restaurantId || "rest-1";
      const bId = o.branchId || "branch-1";
      const key = `${rId}_${bId}`;

      const rName = restMap.get(rId) || o.branchName || "Spicy Kingdom Gourmet";
      const bInfo = branchMap.get(bId);
      const bName = o.branchName || bInfo?.name || "Main Branch";

      const existing = restBreakdownMap.get(key) || {
        restaurantId: rId,
        restaurantName: rName,
        branchId: bId,
        branchName: bName,
        orderCount: 0,
        totalRevenue: 0,
        lastOrderDate: o.createdAt
      };

      existing.orderCount += 1;
      if (o.status !== "CANCELLED" && o.status !== "REJECTED") {
        existing.totalRevenue += o.totalAmount || 0;
      }
      if (new Date(o.createdAt).getTime() > new Date(existing.lastOrderDate).getTime()) {
        existing.lastOrderDate = o.createdAt;
      }

      restBreakdownMap.set(key, existing);
    });

    const restaurantAnalytics = Array.from(restBreakdownMap.values());
    const distinctRestaurants = new Set(restaurantAnalytics.map((r) => r.restaurantId));
    const assignedRestaurantCount = distinctRestaurants.size > 0 ? distinctRestaurants.size : 1;

    // Timeline events creation
    const timeline: CustomerTimelineItem[] = [];
    
    timeline.push({
      id: `tl-reg-${c.id}`,
      title: "Account Registered",
      description: "Customer completed account registration",
      timestamp: registeredDate,
      type: "REGISTRATION"
    });

    if (customerOrders.length > 0) {
      const firstOrd = customerOrders[customerOrders.length - 1];
      timeline.push({
        id: `tl-first-${firstOrd.id}`,
        title: "Placed First Order",
        description: `Order #${firstOrd.orderNumber || firstOrd.id} at ${firstOrd.branchName || 'Branch'}`,
        timestamp: firstOrd.createdAt,
        type: "FIRST_ORDER"
      });
    }

    if (addressList.length > 1) {
      timeline.push({
        id: `tl-addr-${c.id}`,
        title: "Saved Delivery Address",
        description: `Added "${addressList[0].fullAddress.substring(0, 35)}..."`,
        timestamp: new Date(new Date(registeredDate).getTime() + 86400000 * 2).toISOString(),
        type: "ADDRESS_UPDATE"
      });
    }

    if (customerOrders.length > 1) {
      const latestOrd = customerOrders[0];
      timeline.push({
        id: `tl-latest-${latestOrd.id}`,
        title: "Recent Order Activity",
        description: `Placed order #${latestOrd.orderNumber || latestOrd.id} (₹${latestOrd.totalAmount})`,
        timestamp: latestOrd.createdAt,
        type: "LATEST_ORDER"
      });
    }

    timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const daysSinceLastOrder = (Date.now() - new Date(lastOrderDate).getTime()) / (1000 * 3600 * 24);
    const status: "ACTIVE" | "INACTIVE" = c.status || (daysSinceLastOrder <= 90 ? "ACTIVE" : "INACTIVE");

    // Profile photo evaluation
    let rawPhotoUrl =
      c.profileImage ||
      c.avatar ||
      (c as any).photoUrl ||
      (c as any).photo ||
      (c as any).image ||
      (c as any).profilePic ||
      "";

    // If order has photo, use it as fallback
    if (!rawPhotoUrl && customerOrders.length > 0) {
      const orderWithPhoto = customerOrders.find((o) => (o as any).customerPhoto || (o as any).photoUrl);
      if (orderWithPhoto) {
        rawPhotoUrl = (orderWithPhoto as any).customerPhoto || (orderWithPhoto as any).photoUrl || "";
      }
    }

    const profileImage = rawPhotoUrl;

    return {
      id: c.id,
      name: c.name || "Customer Name",
      email: c.email || "",
      phone: c.phone || "+91 90000 00000",
      totalOrders: totalOrdersCount,
      totalSpent,
      lastOrderDate,
      firstOrderDate,
      branchId: c.branchId,
      profileImage,
      registeredDate,
      currentSavedAddress,
      city,
      state,
      pincode,
      latitude,
      longitude,
      status,
      assignedRestaurantCount,
      avgOrderValue,
      highestOrderValue,
      cancelledOrdersCount,
      completedOrdersCount,
      customerOrders,
      restaurantAnalytics,
      savedAddresses: addressList,
      timeline
    };
  };

  rawCustomers.forEach((c) => {
    if (c.id) {
      enrichedList.push(processSingleCustomer(c));
    }
  });

  const ordersDerivedMap = new Map<string, { name: string; phone: string }>();
  rawOrders.forEach((o) => {
    const key = o.customerPhone || o.customerName;
    if (key && !ordersDerivedMap.has(key)) {
      ordersDerivedMap.set(key, {
        name: o.customerName || "Customer",
        phone: o.customerPhone || "+91 9876543210"
      });
    }
  });

  ordersDerivedMap.forEach((val, key) => {
    const isAlreadyIncluded = enrichedList.some(
      (c) => c.phone === val.phone || c.name.toLowerCase() === val.name.toLowerCase()
    );

    if (!isAlreadyIncluded) {
      const syntheticId = `cust-derived-${key.replace(/\s+/g, "-").toLowerCase()}`;
      enrichedList.push(
        processSingleCustomer({
          id: syntheticId,
          name: val.name,
          phone: val.phone,
          totalOrders: 1,
          totalSpent: 0,
          lastOrderDate: new Date().toISOString()
        })
      );
    }
  });

  return enrichedList;
}

export function calculateCustomerSummaryStats(customers: EnrichedCustomer[]) {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter((c) => c.status === "ACTIVE").length;

  let totalRevenue = 0;
  let totalOrders = 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let newCustomersThisMonth = 0;

  customers.forEach((c) => {
    totalRevenue += c.totalSpent;
    totalOrders += c.totalOrders;

    if (c.registeredDate) {
      const reg = new Date(c.registeredDate);
      if (reg.getMonth() === currentMonth && reg.getFullYear() === currentYear) {
        newCustomersThisMonth++;
      }
    }
  });

  const avgRevenuePerCustomer = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;

  return {
    totalCustomers,
    activeCustomers,
    totalRevenue,
    totalOrders,
    avgRevenuePerCustomer,
    newCustomersThisMonth
  };
}

export function filterCustomers(customers: EnrichedCustomer[], filters: CustomerFilters): EnrichedCustomer[] {
  return customers.filter((c) => {
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = c.name.toLowerCase().includes(q);
      const matchPhone = c.phone.toLowerCase().includes(q);
      const matchCity = c.city.toLowerCase().includes(q);
      const matchState = c.state.toLowerCase().includes(q);
      const matchAddr = c.currentSavedAddress.toLowerCase().includes(q);

      if (!matchName && !matchPhone && !matchCity && !matchState && !matchAddr) {
        return false;
      }
    }

    if (filters.city && filters.city !== "ALL" && c.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }

    if (filters.state && filters.state !== "ALL" && c.state.toLowerCase() !== filters.state.toLowerCase()) {
      return false;
    }

    if (filters.status !== "ALL" && c.status !== filters.status) {
      return false;
    }

    if (filters.registrationDateRange !== "ALL" && c.registeredDate) {
      const regTime = new Date(c.registeredDate).getTime();
      const nowTime = Date.now();
      const diffDays = (nowTime - regTime) / (1000 * 3600 * 24);

      if (filters.registrationDateRange === "TODAY" && diffDays > 1) return false;
      if (filters.registrationDateRange === "THIS_WEEK" && diffDays > 7) return false;
      if (filters.registrationDateRange === "THIS_MONTH" && diffDays > 30) return false;
      if (filters.registrationDateRange === "THIS_YEAR" && diffDays > 365) return false;
    }

    if (filters.restaurantId && filters.restaurantId !== "ALL") {
      const hasOrderedFromRest = c.restaurantAnalytics.some((r) => r.restaurantId === filters.restaurantId);
      if (!hasOrderedFromRest) return false;
    }

    if (filters.minRevenue && c.totalSpent < Number(filters.minRevenue)) return false;
    if (filters.maxRevenue && c.totalSpent > Number(filters.maxRevenue)) return false;

    if (filters.minOrders && c.totalOrders < Number(filters.minOrders)) return false;
    if (filters.maxOrders && c.totalOrders > Number(filters.maxOrders)) return false;

    return true;
  });
}

export function exportCustomersToCSV(customers: EnrichedCustomer[]) {
  if (!customers || customers.length === 0) return;

  const headers = [
    "Customer ID",
    "Customer Name",
    "Mobile Number",
    "Registered Date",
    "Current Saved Address",
    "City",
    "State",
    "Pincode",
    "Total Orders",
    "Total Amount Spent (₹)",
    "Avg Order Value (₹)",
    "Last Order Date",
    "Status",
    "Assigned Restaurant Count"
  ];

  const rows = customers.map((c) => [
    `"${c.id}"`,
    `"${c.name.replace(/"/g, '""')}"`,
    `"${c.phone}"`,
    `"${c.registeredDate ? new Date(c.registeredDate).toLocaleDateString() : ''}"`,
    `"${c.currentSavedAddress.replace(/"/g, '""')}"`,
    `"${c.city}"`,
    `"${c.state}"`,
    `"${c.pincode}"`,
    c.totalOrders,
    c.totalSpent,
    c.avgOrderValue,
    `"${c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : ''}"`,
    `"${c.status}"`,
    c.assignedRestaurantCount
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Customer_Export_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
