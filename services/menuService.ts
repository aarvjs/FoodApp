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
import { Product } from "@/types";
import { uploadImage, uploadMultipleImages } from "./storageService";

const COLLECTION_NAME = "menuItems";

export const menuService = {
  getMenuItems: async (): Promise<Product[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Product));
    } catch (e) {
      console.warn("getMenuItems error:", e);
      return [];
    }
  },

  subscribeToMenuItems: (callback: (products: Product[]) => void, onError?: (err: any) => void) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Product));
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Permission Notice (menuItems):", err.message);
        if (onError) onError(err);
      }
    );
  },

  subscribeToBranchMenuItems: (branchId: string, callback: (products: Product[]) => void, onError?: (err: any) => void) => {
    if (!branchId) {
      callback([]);
      return () => {};
    }
    const q = query(collection(db, COLLECTION_NAME), where("branchId", "==", branchId));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Product));
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Notice (branchMenuItems):", err.message);
        if (onError) onError(err);
      }
    );
  },

  getMenuItemsByBranch: async (branchId: string): Promise<Product[]> => {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("branchIds", "array-contains", branchId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Product));
  },

  addMenuItem: async (data: Partial<Product> & { imageFile?: File | string; imageFiles?: File[] }): Promise<Product> => {
    const docRef = doc(collection(db, COLLECTION_NAME));
    const now = new Date().toISOString();

    let imageUrl = data.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80";
    if (data.imageFile) {
      imageUrl = await uploadImage(data.imageFile, "menu_items");
    }

    let imagesList: string[] = data.images || [imageUrl];
    if (data.imageFiles && data.imageFiles.length > 0) {
      const uploaded = await uploadMultipleImages(data.imageFiles, "menu_items");
      imagesList = [...uploaded, ...imagesList];
    }

    const foodTypeVal = data.foodType || (data.isVeg ? "Veg" : "Non Veg");
    const targetBranchId = data.branchId || (data.branchIds && data.branchIds[0]) || "";
    const isActiveBool = (data.status ? data.status === "ACTIVE" : true) && (data.isAvailable ?? data.available ?? true);

    const initialBranchAvailability: Record<string, any> = data.branchAvailability || {};
    if (targetBranchId) {
      initialBranchAvailability[targetBranchId] = {
        isActive: isActiveBool,
        availableFrom: data.availableFrom || "10:00 AM",
        availableUntil: data.availableUntil || "11:00 PM",
        availableDays: data.availableDays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        updatedAt: now
      };
    }

    const newItem: Product = {
      id: docRef.id,
      title: data.title || data.name || "Untitled Dish",
      name: data.name || data.title || "Untitled Dish",
      description: data.description || "",
      fullDescription: data.fullDescription || data.description || "",
      price: Number(data.price) || 0,
      discountPrice: data.discountPrice !== undefined ? Number(data.discountPrice) : Number(data.offerPrice || 0),
      offerPrice: data.offerPrice !== undefined ? Number(data.offerPrice) : Number(data.discountPrice || 0),
      category: data.category || "General",
      subCategory: data.subCategory || "Standard",
      isVeg: foodTypeVal === "Veg",
      foodType: foodTypeVal,
      veg: foodTypeVal.toLowerCase(),
      image: imageUrl,
      images: imagesList,
      available: isActiveBool,
      isAvailable: isActiveBool,
      availableFrom: data.availableFrom || "10:00 AM",
      availableUntil: data.availableUntil || "11:00 PM",
      availableDays: data.availableDays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      branchAvailability: initialBranchAvailability,
      stock: data.stock !== undefined ? Number(data.stock) : 50,
      availableQuantity: data.availableQuantity !== undefined ? Number(data.availableQuantity) : 50,
      stockStatus: data.stockStatus || (isActiveBool ? "IN_STOCK" : "OUT_OF_STOCK"),
      bestseller: data.bestseller ?? false,
      recommended: data.recommended ?? false,
      featured: data.featured ?? false,
      spicyLevel: data.spicyLevel || "Medium",
      ingredients: data.ingredients || [],
      customTags: data.customTags || [],
      customizations: data.customizations || [],
      branchId: targetBranchId,
      branchIds: data.branchIds || (targetBranchId ? [targetBranchId] : []),
      restaurantId: data.restaurantId || "",
      prepTimeMinutes: Number(data.prepTimeMinutes) || 20,
      rating: data.rating || 4.5,
      status: isActiveBool ? "ACTIVE" : "INACTIVE",
      createdAt: now,
      updatedAt: now
    };

    await setDoc(docRef, newItem);
    return newItem;
  },

  updateMenuItem: async (id: string, updated: Partial<Product> & { imageFile?: File | string; imageFiles?: File[] }): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const now = new Date().toISOString();
    let updatePayload: any = { ...updated, updatedAt: now };

    if (updated.branchId) {
      updatePayload.branchId = updated.branchId;
      updatePayload.branchIds = [updated.branchId];
    }

    if (updated.imageFile) {
      const imageUrl = await uploadImage(updated.imageFile, "menu_items");
      updatePayload.image = imageUrl;
    }
    delete updatePayload.imageFile;

    if (updated.imageFiles && updated.imageFiles.length > 0) {
      const uploaded = await uploadMultipleImages(updated.imageFiles, "menu_items");
      updatePayload.images = uploaded;
    }
    delete updatePayload.imageFiles;

    const targetBranchId = updated.branchId || (updated.branchIds && updated.branchIds[0]);

    // Delete top-level branchAvailability object to avoid Firestore payload conflict
    delete updatePayload.branchAvailability;

    if (targetBranchId) {
      const isActiveState = (updated.status ? updated.status === "ACTIVE" : true) && (updated.isAvailable ?? updated.available ?? true);
      const branchAvailData: any = {
        isActive: isActiveState,
        availableFrom: updated.availableFrom || "10:00 AM",
        availableUntil: updated.availableUntil || "11:00 PM",
        updatedAt: now
      };
      if (updated.availableDays) {
        branchAvailData.availableDays = updated.availableDays;
      }
      updatePayload[`branchAvailability.${targetBranchId}`] = branchAvailData;
    }

    // Sanitize updatePayload for Firestore: remove any keys that evaluate to undefined
    Object.keys(updatePayload).forEach((key) => {
      if (updatePayload[key] === undefined) {
        delete updatePayload[key];
      }
    });

    await updateDoc(docRef, updatePayload);
  },

  toggleAvailability: async (id: string, isAvailable: boolean, branchId?: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const now = new Date().toISOString();
    const payload: any = { 
      isAvailable, 
      available: isAvailable, 
      status: isAvailable ? "ACTIVE" : "INACTIVE",
      stockStatus: isAvailable ? "IN_STOCK" : "OUT_OF_STOCK",
      updatedAt: now
    };

    if (branchId) {
      payload[`branchAvailability.${branchId}.isActive`] = isAvailable;
      payload[`branchAvailability.${branchId}.updatedAt`] = now;
    }

    await updateDoc(docRef, payload);
  },

  deleteMenuItem: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
