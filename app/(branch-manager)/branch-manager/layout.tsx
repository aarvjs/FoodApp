"use client";

import React, { useState } from "react";
import { BranchManagerSidebar } from "@/components/layout/BranchManagerSidebar";
import { BranchManagerTopbar } from "@/components/layout/BranchManagerTopbar";
import { useFirestoreRealtime } from "@/hooks/useFirestoreRealtime";
import { useStore } from "@/lib/store/useStore";

export default function BranchManagerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const branchManagerUser = useStore((state) => state.branchManagerUser);
  const user = useStore((state) => state.user);
  const activeUser = branchManagerUser || (user?.role === "branchManager" ? user : null);
  const branchId = activeUser?.assignedBranchId || activeUser?.branchId;
  useFirestoreRealtime("branchManager", branchId);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 antialiased overflow-x-hidden">
      <BranchManagerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <BranchManagerTopbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
