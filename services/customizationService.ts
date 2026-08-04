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
import { CustomizationGroup } from "@/types";

const COLLECTION_NAME = "customizationGroups";

export const customizationService = {
  getCustomizationGroups: async (): Promise<CustomizationGroup[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as CustomizationGroup));
    } catch (e) {
      console.warn("getCustomizationGroups error:", e);
      return [];
    }
  },

  subscribeToCustomizationGroups: (callback: (groups: CustomizationGroup[]) => void, onError?: (err: any) => void) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as CustomizationGroup));
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Permission Notice (customizationGroups):", err.message);
        if (onError) onError(err);
      }
    );
  },

  addCustomizationGroup: async (data: Partial<CustomizationGroup>): Promise<CustomizationGroup> => {
    const docRef = doc(collection(db, COLLECTION_NAME));
    const now = new Date().toISOString();

    const newGroup: CustomizationGroup = {
      id: docRef.id,
      restaurantId: data.restaurantId || "",
      branchId: data.branchId || "",
      branchIds: data.branchIds || (data.branchId ? [data.branchId] : []),
      title: data.title || "Customization Group",
      selectionType: data.selectionType || "single",
      isRequired: data.isRequired ?? false,
      minSelection: data.minSelection !== undefined ? Number(data.minSelection) : (data.isRequired ? 1 : 0),
      maxSelection: data.maxSelection !== undefined ? Number(data.maxSelection) : 1,
      options: data.options || [],
      status: data.status || "ACTIVE",
      createdAt: now,
      updatedAt: now
    };

    await setDoc(docRef, newGroup);
    return newGroup;
  },

  updateCustomizationGroup: async (id: string, updated: Partial<CustomizationGroup>): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...updated,
      updatedAt: new Date().toISOString()
    });
  },

  deleteCustomizationGroup: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
