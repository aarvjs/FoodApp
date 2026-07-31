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
import { CategoryModel, validateCategoryData } from "@/models/category";
import { uploadImage } from "@/services/storageService";

const COLLECTION_NAME = "categories";

export const categoryRepository = {
  async getByBranch(branchId: string): Promise<CategoryModel[]> {
    if (!branchId) return [];
    try {
      const q = query(collection(db, COLLECTION_NAME), where("branchId", "==", branchId));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as CategoryModel));
    } catch (e) {
      console.warn("categoryRepository.getByBranch error:", e);
      return [];
    }
  },

  subscribeByBranch(branchId: string, callback: (categories: CategoryModel[]) => void, onError?: (err: any) => void) {
    if (!branchId) {
      callback([]);
      return () => {};
    }
    const q = query(collection(db, COLLECTION_NAME), where("branchId", "==", branchId));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as CategoryModel));
        callback(items);
      },
      (err) => {
        console.warn("categoryRepository.subscribeByBranch notice:", err.message);
        if (onError) onError(err);
      }
    );
  },

  async create(data: Partial<CategoryModel> & { imageFile?: File | string }): Promise<CategoryModel> {
    validateCategoryData(data); // MANDATORY CHECK

    const docRef = doc(collection(db, COLLECTION_NAME));
    let imageUrl = data.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80";
    if (data.imageFile) {
      imageUrl = await uploadImage(data.imageFile, "categories");
    }

    const newCategory: CategoryModel = {
      id: docRef.id,
      restaurantId: data.restaurantId!,
      branchId: data.branchId!, // STRICT MANDATORY OWNERSHIP
      name: data.name || "Category",
      slug: (data.name || "category").toLowerCase().replace(/\s+/g, "-"),
      description: data.description || "",
      displayOrder: data.displayOrder || 1,
      image: imageUrl,
      itemCount: 0,
      status: data.status || "ACTIVE",
      createdAt: new Date().toISOString()
    };

    await setDoc(docRef, newCategory);
    return newCategory;
  },

  async update(id: string, updated: Partial<CategoryModel> & { imageFile?: File | string }): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    let payload: any = { ...updated, updatedAt: new Date().toISOString() };
    if (updated.imageFile) {
      payload.image = await uploadImage(updated.imageFile, "categories");
      delete payload.imageFile;
    }
    await updateDoc(docRef, payload);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
