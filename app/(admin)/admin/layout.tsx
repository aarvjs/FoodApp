"use client";

import React from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { AdminTopbar } from "@/components/layout/AdminTopbar";
import { useFirestoreRealtime } from "@/hooks/useFirestoreRealtime";
import { useStore } from "@/lib/store/useStore";

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const user = useStore((state) => state.user);
  useFirestoreRealtime(user?.role, user?.branchId);

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 antialiased">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
