"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GitBranch, ArrowRight, Lock, Mail, AlertCircle, MapPin } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function BranchManagerLoginPage() {
  const router = useRouter();
  const { loginBranchManager, branchManagerAccounts } = useAuthStore();

  const [email, setEmail] = useState("kanpur.manager@foodhub.com");
  const [password, setPassword] = useState("password123");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = loginBranchManager(email, password);
    if (res.success) {
      router.push("/branch-manager/dashboard");
    } else {
      setErrorMsg(res.error || "Invalid credentials.");
    }
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    const res = loginBranchManager(demoEmail, "password123");
    if (res.success) {
      router.push("/branch-manager/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-10 left-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-stone-900 rounded-3xl p-8 border border-stone-800 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3">
            <GitBranch className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Branch Manager Portal
          </h1>
          <p className="text-xs text-stone-400 font-medium mt-1">
            Log in with credentials created by Super Admin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-300 mb-1.5">
              Manager Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                className="w-full pl-10 pr-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-rose-400 text-center flex items-center justify-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMsg}</span>
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 hover:opacity-95 transition-all"
          >
            <span>Sign In to Branch Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Branch Manager Selection */}
        <div className="mt-8 pt-6 border-t border-stone-800">
          <p className="text-xs font-bold text-stone-400 text-center uppercase tracking-wider mb-3">
            Quick Select Provisioned Manager Login
          </p>
          <div className="space-y-2">
            {branchManagerAccounts.map((bm) => (
              <button
                key={bm.id}
                onClick={() => handleQuickDemoLogin(bm.email)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 border border-stone-700 text-left transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {bm.assignedBranchName} Manager ({bm.name})
                    </span>
                    <span className="text-[10px] text-stone-400">{bm.email}</span>
                  </div>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-400 font-bold px-2 py-0.5 rounded">
                  Log In
                </span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-stone-500 text-center mt-6">
          Need portal switch?{" "}
          <Link href="/" className="text-amber-400 font-bold hover:underline">
            Gateway Directory
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
