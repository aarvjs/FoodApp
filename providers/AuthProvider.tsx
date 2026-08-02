"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("[Auth Audit] Firebase initialized. Monitoring onAuthStateChanged...");

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("[Auth Audit] Current Firebase User:", firebaseUser ? { uid: firebaseUser.uid, email: firebaseUser.email } : null);
      console.log("[Auth Audit] Cookie Values:", typeof document !== "undefined" ? document.cookie : "");
      console.log("[Auth Audit] Local Storage Values (Zustand):", typeof localStorage !== "undefined" ? localStorage.getItem("food_admin_firebase_store_v1") : "");

      if (firebaseUser) {
        try {
          // Check admins collection
          const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid));
          if (adminDoc.exists()) {
            const data = adminDoc.data();
            const adminObj: AdminUser = {
              id: firebaseUser.uid,
              name: data.name || "Super Admin",
              email: firebaseUser.email || "",
              role: "admin",
              phone: data.phone || "",
              avatar: data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            };

            console.log("[Auth Audit] Current Role: admin");
            console.log("[Auth Audit] Auth Guard Decision: User validated as Super Admin");

            document.cookie = "admin_session=true; path=/; max-age=86400; SameSite=Lax;";
            document.cookie = "admin_role=admin; path=/; max-age=86400; SameSite=Lax;";
            document.cookie = "user_role=admin; path=/; max-age=86400; SameSite=Lax;";

            setUser(adminObj);
            setAdminUser(adminObj);
            setIsLoading(false);
            return;
          }

          // Check managers collection
          const managerDoc = await getDoc(doc(db, "managers", firebaseUser.uid));
          if (managerDoc.exists()) {
            const data = managerDoc.data();
            if (data.status === "INACTIVE") {
              console.log("[Auth Audit] Auth Guard Decision: Branch Manager is INACTIVE, clearing session");
              document.cookie = "branch_manager_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;";
              document.cookie = "branch_manager_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;";
              setUser(null);
            } else {
              const managerObj: BranchManagerUser = {
                id: firebaseUser.uid,
                name: data.name || "Branch Manager",
                email: firebaseUser.email || "",
                role: "branchManager",
                restaurantId: data.restaurantId || "",
                branchId: data.assignedBranchId || "",
                assignedBranchId: data.assignedBranchId || "",
                assignedBranchName: data.assignedBranchName || "Branch",
                status: data.status || "ACTIVE",
                phone: data.phone || "",
                avatar: data.avatar || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80"
              };

              console.log("[Auth Audit] Current Role: branchManager");
              console.log("[Auth Audit] Auth Guard Decision: User validated as Branch Manager");

              document.cookie = "branch_manager_session=true; path=/; max-age=86400; SameSite=Lax;";
              document.cookie = "branch_manager_role=branchManager; path=/; max-age=86400; SameSite=Lax;";
              document.cookie = "user_role=branchManager; path=/; max-age=86400; SameSite=Lax;";

              setUser(managerObj);
              setBranchManagerUser(managerObj);
            }
            setIsLoading(false);
            return;
          }

          // Fallback admin
          console.log("[Auth Audit] Current Role: admin (fallback)");
          document.cookie = "admin_session=true; path=/; max-age=86400; SameSite=Lax;";
          document.cookie = "admin_role=admin; path=/; max-age=86400; SameSite=Lax;";
          document.cookie = "user_role=admin; path=/; max-age=86400; SameSite=Lax;";

          const defaultAdmin: AdminUser = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "Admin User",
            email: firebaseUser.email || "",
            role: "admin"
          };
          setUser(defaultAdmin);
          setAdminUser(defaultAdmin);
        } catch (e) {
          console.error("Error fetching user profile from Firestore:", e);
        }
      } else {
        console.log("[Auth Audit] Auth Guard Decision: No Firebase user active");
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setAdminUser, setBranchManagerUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
