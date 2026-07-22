import React from "react";
import { OwnerProtectedLayout } from "@/components/owner/OwnerProtectedLayout";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <OwnerProtectedLayout>{children}</OwnerProtectedLayout>;
}
