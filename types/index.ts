export type UserRole =
  | "SUPER_ADMIN"
  | "OWNER"
  | "BRANCH_MANAGER"
  | "KITCHEN_STAFF"
  | "DELIVERY_BOY"
  | "CUSTOMER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  restaurantId?: string;
  branchId?: string;
  phone?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "SUPER_ADMIN";
}

export interface OwnerUser {
  id: string;
  name: string;
  email: string;
  restaurantId: string;
  restaurantName: string;
  avatar: string;
  role: "OWNER";
}

export interface BranchManagerUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  restaurantId: string;
  assignedBranchId: string;
  assignedBranchName: string;
  avatar: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE";
  role: "BRANCH_MANAGER";
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  logo: string;
  banner: string;
  ownerName: string;
  ownerEmail: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  totalBranches: number;
  totalRevenue: number;
  rating: number;
  createdAt: string;
}

export interface Branch {
  id: string;
  restaurantId: string;
  name: string;
  city: string;
  address: string;
  managerName: string;
  phone: string;
  status: "OPEN" | "CLOSED" | "BUSY";
  kitchenStatus: "OPERATIONAL" | "HIGH_LOAD" | "OFFLINE";
  openingTime: string;
  closingTime: string;
  deliveryRadiusKm: number;
  todayOrdersCount: number;
  todayRevenue: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  itemCount: number;
  status: "ACTIVE" | "INACTIVE";
}

export interface Product {
  id: string;
  restaurantId: string;
  branchIds: string[];
  name: string;
  description: string;
  category: string;
  price: number;
  offerPrice?: number;
  image: string;
  isAvailable: boolean;
  stock: number;
  isVeg: boolean;
  rating: number;
  prepTimeMinutes: number;
}

export type OrderStatus =
  | "PENDING"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type OrderType = "DELIVERY" | "TAKEAWAY" | "DINE_IN";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
  customizations?: string[];
}

export interface Order {
  id: string;
  orderNumber: string;
  restaurantId: string;
  branchId: string;
  branchName: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  paymentStatus: "PAID" | "PENDING" | "REFUNDED";
  paymentMethod: "UPI" | "CREDIT_CARD" | "CASH_ON_DELIVERY";
  orderType: OrderType;
  status: OrderStatus;
  deliveryBoyId?: string;
  deliveryBoyName?: string;
  otp?: string;
  createdAt: string;
  estimatedPrepTimeMinutes: number;
  startedPrepAt?: string;
}

export interface DeliveryBoy {
  id: string;
  branchId: string;
  branchName: string;
  name: string;
  phone: string;
  avatar: string;
  status: "AVAILABLE" | "ON_DELIVERY" | "OFFLINE";
  rating: number;
  totalDeliveries: number;
  activeOrderId?: string;
  currentLocation?: string;
}

export interface Staff {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  branchId: string;
  branchName: string;
  status: "ACTIVE" | "ON_LEAVE" | "INACTIVE";
  joinedDate: string;
}

export interface Coupon {
  id: string;
  code: string;
  title: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  minOrderValue: number;
  validTill: string;
  status: "ACTIVE" | "EXPIRED";
  branchScope: "ALL" | string;
  usageCount: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  banner: string;
  type: "FESTIVAL" | "FREE_DELIVERY" | "FLAT_DISCOUNT" | "COMBO";
  discountPercentage?: number;
  branchId: string;
  status: "ACTIVE" | "DRAFT" | "EXPIRED";
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "ORDER" | "KITCHEN" | "DELIVERY" | "SYSTEM";
}
