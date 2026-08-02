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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Check admins collection
          const adminDoc = await getDoc(doc(db, "admins", firebaseUser.uid));
          if (adminDoc.exists()) {
            const data = adminDoc.data();
            const adminUser: AdminUser = {
              id: firebaseUser.uid,
              name: data.name || "Super Admin",
              email: firebaseUser.email || "",
              role: "admin",
              phone: data.phone || "",
              avatar: data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            };

            // SYNC COOKIE FOR MIDDLEWARE (Vercel Production)
            document.cookie = "user_role=admin; path=/; max-age=86400; SameSite=Lax;";
            setUser(adminUser);
            setIsLoading(false);
            return;
          }

          // Check managers collection
          const managerDoc = await getDoc(doc(db, "managers", firebaseUser.uid));
          if (managerDoc.exists()) {
            const data = managerDoc.data();
            if (data.status === "INACTIVE") {
              document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;";
              setUser(null);
            } else {
              const managerUser: BranchManagerUser = {
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

              // SYNC COOKIE FOR MIDDLEWARE (Vercel Production)
              document.cookie = "user_role=branchManager; path=/; max-age=86400; SameSite=Lax;";
              setUser(managerUser);
            }
            setIsLoading(false);
            return;
          }

          // Default fallback to admin if in Firebase Auth
          document.cookie = "user_role=admin; path=/; max-age=86400; SameSite=Lax;";
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "Admin User",
            email: firebaseUser.email || "",
            role: "admin"
          });
        } catch (e) {
          console.error("Error fetching user profile from Firestore:", e);
        }
      } else {
        // Clear cookie when no Firebase user
        document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax;";
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [setUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
