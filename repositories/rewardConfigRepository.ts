import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  increment
} from "firebase/firestore";
import { RewardConfig } from "@/models/rewardConfig";

const COLLECTION_NAME = "reward_points_config";

export const rewardConfigRepository = {
  async getByBranch(branchId: string): Promise<RewardConfig | null> {
    if (!branchId) return null;
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("branchId", "==", branchId)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const docSnap = snap.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as RewardConfig;
    } catch (e) {
      console.warn("rewardConfigRepository.getByBranch error:", e);
      return null;
    }
  },

  async awardPointsForOrder(order: {
    id: string;
    orderNumber?: string;
    restaurantId: string;
    branchId: string;
    branchName?: string;
    customerId?: string;
    userId?: string;
    items?: any[];
    status?: string;
  }): Promise<number> {
    const custId = order.customerId || order.userId;
    if (!order.id || !custId) return 0;

    // Strict status gate: Reward points are credited ONLY when order is DELIVERED
    if (order.status !== "DELIVERED" && order.status !== "COMPLETED") return 0;

    try {
      // 1. Guard against duplicate reward awarding for the same order ID
      const txQuery = query(
        collection(db, "reward_transactions"),
        where("orderId", "==", order.id)
      );
      const txSnap = await getDocs(txQuery);
      if (!txSnap.empty) return 0;

      // 2. Calculate eligible menu product total ONLY (excluding combos)
      let eligibleMenuTotal = 0;
      if (Array.isArray(order.items)) {
        for (const item of order.items) {
          const isCombo = item.isCombo === true || item.itemType === "combo";
          if (!isCombo) {
            const price = Number(item.unitPrice ?? item.price ?? 0);
            const qty = Number(item.quantity ?? 1);
            eligibleMenuTotal += price * qty;
          }
        }
      }

      if (eligibleMenuTotal <= 0) return 0;

      // 3. Fetch configuration for branch
      const config = await this.getByBranch(order.branchId);
      if (!config || config.status !== "ACTIVE" || !config.rewardPoints || config.rewardPoints <= 0) {
        return 0;
      }

      if (eligibleMenuTotal < config.minimumOrderAmount) {
        return 0;
      }

      const pointsToAward = Number(config.rewardPoints);
      const now = new Date().toISOString();

      // 4. Create reward transaction
      const txRef = doc(collection(db, "reward_transactions"));
      await setDoc(txRef, {
        id: txRef.id,
        userId: custId,
        orderId: order.id,
        orderNumber: order.orderNumber || order.id,
        points: pointsToAward,
        qualifyingAmount: eligibleMenuTotal,
        restaurantId: order.restaurantId,
        branchId: order.branchId,
        branchName: order.branchName || "Branch",
        createdAt: now
      });

      // 5. Update user reward points balance in users collection
      const userRef = doc(db, "users", custId);
      await setDoc(
        userRef,
        {
          rewardPoints: increment(pointsToAward),
          updatedAt: now
        },
        { merge: true }
      );

      return pointsToAward;
    } catch (e) {
      console.warn("rewardConfigRepository.awardPointsForOrder error:", e);
      return 0;
    }
  },

  async getByRestaurant(restaurantId: string): Promise<RewardConfig[]> {

    if (!restaurantId) return [];
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("restaurantId", "==", restaurantId)
      );
      const snap = await getDocs(q);
      return snap.docs.map(
        (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as RewardConfig)
      );
    } catch (e) {
      console.warn("rewardConfigRepository.getByRestaurant error:", e);
      return [];
    }
  },

  subscribeByBranch(
    branchId: string,
    callback: (config: RewardConfig | null) => void,
    onError?: (err: any) => void
  ) {
    if (!branchId) {
      callback(null);
      return () => {};
    }
    const q = query(
      collection(db, COLLECTION_NAME),
      where("branchId", "==", branchId)
    );
    return onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          callback(null);
        } else {
          const docSnap = snap.docs[0];
          callback({ id: docSnap.id, ...docSnap.data() } as RewardConfig);
        }
      },
      (err) => {
        console.warn("rewardConfigRepository.subscribeByBranch notice:", err.message);
        if (onError) onError(err);
      }
    );
  },

  subscribeByRestaurant(
    restaurantId: string,
    callback: (configs: RewardConfig[]) => void,
    onError?: (err: any) => void
  ) {
    if (!restaurantId) {
      callback([]);
      return () => {};
    }
    const q = query(
      collection(db, COLLECTION_NAME),
      where("restaurantId", "==", restaurantId)
    );
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map(
          (docSnap) => ({ id: docSnap.id, ...docSnap.data() } as RewardConfig)
        );
        callback(items);
      },
      (err) => {
        console.warn("rewardConfigRepository.subscribeByRestaurant notice:", err.message);
        if (onError) onError(err);
      }
    );
  },

  async saveOrUpdate(data: Partial<RewardConfig>): Promise<RewardConfig> {
    if (!data.restaurantId || !data.branchId) {
      throw new Error("restaurantId and branchId are mandatory for reward points configuration.");
    }

    const now = new Date().toISOString();
    const existing = await this.getByBranch(data.branchId);

    if (existing && existing.id) {
      const docRef = doc(db, COLLECTION_NAME, existing.id);
      const updatePayload: Record<string, any> = {
        minimumOrderAmount: Number(data.minimumOrderAmount ?? 0),
        rewardPoints: Number(data.rewardPoints ?? 0),
        status: data.status || "ACTIVE",
        updatedAt: now,
      };
      if (data.updatedBy) updatePayload.updatedBy = data.updatedBy;

      await updateDoc(docRef, updatePayload);
      return {
        ...existing,
        ...updatePayload,
      } as RewardConfig;
    } else {
      const docRef = doc(collection(db, COLLECTION_NAME));
      const newConfig: RewardConfig = {
        id: docRef.id,
        restaurantId: data.restaurantId,
        branchId: data.branchId,
        minimumOrderAmount: Number(data.minimumOrderAmount ?? 0),
        rewardPoints: Number(data.rewardPoints ?? 0),
        status: data.status || "ACTIVE",
        createdAt: now,
        updatedAt: now,
        updatedBy: data.updatedBy || "System",
      };

      await setDoc(docRef, newConfig);
      return newConfig;
    }
  }
};
