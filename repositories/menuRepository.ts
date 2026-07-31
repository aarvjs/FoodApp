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
import { MenuItemModel, validateMenuItemData } from "@/models/menuItem";
import { uploadImage, uploadMultipleImages } from "@/services/storageService";

const COLLECTION_NAME = "menuItems";

export const menuRepository = {
  /**
   * Fetch all menu items belonging strictly to a specific Branch
   */
  async getByBranch(branchId: string): Promise<MenuItemModel[]> {
    if (!branchId) return [];
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where("branchId", "==", branchId)
      );
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as MenuItemModel));
    } catch (e) {
      console.warn("menuRepository.getByBranch error:", e);
      return [];
    }
  },

  /**
   * Real-time subscription to menu items belonging strictly to a specific Branch
   */
  subscribeByBranch(branchId: string, callback: (items: MenuItemModel[]) => void, onError?: (err: any) => void) {
    if (!branchId) {
      callback([]);
      return () => {};
    }
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("branchId", "==", branchId)
    );
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as MenuItemModel));
        callback(items);
      },
      (err) => {
        console.warn("menuRepository.subscribeByBranch notice:", err.message);
        if (onError) onError(err);
      }
    );
  },

  /**
   * Fetch all menu items for a Restaurant
   */
  async getByRestaurant(restaurantId: string): Promise<MenuItemModel[]> {
    if (!restaurantId) return [];
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("restaurantId", "==", restaurantId)
      );
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as MenuItemModel));
    } catch (e) {
      console.warn("menuRepository.getByRestaurant error:", e);
      return [];
    }
  },

  /**
   * Create a new menu item. Throws error if branchId or restaurantId is missing.
   */
  async create(data: Partial<MenuItemModel> & { imageFile?: File | string; imageFiles?: File[] }): Promise<MenuItemModel> {
    validateMenuItemData(data); // MANDATORY CHECK: Throws error if branchId or restaurantId is missing

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

    const newItem: MenuItemModel = {
      id: docRef.id,
      restaurantId: data.restaurantId!,
      branchId: data.branchId!, // STRICT MANDATORY OWNERSHIP
      categoryId: data.categoryId || "cat-default",
      categoryName: data.categoryName || "General",
      name: data.name || "Untitled Dish",
      description: data.description || "",
      fullDescription: data.fullDescription || data.description || "",
      price: Number(data.price) || 0,
      discountPrice: data.discountPrice !== undefined ? Number(data.discountPrice) : Number(data.offerPrice || 0),
      offerPrice: data.offerPrice !== undefined ? Number(data.offerPrice) : Number(data.discountPrice || 0),
      image: imageUrl,
      images: imagesList,
      isAvailable: data.isAvailable ?? true,
      stock: data.stock !== undefined ? Number(data.stock) : 50,
      stockStatus: data.stockStatus || "IN_STOCK",
      isVeg: foodTypeVal === "Veg",
      foodType: foodTypeVal,
      bestseller: data.bestseller ?? false,
      recommended: data.recommended ?? false,
      featured: data.featured ?? false,
      spicyLevel: data.spicyLevel || "Medium",
      ingredients: data.ingredients || [],
      customTags: data.customTags || [],
      customizations: data.customizations || [],
      prepTimeMinutes: Number(data.prepTimeMinutes) || 20,
      createdBy: data.createdBy || "system",
      status: data.status || "ACTIVE",
      createdAt: now,
      updatedAt: now
    };

    await setDoc(docRef, newItem);
    return newItem;
  },

  async update(id: string, updated: Partial<MenuItemModel> & { imageFile?: File | string; imageFiles?: File[] }): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    let payload: any = { ...updated, updatedAt: new Date().toISOString() };

    if (updated.imageFile) {
      payload.image = await uploadImage(updated.imageFile, "menu_items");
      delete payload.imageFile;
    }

    if (updated.imageFiles && updated.imageFiles.length > 0) {
      const uploaded = await uploadMultipleImages(updated.imageFiles, "menu_items");
      payload.images = uploaded;
      delete payload.imageFiles;
    }

    await updateDoc(docRef, payload);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
