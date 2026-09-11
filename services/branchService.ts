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
    const latFromData = data.latitude !== undefined && data.latitude !== null && !isNaN(Number(data.latitude)) ? Number(data.latitude) : 0;
    const lngFromData = data.longitude !== undefined && data.longitude !== null && !isNaN(Number(data.longitude)) ? Number(data.longitude) : 0;
    const latFromLoc = data.location?.latitude !== undefined && data.location?.latitude !== null && !isNaN(Number(data.location.latitude)) ? Number(data.location.latitude) : 0;
    const lngFromLoc = data.location?.longitude !== undefined && data.location?.longitude !== null && !isNaN(Number(data.location.longitude)) ? Number(data.location.longitude) : 0;

    const lat = latFromData !== 0 ? latFromData : (latFromLoc !== 0 ? latFromLoc : 0);
    const lng = lngFromData !== 0 ? lngFromData : (lngFromLoc !== 0 ? lngFromLoc : 0);
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

    const radVal = Number(data.deliveryRadiusKm ?? data.maximumDeliveryRadius ?? data.serviceRadiusKm ?? data.deliveryRadius ?? 5);

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
      deliveryRadiusKm: radVal,
      maximumDeliveryRadius: radVal,
      serviceRadiusKm: radVal,
      deliveryRadius: radVal,
      maxRadiusConfigured: true,
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

    if (updated.deliveryRadiusKm !== undefined || updated.maximumDeliveryRadius !== undefined || updated.serviceRadiusKm !== undefined || updated.deliveryRadius !== undefined) {
      const radiusVal = Number(updated.deliveryRadiusKm ?? updated.maximumDeliveryRadius ?? updated.serviceRadiusKm ?? updated.deliveryRadius);
      if (!isNaN(radiusVal) && radiusVal > 0) {
        payload.deliveryRadiusKm = radiusVal;
        payload.maximumDeliveryRadius = radiusVal;
        payload.serviceRadiusKm = radiusVal;
        payload.deliveryRadius = radiusVal;
        payload.maxRadiusConfigured = true;
      }
    }

    const locSource = updated.locationSource || updated.location?.source || updated.location?.locationSource;

    if (updated.location) {
      const addrStr = updated.location.address || updated.location.formattedAddress || "Branch Address";
      const latFromData = updated.latitude !== undefined && updated.latitude !== null && !isNaN(Number(updated.latitude)) ? Number(updated.latitude) : 0;
      const lngFromData = updated.longitude !== undefined && updated.longitude !== null && !isNaN(Number(updated.longitude)) ? Number(updated.longitude) : 0;
      const latFromLoc = updated.location?.latitude !== undefined && updated.location?.latitude !== null && !isNaN(Number(updated.location.latitude)) ? Number(updated.location.latitude) : 0;
      const lngFromLoc = updated.location?.longitude !== undefined && updated.location?.longitude !== null && !isNaN(Number(updated.location.longitude)) ? Number(updated.location.longitude) : 0;

      const latVal = latFromData !== 0 ? latFromData : (latFromLoc !== 0 ? latFromLoc : 0);
      const lngVal = lngFromData !== 0 ? lngFromData : (lngFromLoc !== 0 ? lngFromLoc : 0);

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
