"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Store, 
  UserCheck, 
  ShoppingBag, 
  BarChart3, 
  Users, 
  Settings,
  LogOut,
  ShieldCheck,
  Truck,
  X
} from "lucide-react";
import { useStore } from "@/lib/store/useStore";

import { authService } from "@/services/authService";

const adminNavItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Restaurants", href: "/admin/restaurants", icon: Store },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Delivery Charges", href: "/admin/delivery-charges", icon: Truck },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Users & Managers", href: "/admin/branch-managers", icon: UserCheck },
  { name: "Settings", href: "/admin/settings", icon: Settings }
];


interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();
  const logoutAdmin = useStore((state) => state.logoutAdmin);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn("Signout notice:", e);
    } finally {
      logoutAdmin();
      window.location.href = "/admin/login";
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 shrink-0 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">
              S
            </div>
            <div>
              <h1 className="font-bold text-white text-base tracking-tight leading-none flex items-center gap-1.5">
                SuperAdmin
                <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
              </h1>
              <p className="text-[11px] text-emerald-400 font-medium mt-1">Multi-Restaurant Platform</p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Menu */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Global Console
          </div>
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/30 font-semibold"
                    : "hover:bg-slate-800/70 text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
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
              Logout Session
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">Admin</span>
          </button>
        </div>
      </aside>
    </>
  );
};
