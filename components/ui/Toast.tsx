import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "success", onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const bgColors = {
    success: "bg-emerald-900 text-emerald-100 border-emerald-700",
    error: "bg-rose-900 text-rose-100 border-rose-700",
    info: "bg-slate-900 text-slate-100 border-slate-700"
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl text-xs font-semibold max-w-md ${bgColors[type]}`}>
        {icons[type]}
        <span className="flex-1">{message}</span>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-slate-300">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
