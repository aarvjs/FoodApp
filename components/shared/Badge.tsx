import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "primary"
    | "secondary"
    | "neutral";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "neutral",
  size = "md",
  className,
}) => {
  const variantStyles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    warning: "bg-amber-50 text-amber-700 border-amber-200/80",
    danger: "bg-rose-50 text-rose-700 border-rose-200/80",
    info: "bg-sky-50 text-sky-700 border-sky-200/80",
    primary: "bg-orange-50 text-[#FF6B35] border-orange-200/80 font-semibold",
    secondary: "bg-amber-50 text-[#FFA726] border-amber-200/80",
    neutral: "bg-stone-100 text-stone-700 border-stone-200/80",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium rounded-full",
    md: "px-2.5 py-1 text-xs font-semibold rounded-full",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border transition-colors",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};
