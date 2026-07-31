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
  orderBy 
} from "firebase/firestore";
import { uploadImage } from "./storageService";

const COLLECTION_NAME = "banners";

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  restaurantId: string;
  branchId: string;
  priority: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
}

export const bannerService = {
  getBanners: async (): Promise<Banner[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("priority", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Banner));
    } catch (e) {
      console.warn("getBanners error:", e);
      return [];
    }
  },

  subscribeToBanners: (callback: (banners: Banner[]) => void, onError?: (err: any) => void) => {
    const q = query(collection(db, COLLECTION_NAME));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Banner));
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Permission Notice (banners):", err.message);
        if (onError) onError(err);
      }
    );
  },

  addBanner: async (data: Partial<Banner> & { imageFile?: File | string }): Promise<Banner> => {
    const docRef = doc(collection(db, COLLECTION_NAME));

    let imageUrl = data.image || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&auto=format&fit=crop&q=80";
    if (data.imageFile) {
      imageUrl = await uploadImage(data.imageFile, "banners");
    }

    const newBanner: Banner = {
      id: docRef.id,
      title: data.title || "Special Offer",
      subtitle: data.subtitle || "Get delicious meals delivered fast",
      image: imageUrl,
      restaurantId: data.restaurantId || "",
      branchId: data.branchId || "",
      priority: data.priority || 1,
      status: data.status || "ACTIVE",
      createdAt: new Date().toISOString()
    };

    await setDoc(docRef, newBanner);
    return newBanner;
  },

  updateBanner: async (id: string, updated: Partial<Banner> & { imageFile?: File | string }): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    let payload: any = { ...updated };
    if (updated.imageFile) {
      payload.image = await uploadImage(updated.imageFile, "banners");
      delete payload.imageFile;
    }
    await updateDoc(docRef, payload);
  },

  deleteBanner: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
