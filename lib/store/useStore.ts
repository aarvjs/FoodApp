import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { 
  User, 
  Restaurant, 
  Branch, 
  Product, 
  Category, 
  Order, 
  RestaurantTable, 
  TableBooking, 
  TableBookingStatus,
  Coupon, 
  Offer, 
  Customer, 
  DeliveryChargeRule,
  DeliveryChargeSlab,
  OrderStatus,
  Combo,
  CustomizationGroup
} from "@/types";
import { 
  restaurantService, 
  branchService, 
  menuService, 
  categoryService, 
  offerService, 
  orderService, 
  customerService, 
  bannerService, 
  tableService,
  comboService,
  customizationService,
  deliveryChargeSlabService
} from "@/services";


function dedupeById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (!item.id || seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

interface AppState {
  user: User | null;
  adminUser: User | null;
  branchManagerUser: User | null;
  setUser: (user: User | null) => void;
  setAdminUser: (user: User | null) => void;
  setBranchManagerUser: (user: User | null) => void;
  logoutAdmin: () => void;
  logoutBranchManager: () => void;
  logout: () => void;

  selectedRestaurantId: string | null;
  selectedBranchId: string | null;
  setSelectedRestaurantId: (id: string | null) => void;
  setSelectedBranchId: (id: string | null) => void;

  restaurants: Restaurant[];
  setRestaurants: (restaurants: Restaurant[]) => void;
  addRestaurant: (restaurant: Partial<Restaurant>) => Promise<Restaurant>;
  updateRestaurant: (id: string, updated: Partial<Restaurant>) => Promise<void>;
  deleteRestaurant: (id: string) => Promise<void>;

  branches: Branch[];
  setBranches: (branches: Branch[]) => void;
  addBranch: (branch: Partial<Branch>) => Promise<Branch>;
  updateBranch: (id: string, updated: Partial<Branch>) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;

  categories: Category[];
  setCategories: (categories: Category[]) => void;
  addCategory: (category: Partial<Category> & { imageFile?: File | string }) => Promise<Category>;
  updateCategory: (id: string, updated: Partial<Category> & { imageFile?: File | string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  products: Product[];
  setProducts: (products: Product[]) => void;
  addProduct: (product: Partial<Product> & { imageFile?: File | string; imageFiles?: File[] }) => Promise<Product>;
  updateProduct: (id: string, updated: Partial<Product> & { imageFile?: File | string; imageFiles?: File[] }) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  orders: Order[];
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Partial<Order>) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus, prepTime?: number, rejectionReason?: string) => Promise<void>;
  cancelOrder: (id: string, cancelledBy: string, cancellationReason: string, cancellationNote?: string) => Promise<{ success: boolean; message?: string }>;
  deleteOrder: (id: string) => Promise<void>;

  coupons: Coupon[];
  setCoupons: (coupons: Coupon[]) => void;
  addCoupon: (coupon: Coupon) => void;

  offers: Offer[];
  setOffers: (offers: Offer[]) => void;
  addOffer: (offer: Partial<Offer>) => Promise<Offer>;
  deleteOffer: (id: string) => Promise<void>;

  customers: Customer[];
  setCustomers: (customers: Customer[]) => void;

  deliveryRules: DeliveryChargeRule[];
  updateDeliveryRule: (id: string, rule: Partial<DeliveryChargeRule>) => void;

  deliverySlabs: DeliveryChargeSlab[];
  setDeliverySlabs: (slabs: DeliveryChargeSlab[]) => void;
  addDeliverySlab: (slab: Partial<DeliveryChargeSlab>) => Promise<DeliveryChargeSlab>;
  updateDeliverySlab: (id: string, updated: Partial<DeliveryChargeSlab>) => Promise<void>;
  deleteDeliverySlab: (id: string) => Promise<void>;
  toggleDeliverySlabStatus: (id: string, currentStatus: "ACTIVE" | "INACTIVE") => Promise<void>;


  tables: RestaurantTable[];
  setTables: (tables: RestaurantTable[]) => void;
  addTable: (table: Partial<RestaurantTable>) => Promise<RestaurantTable>;
  updateTable: (id: string, updated: Partial<RestaurantTable>) => Promise<void>;
  deleteTable: (id: string) => Promise<void>;

  tableBookings: TableBooking[];
  setTableBookings: (bookings: TableBooking[]) => void;
  createTableBooking: (booking: Partial<TableBooking>) => Promise<TableBooking>;
  updateBookingStatus: (id: string, status: TableBookingStatus, tableId?: string) => Promise<void>;

  combos: Combo[];
  setCombos: (combos: Combo[]) => void;
  addCombo: (combo: Partial<Combo> & { imageFile?: File | string; imageFiles?: File[] }) => Promise<Combo>;
  updateCombo: (id: string, updated: Partial<Combo> & { imageFile?: File | string; imageFiles?: File[] }) => Promise<void>;
  deleteCombo: (id: string) => Promise<void>;
  toggleComboAvailability: (id: string, isAvailable: boolean) => Promise<void>;

  customizationGroups: CustomizationGroup[];
  setCustomizationGroups: (groups: CustomizationGroup[]) => void;
  addCustomizationGroup: (group: Partial<CustomizationGroup>) => Promise<CustomizationGroup>;
  updateCustomizationGroup: (id: string, updated: Partial<CustomizationGroup>) => Promise<void>;
  deleteCustomizationGroup: (id: string) => Promise<void>;
}

const initialDeliveryCharges: DeliveryChargeRule[] = [
  { id: "del-1", restaurantId: "rest-1", minDistanceKm: 0, maxDistanceKm: 3, baseCharge: 30, perKmCharge: 0 },
  { id: "del-2", restaurantId: "rest-1", minDistanceKm: 3, maxDistanceKm: 7, baseCharge: 50, perKmCharge: 10 },
  { id: "del-3", restaurantId: "rest-1", minDistanceKm: 7, maxDistanceKm: 15, baseCharge: 90, perKmCharge: 15 }
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      adminUser: null,
      branchManagerUser: null,
      setUser: (user) => set((state) => {
        const isAdmin = user?.role === "admin";
        const isManager = user?.role === "branchManager";
        return { 
          user,
          adminUser: isAdmin ? user : state.adminUser,
          branchManagerUser: isManager ? user : state.branchManagerUser,
          selectedRestaurantId: user?.restaurantId || state.selectedRestaurantId,
          selectedBranchId: user?.assignedBranchId || user?.branchId || state.selectedBranchId
        };
      }),
      setAdminUser: (adminUser) => set({ adminUser }),
      setBranchManagerUser: (branchManagerUser) => set({ branchManagerUser }),
      logoutAdmin: () => set({ adminUser: null, user: null }),
      logoutBranchManager: () => set({ branchManagerUser: null, user: null }),
      logout: () => set({ user: null, adminUser: null, branchManagerUser: null, selectedRestaurantId: null, selectedBranchId: null }),

      selectedRestaurantId: null,
      selectedBranchId: null,
      setSelectedRestaurantId: (id) => set({ selectedRestaurantId: id }),
      setSelectedBranchId: (id) => set({ selectedBranchId: id }),

      // Restaurants
      restaurants: [],
      setRestaurants: (restaurants) => set({ restaurants: dedupeById(restaurants) }),
      addRestaurant: async (data) => {
        const created = await restaurantService.addRestaurant(data);
        set((state) => ({ restaurants: dedupeById([created, ...state.restaurants]) }));
        return created;
      },
      updateRestaurant: async (id, updated) => {
        await restaurantService.updateRestaurant(id, updated);
        set((state) => ({
          restaurants: state.restaurants.map((r) => (r.id === id ? { ...r, ...updated } : r))
        }));
      },
      deleteRestaurant: async (id) => {
        await restaurantService.deleteRestaurant(id);
        set((state) => ({
          restaurants: state.restaurants.filter((r) => r.id !== id)
        }));
      },

      // Branches
      branches: [],
      setBranches: (branches) => set({ branches: dedupeById(branches) }),
      addBranch: async (data) => {
        const created = await branchService.addBranch(data);
        set((state) => ({ branches: dedupeById([created, ...state.branches]) }));
        return created;
      },
      updateBranch: async (id, updated) => {
        await branchService.updateBranch(id, updated);
        set((state) => ({
          branches: state.branches.map((b) => (b.id === id ? { ...b, ...updated } : b))
        }));
      },
      deleteBranch: async (id) => {
        await branchService.deleteBranch(id);
        set((state) => ({
          branches: state.branches.filter((b) => b.id !== id)
        }));
      },

      // Categories
      categories: [],
      setCategories: (categories) => set({ categories: dedupeById(categories) }),
      addCategory: async (data) => {
        const currentRest = get().selectedRestaurantId || get().user?.restaurantId || "";
        const currentBranch = get().selectedBranchId || get().user?.assignedBranchId || get().user?.branchId || "";
        const payload = {
          ...data,
          restaurantId: data.restaurantId || currentRest,
          branchId: data.branchId || currentBranch
        };
        const created = await categoryService.addCategory(payload);
        set((state) => ({ categories: dedupeById([created, ...state.categories]) }));
        return created;
      },
      updateCategory: async (id, updated) => {
        await categoryService.updateCategory(id, updated);
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...updated } : c))
        }));
      },
      deleteCategory: async (id) => {
        await categoryService.deleteCategory(id);
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id)
        }));
      },

      // Products / Menus
      products: [],
      setProducts: (products) => set({ products: dedupeById(products) }),
      addProduct: async (data) => {
        const currentRest = get().selectedRestaurantId || get().user?.restaurantId || "";
        const currentBranch = get().selectedBranchId || get().user?.assignedBranchId || get().user?.branchId || "";
        const payload = {
          ...data,
          restaurantId: data.restaurantId || currentRest,
          branchId: data.branchId || currentBranch,
          branchIds: data.branchIds || [data.branchId || currentBranch]
        };
        const created = await menuService.addMenuItem(payload);
        set((state) => ({ products: dedupeById([created, ...state.products]) }));
        return created;
      },
      updateProduct: async (id, updated) => {
        await menuService.updateMenuItem(id, updated);
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updated } : p))
        }));
      },
      deleteProduct: async (id) => {
        await menuService.deleteMenuItem(id);
        set((state) => ({
          products: state.products.filter((p) => p.id !== id)
        }));
      },

      // Orders
      orders: [],
      setOrders: (orders) => set({ orders: dedupeById(orders) }),
      addOrder: async (data) => {
        const currentRest = get().selectedRestaurantId || get().user?.restaurantId || "";
        const currentBranch = get().selectedBranchId || get().user?.assignedBranchId || get().user?.branchId || "";
        const payload = {
          ...data,
          restaurantId: data.restaurantId || currentRest,
          branchId: data.branchId || currentBranch
        };
        const created = await orderService.addOrder(payload);
        set((state) => ({ orders: dedupeById([created, ...state.orders]) }));
        return created;
      },
      updateOrderStatus: async (id, status, prepTime, rejectionReason) => {
        await orderService.updateOrderStatus(id, status, prepTime, rejectionReason);
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { 
            ...o, 
            status, 
            estimatedPrepMinutes: prepTime !== undefined ? prepTime : o.estimatedPrepMinutes,
            rejectionReason: rejectionReason !== undefined ? rejectionReason : o.rejectionReason,
            updatedAt: new Date().toISOString() 
          } : o))
        }));
      },
      cancelOrder: async (id, cancelledBy, cancellationReason, cancellationNote) => {
        const result = await orderService.cancelOrder(id, cancelledBy, cancellationReason, cancellationNote);
        if (result.success) {
          const now = new Date().toISOString();
          set((state) => ({
            orders: state.orders.map((o) => (o.id === id ? {
              ...o,
              status: "CANCELLED",
              cancelledBy,
              cancellationReason,
              cancellationNote: cancellationNote || "",
              cancelledAt: now,
              updatedAt: now
            } : o))
          }));
        }
        return result;
      },
      deleteOrder: async (id) => {
        const result = await orderService.deleteOrder(id);
        if (result.success) {
          set((state) => ({
            orders: state.orders.filter((o) => o.id !== id)
          }));
        } else {
          throw new Error(result.message || "Failed to delete order.");
        }
      },

      // Coupons & Offers
      coupons: [],
      setCoupons: (coupons) => set({ coupons: dedupeById(coupons) }),
      addCoupon: (coupon) => set((state) => ({ coupons: dedupeById([coupon, ...state.coupons]) })),

      offers: [],
      setOffers: (offers) => set({ offers: dedupeById(offers) }),
      addOffer: async (data) => {
        const currentRest = get().selectedRestaurantId || get().user?.restaurantId || "";
        const currentBranch = get().selectedBranchId || get().user?.assignedBranchId || get().user?.branchId || "";
        const payload = {
          ...data,
          restaurantId: data.restaurantId || currentRest,
          branchId: data.branchId || currentBranch
        };
        const created = await offerService.addOffer(payload);
        set((state) => ({ offers: dedupeById([created, ...state.offers]) }));
        return created;
      },
      deleteOffer: async (id) => {
        await offerService.deleteOffer(id);
        set((state) => ({
          offers: state.offers.filter((o) => o.id !== id)
        }));
      },

      // Customers
      customers: [],
      setCustomers: (customers) => set({ customers: dedupeById(customers) }),

      // Delivery Rules
      deliveryRules: initialDeliveryCharges,
      updateDeliveryRule: (id, rule) => set((state) => ({
        deliveryRules: state.deliveryRules.map((d) => (d.id === id ? { ...d, ...rule } : d))
      })),

      // Delivery Charge Slabs
      deliverySlabs: [],
      setDeliverySlabs: (slabs) => set({ deliverySlabs: dedupeById(slabs) }),
      addDeliverySlab: async (data) => {
        const currentRest = get().selectedRestaurantId || get().user?.restaurantId || "";
        const currentBranch = get().selectedBranchId || get().user?.assignedBranchId || get().user?.branchId || "";
        const payload = {
          ...data,
          restaurantId: data.restaurantId || currentRest,
          branchId: data.branchId || currentBranch
        };
        const created = await deliveryChargeSlabService.addSlab(payload, get().deliverySlabs);
        set((state) => ({ deliverySlabs: dedupeById([...state.deliverySlabs, created]).sort((a, b) => a.minDistanceKm - b.minDistanceKm) }));
        return created;
      },
      updateDeliverySlab: async (id, updated) => {
        await deliveryChargeSlabService.updateSlab(id, updated, get().deliverySlabs);
        set((state) => ({
          deliverySlabs: state.deliverySlabs.map((s) => (s.id === id ? { ...s, ...updated } : s)).sort((a, b) => a.minDistanceKm - b.minDistanceKm)
        }));
      },
      deleteDeliverySlab: async (id) => {
        await deliveryChargeSlabService.deleteSlab(id);
        set((state) => ({
          deliverySlabs: state.deliverySlabs.filter((s) => s.id !== id)
        }));
      },
      toggleDeliverySlabStatus: async (id, currentStatus) => {
        await deliveryChargeSlabService.toggleSlabStatus(id, currentStatus, get().deliverySlabs);
        const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
        set((state) => ({
          deliverySlabs: state.deliverySlabs.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
        }));
      },


      // Tables
      tables: [],
      setTables: (tables) => set({ tables: dedupeById(tables) }),
      addTable: async (data) => {
        const currentRest = get().selectedRestaurantId || get().user?.restaurantId || "";
        const currentBranch = get().selectedBranchId || get().user?.assignedBranchId || get().user?.branchId || "";
        const payload = {
          ...data,
          restaurantId: data.restaurantId || currentRest,
          branchId: data.branchId || currentBranch
        };
        const created = await tableService.addTable(payload);
        set((state) => ({ tables: dedupeById([created, ...state.tables]) }));
        return created;
      },
      updateTable: async (id, updated) => {
        await tableService.updateTable(id, updated);
        set((state) => ({
          tables: state.tables.map((t) => (t.id === id ? { ...t, ...updated } : t))
        }));
      },
      deleteTable: async (id) => {
        await tableService.deleteTable(id);
        set((state) => ({
          tables: state.tables.filter((t) => t.id !== id)
        }));
      },

      // Table Bookings
      tableBookings: [],
      setTableBookings: (tableBookings) => set({ tableBookings: dedupeById(tableBookings) }),
      createTableBooking: async (data) => {
        const currentRest = get().selectedRestaurantId || get().user?.restaurantId || "";
        const currentBranch = get().selectedBranchId || get().user?.assignedBranchId || get().user?.branchId || "";
        const payload = {
          ...data,
          restaurantId: data.restaurantId || currentRest,
          branchId: data.branchId || currentBranch
        };
        const created = await tableService.createTableBooking(payload);
        set((state) => ({ tableBookings: dedupeById([created, ...state.tableBookings]) }));
        return created;
      },
      updateBookingStatus: async (id, status, tableId) => {
        await tableService.updateBookingStatus(id, status, tableId);
        set((state) => ({
          tableBookings: state.tableBookings.map((b) => (b.id === id ? { ...b, status, updatedAt: new Date().toISOString() } : b))
        }));
      },

      // Combos
      combos: [],
      setCombos: (combos) => set({ combos: dedupeById(combos) }),
      addCombo: async (data) => {
        const currentRest = get().selectedRestaurantId || get().user?.restaurantId || "";
        const currentBranch = get().selectedBranchId || get().user?.assignedBranchId || get().user?.branchId || "";
        const allBranchIds = get().branches.map((b) => b.id);
        const targetBranchIds = (data.branchIds && data.branchIds.length > 0)
          ? data.branchIds
          : (data.branchId ? [data.branchId] : (currentBranch ? [currentBranch] : allBranchIds));

        const payload = {
          ...data,
          restaurantId: data.restaurantId || currentRest,
          branchId: data.branchId || currentBranch || (allBranchIds[0] || ""),
          branchIds: targetBranchIds
        };
        const created = await comboService.addCombo(payload);
        set((state) => ({ combos: dedupeById([created, ...state.combos]) }));
        return created;
      },
      updateCombo: async (id, updated) => {
        await comboService.updateCombo(id, updated);
        set((state) => ({
          combos: state.combos.map((c) => (c.id === id ? { ...c, ...updated } : c))
        }));
      },
      deleteCombo: async (id) => {
        await comboService.deleteCombo(id);
        set((state) => ({
          combos: state.combos.filter((c) => c.id !== id)
        }));
      },
      toggleComboAvailability: async (id, isAvailable) => {
        await comboService.toggleAvailability(id, isAvailable);
        set((state) => ({
          combos: state.combos.map((c) => (c.id === id ? { ...c, isAvailable } : c))
        }));
      },

      // Customization Groups
      customizationGroups: [],
      setCustomizationGroups: (groups) => set({ customizationGroups: dedupeById(groups) }),
      addCustomizationGroup: async (data) => {
        const currentRest = get().selectedRestaurantId || get().user?.restaurantId || "";
        const currentBranch = get().selectedBranchId || get().user?.assignedBranchId || get().user?.branchId || "";
        const allBranchIds = get().branches.map((b) => b.id);
        const targetBranchIds = (data.branchIds && data.branchIds.length > 0)
          ? data.branchIds
          : (data.branchId ? [data.branchId] : (currentBranch ? [currentBranch] : allBranchIds));

        const payload = {
          ...data,
          restaurantId: data.restaurantId || currentRest,
          branchId: data.branchId || currentBranch || (allBranchIds[0] || ""),
          branchIds: targetBranchIds
        };
        const created = await customizationService.addCustomizationGroup(payload);
        set((state) => ({ customizationGroups: dedupeById([created, ...state.customizationGroups]) }));
        return created;
      },
      updateCustomizationGroup: async (id, updated) => {
        await customizationService.updateCustomizationGroup(id, updated);
        set((state) => ({
          customizationGroups: state.customizationGroups.map((g) => (g.id === id ? { ...g, ...updated } : g))
        }));
      },
      deleteCustomizationGroup: async (id) => {
        await customizationService.deleteCustomizationGroup(id);
        set((state) => ({
          customizationGroups: state.customizationGroups.filter((g) => g.id !== id)
        }));
      }
    }),
    {
      name: "food_admin_firebase_store_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        user: state.user,
        adminUser: state.adminUser,
        branchManagerUser: state.branchManagerUser
      })
    }
  )
);
