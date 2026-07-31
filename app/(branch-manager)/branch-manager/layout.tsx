"use client";

import React from "react";
import { BranchManagerSidebar } from "@/components/layout/BranchManagerSidebar";
import { BranchManagerTopbar } from "@/components/layout/BranchManagerTopbar";
import { useFirestoreRealtime } from "@/hooks/useFirestoreRealtime";
import { useStore } from "@/lib/store/useStore";

export default function BranchManagerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = useStore((state) => state.user);
  useFirestoreRealtime("branchManager", user?.branchId);

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 antialiased">
      <BranchManagerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <BranchManagerTopbar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
