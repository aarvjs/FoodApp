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
  where 
} from "firebase/firestore";
import { TableModel, TableBookingModel } from "@/models/table";

const TABLES_COLLECTION = "tables";
const BOOKINGS_COLLECTION = "tableBookings";

export const tableRepository = {
  async getByBranch(branchId: string): Promise<TableModel[]> {
    if (!branchId) return [];
    try {
      const q = query(collection(db, TABLES_COLLECTION), where("branchId", "==", branchId));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as TableModel));
    } catch (e) {
      console.warn("tableRepository.getByBranch error:", e);
      return [];
    }
  },

  subscribeByBranch(branchId: string, callback: (tables: TableModel[]) => void, onError?: (err: any) => void) {
    if (!branchId) {
      callback([]);
      return () => {};
    }
    const q = query(collection(db, TABLES_COLLECTION), where("branchId", "==", branchId));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as TableModel));
        callback(items);
      },
      (err) => {
        console.warn("tableRepository.subscribeByBranch notice:", err.message);
        if (onError) onError(err);
      }
    );
  },

  async createTable(data: Partial<TableModel>): Promise<TableModel> {
    if (!data.branchId || !data.restaurantId) {
      throw new Error("tableRepository.createTable: branchId and restaurantId are mandatory.");
    }

    const docRef = doc(collection(db, TABLES_COLLECTION));
    const newTable: TableModel = {
      id: docRef.id,
      restaurantId: data.restaurantId,
      branchId: data.branchId,
      tableNumber: data.tableNumber || "T-01",
      capacity: data.capacity || 4,
      section: data.section || "Main Dining",
      type: data.type || "Indoor",
      environment: data.environment || "AC",
      status: data.status || "AVAILABLE",
      createdAt: new Date().toISOString()
    };

    await setDoc(docRef, newTable);
    return newTable;
  },

  async updateTable(id: string, updated: Partial<TableModel>): Promise<void> {
    const docRef = doc(db, TABLES_COLLECTION, id);
    await updateDoc(docRef, updated);
  },

  async deleteTable(id: string): Promise<void> {
    const docRef = doc(db, TABLES_COLLECTION, id);
    await deleteDoc(docRef);
  },

  async getBookingsByBranch(branchId: string): Promise<TableBookingModel[]> {
    if (!branchId) return [];
    try {
      const q = query(collection(db, BOOKINGS_COLLECTION), where("branchId", "==", branchId));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as TableBookingModel));
    } catch (e) {
      console.warn("tableRepository.getBookingsByBranch error:", e);
      return [];
    }
  },

  async createBooking(data: Partial<TableBookingModel>): Promise<TableBookingModel> {
    if (!data.branchId || !data.restaurantId) {
      throw new Error("tableRepository.createBooking: branchId and restaurantId are mandatory.");
    }

    const docRef = doc(collection(db, BOOKINGS_COLLECTION));
    const now = new Date().toISOString();
    const newBooking: TableBookingModel = {
      id: docRef.id,
      restaurantId: data.restaurantId,
      branchId: data.branchId,
      tableId: data.tableId || "",
      tableNumber: data.tableNumber || "T-101",
      customerName: data.customerName || "Walk-in Guest",
      customerPhone: data.customerPhone || "+91 9876543210",
      date: data.date || now.split("T")[0],
      time: data.time || "07:30 PM",
      guests: data.guests || 2,
      status: data.status || "CONFIRMED",
      createdAt: now
    };

    await setDoc(docRef, newBooking);
    return newBooking;
  }
};
