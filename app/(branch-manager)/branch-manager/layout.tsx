"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BranchManagerSidebar } from "@/components/layout/BranchManagerSidebar";
import { BranchManagerTopbar } from "@/components/layout/BranchManagerTopbar";
import { useFirestoreRealtime } from "@/hooks/useFirestoreRealtime";
import { useAuth } from "@/providers/AuthProvider";
import { Loader2 } from "lucide-react";

import { OrderNotificationProvider } from "@/providers/OrderNotificationContext";

export default function BranchManagerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isManagerRole = user?.role === "branch_manager" || user?.role === "branchManager";

  useFirestoreRealtime("branchManager", user?.assignedBranchId || user?.branchId);

  // Exclude login page from sidebar layout & guard check
  const isLoginPage = pathname?.startsWith("/branch-manager/login");

  useEffect(() => {
    if (!isLoading && !isLoginPage) {
      if (!user || !isManagerRole) {
        console.log("[Route Guard] Unauthorized access to Branch Manager route. Redirecting to /branch-manager/login...");
        router.push("/branch-manager/login");
      }
    }
  }, [user, isLoading, isLoginPage, isManagerRole, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin " />
          <p className="text-xs font-semibold text-slate-400">Verifying Branch Manager session...</p>
        </div>
      </div>
    );
  }

  if (!user || !isManagerRole) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-xs text-slate-400">Redirecting to Branch Manager login...</p>
        </div>
      </div>
    );
  }

  return (
    <OrderNotificationProvider role="branchManager">
      <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 antialiased overflow-x-hidden">
        <BranchManagerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <BranchManagerTopbar onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </OrderNotificationProvider>
  );
}
