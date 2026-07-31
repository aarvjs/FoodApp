import { Restaurant, Branch, Product, Category, Order, RestaurantTable, Coupon, Offer, Customer, DeliveryChargeRule } from "@/types";

export const initialRestaurants: Restaurant[] = [
  {
    id: "rest-1",
    name: "Spicy Kingdom Gourmet",
    description: "Authentic North & South Indian delicacies, wood-fired tandoor & biryanis.",
    logo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80",
    cuisineType: ["North Indian", "South Indian", "Biryani", "Chinese"],
    gstNumber: "09AAACS1234F1Z5",
    phone: "+91 98765 43210",
    email: "contact@spicykingdom.com",
    openingTime: "10:00 AM",
    closingTime: "11:30 PM",
    deliveryCharges: 40,
    minimumOrder: 199,
    hasTableService: true,
    hasTakeaway: true,
    hasDelivery: true,
    hasDineIn: true,
    status: "ACTIVE",
    totalBranches: 2,
    totalRevenue: 458900,
    createdAt: "2025-01-15T10:00:00Z"
  }
];

export const initialBranches: Branch[] = [
  {
    id: "branch-1",
    restaurantId: "rest-1",
    restaurantName: "Spicy Kingdom Gourmet",
    name: "Kanpur Central Branch",
    phone: "+91 91234 56789",
    email: "kanpur.central@spicykingdom.com",
    managerName: "Rahul Sharma",
    managerEmail: "rahul.manager@spicykingdom.com",
    managerId: "bm-1",
    generatedPassword: "SpicyPass#2026",
    deliveryRadiusKm: 8,
    openingTime: "10:00 AM",
    closingTime: "11:00 PM",
    status: "OPEN",
    location: {
      formattedAddress: "Civil Lines, Near Z Square Mall, Kanpur",
      latitude: 26.4499,
      longitude: 80.3319,
      city: "Kanpur",
      state: "Uttar Pradesh",
      pincode: "208001"
    },
    todayOrdersCount: 42,
    todayRevenue: 28450,
    createdAt: "2025-02-01T10:00:00Z"
  },
  {
    id: "branch-2",
    restaurantId: "rest-1",
    restaurantName: "Spicy Kingdom Gourmet",
    name: "Swaroop Nagar Hub",
    phone: "+91 91234 56790",
    email: "swaroop.hub@spicykingdom.com",
    managerName: "Ananya Patel",
    managerEmail: "ananya.manager@spicykingdom.com",
    managerId: "bm-2",
    generatedPassword: "SwaroopPass#2026",
    deliveryRadiusKm: 6,
    openingTime: "11:00 AM",
    closingTime: "11:30 PM",
    status: "OPEN",
    location: {
      formattedAddress: "Main Road, Swaroop Nagar, Kanpur",
      latitude: 26.4784,
      longitude: 80.3061,
      city: "Kanpur",
      state: "Uttar Pradesh",
      pincode: "208002"
    },
    todayOrdersCount: 29,
    todayRevenue: 19800,
    createdAt: "2025-02-10T10:00:00Z"
  }
];

