import { db } from "@/firebase/config";
import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from "firebase/firestore";
import { GalleryItemModel } from "@/models/gallery";

const COLLECTION_NAME = "gallery";

export const galleryRepository = {
  async getByBranch(branchId: string): Promise<GalleryItemModel[]> {
    if (!branchId) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME), where("branchId", "==", branchId));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as GalleryItemModel));
    } catch (e) {
      console.warn("galleryRepository.getByBranch error:", e);
      return [];
    }
  },

  async create(data: Partial<GalleryItemModel>): Promise<GalleryItemModel> {
    if (!data.branchId || !data.restaurantId) {
      throw new Error("galleryRepository.create: branchId and restaurantId are mandatory.");
    }
    const docRef = doc(collection(db, COLLECTION_NAME));
    const newItem: GalleryItemModel = {
      id: docRef.id,
      restaurantId: data.restaurantId,
      branchId: data.branchId,
      imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
      title: data.title || "Branch Photo",
      category: data.category || "Interior",
      createdAt: new Date().toISOString()
    };
    await setDoc(docRef, newItem);
    return newItem;
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  }
};
