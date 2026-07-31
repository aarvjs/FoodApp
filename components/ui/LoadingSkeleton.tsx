import React from "react";

interface LoadingSkeletonProps {
  count?: number;
  type?: "card" | "table" | "list";
}

export function LoadingSkeleton({ count = 3, type = "card" }: LoadingSkeletonProps) {
  return (
    <div className="space-y-4 animate-pulse">
      {type === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-slate-200/60 rounded-2xl h-64 w-full" />
          ))}
        </div>
      )}
      {type === "list" && (
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-slate-200/60 rounded-xl h-16 w-full" />
          ))}
        </div>
      )}
      {type === "table" && (
        <div className="bg-slate-200/60 rounded-2xl h-48 w-full" />
      )}
    </div>
  );
}
