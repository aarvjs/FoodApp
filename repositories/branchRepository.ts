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
import { BranchModel } from "@/models/branch";

const COLLECTION_NAME = "branches";

export const branchRepository = {
  async getAll(): Promise<BranchModel[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as BranchModel));
    } catch (e) {
      console.warn("branchRepository.getAll error:", e);
      return [];
    }
  },

  async getByRestaurant(restaurantId: string): Promise<BranchModel[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where("restaurantId", "==", restaurantId)
      );
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as BranchModel));
    } catch (e) {
      console.warn("branchRepository.getByRestaurant error:", e);
      return [];
    }
  },

  subscribeByRestaurant(restaurantId: string, callback: (branches: BranchModel[]) => void, onError?: (err: any) => void) {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("restaurantId", "==", restaurantId)
    );
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as BranchModel));
        callback(items);
      },
      (err) => {
        console.warn("branchRepository.subscribeByRestaurant notice:", err.message);
        if (onError) onError(err);
      }
    );
  },

  subscribeAll(callback: (branches: BranchModel[]) => void, onError?: (err: any) => void) {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as BranchModel));
        callback(items);
      },
      (err) => {
        console.warn("branchRepository.subscribeAll notice:", err.message);
        if (onError) onError(err);
      }
    );
  },

  async getById(id: string): Promise<BranchModel | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as BranchModel;
    }
    return null;
  },

  async create(data: Partial<BranchModel>): Promise<BranchModel> {
    if (!data.restaurantId) {
      throw new Error("branchRepository.create: restaurantId is mandatory.");
    }

    const docRef = doc(collection(db, COLLECTION_NAME));
    const now = new Date().toISOString();

    const newBranch: BranchModel = {
      id: docRef.id,
      restaurantId: data.restaurantId,
      restaurantName: data.restaurantName || "Restaurant",
      name: data.name || "Branch Office",
      phone: data.phone || "",
      email: data.email || "",
      managerName: data.managerName || "Unassigned",
      managerEmail: data.managerEmail || "",
      managerId: data.managerId || "",
      deliveryRadiusKm: data.deliveryRadiusKm || 5,
      openingTime: data.openingTime || "09:00 AM",
      closingTime: data.closingTime || "11:00 PM",
      status: data.status || "OPEN",
      location: data.location || {
        formattedAddress: "Branch Address",
        latitude: 0,
        longitude: 0,
        city: "City",
        state: "State",
        pincode: "100001"
      },
      todayOrdersCount: 0,
      todayRevenue: 0,
      createdAt: now
    };

    await setDoc(docRef, newBranch);
    return newBranch;
  },

  async update(id: string, updated: Partial<BranchModel>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, { ...updated, updatedAt: new Date().toISOString() });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
