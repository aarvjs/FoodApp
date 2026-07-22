"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Lock, Mail } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin } = useAuthStore();
  const [email, setEmail] = useState("admin@foodkingdom.com");
  const [password, setPassword] = useState("admin123");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAdmin(email, password);
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4 relative overflow-hidden text-stone-100">
      <div className="absolute top-10 left-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-stone-900 rounded-3xl p-8 border border-stone-800 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6B35] to-[#FFA726] text-white flex items-center justify-center shadow-lg shadow-orange-500/20 mb-3">
            <ShieldCheck className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Super Admin Portal
          </h1>
          <p className="text-xs text-stone-400 font-medium mt-1">
            Enterprise HQ authentication & system control
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1.5">
              Admin Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#FF6B35]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#FF6B35] to-[#FFA726] text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
          >
            <span>Sign In to Super Admin</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-xs text-stone-500 text-center mt-6">
          Need portal switch?{" "}
          <Link href="/" className="text-[#FF6B35] font-bold hover:underline">
            Gateway Directory
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
