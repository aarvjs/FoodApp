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
  where,
  orderBy 
} from "firebase/firestore";
import { Category } from "@/types";
import { uploadImage } from "./storageService";

const COLLECTION_NAME = "categories";

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Category));
    } catch (e) {
      console.warn("getCategories error:", e);
      return [];
    }
  },

  subscribeToCategories: (callback: (categories: Category[]) => void, onError?: (err: any) => void) => {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Category));
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Permission Notice (categories):", err.message);
        if (onError) onError(err);
      }
    );
  },

  subscribeToBranchCategories: (branchId: string, callback: (categories: Category[]) => void, onError?: (err: any) => void) => {
    if (!branchId) {
      callback([]);
      return () => {};
    }
    const q = query(collection(db, COLLECTION_NAME), where("branchId", "==", branchId));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Category));
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Notice (branchCategories):", err.message);
        if (onError) onError(err);
      }
    );
  },

  addCategory: async (data: Partial<Category> & { imageFile?: File | string }): Promise<Category> => {
    const docRef = doc(collection(db, COLLECTION_NAME));
    
    let imageUrl = data.image || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80";
    if (data.imageFile) {
      imageUrl = await uploadImage(data.imageFile, "categories");
    }

    const newCategory: Category = {
      id: docRef.id,
      restaurantId: data.restaurantId || "",
      branchId: data.branchId || "",
      name: data.name || data.categoryName || "Category",
      categoryName: data.categoryName || data.name || "Category",
      slug: (data.name || data.categoryName || "category").toLowerCase().replace(/\s+/g, "-"),
      image: imageUrl,
      itemCount: data.itemCount || 0,
      status: data.status || "ACTIVE",
      createdAt: new Date().toISOString()
    } as any;

    await setDoc(docRef, newCategory);
    return newCategory;
  },

  updateCategory: async (id: string, updated: Partial<Category> & { imageFile?: File | string }): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    let payload: any = { ...updated, updatedAt: new Date().toISOString() };

    if (updated.imageFile) {
      payload.image = await uploadImage(updated.imageFile, "categories");
      delete payload.imageFile;
    }

    await updateDoc(docRef, payload);
  },

  deleteCategory: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
