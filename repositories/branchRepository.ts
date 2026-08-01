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

    const locSource = data.locationSource || data.location?.source || data.location?.locationSource || "search";
    const addressStr = data.location?.address || data.location?.formattedAddress || data.formattedAddress || "Branch Address";
    const latVal = Number(data.latitude ?? data.location?.latitude ?? 0);
    const lngVal = Number(data.longitude ?? data.location?.longitude ?? 0);

    const locationObj = {
      ...data.location,
      address: addressStr,
      formattedAddress: addressStr,
      latitude: latVal,
      longitude: lngVal,
      source: locSource,
      locationSource: locSource
    };

    const newBranch: any = {
      id: docRef.id,
      restaurantId: data.restaurantId,
      restaurantName: data.restaurantName || "Restaurant",
      name: data.name || "Branch Office",
      branchName: data.name || "Branch Office",
      phone: data.phone || "",
      email: data.email || "",
      managerName: data.managerName || "Unassigned",
      managerEmail: data.managerEmail || "",
      managerId: data.managerId || "",
      deliveryRadiusKm: data.deliveryRadiusKm || 5,
      openingTime: data.openingTime || "09:00 AM",
      closingTime: data.closingTime || "11:00 PM",
      status: data.status || "OPEN",
      address: addressStr,
      formattedAddress: addressStr,
      latitude: latVal,
      longitude: lngVal,
      locationSource: locSource,
      location: locationObj,
      todayOrdersCount: 0,
      todayRevenue: 0,
      createdAt: now,
      updatedAt: now
    };

    await setDoc(docRef, newBranch);

    if (locSource === "gps") {
      console.log("[GPS] Saved to Firestore");
    } else {
      console.log("[Search] Saved to Firestore");
    }

    return newBranch as BranchModel;
  },

  async update(id: string, updated: Partial<BranchModel>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const now = new Date().toISOString();
    const payload: any = { ...updated, updatedAt: now };
    const locSource = updated.locationSource || updated.location?.source || updated.location?.locationSource;

    if (updated.location) {
      const addrStr = updated.location.address || updated.location.formattedAddress || "Branch Address";
      const latVal = Number(updated.location.latitude);
      const lngVal = Number(updated.location.longitude);

      payload.address = addrStr;
      payload.formattedAddress = addrStr;
      payload.latitude = latVal;
      payload.longitude = lngVal;
      payload.locationSource = locSource || "search";
      payload.location = {
        ...updated.location,
        address: addrStr,
        formattedAddress: addrStr,
        latitude: latVal,
        longitude: lngVal,
        source: locSource || "search",
        locationSource: locSource || "search"
      };
    } else {
      if (updated.latitude !== undefined) payload.latitude = Number(updated.latitude);
      if (updated.longitude !== undefined) payload.longitude = Number(updated.longitude);
      if (updated.locationSource !== undefined) payload.locationSource = updated.locationSource;
    }

    await updateDoc(docRef, payload);

    if (locSource === "gps") {
      console.log("[GPS] Saved to Firestore");
    } else {
      console.log("[Search] Saved to Firestore");
    }
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
