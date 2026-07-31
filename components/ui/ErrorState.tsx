import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-6 text-rose-900 space-y-3">
      <div className="flex items-center gap-2 font-bold text-sm">
        <AlertCircle className="w-5 h-5 text-rose-600" />
        <span>{title}</span>
      </div>
      <p className="text-xs text-rose-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3.5 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-lg shadow hover:bg-rose-700 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      )}
    </div>
  );
}
