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

