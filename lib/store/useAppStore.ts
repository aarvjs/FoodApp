import { create } from "zustand";
import {
  UserRole,
  Restaurant,
  Branch,
  Category,
  Product,
  Order,
  OrderStatus,
  DeliveryBoy,
  Staff,
  Coupon,
  Offer,
  NotificationItem,
} from "@/types";
import {
  MOCK_RESTAURANTS,
  MOCK_BRANCHES,
  MOCK_CATEGORIES,
  MOCK_PRODUCTS,
  MOCK_ORDERS,
  MOCK_DELIVERY_BOYS,
  MOCK_STAFF,
  MOCK_COUPONS,
  MOCK_OFFERS,
  MOCK_NOTIFICATIONS,
} from "@/constants/mockData";

interface AppState {
  // Active Role & Scope
  currentRole: UserRole;
  selectedRestaurantId: string;
  selectedBranchId: string;
  isSidebarCollapsed: boolean;
  searchQuery: string;

  // Domain Datasets
  restaurants: Restaurant[];
  branches: Branch[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  deliveryBoys: DeliveryBoy[];
  staff: Staff[];
  coupons: Coupon[];
  offers: Offer[];
  notifications: NotificationItem[];

  // Actions
  setCurrentRole: (role: UserRole) => void;
  setSelectedRestaurantId: (id: string) => void;
  setSelectedBranchId: (id: string) => void;
  toggleSidebar: () => void;
  setSearchQuery: (query: string) => void;

  // Orders Actions
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignDeliveryBoy: (orderId: string, deliveryBoyId: string) => void;
  verifyDeliveryOtp: (orderId: string, otp: string) => boolean;

  // Products Actions
  toggleProductAvailability: (productId: string) => void;
  updateProductStock: (productId: string, stock: number) => void;
  addProduct: (product: Omit<Product, "id">) => void;
  editProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;

  // Category Actions
  addCategory: (category: Omit<Category, "id">) => void;
  deleteCategory: (id: string) => void;

  // Branch & Restaurant Actions
  updateBranchStatus: (branchId: string, status: "OPEN" | "CLOSED" | "BUSY") => void;
  updateKitchenStatus: (branchId: string, status: "OPERATIONAL" | "HIGH_LOAD" | "OFFLINE") => void;
  addBranch: (branch: Omit<Branch, "id">) => void;

  // Coupons & Offers
  addCoupon: (coupon: Omit<Coupon, "id">) => void;
  toggleCouponStatus: (id: string) => void;

  // Staff
  addStaff: (staff: Omit<Staff, "id">) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentRole: "SUPER_ADMIN",
  selectedRestaurantId: "ALL",
  selectedBranchId: "ALL",
  isSidebarCollapsed: false,
  searchQuery: "",

  restaurants: MOCK_RESTAURANTS,
  branches: MOCK_BRANCHES,
  categories: MOCK_CATEGORIES,
  products: MOCK_PRODUCTS,
  orders: MOCK_ORDERS,
  deliveryBoys: MOCK_DELIVERY_BOYS,
  staff: MOCK_STAFF,
  coupons: MOCK_COUPONS,
  offers: MOCK_OFFERS,
  notifications: MOCK_NOTIFICATIONS,

  setCurrentRole: (role) => set({ currentRole: role }),
  setSelectedRestaurantId: (id) => set({ selectedRestaurantId: id }),
  setSelectedBranchId: (id) => set({ selectedBranchId: id }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSearchQuery: (query) => set({ searchQuery: query }),

  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((ord) =>
        ord.id === orderId ? { ...ord, status } : ord
      ),
    })),

  assignDeliveryBoy: (orderId, deliveryBoyId) => {
    const db = get().deliveryBoys.find((d) => d.id === deliveryBoyId);
    set((state) => ({
      orders: state.orders.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              deliveryBoyId,
              deliveryBoyName: db?.name,
              status: "OUT_FOR_DELIVERY",
            }
          : ord
      ),
      deliveryBoys: state.deliveryBoys.map((d) =>
        d.id === deliveryBoyId ? { ...d, status: "ON_DELIVERY", activeOrderId: orderId } : d
      ),
    }));
  },

  verifyDeliveryOtp: (orderId, otp) => {
    const targetOrder = get().orders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.otp !== otp) {
      return false;
    }
    set((state) => ({
      orders: state.orders.map((ord) =>
        ord.id === orderId ? { ...ord, status: "DELIVERED", paymentStatus: "PAID" } : ord
      ),
      deliveryBoys: state.deliveryBoys.map((d) =>
        d.id === targetOrder.deliveryBoyId ? { ...d, status: "AVAILABLE", activeOrderId: undefined, totalDeliveries: d.totalDeliveries + 1 } : d
      ),
    }));
    return true;
  },

  toggleProductAvailability: (productId) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, isAvailable: !p.isAvailable } : p
      ),
    })),

  updateProductStock: (productId, stock) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, stock } : p
      ),
    })),

  addProduct: (product) =>
    set((state) => ({
      products: [
        { ...product, id: `prod-${Date.now()}` },
        ...state.products,
      ],
    })),

  editProduct: (productId, updates) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, ...updates } : p
      ),
    })),

  deleteProduct: (productId) =>
    set((state) => ({
      products: state.products.filter((p) => p.id !== productId),
    })),

  addCategory: (category) =>
    set((state) => ({
      categories: [
        { ...category, id: `cat-${Date.now()}` },
        ...state.categories,
      ],
    })),

  deleteCategory: (id) =>
    set((state) => ({
      categories: state.categories.filter((c) => c.id !== id),
    })),

  updateBranchStatus: (branchId, status) =>
    set((state) => ({
      branches: state.branches.map((b) =>
        b.id === branchId ? { ...b, status } : b
      ),
    })),

  updateKitchenStatus: (branchId, status) =>
    set((state) => ({
      branches: state.branches.map((b) =>
        b.id === branchId ? { ...b, kitchenStatus: status } : b
      ),
    })),

  addBranch: (branch) =>
    set((state) => ({
      branches: [...state.branches, { ...branch, id: `branch-${Date.now()}` }],
    })),

  addCoupon: (coupon) =>
    set((state) => ({
      coupons: [{ ...coupon, id: `coup-${Date.now()}` }, ...state.coupons],
    })),

  toggleCouponStatus: (id) =>
    set((state) => ({
      coupons: state.coupons.map((c) =>
        c.id === id
          ? { ...c, status: c.status === "ACTIVE" ? "EXPIRED" : "ACTIVE" }
          : c
      ),
    })),

  addStaff: (staffMember) =>
    set((state) => ({
      staff: [{ ...staffMember, id: `st-${Date.now()}` }, ...state.staff],
    })),

  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  clearAllNotifications: () => set({ notifications: [] }),
}));
