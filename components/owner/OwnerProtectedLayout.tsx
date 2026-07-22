"use client";

import React from "react";
import { OwnerSidebar } from "./OwnerSidebar";
import { OwnerTopbar } from "./OwnerTopbar";

export const OwnerProtectedLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="flex min-h-screen bg-[#FFFDF8] text-stone-900 font-sans antialiased">
      <OwnerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <OwnerTopbar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
