"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Store, ArrowRight, Lock, Mail } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function OwnerLoginPage() {
  const router = useRouter();
  const { loginOwner } = useAuthStore();
  const [email, setEmail] = useState("owner@foodkingdom.com");
  const [password, setPassword] = useState("owner123");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginOwner(email, password);
    router.push("/owner/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 right-10 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-8 border border-orange-100 shadow-xl shadow-orange-500/5 relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B35] to-[#FFA726] text-white flex items-center justify-center shadow-lg shadow-orange-500/30 mb-3">
            <Store className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Restaurant Owner Portal
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Sign in to manage Food Kingdom outlets, sales & operations
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Owner Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
          >
            <span>Sign In to Owner Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-xs text-stone-400 text-center mt-6">
          Need portal switch?{" "}
          <Link href="/" className="text-[#FF6B35] font-bold hover:underline">
            Gateway Directory
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
