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

function normalizeCustomerDoc(id: string, data: any): Customer {
  const photoUrl =
    data.photoUrl ||
    data.profileImage ||
    data.photo ||
    data.avatar ||
    data.image ||
    data.profilePic ||
    "";

  let createdAtIso = "";
  if (data.createdAt) {
    if (typeof data.createdAt.toDate === "function") {
      createdAtIso = data.createdAt.toDate().toISOString();
    } else if (typeof data.createdAt === "string") {
      createdAtIso = data.createdAt;
    } else if (typeof data.createdAt === "number") {
      createdAtIso = new Date(data.createdAt).toISOString();
    }
  }

  return {
    id: id || data.uid || "",
    name: data.fullName || data.name || "Customer",
    email: data.email || "",
    phone: data.phone || data.mobile || "+91 90000 00000",
    profileImage: photoUrl,
    avatar: photoUrl,
    address: data.formattedAddress || data.deliveryAddress || data.address || "",
    currentSavedAddress: data.formattedAddress || data.deliveryAddress || data.address || "",
    city: data.city || "",
    state: data.state || "",
    pincode: data.pincode || "",
    latitude: typeof data.latitude === "number" ? data.latitude : undefined,
    longitude: typeof data.longitude === "number" ? data.longitude : undefined,
    totalOrders: data.totalOrders || 0,
    totalSpent: data.totalSpent || 0,
    lastOrderDate: data.lastOrderDate || createdAtIso || "",
    registeredDate: createdAtIso || data.registeredDate || "",
    createdAt: createdAtIso || "",
    status: data.status || "ACTIVE",
    branchId: data.branchId || ""
  };
}

export const customerService = {
  getCustomers: async (): Promise<Customer[]> => {
    try {
      const snapCustomers = await getDocs(collection(db, "customers"));
      const snapUsers = await getDocs(collection(db, "users"));

      const map = new Map<string, Customer>();

      snapCustomers.docs.forEach((docSnap) => {
        map.set(docSnap.id, normalizeCustomerDoc(docSnap.id, docSnap.data()));
      });

      snapUsers.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const norm = normalizeCustomerDoc(docSnap.id, data);
        if (!map.has(docSnap.id)) {
          map.set(docSnap.id, norm);
        } else {
          const existing = map.get(docSnap.id)!;
          map.set(docSnap.id, {
            ...existing,
            ...norm,
            name: existing.name !== "Customer" ? existing.name : norm.name,
            profileImage: norm.profileImage || existing.profileImage,
            avatar: norm.avatar || existing.avatar,
            address: norm.address || existing.address,
            currentSavedAddress: norm.currentSavedAddress || existing.currentSavedAddress,
            city: norm.city || existing.city,
            state: norm.state || existing.state,
            pincode: norm.pincode || existing.pincode
          });
        }
      });

      return Array.from(map.values());
    } catch (e) {
      console.warn("getCustomers error:", e);
      return [];
    }
  },

  subscribeToCustomers: (callback: (customers: Customer[]) => void, onError?: (err: any) => void) => {
    let customersList: Customer[] = [];
    let usersList: Customer[] = [];

    const mergeAndCallback = () => {
      const map = new Map<string, Customer>();
      customersList.forEach((c) => map.set(c.id, c));
      usersList.forEach((u) => {
        if (!map.has(u.id)) {
          map.set(u.id, u);
        } else {
          const existing = map.get(u.id)!;
          map.set(u.id, {
            ...existing,
            ...u,
            name: existing.name !== "Customer" ? existing.name : u.name,
            profileImage: u.profileImage || existing.profileImage,
            avatar: u.avatar || existing.avatar,
            address: u.address || existing.address,
            currentSavedAddress: u.currentSavedAddress || existing.currentSavedAddress,
            city: u.city || existing.city,
            state: u.state || existing.state,
            pincode: u.pincode || existing.pincode
          });
        }
      });
      callback(Array.from(map.values()));
    };

    const unsubCustomers = onSnapshot(
      collection(db, "customers"),
      (snap) => {
        customersList = snap.docs.map((docSnap) => normalizeCustomerDoc(docSnap.id, docSnap.data()));
        mergeAndCallback();
      },
      (err) => {
        console.warn("Firestore Snapshot Permission Notice (customers):", err.message);
        if (onError) onError(err);
      }
    );

    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snap) => {
        usersList = snap.docs.map((docSnap) => normalizeCustomerDoc(docSnap.id, docSnap.data()));
        mergeAndCallback();
      },
      (err) => {
        console.warn("Firestore Snapshot Permission Notice (users):", err.message);
      }
    );

    return () => {
      unsubCustomers();
      unsubUsers();
    };
  },

  addCustomer: async (data: Partial<Customer>): Promise<Customer> => {
    const docRef = doc(collection(db, "customers"));
    const newCustomer: Customer = {
      id: docRef.id,
      name: data.name || "Customer Name",
      email: data.email || "",
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
    const docRef = doc(db, "customers", id);
    await updateDoc(docRef, updated);
  }
};
