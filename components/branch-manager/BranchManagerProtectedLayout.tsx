"use client";

import React from "react";
import { BranchManagerSidebar } from "./BranchManagerSidebar";
import { BranchManagerTopbar } from "./BranchManagerTopbar";

export const BranchManagerProtectedLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex min-h-screen bg-stone-950 text-stone-100 font-sans antialiased">
      <BranchManagerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <BranchManagerTopbar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
