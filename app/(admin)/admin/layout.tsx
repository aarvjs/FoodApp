"use client";

import React, { useState } from "react";
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 antialiased overflow-x-hidden">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
