import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AdminUser, OwnerUser, BranchManagerUser } from "@/types";

interface AuthState {
  // Session States
  adminUser: AdminUser | null;
  ownerUser: OwnerUser | null;
  branchManagerUser: BranchManagerUser | null;

  // Registered Accounts (Created by Super Admin)
  branchManagerAccounts: BranchManagerUser[];
  ownerAccounts: OwnerUser[];

  // Session Actions
  loginAdmin: (email: string, password?: string) => boolean;
  logoutAdmin: () => void;

  loginOwner: (email: string, password?: string) => boolean;
  logoutOwner: () => void;

  loginBranchManager: (email: string, password?: string) => { success: boolean; error?: string };
  logoutBranchManager: () => void;

  // Super Admin Management Actions
  createBranchManagerAccount: (account: Omit<BranchManagerUser, "id" | "role" | "avatar">) => void;
  deleteBranchManagerAccount: (id: string) => void;
  toggleBranchManagerStatus: (id: string) => void;

  createOwnerAccount: (account: Omit<OwnerUser, "id" | "role" | "avatar">) => void;
}

const INITIAL_ADMIN: AdminUser = {
  id: "adm-1",
  name: "Vikram Malhotra",
  email: "admin@foodkingdom.com",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  role: "SUPER_ADMIN",
};

const INITIAL_OWNERS: OwnerUser[] = [
  {
    id: "own-1",
    name: "Rajesh Sharma",
    email: "owner@foodkingdom.com",
    restaurantId: "rest-1",
    restaurantName: "Food Kingdom",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    role: "OWNER",
  },
];

const INITIAL_BRANCH_MANAGERS: BranchManagerUser[] = [
  {
    id: "bm-kanpur",
    name: "Amit Verma",
    email: "kanpur.manager@foodhub.com",
    password: "password123",
    restaurantId: "rest-1",
    assignedBranchId: "branch-kanpur",
    assignedBranchName: "Kanpur Branch",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    phone: "+91 94551 12233",
    status: "ACTIVE",
    role: "BRANCH_MANAGER",
  },
  {
    id: "bm-lucknow",
    name: "Ritu Singhania",
    email: "lucknow.manager@foodhub.com",
    password: "password123",
    restaurantId: "rest-1",
    assignedBranchId: "branch-lucknow",
    assignedBranchName: "Lucknow Branch",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    phone: "+91 94551 44556",
    status: "ACTIVE",
    role: "BRANCH_MANAGER",
  },
  {
    id: "bm-delhi",
    name: "Deepak Joshi",
    email: "delhi.manager@foodhub.com",
    password: "password123",
    restaurantId: "rest-1",
    assignedBranchId: "branch-delhi",
    assignedBranchName: "Delhi Branch",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    phone: "+91 98119 00112",
    status: "ACTIVE",
    role: "BRANCH_MANAGER",
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      adminUser: INITIAL_ADMIN,
      ownerUser: INITIAL_OWNERS[0],
      branchManagerUser: INITIAL_BRANCH_MANAGERS[0], // default session for testing Kanpur manager

      branchManagerAccounts: INITIAL_BRANCH_MANAGERS,
      ownerAccounts: INITIAL_OWNERS,

      loginAdmin: (email, password) => {
        // Mock admin check
        set({ adminUser: INITIAL_ADMIN });
        return true;
      },
      logoutAdmin: () => set({ adminUser: null }),

      loginOwner: (email, password) => {
        const found = get().ownerAccounts.find((o) => o.email.toLowerCase() === email.toLowerCase());
        if (found) {
          set({ ownerUser: found });
          return true;
        }
        // Fallback default for demo
        set({ ownerUser: INITIAL_OWNERS[0] });
        return true;
      },
      logoutOwner: () => set({ ownerUser: null }),

      loginBranchManager: (email, password) => {
        const accounts = get().branchManagerAccounts;
        const manager = accounts.find(
          (m) => m.email.toLowerCase() === email.toLowerCase()
        );

        if (!manager) {
          return { success: false, error: "No Branch Manager found with this email address." };
        }

        if (manager.status === "INACTIVE") {
          return { success: false, error: "This manager account has been deactivated by Super Admin." };
        }

        set({ branchManagerUser: manager });
        return { success: true };
      },
      logoutBranchManager: () => set({ branchManagerUser: null }),

      createBranchManagerAccount: (account) =>
        set((state) => ({
          branchManagerAccounts: [
            {
              ...account,
              id: `bm-${Date.now()}`,
              role: "BRANCH_MANAGER",
              avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random()*1000000)}?auto=format&fit=crop&w=150&q=80`,
            },
            ...state.branchManagerAccounts,
          ],
        })),

      deleteBranchManagerAccount: (id) =>
        set((state) => ({
          branchManagerAccounts: state.branchManagerAccounts.filter((m) => m.id !== id),
        })),

      toggleBranchManagerStatus: (id) =>
        set((state) => ({
          branchManagerAccounts: state.branchManagerAccounts.map((m) =>
            m.id === id
              ? { ...m, status: m.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
              : m
          ),
        })),

      createOwnerAccount: (account) =>
        set((state) => ({
          ownerAccounts: [
            {
              ...account,
              id: `own-${Date.now()}`,
              role: "OWNER",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
            },
            ...state.ownerAccounts,
          ],
        })),
    }),
    {
      name: "food-admin-auth-storage",
    }
  )
);
