export interface RewardSlab {
  id: string;
  minAmount: number;
  rewardPoints: number;
  enabled: boolean;
}

export interface RewardConfig {
  id?: string;
  restaurantId: string;
  branchId: string; // 'ALL' or specific branch ID
  branchScope?: "ALL" | "BRANCH";
  pointValue: number; // e.g. 0.25 (₹0.25 per point)
  slabs: RewardSlab[];
  status: "ACTIVE" | "INACTIVE";
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

