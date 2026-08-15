export interface RewardConfig {
  id?: string;
  restaurantId: string;
  branchId: string;
  minimumOrderAmount: number;
  rewardPoints: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}
