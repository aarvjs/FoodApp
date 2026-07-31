import { db } from "@/firebase/config";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from "firebase/firestore";
import { Customer } from "@/types";

const COLLECTION_NAME = "customers";

export const customerService = {
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("name", "asc"));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Customer));
    } catch (e) {
      console.warn("getCustomers error:", e);
      return [];
    }
  },

  subscribeToCustomers: (callback: (customers: Customer[]) => void, onError?: (err: any) => void) => {
    return onSnapshot(
      collection(db, COLLECTION_NAME),
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Customer));
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Permission Notice (customers):", err.message);
        if (onError) onError(err);
      }
    );
  },

  addCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const docRef = doc(collection(db, COLLECTION_NAME));
    const newCustomer: Customer = {
      id: docRef.id,
      name: data.name || "Customer Name",
      email: data.email || "customer@example.com",
      phone: data.phone || "+91 90000 00000",
      totalOrders: data.totalOrders || 1,
      totalSpent: data.totalSpent || 0,
      lastOrderDate: data.lastOrderDate || new Date().toISOString(),
      branchId: data.branchId || ""
    };

    await setDoc(docRef, newCustomer);
    return newCustomer;
  },

  updateCustomer: async (id: string, updated: Partial<Customer>): Promise<void> => {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, updated);
  }
};
