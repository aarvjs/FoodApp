"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Flame, Shield, ArrowRight, Lock, Mail, Store } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { UserRole } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { setCurrentRole } = useAppStore();
  const [email, setEmail] = useState("owner@foodkingdom.com");
  const [password, setPassword] = useState("••••••••");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    setCurrentRole(role);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl p-8 border border-orange-100 shadow-xl shadow-orange-500/5 relative z-10"
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B35] to-[#FFA726] text-white flex items-center justify-center shadow-lg shadow-orange-500/30 mb-3">
            <Flame className="w-8 h-8 fill-white stroke-none" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Food<span className="text-[#FF6B35]">Kingdom</span> ERP
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Sign in to manage restaurants, orders, & delivery operations
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:bg-white transition-all"
                placeholder="name@foodkingdom.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Password
              </label>
              <a href="#" className="text-xs text-[#FF6B35] hover:underline font-semibold">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:bg-white transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#FF6B35] to-[#FFA726] hover:opacity-95 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <span>Sign In to Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Demo Switcher */}
        <div className="mt-8 pt-6 border-t border-stone-100">
          <p className="text-xs font-bold text-stone-400 text-center uppercase tracking-wider mb-3">
            Quick Demo Role Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickDemoLogin("SUPER_ADMIN")}
              className="px-3 py-2 bg-stone-100 hover:bg-orange-50 hover:text-[#FF6B35] text-stone-700 text-xs font-bold rounded-xl text-left border border-stone-200/60 transition-colors"
            >
              👑 Super Admin
            </button>
            <button
              onClick={() => handleQuickDemoLogin("OWNER")}
              className="px-3 py-2 bg-stone-100 hover:bg-orange-50 hover:text-[#FF6B35] text-stone-700 text-xs font-bold rounded-xl text-left border border-stone-200/60 transition-colors"
            >
              🏢 Restaurant Owner
            </button>
            <button
              onClick={() => handleQuickDemoLogin("BRANCH_MANAGER")}
              className="px-3 py-2 bg-stone-100 hover:bg-orange-50 hover:text-[#FF6B35] text-stone-700 text-xs font-bold rounded-xl text-left border border-stone-200/60 transition-colors"
            >
              📍 Branch Manager
            </button>
            <button
              onClick={() => handleQuickDemoLogin("KITCHEN_STAFF")}
              className="px-3 py-2 bg-stone-100 hover:bg-orange-50 hover:text-[#FF6B35] text-stone-700 text-xs font-bold rounded-xl text-left border border-stone-200/60 transition-colors"
            >
              👨‍🍳 Kitchen Staff
            </button>
          </div>
        </div>

        <p className="text-xs text-stone-400 text-center mt-6">
          Don't have an account?{" "}
          <Link href="/register" className="text-[#FF6B35] font-bold hover:underline">
            Register Restaurant
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
