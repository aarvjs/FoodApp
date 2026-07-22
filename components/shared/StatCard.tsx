"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  iconName: string;
  subtitle?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  iconName,
  subtitle,
  className,
}) => {
  // Dynamically resolve icon
  const IconComponent = (Icons as unknown as Record<string, React.ElementType>)[iconName] || Icons.CircleDollarSign;

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "glass-card p-5 rounded-2xl border border-orange-100/60 bg-white relative overflow-hidden group shadow-sm hover:shadow-md transition-all",
        className
      )}
    >
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br from-orange-100/40 to-amber-100/20 rounded-full blur-xl group-hover:scale-150 transition-all duration-500 pointer-events-none" />

      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform">
          <IconComponent className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold tracking-tight text-stone-900">
          {value}
        </h3>
        {change && (
          <div
            className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
              isPositive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-stone-400 font-medium">{subtitle}</p>
      )}
    </motion.div>
  );
};
