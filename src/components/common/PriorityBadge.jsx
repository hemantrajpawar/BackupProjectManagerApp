import React from "react";
import { AlertTriangle, ArrowUp, ArrowRight, ArrowDown } from "lucide-react";

export const PriorityBadge = ({ priority = "Medium", size = "sm" }) => {
  const configs = {
    Critical: {
      bg: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60",
      icon: AlertTriangle,
    },
    High: {
      bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60",
      icon: ArrowUp,
    },
    Medium: {
      bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/60",
      icon: ArrowRight,
    },
    Low: {
      bg: "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
      icon: ArrowDown,
    },
  };

  const current = configs[priority] || configs.Medium;
  const Icon = current.icon;

  const sizeClasses = {
    xs: "px-1.5 py-0.5 text-[10px]",
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded border shadow-2xs ${
        current.bg
      } ${sizeClasses[size] || sizeClasses.sm}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{priority}</span>
    </span>
  );
};

export default PriorityBadge;
