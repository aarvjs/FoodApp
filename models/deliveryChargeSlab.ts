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
