import { db } from "@/firebase/config";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { OfferModel } from "@/models/offer";

const COLLECTION_NAME = "offers";

export const offerRepository = {
  async getByRestaurant(restaurantId: string): Promise<OfferModel[]> {
    if (!restaurantId) return [];
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      return snap.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as OfferModel))
        .filter((off) => off.restaurantId === restaurantId || !off.restaurantId);
    } catch (e) {
      console.warn("offerRepository.getByRestaurant error:", e);
      return [];
    }
  },

  async getByBranch(branchId: string): Promise<OfferModel[]> {
    if (!branchId) return [];
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      return snap.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as OfferModel))
        .filter((off) => {
          if (!off.branchId && (!off.branchIds || off.branchIds.length === 0)) return true;
          if (off.branchId === branchId || off.branchId === "all" || off.branchId === "ALL" || off.branchId === "") return true;
          if (off.branchIds && (off.branchIds.includes(branchId) || off.branchIds.includes("all") || off.branchIds.includes("ALL"))) return true;
          return false;
        });
    } catch (e) {
      console.warn("offerRepository.getByBranch error:", e);
      return [];
    }
  },

  async create(data: Partial<OfferModel>): Promise<OfferModel> {
    if (!data.branchId || !data.restaurantId) {
      throw new Error("offerRepository.create: branchId and restaurantId are mandatory.");
    }
    const docRef = doc(collection(db, COLLECTION_NAME));
    const usageLimitVal = data.usageLimit !== undefined ? Number(data.usageLimit) : 0;
    const usageCountVal = data.usageCount !== undefined ? Number(data.usageCount) : 0;
    const remainingUsesVal = usageLimitVal > 0 ? Math.max(0, usageLimitVal - usageCountVal) : 0;

    const newOffer: OfferModel = {
      id: docRef.id,
      restaurantId: data.restaurantId,
      branchId: data.branchId,
      branchIds: data.branchIds || (data.branchId ? [data.branchId] : []),
      branchName: data.branchName || "",
      branchNames: data.branchNames || (data.branchName ? [data.branchName] : []),
      title: data.title || "Special Offer",
      description: data.description || "Limited time discount",
      banner: data.banner || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80",
      type: data.type || "FLAT_DISCOUNT",
      discountPercentage: data.discountPercentage || 15,
      coupon: data.coupon || "SPECIAL15",
      minimumOrder: data.minimumOrder !== undefined ? Number(data.minimumOrder) : 299,
      status: data.status || "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      validityType: data.validityType || "FULL_DAY",
      startTime: data.startTime || "",
      endTime: data.endTime || "",
      applicableDays: data.applicableDays || [],
      usageLimit: usageLimitVal,
      usageCount: usageCountVal,
      remainingUses: remainingUsesVal,
      minimumOrderAmount: data.minimumOrderAmount !== undefined ? Number(data.minimumOrderAmount) : Number(data.minimumOrder || 0),
      discountType: data.discountType || (data.discountPercentage ? "PERCENTAGE" : "FIXED_AMOUNT"),
      discountValue: data.discountValue !== undefined ? Number(data.discountValue) : Number(data.discountPercentage || 0),
      maximumDiscountAmount: data.maximumDiscountAmount !== undefined ? Number(data.maximumDiscountAmount) : 0,
      excludedCategoryIds: data.excludedCategoryIds || [],
      isActive: data.isActive !== false && data.status !== "EXPIRED"
    };

    await setDoc(docRef, newOffer);
    return newOffer;
  },

  async update(id: string, data: Partial<OfferModel>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const updatePayload: Record<string, any> = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    if (data.usageLimit !== undefined || data.usageCount !== undefined) {
      const limit = data.usageLimit !== undefined ? Number(data.usageLimit) : 0;
      const count = data.usageCount !== undefined ? Number(data.usageCount) : 0;
      updatePayload.remainingUses = limit > 0 ? Math.max(0, limit - count) : 0;
    }
    await updateDoc(docRef, updatePayload);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  }
};
