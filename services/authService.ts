import { auth, db, getSecondaryAuth } from "@/firebase/config";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail
} from "firebase/auth";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where 
} from "firebase/firestore";
import { User, AdminUser, BranchManagerUser } from "@/types";

export const authService = {
  /**
   * Log in user (Admin or Branch Manager) via Firebase Auth
   */
  login: async (email: string, pass: string): Promise<User> => {
    let firebaseUser;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      firebaseUser = userCredential.user;
    } catch (err: any) {
      const code = err?.code || "";
      if (
        code === "auth/invalid-credential" || 
        code === "auth/user-not-found" || 
        code === "auth/wrong-password"
      ) {
        throw new Error("User not found or invalid credentials. Please check your email and password.");
      } else if (code === "auth/invalid-email") {
        throw new Error("Invalid email address format.");
      } else if (code === "auth/user-disabled") {
        throw new Error("This account has been disabled.");
      } else if (code === "auth/too-many-requests") {
        throw new Error("Too many failed attempts. Please try again later.");
      }
      throw new Error(err.message || "Authentication failed. Please check your credentials.");
    }

    console.log("[Branch Audit] Firebase UID:", firebaseUser.uid);
    console.log("[Branch Audit] Email:", firebaseUser.email);

    // First check admins collection
    const adminDocRef = doc(db, "admins", firebaseUser.uid);
    const adminSnap = await getDoc(adminDocRef);

    if (adminSnap.exists()) {
      const data = adminSnap.data();
      console.log("[Branch Audit] Firestore document found in admins:", data);
      console.log("[Branch Audit] Role: admin");
      return {
        id: firebaseUser.uid,
        name: data.name || "Super Admin",
        email: firebaseUser.email || email,
        role: "admin",
        phone: data.phone || "",
        avatar: data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
      } as AdminUser;
    }

    // Next check managers collection by UID first, then fallback to email query
    let managerData: any = null;
    let managerDocSnap = await getDoc(doc(db, "managers", firebaseUser.uid));
    if (managerDocSnap.exists()) {
      managerData = managerDocSnap.data();
    } else if (firebaseUser.email) {
      const q = query(collection(db, "managers"), where("email", "==", firebaseUser.email.trim()));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        managerData = querySnap.docs[0].data();
      }
    }

    if (managerData) {
      console.log("[Branch Audit] Firestore document found in managers:", managerData);
      console.log("[Branch Audit] Role:", managerData.role || "branchManager");
      console.log("[Branch Audit] Branch ID:", managerData.assignedBranchId || managerData.branchId || "");
      console.log("[Branch Audit] Restaurant ID:", managerData.restaurantId || "");

      if (managerData.status === "INACTIVE") {
        console.log("[Branch Audit] Manager status is INACTIVE. Signing out.");
        await firebaseSignOut(auth);
        throw new Error("Your account has been disabled by the Super Admin.");
      }

      return {
        id: firebaseUser.uid,
        name: managerData.name || "Branch Manager",
        email: firebaseUser.email || email,
        role: "branchManager",
        phone: managerData.phone || "",
        restaurantId: managerData.restaurantId || "",
        branchId: managerData.assignedBranchId || managerData.branchId || "",
        assignedBranchId: managerData.assignedBranchId || managerData.branchId || "",
        assignedBranchName: managerData.assignedBranchName || managerData.branchName || "Branch",
        status: managerData.status || "ACTIVE",
        avatar: managerData.avatar || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80"
      } as BranchManagerUser;
    }

    // If authenticated with Firebase Auth but not found in admins or managers in Firestore
    console.log("[Branch Audit] User record not found in Firestore admins or managers collections.");
    await firebaseSignOut(auth);
    throw new Error("User record not found in database. Access denied.");
  },

  /**
   * Register Super Admin (One-time or main admin creation)
   */
  registerSuperAdmin: async (data: { name: string; email: string; pass: string; phone?: string }): Promise<User> => {
    let firebaseUser;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.pass);
      firebaseUser = userCredential.user;
    } catch (err: any) {
      const code = err?.code || "";
      if (code === "auth/email-already-in-use") {
        throw new Error("This email is already registered. Please sign in instead.");
      } else if (code === "auth/weak-password") {
        throw new Error("Password must be at least 6 characters long.");
      } else if (code === "auth/invalid-email") {
        throw new Error("Invalid email address format.");
      }
      throw new Error(err.message || "Registration failed. Please check provided details.");
    }

    const adminData = {
      id: firebaseUser.uid,
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      role: "admin",
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, "admins", firebaseUser.uid), adminData);

    return {
      id: firebaseUser.uid,
      name: data.name,
      email: data.email,
      role: "admin",
      phone: data.phone
    };
  },

  /**
   * Create Branch Manager (Super Admin action without signing out current admin)
   */
  createManager: async (data: {
    name: string;
    email: string;
    pass: string;
    phone: string;
    restaurantId: string;
    assignedBranchId: string;
    assignedBranchName: string;
  }): Promise<BranchManagerUser> => {
    const secondaryAuth = getSecondaryAuth();
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.pass);
    const newUid = userCredential.user.uid;

    const managerData = {
      id: newUid,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: "branchManager",
      restaurantId: data.restaurantId,
      assignedBranchId: data.assignedBranchId,
      assignedBranchName: data.assignedBranchName,
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, "managers", newUid), managerData);
    await firebaseSignOut(secondaryAuth);

    return managerData as BranchManagerUser;
  },

  /**
   * Fetch all managers
   */
  getManagers: async (): Promise<BranchManagerUser[]> => {
    const q = collection(db, "managers");
    const snapshot = await getDocs(q);
    return snapshot.docs.map((docSnap) => docSnap.data() as BranchManagerUser);
  },

  /**
   * Enable/Disable Manager Account
   */
  toggleManagerStatus: async (managerId: string, status: "ACTIVE" | "INACTIVE"): Promise<void> => {
    const refDoc = doc(db, "managers", managerId);
    await updateDoc(refDoc, { status, updatedAt: new Date().toISOString() });
  },

  /**
   * Reset Manager Password via Email Link
   */
  resetPassword: async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  },

  /**
   * Check if any Super Admin account exists in Firestore
   */
  checkSuperAdminExists: async (): Promise<boolean> => {
    const snap = await getDocs(collection(db, "admins"));
    return !snap.empty;
  },

  /**
   * Log out current session
   */
  logout: async (): Promise<void> => {
    await firebaseSignOut(auth);
  }
};
