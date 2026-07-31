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
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
  customizations?: string[];
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
  createdAt: string;
  updatedAt?: string;
}
