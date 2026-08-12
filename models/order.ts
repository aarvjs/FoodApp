export type OrderStatusType =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "REJECTED"
  | "CANCELLED";

export type OrderTypeFormat = "DELIVERY" | "TAKEAWAY" | "DINE_IN";

export interface OrderItemModel {
  itemType?: "product" | "combo" | string;
  productId: string;
  productName: string;
  isCombo?: boolean;
  comboId?: string;
  comboName?: string;
  comboItemId?: string;
  quantity: number;
  price: number;
  basePrice?: number;
  unitPrice?: number;
  totalPrice?: number;
  itemTotal?: number;
  image?: string;
  category?: string;
  selectedVariant?: { name: string; additionalPrice?: number } | string;
  size?: string;
  customizations?: string[];
  customizationSelections?: {
    groupName?: string;
    optionId?: string;
    optionName?: string;
    name?: string;
    additionalPrice?: number;
  }[];
  removedItems?: string[];
  replacements?: string[];
  selectedAddons?: string[];
  selectedComboOptions?: {
    categoryName?: string;
    groupName?: string;
    optionName?: string;
    name?: string;
  }[];
}

export interface OrderModel {
  id: string;
  orderNumber: string;
  restaurantId: string;
  branchId: string;
  branchName: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: OrderItemModel[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  totalAmount: number;
  paymentStatus: "PAID" | "PENDING" | "REFUNDED";
  paymentMethod: "UPI" | "CREDIT_CARD" | "CASH_ON_DELIVERY";
  orderType: OrderTypeFormat;
  status: OrderStatusType;
  estimatedPrepMinutes?: number;
  rejectionReason?: string;
  cancelledBy?: "customer" | "admin" | "branch_manager" | string;
  cancellationReason?: string;
  cancellationNote?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt?: string;
}
