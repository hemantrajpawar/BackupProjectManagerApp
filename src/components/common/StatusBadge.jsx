
import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  PauseCircle,
  Circle,
  AlertCircle,
} from "lucide-react";

export const StatusBadge = ({
  status,
  holdReason = null,
  size = "md",
  showIcon = true,
  className = "",
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const configs = {
    Completed: {
      bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60",
      icon: CheckCircle2,
    },
    "In Progress": {
      bg: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/60",
      icon: Clock,
    },
    "On Hold": {
      bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/60",
      icon: PauseCircle,
    },
    "Not Started": {
      bg: "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
      icon: Circle,
    },
  };

  const current = configs[status] || configs["Not Started"];
  const IconComponent = current.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-medium",
    lg: "px-3 py-1.5 text-sm font-semibold",
  };

  return (
    <div
      className="relative inline-flex min-w-0 items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Status badge */}
      <span
        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border shadow-sm transition-colors ${
          current.bg
        } ${sizeClasses[size] || sizeClasses.md} ${className} ${
          holdReason ? "cursor-help" : ""
        }`}
      >
        {showIcon && (
          <IconComponent className="h-3.5 w-3.5 shrink-0" />
        )}

        <span>{status}</span>

        {status === "On Hold" && holdReason && (
          <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-amber-500" />
        )}
      </span>

      {/* On Hold tooltip */}
      {status === "On Hold" && holdReason && showTooltip && (
        <div
          className="
            absolute left-0 top-full z-50 mt-2
            box-border w-80 max-w-[calc(100vw-2rem)]
            min-w-0 overflow-hidden
            rounded-xl border border-slate-700
            bg-slate-900 p-3 text-xs text-white
            shadow-xl animate-fade-in
          "
        >
          {/* Tooltip heading */}
          <div className="flex min-w-0 items-start gap-2 border-b border-slate-800 pb-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />

            <span className="min-w-0 flex-1 whitespace-normal break-words [overflow-wrap:anywhere] font-semibold leading-snug text-amber-400">
              Hold Reason: {holdReason.title}
            </span>
          </div>

          {/* Description */}
          {holdReason.description && (
            <p className="mt-2 min-w-0 whitespace-normal break-words [overflow-wrap:anywhere] text-xs leading-relaxed text-slate-300">
              {holdReason.description}
            </p>
          )}

          {/* Dates */}
          <div className="mt-2 grid min-w-0 grid-cols-1 gap-2 border-t border-slate-800 pt-2 text-[11px] text-slate-400">
            <div className="min-w-0 break-words [overflow-wrap:anywhere]">
              <span>Date: </span>
              <span>{holdReason.recordedDate}</span>
            </div>

            {holdReason.expectedReviewDate && (
              <div className="min-w-0 break-words [overflow-wrap:anywhere] text-amber-300">
                <span>Review: </span>
                <span>{holdReason.expectedReviewDate}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusBadge;