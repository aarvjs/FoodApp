"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";
import { User, AdminUser, BranchManagerUser } from "@/types";
import { useStore } from "@/lib/store/useStore";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useStore((state) => state.user);
  const setUser = useStore((state) => state.setUser);
  const setAdminUser = useStore((state) => state.setAdminUser);
  const setBranchManagerUser = useStore((state) => state.setBranchManagerUser);
  const logout = useStore((state) => state.logout);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("[Auth] Initializing Firebase Auth state listener...");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // 1. Check admins collection
          const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid));
          if (adminDoc.exists()) {
            const data = adminDoc.data();
            if (data.role === "admin") {
              const adminObj: AdminUser = {
                id: firebaseUser.uid,
                name: data.name || "Super Admin",
                email: firebaseUser.email || "",
                role: "admin",
                phone: data.phone || "",
                avatar: data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
              };

              setUser(adminObj);
              setAdminUser(adminObj);
              setIsLoading(false);
              return;
            }
          }

          // 2. Check managers collection
          const managerDoc = await getDoc(doc(db, "managers", firebaseUser.uid));
          if (managerDoc.exists()) {
            const data = managerDoc.data();
            if (data.status === "INACTIVE") {
              console.warn("[Auth] Branch Manager is INACTIVE. Logging out...");
              await firebaseSignOut(auth);
              logout();
            } else {
              const managerObj: BranchManagerUser = {
                id: firebaseUser.uid,
                name: data.name || "Branch Manager",
                email: firebaseUser.email || "",
                role: data.role === "branch_manager" ? "branch_manager" : "branchManager",
                restaurantId: data.restaurantId || "",
                branchId: data.assignedBranchId || data.branchId || "",
                assignedBranchId: data.assignedBranchId || data.branchId || "",
                assignedBranchName: data.assignedBranchName || "Branch",
                status: data.status || "ACTIVE",
                phone: data.phone || "",
                avatar: data.avatar || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80"
              };

              setUser(managerObj);
              setBranchManagerUser(managerObj);
            }
            setIsLoading(false);
            return;
          }

          // 3. User authenticated in Firebase but not in admins or managers collection
          console.warn("[Auth] User record not found in database. Access denied.");
          await firebaseSignOut(auth);
          logout();
        } catch (e) {
          console.error("[Auth] Error fetching user profile from Firestore:", e);
          logout();
        }
      } else {
        console.log("[Auth] No active Firebase Auth user session");
        logout();
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setAdminUser, setBranchManagerUser, logout]);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
