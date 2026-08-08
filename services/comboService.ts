import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { Combo, ComboItem, CustomizationGroup, CustomizationOption } from "@/types";
import {
  normalizeComboData,
  validateComboData,
  normalizeComboItemData,
  validateComboItemData,
  sanitizeForFirestore
} from "@/models/combo";
import { uploadImage } from "./storageService";

const COMBOS_COLLECTION = "combos";
const COMBO_ITEMS_COLLECTION = "comboItems";

// ==========================================
// COMBO CATEGORIES / BANNERS
// ==========================================
export const getCombos = async (): Promise<Combo[]> => {
  try {
    const q = query(collection(db, COMBOS_COLLECTION), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => normalizeComboData({ id: docSnap.id, ...docSnap.data() }));
  } catch (e) {
    console.warn("getCombos error:", e);
    return [];
  }
};

export const subscribeToCombos = (callback: (combos: Combo[]) => void, onError?: (err: any) => void) => {
  const q = query(collection(db, COMBOS_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((docSnap) => normalizeComboData({ id: docSnap.id, ...docSnap.data() }));
      callback(items);
    },
    (err) => {
      console.warn("Firestore Snapshot Notice (combos):", err.message);
      if (onError) onError(err);
    }
  );
};

export const subscribeToBranchCombos = (branchId: string, callback: (combos: Combo[]) => void, onError?: (err: any) => void) => {
  const q = query(collection(db, COMBOS_COLLECTION));
  return onSnapshot(
    q,
    (snap) => {
      const allItems = snap.docs.map((docSnap) => normalizeComboData({ id: docSnap.id, ...docSnap.data() }));
      const filtered = allItems.filter((c) => {
        if (!branchId) return true;
        if (!c.branchIds || c.branchIds.length === 0) return true;
        return c.branchId === branchId || c.branchIds.includes(branchId);
      });
      callback(filtered);
    },
    (err) => {
      console.warn("Firestore Snapshot Notice (branchCombos):", err.message);
      if (onError) onError(err);
    }
  );
};

