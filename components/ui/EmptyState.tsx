import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-10 text-center space-y-3 shadow-sm">
      {icon && <div className="mx-auto w-12 h-12 text-slate-300 flex items-center justify-center">{icon}</div>}
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mx-auto">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
