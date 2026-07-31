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
import { RestaurantModel } from "@/models/restaurant";

const COLLECTION_NAME = "restaurants";

export const restaurantRepository = {
  async getAll(): Promise<RestaurantModel[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as RestaurantModel));
    } catch (e) {
      console.warn("restaurantRepository.getAll error:", e);
      return [];
    }
  },

  subscribeAll(callback: (restaurants: RestaurantModel[]) => void, onError?: (err: any) => void) {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as RestaurantModel));
        callback(items);
      },
      (err) => {
        console.warn("restaurantRepository.subscribeAll notice:", err.message);
        if (onError) onError(err);
      }
    );
  },

  async getById(id: string): Promise<RestaurantModel | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as RestaurantModel;
    }
    return null;
  },

  async create(data: Partial<RestaurantModel>): Promise<RestaurantModel> {
    const docRef = doc(collection(db, COLLECTION_NAME));
    const now = new Date().toISOString();
    const newRestaurant: RestaurantModel = {
      id: docRef.id,
      name: data.name || "New Restaurant",
      description: data.description || "",
      ownerName: data.ownerName || "",
      logo: data.logo || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=150&auto=format&fit=crop&q=80",
      banner: data.banner || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=80",
      cuisineType: data.cuisineType || ["Multi-Cuisine"],
      gstNumber: data.gstNumber || "",
      phone: data.phone || "",
      email: data.email || "",
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

  async update(id: string, updated: Partial<RestaurantModel>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { ...updated, updatedAt: new Date().toISOString() });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
