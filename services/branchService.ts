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
import { Branch } from "@/types";

const COLLECTION_NAME = "branches";

export const branchService = {
  getBranches: async (): Promise<Branch[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Branch));
    } catch (e) {
      console.warn("getBranches error:", e);
      return [];
    }
  },

  subscribeToBranches: (callback: (branches: Branch[]) => void, onError?: (err: any) => void) => {
    const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Branch));
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Permission Notice (branches):", err.message);
        if (onError) onError(err);
      }
    );
  },

  getBranchesByRestaurant: async (restaurantId: string): Promise<Branch[]> => {
    const q = query(
      collection(db, COLLECTION_NAME), 
      where("restaurantId", "==", restaurantId)
    );
    const snap = await getDocs(q);
    return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Branch));
  },

  getBranchById: async (id: string): Promise<Branch | null> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Branch;
    }
    return null;
  },

  addBranch: async (data: Partial<Branch>): Promise<Branch> => {
    const docRef = doc(collection(db, COLLECTION_NAME));
    const now = new Date().toISOString();
    const locSource = data.locationSource || data.location?.source || data.location?.locationSource || "search";
    const lat = Number(data.latitude !== undefined ? data.latitude : (data.location?.latitude || 0));
    const lng = Number(data.longitude !== undefined ? data.longitude : (data.location?.longitude || 0));
    const addrStr = data.location?.address || data.location?.formattedAddress || data.address || "Main Street";

    const locationObj = {
      ...data.location,
      address: addrStr,
      formattedAddress: addrStr,
      latitude: lat,
      longitude: lng,
      source: locSource,
      locationSource: locSource
    };

    const newBranch: Branch = {
      id: docRef.id,
      branchId: docRef.id,
      restaurantId: data.restaurantId || "default-rest",
      restaurantName: data.restaurantName || "Main Restaurant",
      name: data.name || data.branchName || "Main Branch",
      branchName: data.branchName || data.name || "Main Branch",
      phone: data.phone || "",
      email: data.email || "",
      managerName: data.managerName || "Unassigned",
      managerEmail: data.managerEmail || "",
      managerId: data.managerId || "",
      deliveryRadiusKm: data.deliveryRadiusKm || 5,
      deliveryRadius: data.deliveryRadius || data.deliveryRadiusKm || 5,
      openingTime: data.openingTime || "09:00 AM",
      closingTime: data.closingTime || "11:00 PM",
      status: data.status || "OPEN",
      address: addrStr,
      latitude: lat,
      longitude: lng,
      locationSource: locSource,
      location: locationObj as any,
      todayOrdersCount: 0,
      todayRevenue: 0,
      createdAt: now,
      updatedAt: now
    } as any;

    await setDoc(docRef, newBranch);

    if (locSource === "gps") {
      console.log("[GPS] Saved to Firestore");
    } else {
      console.log("[Search] Saved to Firestore");
    }

    return newBranch;
  },

  updateBranch: async (id: string, updated: Partial<Branch>): Promise<void> => {
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
    }

    await updateDoc(docRef, payload);

    if (locSource === "gps") {
      console.log("[GPS] Saved to Firestore");
    } else {
      console.log("[Search] Saved to Firestore");
    }
  },

  deleteBranch: async (id: string): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
