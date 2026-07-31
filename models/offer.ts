export interface OfferModel {
  id: string;
  restaurantId: string;
  branchId: string;
  title: string;
  description: string;
  banner: string;
  type: "FESTIVAL" | "FREE_DELIVERY" | "FLAT_DISCOUNT" | "COMBO";
  discountPercentage?: number;
  coupon?: string;
  minimumOrder?: number;
  startDate?: string;
  endDate?: string;
  status: "ACTIVE" | "DRAFT" | "EXPIRED";
  createdAt: string;
}
