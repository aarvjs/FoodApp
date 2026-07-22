"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, ShieldCheck, Store, GitBranch, ArrowRight } from "lucide-react";

export default function PortalGatewayPage() {
  const portals = [
    {
      title: "Super Admin Portal",
      subtitle: "Enterprise HQ Control & Multi-Brand Governance",
      href: "/admin/login",
      icon: ShieldCheck,
      color: "from-stone-900 to-stone-950",
      accent: "text-[#FF6B35]",
      btn: "bg-[#FF6B35] hover:bg-orange-600 text-white",
      badge: "Super Admin Only",
      desc: "Manage restaurants, global menu, create Branch Managers & Owners, setup logistics.",
    },
    {
      title: "Restaurant Owner Portal",
      subtitle: "Brand Portfolio Analytics & Outlet Management",
      href: "/owner/login",
      icon: Store,
      color: "from-orange-500 to-amber-500",
      accent: "text-amber-500",
      btn: "bg-[#FF6B35] hover:bg-orange-600 text-white",
      badge: "Brand Owners",
      desc: "Monitor Food Kingdom revenues, popular products, branch performance, and campaigns.",
    },
    {
      title: "Branch Manager Portal",
      subtitle: "Branch-Level Orders, Kitchen KDS & Sales Reports",
      href: "/branch-manager/login",
      icon: GitBranch,
      color: "from-amber-600 to-orange-600",
      accent: "text-orange-400",
      btn: "bg-amber-500 hover:bg-amber-600 text-white",
      badge: "Strict Branch Scoped",
      desc: "Login with manager credentials (e.g. kanpur.manager@foodhub.com) for isolated outlet ops.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl z-10 space-y-8 text-center">
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FF6B35] to-[#FFA726] text-white flex items-center justify-center shadow-xl shadow-orange-500/30 mb-4">
            <Flame className="w-9 h-9 fill-white stroke-none" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight">
            Food<span className="text-[#FF6B35]">Kingdom</span> Enterprise ERP
          </h1>
          <p className="text-sm text-stone-500 font-medium max-w-xl mt-2">
            Multi-Role Restaurant Management Platform featuring 3 isolated operational portals
          </p>
        </div>

        {/* Portal Gateway Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {portals.map((portal, idx) => {
            const Icon = portal.icon;
            return (
              <motion.div
                key={portal.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                className="glass-card rounded-3xl bg-white border border-orange-100 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white flex items-center justify-center shadow-md">
                      <Icon className="w-6 h-6 text-[#FF6B35]" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-50 text-[#FF6B35] px-2.5 py-1 rounded-full border border-orange-200/60">
                      {portal.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-stone-900 group-hover:text-[#FF6B35] transition-colors">
                    {portal.title}
                  </h3>
                  <p className="text-xs font-semibold text-stone-400 mt-0.5">
                    {portal.subtitle}
                  </p>

                  <p className="text-xs text-stone-600 font-medium leading-relaxed mt-4">
                    {portal.desc}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-stone-100">
                  <Link
                    href={portal.href}
                    className={`w-full py-3 rounded-2xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all ${portal.btn}`}
                  >
                    <span>Launch Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
