import { db } from "@/firebase/config";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query,
  where 
} from "firebase/firestore";
import { Offer } from "@/types";

const COLLECTION_NAME = "offers";

export const offerService = {
  getOffers: async (): Promise<Offer[]> => {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Offer));
    } catch (e) {
      console.warn("getOffers error:", e);
      return [];
    }
  },

  subscribeToOffers: (callback: (offers: Offer[]) => void, onError?: (err: any) => void) => {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Offer));
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Permission Notice (offers):", err.message);
        if (onError) onError(err);
      }
    );
  },

  subscribeToBranchOffers: (branchId: string, callback: (offers: Offer[]) => void, onError?: (err: any) => void) => {
    if (!branchId) {
      callback([]);
      return () => {};
    }
    const q = query(collection(db, COLLECTION_NAME), where("branchId", "==", branchId));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Offer));
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Notice (branchOffers):", err.message);
        if (onError) onError(err);
      }
    );
  },

  addOffer: async (data: Partial<Offer> & { coupon?: string; discount?: number; minimumOrder?: number }): Promise<Offer> => {
    const docRef = doc(collection(db, COLLECTION_NAME));
    
    const usageLimitVal = data.usageLimit !== undefined ? Number(data.usageLimit) : 0;
    const usageCountVal = data.usageCount !== undefined ? Number(data.usageCount) : 0;
    const remainingUsesVal = usageLimitVal > 0 ? Math.max(0, usageLimitVal - usageCountVal) : 0;

    const newOffer: Offer = {
      id: docRef.id,
      title: data.title || "Special Deal",
      description: data.description || "Limited time discount",
      banner: data.banner || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80",
      type: data.type || "FLAT_DISCOUNT",
      discountPercentage: data.discountPercentage || data.discount || 15,
      branchId: data.branchId || "ALL",
      restaurantId: data.restaurantId || "",
      coupon: data.coupon || "FLAT15",
      discount: data.discount || data.discountPercentage || 15,
      minimumOrder: data.minimumOrder !== undefined ? Number(data.minimumOrder) : 299,
      startDate: data.startDate || new Date().toISOString().split("T")[0],
      endDate: data.endDate || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      status: data.status || "ACTIVE",
      validityType: data.validityType || "FULL_DAY",
      startTime: data.startTime || "",
      endTime: data.endTime || "",
      applicableDays: data.applicableDays || [],
      usageLimit: usageLimitVal,
      usageCount: usageCountVal,
      remainingUses: remainingUsesVal,
      minimumOrderAmount: data.minimumOrderAmount !== undefined ? Number(data.minimumOrderAmount) : Number(data.minimumOrder || 0),
      discountType: data.discountType || (data.discountPercentage ? "PERCENTAGE" : "FIXED_AMOUNT"),
      discountValue: data.discountValue !== undefined ? Number(data.discountValue) : Number(data.discountPercentage || data.discount || 0),
      maximumDiscountAmount: data.maximumDiscountAmount !== undefined ? Number(data.maximumDiscountAmount) : 0,
      excludedCategoryIds: data.excludedCategoryIds || [],
      isActive: data.isActive !== false && data.status !== "EXPIRED",
      updatedAt: new Date().toISOString()
    } as any;

    await setDoc(docRef, newOffer);
    return newOffer;
  },

  updateOffer: async (id: string, updated: Partial<Offer>): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updatePayload: Record<string, any> = {
      ...updated,
      updatedAt: new Date().toISOString()
    };
    if (updated.usageLimit !== undefined || updated.usageCount !== undefined) {
      const limit = updated.usageLimit !== undefined ? Number(updated.usageLimit) : 0;
      const count = updated.usageCount !== undefined ? Number(updated.usageCount) : 0;
      updatePayload.remainingUses = limit > 0 ? Math.max(0, limit - count) : 0;
    }
    await updateDoc(docRef, updatePayload);
  },

  deleteOffer: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
