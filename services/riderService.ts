import { db } from "@/firebase/config";
import { 
  collection, 
  doc, 
  getDocs, 
  updateDoc, 
  onSnapshot 
} from "firebase/firestore";
import { Rider, RiderAccountStatus } from "@/types";

const COLLECTION_NAME = "riders";

export const riderService = {
  /**
   * Subscribe to real-time updates from 'riders' collection
   */
  subscribeToRiders: (
    callback: (riders: Rider[]) => void, 
    onError?: (err: any) => void
  ) => {
    try {
      return onSnapshot(
        collection(db, COLLECTION_NAME),
        (snap) => {
          const riders: Rider[] = snap.docs.map((docSnap) => {
            const data = docSnap.data();
            const rawStatus = (
              data.status || 
              data.accountStatus || 
              data.riderStatus || 
              "PENDING_APPROVAL"
            ).toString().toUpperCase() as RiderAccountStatus;

            const name = (
              data.name || 
              data.fullName || 
              data.riderName || 
              data.displayName || 
              "Rider #" + docSnap.id.slice(-4)
            ).toString();

            const phone = (
              data.phone || 
              data.phoneNumber || 
              data.mobile || 
              "N/A"
            ).toString();

            const email = (
              data.email || 
              "N/A"
            ).toString();

            const city = (
              data.city || 
              data.location || 
              data.address || 
              "N/A"
            ).toString();

            const branchName = (
              data.branchName || 
              data.assignedBranchName || 
              "All Branches"
            ).toString();

            const isOnline = Boolean(
              data.isOnline === true || 
              data.onlineStatus === true || 
              data.available === true || 
              data.availabilityStatus === "ONLINE"
            );

            const createdAt = (
              data.createdAt || 
              data.registeredAt || 
              data.joinedAt || 
              new Date().toISOString()
            ).toString();

            return {
              ...data,
              id: docSnap.id,
              name,
              phone,
              email,
              city,
              branchName,
              status: rawStatus,
              isOnline,
              createdAt,
            } as Rider;
          });

          // Sort riders by pending approval first, then newest registered
          riders.sort((a, b) => {
            if (a.status === "PENDING_APPROVAL" && b.status !== "PENDING_APPROVAL") return -1;
            if (a.status !== "PENDING_APPROVAL" && b.status === "PENDING_APPROVAL") return 1;
            return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          });

          callback(riders);
        },
        (err) => {
          console.warn("Firestore snapshot notice (riders):", err.message);
          if (onError) onError(err);
        }
      );
    } catch (err: any) {
      console.warn("Failed to subscribe to riders:", err);
      if (onError) onError(err);
      return () => {};
    }
  },

  /**
   * Fetch one-time list of riders
   */
  getRiders: async (): Promise<Rider[]> => {
    try {
      const snap = await getDocs(collection(db, COLLECTION_NAME));
      return snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as Rider));
    } catch (e) {
      console.warn("getRiders error:", e);
      return [];
    }
  },

  /**
   * Update rider account status ONLY (partial document update)
   */
  updateRiderStatus: async (
    riderId: string, 
    newStatus: RiderAccountStatus
  ): Promise<void> => {
    if (!riderId) throw new Error("Rider ID is required.");
    const docRef = doc(db, COLLECTION_NAME, riderId);
    const now = new Date().toISOString();

    // Partial update preserving every existing field
    await updateDoc(docRef, {
      status: newStatus,
      accountStatus: newStatus,
      riderStatus: newStatus,
      updatedAt: now,
      ...(newStatus === "ACTIVE" ? { approvedAt: now } : {}),
      ...(newStatus === "BLOCKED" ? { rejectedAt: now, blockedAt: now } : {}),
    });
  },
};
