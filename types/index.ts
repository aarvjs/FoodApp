export type UserRole = "admin" | "branchManager" | "branch_manager";

export interface AddressLocation {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  district?: string;
  subLocality?: string;
  locality?: string;
  village?: string;
  address?: string;
  street?: string;
  postalCode?: string;
  source?: "gps" | "search";
  locationSource?: "gps" | "search";
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  restaurantId?: string;
  branchId?: string;
  assignedBranchId?: string;
  assignedBranchName?: string;
  phone?: string;
}

export interface AdminUser extends User {
  role: "admin";
}

export interface BranchManagerUser extends User {
  role: "branchManager" | "branch_manager";
  restaurantId: string;
  assignedBranchId: string;
  assignedBranchName: string;
  password?: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface Restaurant {
  id: string;
  restaurantId?: string;
  name: string;
  restaurantName?: string;
  description: string;
  ownerName?: string;
  logo: string;
  banner: string;
  coverImage?: string;
  cuisineType: string[];
  gstNumber: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  openingTime: string;
  closingTime: string;
  deliveryCharges: number;
  minimumOrder: number;
  hasTableService: boolean;
  hasTakeaway: boolean;
  hasDelivery: boolean;
  hasDineIn: boolean;
  status: "ACTIVE" | "INACTIVE";
  totalBranches?: number;
  totalRevenue?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Branch {
  id: string;
  branchId?: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  branchName?: string;
  phone: string;
  email: string;
  managerName: string;
  managerEmail: string;
  managerId: string;
  generatedPassword?: string;
  deliveryRadiusKm: number;
  deliveryRadius?: number;
  maximumDeliveryRadius?: number;
  maxRadiusConfigured?: boolean;
  taxPercentage?: number;
  gstPercentage?: number;


  address?: string;
  latitude?: number;
  longitude?: number;
  locationSource?: "gps" | "search";
  openingTime: string;
  closingTime: string;
  status: "OPEN" | "CLOSED" | "BUSY";
  location: AddressLocation;
  todayOrdersCount?: number;
  todayRevenue?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  restaurantId: string;
  branchId?: string;
  name: string;
  categoryName?: string;
  description?: string;
  displayOrder?: number;
  slug: string;
  image: string;
  itemCount: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductCustomization {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface CustomizationOption {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface CustomizationGroup {
  id: string;
  restaurantId: string;
  branchId?: string;
  branchIds?: string[];
  title: string;
  selectionType: "single" | "multi";
  isRequired: boolean;
  minSelection: number;
  maxSelection: number;
  options: CustomizationOption[];
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface Combo {
  id: string;
  name: string;
  image: string;
  description?: string;
  isAvailable?: boolean;
  isActive?: boolean;
  restaurantId: string;
  branchId?: string;
  branchIds?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ComboVariantOption {
  id: string;
  name: string;
  additionalPrice: number;
  isActive: boolean;
  displayOrder?: number;
}

export interface ComboVariantItem {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  displayOrder?: number;
  options: ComboVariantOption[];
}

export interface ComboItemVariant {
  id: string;
  name: string;
  isActive: boolean;
  displayOrder?: number;
  items?: ComboVariantItem[];
  options?: ComboVariantOption[];
}

export interface ComboItem {
  id: string;
  comboId: string;
  restaurantId: string;
  branchId?: string;
  branchIds?: string[];
  name: string;
  image: string;
  description: string;
  price: number;
  originalPrice?: number;
  foodType: "Veg" | "Non Veg";
  isVeg: boolean;
  rating?: number;
  ratingCount?: number;
  isCustomisable?: boolean;
  customizationGroups?: CustomizationGroup[];
  isVariantEnabled?: boolean;
  variants?: ComboItemVariant[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  title?: string;
  restaurantId: string;
  branchId?: string;
  branchIds: string[];
  name: string;
  description: string;
  fullDescription?: string;
  category: string;
  subCategory?: string;
  price: number;
  discountPrice?: number;
  offerPrice?: number;
  image: string;
  images?: string[];
  isAvailable: boolean;
  available?: boolean;
  stock: number;
  availableQuantity?: number;
  stockStatus?: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK";
  isVeg: boolean;
  foodType?: "Veg" | "Non Veg" | "Egg";
  veg?: string;
  bestseller?: boolean;
  recommended?: boolean;
  featured?: boolean;
  spicyLevel?: "Mild" | "Medium" | "Hot" | "Extra Spicy";
  ingredients?: string[];
  customTags?: string[];
  customizations?: ProductCustomization[];
  customizationGroupIds?: string[];
  customizationGroups?: CustomizationGroup[];
  rating?: number;
  prepTimeMinutes: number;
  status?: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
}

export interface RestaurantTable {
  id: string;
  restaurantId?: string;
  branchId: string;
  tableNumber: string;
  capacity: number;
  section: string;
  type?: "Indoor" | "Outdoor";
  environment?: "AC" | "Non AC";
  status: "AVAILABLE" | "BOOKED" | "OCCUPIED" | "RESERVED" | "MAINTENANCE";
  qrCodeUrl?: string;
  createdAt?: string;
}

export type TableBookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "CONFIRMED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export interface TableBooking {
  id: string;
  restaurantId?: string;
  branchId: string;
  tableId: string;
  tableNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: string;
  time: string;
  guests: number;
  status: TableBookingStatus;
  createdAt: string;
  updatedAt?: string;
}

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "REJECTED"
  | "CANCELLED";

export type OrderType = "DELIVERY" | "TAKEAWAY" | "DINE_IN";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
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
  estimatedPrepMinutes?: number;
  rejectionReason?: string;
  cancelledBy?: "customer" | "admin" | "branch_manager" | string;
  cancellationReason?: string;
  cancellationNote?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DeliveryChargeRule {
  id: string;
  restaurantId: string;
  minDistanceKm: number;
  maxDistanceKm: number;
  baseCharge: number;
  perKmCharge: number;
}

export interface DeliveryChargeSlab {
  id: string;
  restaurantId: string;
  branchId: string;
  minDistanceKm: number;
  maxDistanceKm: number;
  deliveryCharge: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt?: string;
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
  description?: string;
  banner?: string;
  type?: "FESTIVAL" | "FREE_DELIVERY" | "FLAT_DISCOUNT" | "COMBO";
  discountPercentage?: number;
  coupon?: string;
  discount?: number;
  minimumOrder?: number;
  startDate?: string;
  endDate?: string;
  restaurantId?: string;
  branchId: string;
  status: "ACTIVE" | "DRAFT" | "EXPIRED";
  validityType?: "FULL_DAY" | "SCHEDULED_TIME";
  startTime?: string;
  endTime?: string;
  applicableDays?: string[];
  usageLimit?: number;
  usageCount?: number;
  remainingUses?: number;
  minimumOrderAmount?: number;
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue?: number;
  maximumDiscountAmount?: number;
  excludedCategoryIds?: string[];
  isActive?: boolean;
  updatedAt?: string;
}

export interface SavedAddress {
  id?: string;
  label?: string;
  fullAddress: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

export interface CustomerTimelineItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: "REGISTRATION" | "FIRST_ORDER" | "LATEST_ORDER" | "ADDRESS_UPDATE" | "PROFILE_UPDATE";
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  branchId?: string;
  avatar?: string;
  profileImage?: string;
  createdAt?: string;
  registeredDate?: string;
  address?: string;
  currentSavedAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  status?: "ACTIVE" | "INACTIVE";
  assignedRestaurantCount?: number;
  savedAddresses?: SavedAddress[];
  timeline?: CustomerTimelineItem[];
}

export interface AppNotification {
  id: string;
  userId?: string;
  branchId?: string;
  title: string;
  message: string;
  type: "ORDER_UPDATE" | "TABLE_BOOKING" | "SYSTEM";
  read: boolean;
  createdAt: string;
}
