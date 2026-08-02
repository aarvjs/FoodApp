"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Store, ArrowRight, UtensilsCrossed } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

export default function RootLandingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user?.role === "admin") {
        router.push("/admin/dashboard");
      } else if (user?.role === "branch_manager" || user?.role === "branchManager") {
        router.push("/branch-manager/dashboard");
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-6">
      {/* Header Brand */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-lg">
            F
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Food Ordering System</h1>
            <p className="text-xs text-slate-400">Enterprise Multi-Branch Administration Portals</p>
          </div>
        </div>
      </header>

      {/* Main Choice Section */}
      <main className="max-w-4xl mx-auto w-full my-auto py-12 space-y-8">
        <div className="text-center space-y-3">
          <span className="px-3.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-semibold">
            Next.js 15 • Firebase Architecture
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Select Web Portal
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Choose your administrative role to access your dedicated management console.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Super Admin Portal Card */}
          <Link
            href="/admin/login"
            className="group p-8 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 rounded-3xl space-y-5 transition-all shadow-xl hover:shadow-emerald-950/40 relative overflow-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">Portal 1</span>
              <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-emerald-300 transition-colors">
                Super Admin Portal
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Full network control: Create Restaurants, Create Branches, Address Geocoding, Menus, Global Analytics & Revenue.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              Access Super Admin Login <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>

          {/* Branch Manager Portal Card */}
          <Link
            href="/branch-manager/login"
            className="group p-8 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-3xl space-y-5 transition-all shadow-xl hover:shadow-amber-950/40 relative overflow-hidden"
          >
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Store className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">Portal 2</span>
              <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-amber-300 transition-colors">
                Branch Manager Portal
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Strictly scoped branch operations: Today's Orders, Kitchen Status, Menu Availability, Branch Tables & Settings.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-amber-400 group-hover:translate-x-1 transition-transform">
              Access Branch Manager Login <ArrowRight className="w-4 h-4 ml-1" />
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4 border-t border-slate-800/60">
        Food Ordering System • Built for Production
      </footer>
    </div>
  );
}
