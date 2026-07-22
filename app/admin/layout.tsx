import React from "react";
import { AdminProtectedLayout } from "@/components/admin/AdminProtectedLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminProtectedLayout>{children}</AdminProtectedLayout>;
}
