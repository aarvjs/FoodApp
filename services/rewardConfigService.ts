import { RewardConfig } from "@/models/rewardConfig";
import { rewardConfigRepository } from "@/repositories/rewardConfigRepository";

export interface RewardConfigValidationResult {
  isValid: boolean;
  error?: string;
}

export const rewardConfigService = {
  validateRewardConfig(data: Partial<RewardConfig>): RewardConfigValidationResult {
    if (!data.restaurantId || !data.restaurantId.trim()) {
      return { isValid: false, error: "Restaurant ID is required." };
    }

    if (!data.branchId || !data.branchId.trim()) {
      return { isValid: false, error: "Branch ID is required." };
    }

    const minAmount = data.minimumOrderAmount !== undefined ? Number(data.minimumOrderAmount) : NaN;
    const points = data.rewardPoints !== undefined ? Number(data.rewardPoints) : NaN;

    if (isNaN(minAmount) || minAmount < 0) {
      return {
        isValid: false,
        error: "Minimum order amount must be a valid number greater than or equal to ₹0."
      };
    }

    if (isNaN(points) || points < 0) {
      return {
        isValid: false,
        error: "Reward points must be a valid non-negative number."
      };
    }

    return { isValid: true };
  },

  async saveRewardConfig(
    data: Partial<RewardConfig>,
    updatedBy?: string
  ): Promise<RewardConfig> {
    const validation = this.validateRewardConfig(data);
    if (!validation.isValid) {
      throw new Error(validation.error || "Invalid reward points configuration data.");
    }

    return await rewardConfigRepository.saveOrUpdate({
      ...data,
      updatedBy: updatedBy || "Admin"
    });
  },

  async getRewardConfigByBranch(branchId: string): Promise<RewardConfig | null> {
    return await rewardConfigRepository.getByBranch(branchId);
  },

  subscribeToBranchRewardConfig(
    branchId: string,
    callback: (config: RewardConfig | null) => void,
    onError?: (err: any) => void
  ) {
    return rewardConfigRepository.subscribeByBranch(branchId, callback, onError);
  },

  subscribeToRestaurantRewardConfigs(
    restaurantId: string,
    callback: (configs: RewardConfig[]) => void,
    onError?: (err: any) => void
  ) {
    return rewardConfigRepository.subscribeByRestaurant(restaurantId, callback, onError);
  }
};
