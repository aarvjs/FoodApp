"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Store, Mail, Lock, ArrowRight, Loader2, KeyRound, AlertCircle, X } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { useAuth } from "@/providers/AuthProvider";
import { authService } from "@/services/authService";

export default function BranchManagerLoginPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const setUser = useStore((state) => state.setUser);
  const setBranchManagerUser = useStore((state) => state.setBranchManagerUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  // Auto-redirect if already logged in as Branch Manager
  useEffect(() => {
    if (!isAuthLoading && (user?.role === "branch_manager" || user?.role === "branchManager")) {
      router.push("/branch-manager/dashboard");
    }
  }, [user, isAuthLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setShowErrorPopup(false);

    try {
      const userObj = await authService.login(email, password);

      if (userObj.role !== "branch_manager" && userObj.role !== "branchManager") {
        const msg = "Account authorized as Admin. Please log in through Super Admin Portal.";
        setError(msg);
        setShowErrorPopup(true);
        setIsLoading(false);
        return;
      }

      setUser(userObj);
      setBranchManagerUser(userObj);
      router.push("/branch-manager/dashboard");
    } catch (err: any) {
      console.error("[Auth] Branch Manager login failed:", err);
      const msg = err.message || "Invalid credentials or user record not found.";
      setError(msg);
      setShowErrorPopup(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Error Popup Modal */}
      {showErrorPopup && error && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 relative text-center animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowErrorPopup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Authentication Error</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{error}</p>
            </div>
            <button
              onClick={() => setShowErrorPopup(false)}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all"
            >
              Close & Try Again
            </button>
          </div>
        </div>
      )}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-amber-500/30">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Branch Manager Portal</h1>
          <p className="text-xs text-slate-500">Sign in with credentials created by Super Admin</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-start gap-2 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Manager Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="manager@branch.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Assigned Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Sign In to Branch Portal <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
          <KeyRound className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Need credentials?</strong> Contact your Super Admin to generate or reset your branch manager account.
          </div>
        </div>
      </div>
    </div>
  );
}
