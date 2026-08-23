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

    const pointVal = data.pointValue !== undefined ? Number(data.pointValue) : 0.25;
    if (isNaN(pointVal) || pointVal <= 0) {
      return {
        isValid: false,
        error: "Point value must be a valid positive monetary number (e.g. ₹0.25)."
      };
    }

    if (Array.isArray(data.slabs)) {
      for (let i = 0; i < data.slabs.length; i++) {
        const slab = data.slabs[i];
        if (isNaN(Number(slab.minAmount)) || Number(slab.minAmount) < 0) {
          return {
            isValid: false,
            error: `Slab #${i + 1} has an invalid minimum order amount.`
          };
        }
        if (isNaN(Number(slab.rewardPoints)) || Number(slab.rewardPoints) < 0) {
          return {
            isValid: false,
            error: `Slab #${i + 1} has an invalid reward points value.`
          };
        }
      }
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
