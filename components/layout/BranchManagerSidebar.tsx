"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  UtensilsCrossed, 
  Layers, 
  Grid3X3, 
  Users, 
  Bike, 
  Tag, 
  User, 
  Settings,
  LogOut,
  Building2
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";

const branchManagerNavItems = [
  { name: "Dashboard", href: "/branch-manager/dashboard", icon: LayoutDashboard },
  { name: "Branch Orders", href: "/branch-manager/orders", icon: ShoppingBag },
  { name: "Branch Menu", href: "/branch-manager/menu", icon: UtensilsCrossed },
  { name: "Categories", href: "/branch-manager/categories", icon: Layers },
  { name: "Tables Layout", href: "/branch-manager/tables", icon: Grid3X3 },
  { name: "Branch Customers", href: "/branch-manager/customers", icon: Users },
  { name: "Delivery Requests", href: "/branch-manager/delivery-requests", icon: Bike },
  { name: "Promotions & Offers", href: "/branch-manager/offers", icon: Tag },
  { name: "My Profile", href: "/branch-manager/profile", icon: User },
  { name: "Branch Settings", href: "/branch-manager/settings", icon: Settings }
];

export const BranchManagerSidebar: React.FC = () => {
  const pathname = usePathname();
  const logout = useStore((state) => state.logout);
  const user = useStore((state) => state.user);
  const branches = useStore((state) => state.branches);

  const assignedBranch = branches.find((b) => b.id === user?.branchId) || branches[0];

  const handleLogout = () => {
    document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    logout();
    window.location.href = "/branch-manager/login";
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 z-30 shrink-0">
      {/* Branch Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-amber-500/20">
          B
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-white text-sm tracking-tight truncate leading-none">
            {assignedBranch?.name || "Branch Manager"}
          </h1>
          <p className="text-[11px] text-amber-400 font-medium mt-1 truncate flex items-center gap-1">
            <Building2 className="w-3 h-3 shrink-0" />
            {assignedBranch?.location?.city || "Kanpur"}
          </p>
        </div>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Branch Operations
        </div>
        {branchManagerNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-950/30"
                  : "hover:bg-slate-800/70 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
        >
          <span className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout Branch
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded font-medium">Manager</span>
        </button>
      </div>
    </aside>
  );
};
