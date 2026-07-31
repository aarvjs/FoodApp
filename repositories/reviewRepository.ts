import { db } from "@/firebase/config";
import { collection, getDocs, doc, setDoc, query, where } from "firebase/firestore";
import { ReviewModel } from "@/models/review";

const COLLECTION_NAME = "reviews";

export const reviewRepository = {
  async getByBranch(branchId: string): Promise<ReviewModel[]> {
    if (!branchId) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME), where("branchId", "==", branchId));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as ReviewModel));
    } catch (e) {
      console.warn("reviewRepository.getByBranch error:", e);
      return [];
    }
  },

  async create(data: Partial<ReviewModel>): Promise<ReviewModel> {
    if (!data.branchId || !data.restaurantId) {
      throw new Error("reviewRepository.create: branchId and restaurantId are mandatory.");
    }
    const docRef = doc(collection(db, COLLECTION_NAME));
    const newReview: ReviewModel = {
      id: docRef.id,
      restaurantId: data.restaurantId,
      branchId: data.branchId,
      customerName: data.customerName || "Customer",
      rating: data.rating || 5,
      comment: data.comment || "Great food and quick delivery!",
      createdAt: new Date().toISOString()
    };
    await setDoc(docRef, newReview);
    return newReview;
  }
};
