import { db } from "@/firebase/config";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { OfferModel } from "@/models/offer";

const COLLECTION_NAME = "offers";

export const offerRepository = {
  async getByBranch(branchId: string): Promise<OfferModel[]> {
    if (!branchId) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME), where("branchId", "==", branchId));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as OfferModel));
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
    const newOffer: OfferModel = {
      id: docRef.id,
      restaurantId: data.restaurantId,
      branchId: data.branchId,
      title: data.title || "Special Offer",
      description: data.description || "Limited time discount",
      banner: data.banner || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80",
      type: data.type || "FLAT_DISCOUNT",
      discountPercentage: data.discountPercentage || 15,
      coupon: data.coupon || "SPECIAL15",
      minimumOrder: data.minimumOrder || 299,
      status: data.status || "ACTIVE",
      createdAt: new Date().toISOString()
    };

    await setDoc(docRef, newOffer);
    return newOffer;
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  }
};
