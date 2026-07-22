import React from "react";
import { BranchManagerProtectedLayout } from "@/components/branch-manager/BranchManagerProtectedLayout";

export default function BranchManagerLayout({ children }: { children: React.ReactNode }) {
  return <BranchManagerProtectedLayout>{children}</BranchManagerProtectedLayout>;
}
