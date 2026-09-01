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
import { Combo, ComboItem, CustomizationGroup, CustomizationOption, ComboItemVariant } from "@/types";
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

export const subscribeToSingleCombo = (comboId: string, callback: (combo: Combo | null) => void, onError?: (err: any) => void) => {
  if (!comboId) {
    callback(null);
    return () => {};
  }
  const docRef = doc(db, COMBOS_COLLECTION, comboId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback(normalizeComboData({ id: snap.id, ...snap.data() }));
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn("Firestore Snapshot Notice (singleCombo):", err.message);
      if (onError) onError(err);
    }
  );
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
  const targetBranchId = data.branchId || branchIds[0] || "";
  const foodType = data.foodType === "Non Veg" || data.isVeg === false ? "Non Veg" : "Veg";
  const customGroups = data.customizationGroups || [];
  const isVariantEnabled = Boolean(data.isVariantEnabled);
  const variants = data.variants || [];
  const isActiveState = data.isActive ?? data.isAvailable ?? true;
  const availFrom = data.availableFrom || "10:00 AM";
  const availUntil = data.availableUntil || "11:00 PM";

  const initialBranchAvailability: Record<string, any> = data.branchAvailability || {};
  if (targetBranchId) {
    initialBranchAvailability[targetBranchId] = {
      isActive: isActiveState,
      availableFrom: availFrom,
      availableUntil: availUntil,
      updatedAt: now
    };
  }

  const newItemData: ComboItem = {
    id: docRef.id,
    comboId: (data.comboId || "").trim(),
    restaurantId: (data.restaurantId || "").trim(),
    branchId: targetBranchId,
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
    isActive: isActiveState,
    isAvailable: isActiveState,
    availableFrom: availFrom,
    availableUntil: availUntil,
    availableDays: data.availableDays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    branchAvailability: initialBranchAvailability,
    isCustomisable: data.isCustomisable ?? (customGroups.length > 0 || isVariantEnabled ? true : false),
    customizationGroups: customGroups,
    isVariantEnabled: isVariantEnabled,
    variants: variants,
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
  validateComboItemData(updated, true);
  const docRef = doc(db, COMBO_ITEMS_COLLECTION, id);
  const now = new Date().toISOString();

  let updatePayload: any = { updatedAt: now };

  if (updated.name !== undefined) updatePayload.name = updated.name.trim();
  if (updated.description !== undefined) updatePayload.description = updated.description.trim();
  if (updated.price !== undefined) updatePayload.price = Number(updated.price) || 0;
  if (updated.originalPrice !== undefined) {
    updatePayload.originalPrice = updated.originalPrice !== null && !isNaN(Number(updated.originalPrice))
      ? Number(updated.originalPrice)
      : undefined;
  }
  if (updated.foodType !== undefined) {
    updatePayload.foodType = updated.foodType === "Non Veg" || updated.isVeg === false ? "Non Veg" : "Veg";
    updatePayload.isVeg = updatePayload.foodType === "Veg";
  } else if (updated.isVeg !== undefined) {
    updatePayload.isVeg = updated.isVeg;
    updatePayload.foodType = updated.isVeg ? "Veg" : "Non Veg";
  }
  if (updated.rating !== undefined) updatePayload.rating = Number(updated.rating);
  if (updated.ratingCount !== undefined) updatePayload.ratingCount = Number(updated.ratingCount);
  if (updated.isCustomisable !== undefined) updatePayload.isCustomisable = updated.isCustomisable;

  if (updated.isActive !== undefined || updated.isAvailable !== undefined) {
    const activeState = updated.isActive ?? updated.isAvailable ?? true;
    updatePayload.isActive = activeState;
    updatePayload.isAvailable = activeState;
    updatePayload.status = activeState ? "ACTIVE" : "INACTIVE";
  }

  if (updated.availableFrom !== undefined) updatePayload.availableFrom = updated.availableFrom;
  if (updated.availableUntil !== undefined) updatePayload.availableUntil = updated.availableUntil;
  if (updated.availableDays !== undefined) updatePayload.availableDays = updated.availableDays;

  const targetBranchId = updated.branchId || (updated.branchIds && updated.branchIds[0]);

  // Delete top-level branchAvailability object to avoid Firestore payload conflict
  delete updatePayload.branchAvailability;

  if (targetBranchId) {
    const isActiveState = updated.isActive ?? updated.isAvailable ?? true;
    const branchAvailObj: any = {
      isActive: isActiveState,
      availableFrom: updated.availableFrom || "10:00 AM",
      availableUntil: updated.availableUntil || "11:00 PM",
      updatedAt: now
    };
    if (updated.availableDays) {
      branchAvailObj.availableDays = updated.availableDays;
    }
    updatePayload[`branchAvailability.${targetBranchId}`] = branchAvailObj;
  }

  if (updated.customizationGroups !== undefined) updatePayload.customizationGroups = updated.customizationGroups;
  if (updated.isVariantEnabled !== undefined) updatePayload.isVariantEnabled = updated.isVariantEnabled;
  if (updated.variants !== undefined) updatePayload.variants = updated.variants;

  if (updated.imageFile && typeof updated.imageFile !== "string") {
    const imageUrl = await uploadImage(updated.imageFile, "comboItems");
    updatePayload.image = imageUrl;
  } else if (updated.image) {
    updatePayload.image = updated.image;
  }

  // Sanitize updatePayload for Firestore: remove any keys that evaluate to undefined
  Object.keys(updatePayload).forEach((key) => {
    if (updatePayload[key] === undefined) {
      delete updatePayload[key];
    }
  });

  await updateDoc(docRef, updatePayload);
};

export const deleteComboItem = async (id: string): Promise<void> => {
  const docRef = doc(db, COMBO_ITEMS_COLLECTION, id);
  await deleteDoc(docRef);
};

// ==========================================
// CUSTOMIZATION GROUPS & VARIANTS PER ITEM
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

export const saveItemVariants = async (
  itemId: string,
  isVariantEnabled: boolean,
  variants: ComboItemVariant[]
): Promise<void> => {
  const docRef = doc(db, COMBO_ITEMS_COLLECTION, itemId);
  const sanitizedVariants = sanitizeForFirestore(variants);
  await updateDoc(docRef, {
    isVariantEnabled: isVariantEnabled,
    variants: sanitizedVariants,
    isCustomisable: isVariantEnabled || variants.length > 0,
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
  saveItemCustomizationGroups,
  saveItemVariants
};
