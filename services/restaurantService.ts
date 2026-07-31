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
  orderBy 
} from "firebase/firestore";
import { Restaurant } from "@/types";

const COLLECTION_NAME = "restaurants";

export const restaurantService = {
  /**
   * Fetch all restaurants from Firestore
   */
  getRestaurants: async (): Promise<Restaurant[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Restaurant));
    } catch (e) {
      console.warn("getRestaurants permission/fetch error:", e);
      return [];
    }
  },

  /**
   * Listen to realtime updates of restaurants
   */
  subscribeToRestaurants: (callback: (restaurants: Restaurant[]) => void, onError?: (err: any) => void) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Restaurant));
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Permission Notice (restaurants):", err.message);
        if (onError) onError(err);
      }
    );
  },

  /**
   * Get single restaurant by ID
   */
  getRestaurantById: async (id: string): Promise<Restaurant | null> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Restaurant;
    }
    return null;
  },

  /**
   * Add a new restaurant entity
   */
  addRestaurant: async (data: Partial<Restaurant>): Promise<Restaurant> => {
    const docRef = doc(collection(db, COLLECTION_NAME));
    const now = new Date().toISOString();
    const newRestaurant: Restaurant = {
      id: docRef.id,
      name: data.name || data.restaurantName || "New Restaurant",
      restaurantName: data.restaurantName || data.name || "New Restaurant",
      description: data.description || "",
      ownerName: data.ownerName || "",
      logo: data.logo || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80",
      banner: data.banner || data.coverImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80",
      coverImage: data.coverImage || data.banner || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80",
      cuisineType: data.cuisineType || ["Multi-Cuisine"],
      gstNumber: data.gstNumber || "",
      phone: data.phone || "",
      email: data.email || "",
      address: data.address || "",
      city: data.city || "",
      state: data.state || "",
      country: data.country || "India",
      pincode: data.pincode || "",
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      openingTime: data.openingTime || "10:00 AM",
      closingTime: data.closingTime || "11:00 PM",
      deliveryCharges: data.deliveryCharges || 40,
      minimumOrder: data.minimumOrder || 199,
      hasTableService: data.hasTableService ?? true,
      hasTakeaway: data.hasTakeaway ?? true,
      hasDelivery: data.hasDelivery ?? true,
      hasDineIn: data.hasDineIn ?? true,
      status: data.status || "ACTIVE",
      totalBranches: 0,
      totalRevenue: 0,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(docRef, newRestaurant);
    return newRestaurant;
  },

  /**
   * Update restaurant
   */
  updateRestaurant: async (id: string, updated: Partial<Restaurant>): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { ...updated, updatedAt: new Date().toISOString() });
  },

  /**
   * Delete restaurant
   */
  deleteRestaurant: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
