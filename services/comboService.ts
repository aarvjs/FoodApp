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
import { Combo } from "@/types";
import { uploadImage, uploadMultipleImages } from "./storageService";

const COLLECTION_NAME = "combos";

export const comboService = {
  getCombos: async (): Promise<Combo[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Combo));
    } catch (e) {
      console.warn("getCombos error:", e);
      return [];
    }
  },

  subscribeToCombos: (callback: (combos: Combo[]) => void, onError?: (err: any) => void) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Combo));
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Permission Notice (combos):", err.message);
        if (onError) onError(err);
      }
    );
  },

  subscribeToBranchCombos: (branchId: string, callback: (combos: Combo[]) => void, onError?: (err: any) => void) => {
    const q = query(collection(db, COLLECTION_NAME));
    return onSnapshot(
      q,
      (snap) => {
        const allItems = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Combo));
        callback(allItems);
      },
      (err) => {
        console.warn("Firestore Snapshot Notice (branchCombos):", err.message);
        if (onError) onError(err);
      }
    );
  },

  getCombosByBranch: async (branchId: string): Promise<Combo[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME));
      const snap = await getDocs(q);
      const allItems = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Combo));
      return allItems.filter((c) => {
        if (!branchId) return true;
        if (!c.branchIds || c.branchIds.length === 0) return true;
        if (c.branchId === branchId || c.branchIds.includes(branchId)) return true;
        return false;
      });
    } catch (e) {
      console.warn("getCombosByBranch error:", e);
      return [];
    }
  },

  addCombo: async (data: Partial<Combo> & { imageFile?: File | string; imageFiles?: File[] }): Promise<Combo> => {
    const docRef = doc(collection(db, COLLECTION_NAME));
    const now = new Date().toISOString();

    let imageUrl = data.image || "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80";
    if (data.imageFile && typeof data.imageFile !== "string") {
      imageUrl = await uploadImage(data.imageFile, "combos");
    } else if (typeof data.imageFile === "string" && data.imageFile.length > 0) {
      imageUrl = data.imageFile;
    }

    let imagesList: string[] = data.images || [imageUrl];
    if (data.imageFiles && data.imageFiles.length > 0) {
      const uploaded = await uploadMultipleImages(data.imageFiles, "combos");
      imagesList = [...uploaded, ...imagesList];
    }

    const branchIds = data.branchIds || (data.branchId ? [data.branchId] : []);

    const newCombo: Combo = {
      id: docRef.id,
      name: data.name || "Untitled Combo",
      description: data.description || "",
      price: Number(data.price) || 0,
      discountPrice: data.discountPrice !== undefined ? Number(data.discountPrice) : 0,
      image: imageUrl,
      images: imagesList,
      isAvailable: data.isAvailable ?? true,
      availabilitySlot: data.availabilitySlot || "FULL_DAY",
      items: data.items || [],
      addonGroups: data.addonGroups || [],
      customizationGroupIds: data.customizationGroupIds || [],
      category: data.category || "Combos",
      branchId: data.branchId || (branchIds[0] || ""),
      branchIds,
      restaurantId: data.restaurantId || "",
      status: data.status || "ACTIVE",
      createdAt: now,
      updatedAt: now
    };

    await setDoc(docRef, newCombo);
    return newCombo;
  },

  updateCombo: async (id: string, updated: Partial<Combo> & { imageFile?: File | string; imageFiles?: File[] }): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    let updatePayload: any = { ...updated, updatedAt: new Date().toISOString() };

    if (updated.imageFile && typeof updated.imageFile !== "string") {
      const imageUrl = await uploadImage(updated.imageFile, "combos");
      updatePayload.image = imageUrl;
      delete updatePayload.imageFile;
    }

    if (updated.imageFiles && updated.imageFiles.length > 0) {
      const uploaded = await uploadMultipleImages(updated.imageFiles, "combos");
      updatePayload.images = uploaded;
      delete updatePayload.imageFiles;
    }

    await updateDoc(docRef, updatePayload);
  },

  toggleAvailability: async (id: string, isAvailable: boolean): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      isAvailable,
      updatedAt: new Date().toISOString()
    });
  },

  deleteCombo: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