export const initialCategories: Category[] = [
  { id: "cat-1", restaurantId: "rest-1", name: "Starters & Appetizers", slug: "starters", image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=300&auto=format&fit=crop&q=80", itemCount: 12, status: "ACTIVE" },
  { id: "cat-2", restaurantId: "rest-1", name: "Main Course (Gravy)", slug: "main-course", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300&auto=format&fit=crop&q=80", itemCount: 18, status: "ACTIVE" },
  { id: "cat-3", restaurantId: "rest-1", name: "Hyderabadi Biryani", slug: "biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80", itemCount: 8, status: "ACTIVE" },
  { id: "cat-4", restaurantId: "rest-1", name: "Breads & Naan", slug: "breads", image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=300&auto=format&fit=crop&q=80", itemCount: 6, status: "ACTIVE" },
  { id: "cat-5", restaurantId: "rest-1", name: "Desserts & Beverages", slug: "desserts", image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=80", itemCount: 10, status: "ACTIVE" }
];

export const initialProducts: Product[] = [
  {
    id: "prod-1",
    restaurantId: "rest-1",
    branchIds: ["branch-1", "branch-2"],
    name: "Paneer Tikka Angara",
    description: "Cottage cheese marinated in spicy yogurt & smoked in clay tandoor oven.",
    category: "Starters & Appetizers",
    price: 320,
    offerPrice: 289,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    stock: 45,
    isVeg: true,
    prepTimeMinutes: 20
  },
  {
    id: "prod-2",
    restaurantId: "rest-1",
    branchIds: ["branch-1", "branch-2"],
    name: "Butter Chicken Special",
    description: "Tender chicken cooked in rich tomato cashew butter gravy.",
    category: "Main Course (Gravy)",
    price: 420,
    offerPrice: 380,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    stock: 30,
    isVeg: false,
    prepTimeMinutes: 25
  },
  {
    id: "prod-3",
    restaurantId: "rest-1",
    branchIds: ["branch-1"],
    name: "Dum Handi Chicken Biryani",
    description: "Aromatic basmati rice layered with slow-cooked spiced chicken handi.",
    category: "Hyderabadi Biryani",
    price: 390,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    stock: 25,
    isVeg: false,
    prepTimeMinutes: 30
  },
  {
    id: "prod-4",
    restaurantId: "rest-1",
    branchIds: ["branch-1", "branch-2"],
    name: "Garlic Butter Naan",
    description: "Leavened flatbread brushed with fresh garlic and melted butter.",
    category: "Breads & Naan",
    price: 65,
    image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80",
    isAvailable: true,
    stock: 100,
    isVeg: true,
    prepTimeMinutes: 10
  }
];

export const initialOrders: Order[] = [
  {
    id: "ord-101",
    orderNumber: "ORD-9842",
    restaurantId: "rest-1",
    branchId: "branch-1",
    branchName: "Kanpur Central Branch",
    customerName: "Vikram Malhotra",
    customerPhone: "+91 98112 33445",
    customerAddress: "Flat 402, Green Valley Apartments, Civil Lines, Kanpur",
    items: [
      { productId: "prod-2", productName: "Butter Chicken Special", quantity: 1, price: 380 },
      { productId: "prod-4", productName: "Garlic Butter Naan", quantity: 3, price: 65 }
    ],
    subtotal: 575,
    tax: 28.75,
    deliveryFee: 40,
    totalAmount: 643.75,
    paymentStatus: "PAID",
    paymentMethod: "UPI",
    orderType: "DELIVERY",
    status: "PENDING",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: "ord-102",
    orderNumber: "ORD-9843",
    restaurantId: "rest-1",
    branchId: "branch-1",
    branchName: "Kanpur Central Branch",
    customerName: "Priya Sharma",
    customerPhone: "+91 97788 11223",
    customerAddress: "Table #4 (Dine In)",
    items: [
      { productId: "prod-1", productName: "Paneer Tikka Angara", quantity: 2, price: 289 },
      { productId: "prod-4", productName: "Garlic Butter Naan", quantity: 2, price: 65 }
    ],
    subtotal: 708,
    tax: 35.4,
    deliveryFee: 0,
    totalAmount: 743.4,
    paymentStatus: "PAID",
    paymentMethod: "CREDIT_CARD",
    orderType: "DINE_IN",
    status: "PREPARING",
    createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString()
  },
  {
    id: "ord-103",
    orderNumber: "ORD-9844",
    restaurantId: "rest-1",
    branchId: "branch-1",
    branchName: "Kanpur Central Branch",
    customerName: "Amitabh Sen",
    customerPhone: "+91 94556 77889",
    customerAddress: "House 12, Mall Road, Kanpur",
    items: [
      { productId: "prod-3", productName: "Dum Handi Chicken Biryani", quantity: 2, price: 390 }
    ],
    subtotal: 780,
    tax: 39,
    deliveryFee: 40,
    totalAmount: 859,
    paymentStatus: "PAID",
    paymentMethod: "UPI",
    orderType: "DELIVERY",
    status: "OUT_FOR_DELIVERY",
    createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString()
  },
  {
    id: "ord-104",
    orderNumber: "ORD-9840",
    restaurantId: "rest-1",
    branchId: "branch-2",
    branchName: "Swaroop Nagar Hub",
    customerName: "Sneha Reddy",
    customerPhone: "+91 96655 44332",
    customerAddress: "Block B, Tech Park Road, Swaroop Nagar, Kanpur",
    items: [
      { productId: "prod-1", productName: "Paneer Tikka Angara", quantity: 1, price: 289 }
    ],
    subtotal: 289,
    tax: 14.45,
    deliveryFee: 30,
    totalAmount: 333.45,
    paymentStatus: "PAID",
    paymentMethod: "CASH_ON_DELIVERY",
    orderType: "DELIVERY",
    status: "DELIVERED",
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  }
];

export const initialTables: RestaurantTable[] = [
  { id: "tbl-1", branchId: "branch-1", tableNumber: "T-01", capacity: 2, section: "Main Hall", status: "OCCUPIED" },
  { id: "tbl-2", branchId: "branch-1", tableNumber: "T-02", capacity: 4, section: "Main Hall", status: "AVAILABLE" },
  { id: "tbl-3", branchId: "branch-1", tableNumber: "T-03", capacity: 4, section: "Garden Patio", status: "RESERVED" },
  { id: "tbl-4", branchId: "branch-1", tableNumber: "T-04", capacity: 6, section: "VIP Lounge", status: "AVAILABLE" },
  { id: "tbl-5", branchId: "branch-2", tableNumber: "SW-01", capacity: 4, section: "Main Hall", status: "AVAILABLE" }
];

export const initialCoupons: Coupon[] = [
  { id: "coup-1", code: "WELCOME50", title: "50% OFF First Order", discountType: "PERCENTAGE", discountValue: 50, minOrderValue: 299, validTill: "2026-12-31", status: "ACTIVE", branchScope: "ALL", usageCount: 342 },
  { id: "coup-2", code: "SPICY100", title: "Flat ₹100 Discount", discountType: "FLAT", discountValue: 100, minOrderValue: 499, validTill: "2026-10-30", status: "ACTIVE", branchScope: "branch-1", usageCount: 189 }
];

export const initialOffers: Offer[] = [
  { id: "off-1", title: "Weekend Biryani Fiesta", description: "Get complimentary Gulab Jamun with every Biryani combo.", banner: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80", type: "COMBO", discountPercentage: 15, branchId: "branch-1", status: "ACTIVE" }
];

export const initialCustomers: Customer[] = [
  { id: "cust-1", name: "Vikram Malhotra", email: "vikram@gmail.com", phone: "+91 98112 33445", totalOrders: 14, totalSpent: 8450, lastOrderDate: "2026-07-28", branchId: "branch-1" },
  { id: "cust-2", name: "Priya Sharma", email: "priya.s@yahoo.com", phone: "+91 97788 11223", totalOrders: 8, totalSpent: 5120, lastOrderDate: "2026-07-28", branchId: "branch-1" },
  { id: "cust-3", name: "Sneha Reddy", email: "sneha.reddy@gmail.com", phone: "+91 96655 44332", totalOrders: 5, totalSpent: 2900, lastOrderDate: "2026-07-28", branchId: "branch-2" }
];

export const initialDeliveryCharges: DeliveryChargeRule[] = [
  { id: "dc-1", restaurantId: "rest-1", minDistanceKm: 0, maxDistanceKm: 3, baseCharge: 30, perKmCharge: 0 },
  { id: "dc-2", restaurantId: "rest-1", minDistanceKm: 3, maxDistanceKm: 7, baseCharge: 40, perKmCharge: 10 },
  { id: "dc-3", restaurantId: "rest-1", minDistanceKm: 7, maxDistanceKm: 15, baseCharge: 70, perKmCharge: 12 }
];
