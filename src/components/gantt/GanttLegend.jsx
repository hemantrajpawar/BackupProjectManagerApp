
import React from "react";
import { Info } from "lucide-react";

export const GanttLegend = () => {
  const legendItems = [
    {
      label: "Baseline",
      description: "Planned Schedule",
      color:
        "border-2 border-dashed border-indigo-400 bg-indigo-500/15",
    },
    {
      label: "Forecast",
      description: "Active Timeline",
      color: "bg-indigo-600",
    },
    {
      label: "Progress",
      description: "Actual Completion",
      color: "bg-emerald-500",
    },
    {
      label: "Delay Gap",
      description: "Blocker Slippage",
      color: "border border-rose-600 bg-rose-500/90",
      textColor: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Today",
      description: "Current Date",
      color: "w-1.5 bg-amber-500 rounded-full",
    },
  ];

  return (
    <div className="flex w-full min-w-0 flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
      {/* Legend heading */}
      <div className="flex shrink-0 items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
        <Info className="h-4 w-4 shrink-0 text-indigo-500" />
        <span>Gantt Legend</span>
      </div>

      {/* Legend items */}
      {legendItems.map((item) => (
        <div
          key={item.label}
          className="flex min-w-0 items-center gap-2"
        >
          <span
            aria-hidden="true"
            className={`h-3 w-6 shrink-0 rounded-sm ${item.color}`}
          />

          <span
            className={`min-w-0 leading-relaxed ${
              item.textColor || ""
            }`}
          >
            <span className="font-semibold">{item.label}</span>
            <span className="text-slate-500 dark:text-slate-400">
              {" "}({item.description})
            </span>
          </span>
        </div>
      ))}
    </div>
  );
};

export default GanttLegend;
