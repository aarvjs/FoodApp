"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
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
      console.log("[Branch Audit] AuthProvider onAuthStateChanged:", firebaseUser?.uid);

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

            console.log("[Branch Audit] Current Role: admin");

            document.cookie = "admin_session=true; path=/; max-age=86400; SameSite=Lax;";
            document.cookie = "admin_role=admin; path=/; max-age=86400; SameSite=Lax;";
            document.cookie = "user_role=admin; path=/; max-age=86400; SameSite=Lax;";

            setUser(adminObj);
            setAdminUser(adminObj);
            setIsLoading(false);
            return;
          }

          // Check managers collection by UID first, fallback to query by email
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
            console.log("[Branch Audit] Firebase UID:", firebaseUser.uid);
            console.log("[Branch Audit] Email:", firebaseUser.email);
            console.log("[Branch Audit] Firestore document in managers:", managerData);
            console.log("[Branch Audit] Branch ID:", managerData.assignedBranchId || managerData.branchId || "");
            console.log("[Branch Audit] Restaurant ID:", managerData.restaurantId || "");

            if (managerData.status === "INACTIVE") {
              console.log("[Branch Audit] Account status is INACTIVE, clearing manager session");
              document.cookie = "branch_manager_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;";
              document.cookie = "branch_manager_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;";
              setUser(null);
            } else {
              const managerObj: BranchManagerUser = {
                id: firebaseUser.uid,
                name: managerData.name || "Branch Manager",
                email: firebaseUser.email || "",
                role: "branchManager",
                restaurantId: managerData.restaurantId || "",
                branchId: managerData.assignedBranchId || managerData.branchId || "",
                assignedBranchId: managerData.assignedBranchId || managerData.branchId || "",
                assignedBranchName: managerData.assignedBranchName || managerData.branchName || "Branch",
                status: managerData.status || "ACTIVE",
                phone: managerData.phone || "",
                avatar: managerData.avatar || "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80"
              };

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
        console.log("[Branch Audit] No active Firebase user in AuthProvider");
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
