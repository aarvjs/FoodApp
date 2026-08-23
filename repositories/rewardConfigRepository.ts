import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  increment,
  orderBy
} from "firebase/firestore";
import { RewardConfig, RewardSlab } from "@/models/rewardConfig";

const COLLECTION_NAME = "reward_points_config";

export const DEFAULT_REWARD_SLABS: RewardSlab[] = [
  { id: "slab-1", minAmount: 200, rewardPoints: 10, enabled: true },
  { id: "slab-2", minAmount: 300, rewardPoints: 12, enabled: true },
  { id: "slab-3", minAmount: 400, rewardPoints: 15, enabled: true },
  { id: "slab-4", minAmount: 500, rewardPoints: 18, enabled: true },
  { id: "slab-5", minAmount: 600, rewardPoints: 20, enabled: true },
  { id: "slab-6", minAmount: 700, rewardPoints: 25, enabled: true },
  { id: "slab-7", minAmount: 800, rewardPoints: 30, enabled: true },
  { id: "slab-8", minAmount: 1000, rewardPoints: 40, enabled: true },
];

export const rewardConfigRepository = {
  async getByBranch(branchId: string, restaurantId?: string): Promise<RewardConfig | null> {
    if (!branchId) return null;
    try {
      // 1. Direct branch lookup (e.g. Lucknow, Kanpur)
      const q = query(
        collection(db, COLLECTION_NAME),
        where("branchId", "==", branchId)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const data = docSnap.data();
        return {
          id: docSnap.id,
          restaurantId: data.restaurantId || restaurantId || "default",
          branchId: data.branchId || branchId,
          branchScope: data.branchScope || (data.branchId === "ALL" ? "ALL" : "BRANCH"),
          pointValue: Number(data.pointValue ?? 0.25),
          slabs: Array.isArray(data.slabs) ? data.slabs : DEFAULT_REWARD_SLABS,
          status: data.status || "ACTIVE",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          updatedBy: data.updatedBy
        } as RewardConfig;
      }

      // 2. Global "ALL" branch lookup fallback
      if (branchId !== "ALL") {
        const qAll = query(
          collection(db, COLLECTION_NAME),
          where("branchId", "==", "ALL")
        );
        const snapAll = await getDocs(qAll);
        if (!snapAll.empty) {
          const docSnap = snapAll.docs[0];
          const data = docSnap.data();
          return {
            id: docSnap.id,
            restaurantId: data.restaurantId || restaurantId || "default",
            branchId: "ALL",
            branchScope: "ALL",
            pointValue: Number(data.pointValue ?? 0.25),
            slabs: Array.isArray(data.slabs) ? data.slabs : DEFAULT_REWARD_SLABS,
            status: data.status || "ACTIVE",
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            updatedBy: data.updatedBy
          } as RewardConfig;
        }
      }

      // 3. Fallback default configuration if nothing exists in database
      return {
        restaurantId: restaurantId || "default",
        branchId: branchId,
        branchScope: branchId === "ALL" ? "ALL" : "BRANCH",
        pointValue: 0.25,
        slabs: DEFAULT_REWARD_SLABS,
        status: "ACTIVE"
      };
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

    // Strict status gate: Reward points are credited ONLY when order is DELIVERED or COMPLETED
    if (order.status !== "DELIVERED" && order.status !== "COMPLETED") return 0;

    try {
      // 1. Idempotency guard: prevent duplicate reward crediting for the same order
      const txQuery = query(
        collection(db, "reward_transactions"),
        where("orderId", "==", order.id),
        where("type", "==", "EARNED")
      );
      const txSnap = await getDocs(txQuery);
      if (!txSnap.empty) return 0;

      // 2. Calculate eligible menu product total (excluding combos)
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

      // 3. Fetch active configuration for the branch (or global ALL fallback)
      const config = await this.getByBranch(order.branchId, order.restaurantId);
      if (!config || config.status !== "ACTIVE") return 0;

      // 4. Calculate earned points using dynamic active slabs
      let pointsToAward = 0;
      if (Array.isArray(config.slabs) && config.slabs.length > 0) {
        const matchingSlabs = config.slabs.filter(
          (s) => s.enabled && eligibleMenuTotal >= s.minAmount
        );
        if (matchingSlabs.length > 0) {
          matchingSlabs.sort((a, b) => b.minAmount - a.minAmount);
          pointsToAward = Number(matchingSlabs[0].rewardPoints || 0);
        }
      }

      if (pointsToAward <= 0) return 0;

      const now = new Date().toISOString();
      const pointVal = Number(config.pointValue ?? 0.25);
      const monetaryVal = pointsToAward * pointVal;

      // 5. Fetch user document to get current points for remainingBalance
      const userRef = doc(db, "users", custId);
      const userSnap = await getDoc(userRef);
      const currentPts = userSnap.exists()
        ? Number(userSnap.data().rewardPoints ?? userSnap.data().points ?? 0)
        : 0;
      const newBalance = currentPts + pointsToAward;

      // 6. Create immutable ledger entry in reward_transactions
      const txRef = doc(collection(db, "reward_transactions"));
      await setDoc(txRef, {
        id: txRef.id,
        transactionId: txRef.id,
        userId: custId,
        customerId: custId,
        orderId: order.id,
        orderNumber: order.orderNumber || order.id,
        points: pointsToAward,
        monetaryValue: monetaryVal,
        qualifyingAmount: eligibleMenuTotal,
        restaurantId: order.restaurantId,
        branchId: order.branchId,
        branchName: order.branchName || "Branch",
        type: "EARNED",
        transactionType: "EARNED",
        remainingBalance: newBalance,
        description: `Earned ${pointsToAward} Reward Points on Order #${order.orderNumber || order.id}`,
        createdAt: now,
        timestamp: now
      });

      // 7. Update customer's wallet balance atomically
      await setDoc(
        userRef,
        {
          rewardPoints: increment(pointsToAward),
          totalEarnedPoints: increment(pointsToAward),
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

  async reversePointsForOrder(
    orderId: string,
    orderNumber?: string,
    customerId?: string
  ): Promise<{ reversedEarned: number; refundedRedeemed: number }> {
    if (!orderId) return { reversedEarned: 0, refundedRedeemed: 0 };

    try {
      const q = query(
        collection(db, "reward_transactions"),
        where("orderId", "==", orderId)
      );
      const txSnap = await getDocs(q);
      if (txSnap.empty) return { reversedEarned: 0, refundedRedeemed: 0 };

      let reversedEarned = 0;
      let refundedRedeemed = 0;
      const now = new Date().toISOString();

      for (const docSnap of txSnap.docs) {
        const tx = docSnap.data();
        const custId = customerId || tx.userId || tx.customerId;
        if (!custId) continue;

        const txType = (tx.type || tx.transactionType || "").toUpperCase();

        // 1. Reverse points previously EARNED on this order if cancelled/refunded
        if (txType === "EARNED") {
          // Check if already reversed
          const alreadyReversed = txSnap.docs.some((d) => {
            const data = d.data();
            return (
              (data.type || data.transactionType) === "REFUNDED" &&
              data.refTxId === tx.id
            );
          });

          if (!alreadyReversed) {
            const ptsToDeduct = Math.abs(Number(tx.points || 0));
            if (ptsToDeduct > 0) {
              const userRef = doc(db, "users", custId);
              const userSnap = await getDoc(userRef);
              const currentPts = userSnap.exists()
                ? Number(userSnap.data().rewardPoints ?? userSnap.data().points ?? 0)
                : 0;
              const newBalance = Math.max(0, currentPts - ptsToDeduct);

              const revTxRef = doc(collection(db, "reward_transactions"));
              await setDoc(revTxRef, {
                id: revTxRef.id,
                transactionId: revTxRef.id,
                userId: custId,
                customerId: custId,
                orderId: orderId,
                orderNumber: orderNumber || orderId,
                points: -ptsToDeduct,
                monetaryValue: 0,
                restaurantId: tx.restaurantId || "",
                branchId: tx.branchId || "",
                branchName: tx.branchName || "Branch",
                type: "REFUNDED",
                transactionType: "REFUNDED",
                refTxId: tx.id,
                remainingBalance: newBalance,
                description: `Reversed ${ptsToDeduct} earned points for cancelled Order #${orderNumber || orderId}`,
                createdAt: now,
                timestamp: now
              });

              await setDoc(
                userRef,
                {
                  rewardPoints: increment(-ptsToDeduct),
                  updatedAt: now
                },
                { merge: true }
              );

              reversedEarned += ptsToDeduct;
            }
          }
        }

        // 2. Restore points REDEEMED on this order if cancelled/refunded
        if (txType === "REDEEMED") {
          const alreadyRestored = txSnap.docs.some((d) => {
            const data = d.data();
            return (
              (data.type || data.transactionType) === "REFUNDED" &&
              data.refTxId === tx.id
            );
          });

          if (!alreadyRestored) {
            const ptsToRestore = Math.abs(Number(tx.points || 0));
            if (ptsToRestore > 0) {
              const userRef = doc(db, "users", custId);
              const userSnap = await getDoc(userRef);
              const currentPts = userSnap.exists()
                ? Number(userSnap.data().rewardPoints ?? userSnap.data().points ?? 0)
                : 0;
              const newBalance = currentPts + ptsToRestore;

              const resTxRef = doc(collection(db, "reward_transactions"));
              await setDoc(resTxRef, {
                id: resTxRef.id,
                transactionId: resTxRef.id,
                userId: custId,
                customerId: custId,
                orderId: orderId,
                orderNumber: orderNumber || orderId,
                points: ptsToRestore,
                monetaryValue: Number(tx.monetaryValue || 0),
                restaurantId: tx.restaurantId || "",
                branchId: tx.branchId || "",
                branchName: tx.branchName || "Branch",
                type: "REFUNDED",
                transactionType: "REFUNDED",
                refTxId: tx.id,
                remainingBalance: newBalance,
                description: `Restored ${ptsToRestore} redeemed points for cancelled Order #${orderNumber || orderId}`,
                createdAt: now,
                timestamp: now
              });

              await setDoc(
                userRef,
                {
                  rewardPoints: increment(ptsToRestore),
                  updatedAt: now
                },
                { merge: true }
              );

              refundedRedeemed += ptsToRestore;
            }
          }
        }
      }

      return { reversedEarned, refundedRedeemed };
    } catch (e) {
      console.warn("rewardConfigRepository.reversePointsForOrder error:", e);
      return { reversedEarned: 0, refundedRedeemed: 0 };
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
          // If branch config does not exist, try global "ALL" config
          this.getByBranch(branchId).then((fallback) => callback(fallback));
        } else {
          const docSnap = snap.docs[0];
          const data = docSnap.data();
          callback({
            id: docSnap.id,
            restaurantId: data.restaurantId,
            branchId: data.branchId,
            branchScope: data.branchScope || (data.branchId === "ALL" ? "ALL" : "BRANCH"),
            pointValue: Number(data.pointValue ?? 0.25),
            slabs: Array.isArray(data.slabs) ? data.slabs : DEFAULT_REWARD_SLABS,
            status: data.status || "ACTIVE",
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            updatedBy: data.updatedBy
          } as RewardConfig);
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

    const slabsToSave = Array.isArray(data.slabs) ? data.slabs : DEFAULT_REWARD_SLABS;
    const pointValueToSave = Number(data.pointValue ?? 0.25);
    const scopeToSave = data.branchScope || (data.branchId === "ALL" ? "ALL" : "BRANCH");

    if (existing && existing.id && existing.branchId === data.branchId) {
      const docRef = doc(db, COLLECTION_NAME, existing.id);
      const updatePayload: Record<string, any> = {
        branchScope: scopeToSave,
        pointValue: pointValueToSave,
        slabs: slabsToSave,
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
        branchScope: scopeToSave,
        pointValue: pointValueToSave,
        slabs: slabsToSave,
        status: data.status || "ACTIVE",
        createdAt: now,
        updatedAt: now,
        updatedBy: data.updatedBy || "System",
      };

      await setDoc(docRef, newConfig);
      return newConfig;
    }
  },

  async getRewardTransactions(filters?: {
    branchId?: string;
    customerId?: string;
    orderId?: string;
    type?: string;
  }): Promise<any[]> {
    try {
      let q = collection(db, "reward_transactions") as any;
      if (filters?.branchId && filters.branchId !== "ALL") {
        q = query(q, where("branchId", "==", filters.branchId));
      }
      if (filters?.customerId) {
        q = query(q, where("userId", "==", filters.customerId));
      }
      if (filters?.orderId) {
        q = query(q, where("orderId", "==", filters.orderId));
      }
      if (filters?.type) {
        q = query(q, where("type", "==", filters.type));
      }

      const snap = await getDocs(q);
      const list = snap.docs.map((docSnap: any) => ({ id: docSnap.id, ...(docSnap.data() as object) }));



      list.sort((a: any, b: any) => new Date(b.createdAt || b.timestamp || 0).getTime() - new Date(a.createdAt || a.timestamp || 0).getTime());
      return list;
    } catch (e) {
      console.warn("rewardConfigRepository.getRewardTransactions error:", e);
      return [];
    }
  }
};
