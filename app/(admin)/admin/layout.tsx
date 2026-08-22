"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { useFirestoreRealtime } from "@/hooks/useFirestoreRealtime";
import { useAuth } from "@/providers/AuthProvider";
import { Loader2 } from "lucide-react";

import { OrderNotificationProvider } from "@/providers/OrderNotificationContext";

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useFirestoreRealtime(user?.role, user?.branchId);

  // Exclude login page from sidebar layout & guard check
  const isLoginPage = pathname?.startsWith("/admin/login");

  useEffect(() => {
    if (!isLoading && !isLoginPage) {
      if (!user || user.role !== "admin") {
        console.log("[Route Guard] Unauthorized access to Admin route. Redirecting to /admin/login...");
        router.push("/admin/login");
      }
    }
  }, [user, isLoading, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Verifying Super Admin session...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-xs text-slate-400">Redirecting to Super Admin login...</p>
        </div>
      </div>
    );
  }

  return (
    <OrderNotificationProvider role="admin">
      <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 antialiased overflow-x-hidden">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminTopbar onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </OrderNotificationProvider>
  );
}
