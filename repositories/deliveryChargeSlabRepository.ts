import { db } from "@/firebase/config";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy
} from "firebase/firestore";
import { DeliveryChargeSlab } from "@/models/deliveryChargeSlab";

const COLLECTION_NAME = "delivery_charge_slabs";

export const deliveryChargeSlabRepository = {
  async getAll(): Promise<DeliveryChargeSlab[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("minDistanceKm", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as DeliveryChargeSlab));
    } catch (e) {
      console.warn("deliveryChargeSlabRepository.getAll error:", e);
      return [];
    }
  },

  async getByRestaurant(restaurantId: string): Promise<DeliveryChargeSlab[]> {
    if (!restaurantId) return [];
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("restaurantId", "==", restaurantId)
      );
      const snap = await getDocs(q);
      const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as DeliveryChargeSlab));
      return items.sort((a, b) => a.minDistanceKm - b.minDistanceKm);
    } catch (e) {
      console.warn("deliveryChargeSlabRepository.getByRestaurant error:", e);
      return [];
    }
  },

  async getByBranch(branchId: string): Promise<DeliveryChargeSlab[]> {
    if (!branchId) return [];
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("branchId", "==", branchId)
      );
      const snap = await getDocs(q);
      const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as DeliveryChargeSlab));
      return items.sort((a, b) => a.minDistanceKm - b.minDistanceKm);
    } catch (e) {
      console.warn("deliveryChargeSlabRepository.getByBranch error:", e);
      return [];
    }
  },

  subscribeByRestaurant(
    restaurantId: string,
    callback: (slabs: DeliveryChargeSlab[]) => void,
    onError?: (err: any) => void
  ) {
    if (!restaurantId) {
      callback([]);
      return () => {};
    }
    const q = query(
      collection(db, COLLECTION_NAME),
      where("restaurantId", "==", restaurantId)
    );
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as DeliveryChargeSlab));
        items.sort((a, b) => a.minDistanceKm - b.minDistanceKm);
        callback(items);
      },
      (err) => {
        console.warn("deliveryChargeSlabRepository.subscribeByRestaurant notice:", err.message);
        if (onError) onError(err);
      }
    );
  },

  subscribeByBranch(
    branchId: string,
    callback: (slabs: DeliveryChargeSlab[]) => void,
    onError?: (err: any) => void
  ) {
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
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as DeliveryChargeSlab));
        items.sort((a, b) => a.minDistanceKm - b.minDistanceKm);
        callback(items);
      },
      (err) => {
        console.warn("deliveryChargeSlabRepository.subscribeByBranch notice:", err.message);
        if (onError) onError(err);
      }
    );
  },

  async create(data: Partial<DeliveryChargeSlab>): Promise<DeliveryChargeSlab> {
    if (!data.restaurantId || !data.branchId) {
      throw new Error("restaurantId and branchId are mandatory to create a delivery charge slab.");
    }
    const docRef = doc(collection(db, COLLECTION_NAME));
    const now = new Date().toISOString();

    const newSlab: DeliveryChargeSlab = {
      id: docRef.id,
      restaurantId: data.restaurantId,
      branchId: data.branchId,
      minDistanceKm: Number(data.minDistanceKm ?? 0),
      maxDistanceKm: Number(data.maxDistanceKm ?? 0),
      deliveryCharge: Number(data.deliveryCharge ?? 0),
      status: data.status || "ACTIVE",
      createdAt: now,
      updatedAt: now
    };

    await setDoc(docRef, newSlab);
    return newSlab;
  },

  async update(id: string, updated: Partial<DeliveryChargeSlab>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const now = new Date().toISOString();
    const payload: Record<string, any> = { ...updated, updatedAt: now };

    if (updated.minDistanceKm !== undefined) payload.minDistanceKm = Number(updated.minDistanceKm);
    if (updated.maxDistanceKm !== undefined) payload.maxDistanceKm = Number(updated.maxDistanceKm);
    if (updated.deliveryCharge !== undefined) payload.deliveryCharge = Number(updated.deliveryCharge);

    await updateDoc(docRef, payload);
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  }
};
