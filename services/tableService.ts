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
import { RestaurantTable, TableBooking, TableBookingStatus } from "@/types";

const TABLES_COLLECTION = "tables";
const BOOKINGS_COLLECTION = "tableBookings";

export const tableService = {
  // --- TABLE OPERATIONS ---
  getTables: async (): Promise<RestaurantTable[]> => {
    try {
      const snap = await getDocs(collection(db, TABLES_COLLECTION));
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as RestaurantTable));
    } catch (e) {
      console.warn("getTables error:", e);
      return [];
    }
  },

  subscribeToTables: (callback: (tables: RestaurantTable[]) => void, onError?: (err: any) => void) => {
    return onSnapshot(
      collection(db, TABLES_COLLECTION),
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as RestaurantTable));
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Permission Notice (tables):", err.message);
        if (onError) onError(err);
      }
    );
  },

  subscribeToBranchTables: (branchId: string, callback: (tables: RestaurantTable[]) => void, onError?: (err: any) => void) => {
    const q = query(collection(db, TABLES_COLLECTION), where("branchId", "==", branchId));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as RestaurantTable));
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Permission Notice (branchTables):", err.message);
        if (onError) onError(err);
      }
    );
  },

  addTable: async (data: Partial<RestaurantTable>): Promise<RestaurantTable> => {
    const docRef = doc(collection(db, TABLES_COLLECTION));
    const newTable: RestaurantTable = {
      id: docRef.id,
      branchId: data.branchId || "",
      tableNumber: data.tableNumber || "T-" + Math.floor(100 + Math.random() * 900),
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

  updateTable: async (id: string, updated: Partial<RestaurantTable>): Promise<void> => {
    const docRef = doc(db, TABLES_COLLECTION, id);
    await updateDoc(docRef, updated);
  },

  deleteTable: async (id: string): Promise<void> => {
    const docRef = doc(db, TABLES_COLLECTION, id);
    await deleteDoc(docRef);
  },

  // --- BOOKING OPERATIONS ---
  getTableBookings: async (): Promise<TableBooking[]> => {
    try {
      const q = query(collection(db, BOOKINGS_COLLECTION), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as TableBooking));
    } catch (e) {
      console.warn("getTableBookings error:", e);
      return [];
    }
  },

  subscribeToBookings: (callback: (bookings: TableBooking[]) => void, onError?: (err: any) => void) => {
    return onSnapshot(
      collection(db, BOOKINGS_COLLECTION),
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as TableBooking));
        items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Permission Notice (bookings):", err.message);
        if (onError) onError(err);
      }
    );
  },

  subscribeToBranchBookings: (branchId: string, callback: (bookings: TableBooking[]) => void, onError?: (err: any) => void) => {
    if (!branchId) {
      callback([]);
      return () => {};
    }
    const q = query(collection(db, BOOKINGS_COLLECTION), where("branchId", "==", branchId));
    return onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as TableBooking));
        items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        callback(items);
      },
      (err) => {
        console.warn("Firestore Snapshot Notice (branchBookings):", err.message);
        if (onError) onError(err);
      }
    );
  },

  createTableBooking: async (data: Partial<TableBooking>): Promise<TableBooking> => {
    const docRef = doc(collection(db, BOOKINGS_COLLECTION));
    const now = new Date().toISOString();

    const newBooking: TableBooking = {
      id: docRef.id,
      branchId: data.branchId || "",
      tableId: data.tableId || "",
      tableNumber: data.tableNumber || "T-101",
      customerName: data.customerName || "Guest Customer",
      customerPhone: data.customerPhone || "+91 9876543210",
      customerEmail: data.customerEmail || "",
      date: data.date || now.split("T")[0],
      time: data.time || "07:30 PM",
      guests: data.guests || 2,
      status: data.status || "PENDING",
      createdAt: now,
      updatedAt: now
    };

    await setDoc(docRef, newBooking);

    // If booking assigned to specific table, update table status to RESERVED
    if (data.tableId) {
      await updateDoc(doc(db, TABLES_COLLECTION, data.tableId), { status: "RESERVED" });
    }

    return newBooking;
  },

  updateBookingStatus: async (
    id: string, 
    status: TableBookingStatus, 
    tableId?: string
  ): Promise<void> => {
    const docRef = doc(db, BOOKINGS_COLLECTION, id);
    await updateDoc(docRef, { status, updatedAt: new Date().toISOString() });

    if (tableId) {
      const isOccupiedOrBooked = status === "ACCEPTED" || status === "CONFIRMED";
      const isAvailable = status === "COMPLETED" || status === "CANCELLED" || status === "REJECTED" || status === "NO_SHOW";
      const tableStatus = isOccupiedOrBooked ? "BOOKED" : isAvailable ? "AVAILABLE" : "RESERVED";
      await updateDoc(doc(db, TABLES_COLLECTION, tableId), { status: tableStatus });
    }

    try {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const bookingData = snap.data();
        const customerId = bookingData.customerId || bookingData.userId;
        if (customerId) {
          let title = "Table Booking Update";
          let body = `Your table booking status for ${bookingData.date} at ${bookingData.time} is now ${status}.`;

          if (status === "ACCEPTED" || status === "CONFIRMED") {
            title = "Table Booking Accepted! 🪑🎉";
            body = `Your table reservation for ${bookingData.guests} guests on ${bookingData.date} at ${bookingData.time} has been accepted.`;
          } else if (status === "REJECTED") {
            title = "Table Booking Declined ❌";
            body = `Your table reservation for ${bookingData.date} at ${bookingData.time} could not be confirmed.`;
          } else if (status === "COMPLETED") {
            title = "Table Booking Completed ✨";
            body = `Thank you for dining with us! Your reservation is completed.`;
          } else if (status === "CANCELLED") {
            title = "Table Booking Cancelled ⚠️";
            body = `Your table reservation for ${bookingData.date} at ${bookingData.time} has been cancelled.`;
          }

          const notifRef = doc(collection(db, "notifications"));
          await setDoc(notifRef, {
            id: notifRef.id,
            userId: customerId,
            bookingId: id,
            title,
            body,
            type: "table_booking",
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      console.warn("Failed to create booking notification document:", e);
    }
  }
};