export const getCombosByBranch = async (branchId: string): Promise<Combo[]> => {
  try {
    const q = query(collection(db, COMBOS_COLLECTION));
    const snap = await getDocs(q);
    const allItems = snap.docs.map((docSnap) => normalizeComboData({ id: docSnap.id, ...docSnap.data() }));
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
};

export const addCombo = async (data: Partial<Combo> & { imageFile?: File | string }): Promise<Combo> => {
  validateComboData(data);
  const docRef = doc(collection(db, COMBOS_COLLECTION));
  const now = new Date().toISOString();

  let imageUrl = data.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80";
  if (data.imageFile && typeof data.imageFile !== "string") {
    imageUrl = await uploadImage(data.imageFile, "combos");
  } else if (typeof data.imageFile === "string" && data.imageFile.length > 0) {
    imageUrl = data.imageFile;
  }

  const branchIds = data.branchIds || (data.branchId ? [data.branchId] : []);
  const isActive = data.isActive ?? data.isAvailable ?? true;

  const newComboData: Combo = {
    id: docRef.id,
    name: (data.name || "Untitled Combo").trim(),
    description: (data.description || "").trim(),
    image: imageUrl,
    isActive: isActive,
    isAvailable: isActive,
    restaurantId: data.restaurantId || "",
    branchId: data.branchId || (branchIds[0] || ""),
    branchIds: branchIds,
    createdAt: now,
    updatedAt: now
  };

  const sanitized = sanitizeForFirestore(newComboData);
  await setDoc(docRef, sanitized);
  return sanitized as Combo;
};

export const updateCombo = async (id: string, updated: Partial<Combo> & { imageFile?: File | string }): Promise<void> => {
  validateComboData(updated);
  const docRef = doc(db, COMBOS_COLLECTION, id);

  let updatePayload: any = {
    name: (updated.name || "").trim(),
    description: (updated.description || "").trim(),
    updatedAt: new Date().toISOString()
  };

  if (updated.isActive !== undefined || updated.isAvailable !== undefined) {
    const activeState = updated.isActive ?? updated.isAvailable ?? true;
    updatePayload.isActive = activeState;
    updatePayload.isAvailable = activeState;
  }

  if (updated.imageFile && typeof updated.imageFile !== "string") {
    const imageUrl = await uploadImage(updated.imageFile, "combos");
    updatePayload.image = imageUrl;
  } else if (updated.image) {
    updatePayload.image = updated.image;
  }

  const sanitized = sanitizeForFirestore(updatePayload);
  await updateDoc(docRef, sanitized);
};

export const toggleAvailability = async (id: string, isAvailable: boolean): Promise<void> => {
  const docRef = doc(db, COMBOS_COLLECTION, id);
  await updateDoc(docRef, {
    isActive: isAvailable,
    isAvailable: isAvailable,
    updatedAt: new Date().toISOString()
  });
};

export const deleteCombo = async (id: string): Promise<void> => {
  const docRef = doc(db, COMBOS_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// DEDICATED COMBO ITEMS (MANUAL CREATION)
// ==========================================
export const getComboItems = async (comboId: string): Promise<ComboItem[]> => {
  try {
    const q = query(
      collection(db, COMBO_ITEMS_COLLECTION),
      where("comboId", "==", comboId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => normalizeComboItemData({ id: docSnap.id, ...docSnap.data() }));
  } catch (e) {
    console.warn("getComboItems error:", e);
    return [];
  }
};

export const subscribeToComboItems = (
  comboId: string,
  callback: (items: ComboItem[]) => void,
  onError?: (err: any) => void
) => {
  const q = query(
    collection(db, COMBO_ITEMS_COLLECTION),
    where("comboId", "==", comboId)
  );
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((docSnap) =>
        normalizeComboItemData({ id: docSnap.id, ...docSnap.data() })
      );
      callback(items);
    },
    (err) => {
      console.warn("Firestore Snapshot Notice (comboItems):", err.message);
      if (onError) onError(err);
    }
  );
};

export const addComboItem = async (
  data: Partial<ComboItem> & { imageFile?: File | string }
): Promise<ComboItem> => {
  validateComboItemData(data);
  const docRef = doc(collection(db, COMBO_ITEMS_COLLECTION));
  const now = new Date().toISOString();

  let imageUrl = data.image || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80";
  if (data.imageFile && typeof data.imageFile !== "string") {
    imageUrl = await uploadImage(data.imageFile, "comboItems");
  } else if (typeof data.imageFile === "string" && data.imageFile.length > 0) {
    imageUrl = data.imageFile;
  }

  const branchIds = data.branchIds || (data.branchId ? [data.branchId] : []);
  const foodType = data.foodType === "Non Veg" || data.isVeg === false ? "Non Veg" : "Veg";
  const customGroups = data.customizationGroups || [];

  const newItemData: ComboItem = {
    id: docRef.id,
    comboId: (data.comboId || "").trim(),
    restaurantId: (data.restaurantId || "").trim(),
    branchId: data.branchId || (branchIds[0] || ""),
    branchIds: branchIds,
    name: (data.name || "").trim(),
    image: imageUrl,
    description: (data.description || "").trim(),
    price: Number(data.price) || 0,
    originalPrice: data.originalPrice !== undefined && data.originalPrice !== null && !isNaN(Number(data.originalPrice))
      ? Number(data.originalPrice)
      : undefined,
    foodType: foodType,
    isVeg: foodType === "Veg",
    rating: data.rating !== undefined ? Number(data.rating) : 4.2,
    ratingCount: data.ratingCount !== undefined ? Number(data.ratingCount) : 569,
    isCustomisable: data.isCustomisable ?? (customGroups.length > 0 ? true : false),
    customizationGroups: customGroups,
    createdAt: now,
    updatedAt: now
  };

  const sanitized = sanitizeForFirestore(newItemData);
  await setDoc(docRef, sanitized);
  return sanitized as ComboItem;
};

export const updateComboItem = async (
  id: string,
  updated: Partial<ComboItem> & { imageFile?: File | string }
): Promise<void> => {
  validateComboItemData(updated);
  const docRef = doc(db, COMBO_ITEMS_COLLECTION, id);

  let updatePayload: any = {
    name: (updated.name || "").trim(),
    description: (updated.description || "").trim(),
    price: Number(updated.price) || 0,
    originalPrice: updated.originalPrice !== undefined && updated.originalPrice !== null && !isNaN(Number(updated.originalPrice))
      ? Number(updated.originalPrice)
      : undefined,
    foodType: updated.foodType === "Non Veg" || updated.isVeg === false ? "Non Veg" : "Veg",
    isVeg: updated.foodType !== "Non Veg" && updated.isVeg !== false,
    rating: updated.rating !== undefined ? Number(updated.rating) : 4.2,
    ratingCount: updated.ratingCount !== undefined ? Number(updated.ratingCount) : 569,
    isCustomisable: updated.isCustomisable ?? true,
    updatedAt: new Date().toISOString()
  };

  if (updated.customizationGroups !== undefined) {
    updatePayload.customizationGroups = updated.customizationGroups;
  }

  if (updated.imageFile && typeof updated.imageFile !== "string") {
    const imageUrl = await uploadImage(updated.imageFile, "comboItems");
    updatePayload.image = imageUrl;
  } else if (updated.image) {
    updatePayload.image = updated.image;
  }

  const sanitized = sanitizeForFirestore(updatePayload);
  await updateDoc(docRef, sanitized);
};

export const deleteComboItem = async (id: string): Promise<void> => {
  const docRef = doc(db, COMBO_ITEMS_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// CUSTOMIZATION GROUPS & OPTIONS PER ITEM
// ==========================================
export const saveItemCustomizationGroups = async (
  itemId: string,
  groups: CustomizationGroup[]
): Promise<void> => {
  const docRef = doc(db, COMBO_ITEMS_COLLECTION, itemId);
  const sanitizedGroups = sanitizeForFirestore(groups);
  await updateDoc(docRef, {
    customizationGroups: sanitizedGroups,
    isCustomisable: groups.length > 0,
    updatedAt: new Date().toISOString()
  });
};

// Object export for backward compatibility
export const comboService = {
  getCombos,
  subscribeToCombos,
  subscribeToBranchCombos,
  getCombosByBranch,
  addCombo,
  updateCombo,
  toggleAvailability,
  deleteCombo,
  getComboItems,
  subscribeToComboItems,
  addComboItem,
  updateComboItem,
  deleteComboItem,
  saveItemCustomizationGroups
};
