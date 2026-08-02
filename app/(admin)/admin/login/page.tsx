"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, User, Phone, AlertCircle, X } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { authService } from "@/services/authService";

export default function AdminLoginPage() {
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);
  const setAdminUser = useStore((state) => state.setAdminUser);

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showErrorPopup, setShowErrorPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccessMsg("");
    setShowErrorPopup(false);

    try {
      if (isRegisterMode) {
        // Register Super Admin
        const userObj = await authService.registerSuperAdmin({
          name,
          email,
          pass: password,
          phone
        });

        console.log("[Auth Audit] Login success: Super Admin registered", userObj.email);
        document.cookie = "admin_session=true; path=/; max-age=86400; SameSite=Lax;";
        document.cookie = "admin_role=admin; path=/; max-age=86400; SameSite=Lax;";
        document.cookie = "user_role=admin; path=/; max-age=86400; SameSite=Lax;";

        setUser(userObj);
        setAdminUser(userObj);
        setSuccessMsg("Super Admin Account registered successfully!");
        router.push("/admin/dashboard");
      } else {
        // Login Admin
        const userObj = await authService.login(email, password);

        if (userObj.role !== "admin") {
          const msg = "This account is not authorized as a Super Admin.";
          setError(msg);
          setShowErrorPopup(true);
          setIsLoading(false);
          return;
        }

        console.log("[Auth Audit] Login success: Super Admin authenticated", userObj.email);
        document.cookie = "admin_session=true; path=/; max-age=86400; SameSite=Lax;";
        document.cookie = "admin_role=admin; path=/; max-age=86400; SameSite=Lax;";
        document.cookie = "user_role=admin; path=/; max-age=86400; SameSite=Lax;";

        setUser(userObj);
        setAdminUser(userObj);
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      console.error("[Auth Audit] Login failed:", err);
      const msg = err.message || "Authentication failed. User not found in database or invalid credentials.";
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
          <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-emerald-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isRegisterMode ? "Register Super Admin" : "Super Admin Portal"}
          </h1>
          <p className="text-xs text-slate-500">
            {isRegisterMode
              ? "Create primary Super Admin account saved in Firestore"
              : "Global System Management & Multi-Branch Control"}
          </p>
        </div>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegisterMode && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Super Admin Name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="admin@foodsystem.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {isRegisterMode && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {isRegisterMode ? "Register Super Admin" : "Sign In to Super Admin"} <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError("");
            }}
            className="text-emerald-600 font-bold hover:underline"
          >
            {isRegisterMode ? "Already have an account? Sign In" : "First time? Register Super Admin"}
          </button>
          <span className="text-slate-400">Firebase Auth</span>
        </div>
      </div>
    </div>
  );
}
