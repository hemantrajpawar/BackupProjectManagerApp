import React from "react";
import { CheckCircle2, Clock, AlertTriangle, AlertCircle, Users, TrendingUp } from "lucide-react";

export const ProjectKpiCards = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* 1. Completion Percentage */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
          <span>Overall Progress</span>
          <TrendingUp className="w-4 h-4" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {metrics.overallProgress}%
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            style={{ width: `${metrics.overallProgress}%` }}
            className="h-full bg-indigo-600 rounded-full transition-all"
          />
        </div>
      </div>

      {/* 2. Tasks Ratio */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
          <span>Task Delivery</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {metrics.completedTasks}
          <span className="text-sm font-normal text-slate-400">/{metrics.totalTasks}</span>
        </div>
        <p className="text-[11px] text-slate-400">
          {metrics.inProgressTasks} in progress • {metrics.onHoldTasks} on hold
        </p>
      </div>

      {/* 3. Overdue Tasks */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 text-xs font-semibold">
          <span>Overdue Tasks</span>
          <AlertTriangle className="w-4 h-4 text-rose-500" />
        </div>
        <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
          {metrics.overdueTasks}
        </div>
        <p className="text-[11px] text-slate-400">
          {metrics.overdueTasks > 0 ? "Past planned deadline" : "All tasks within schedule"}
        </p>
      </div>

      {/* 4. Open / Critical Blockers */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-semibold">
          <span>Open Issues</span>
          <AlertCircle className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {metrics.openIssues}
        </div>
        <p className="text-[11px] text-slate-400">
          {metrics.criticalIssues} critical/high severity
        </p>
      </div>

      {/* 5. Active Contributors */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
        <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 text-xs font-semibold">
          <span>Active Contributors</span>
          <Users className="w-4 h-4 text-blue-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {metrics.activeTeamCount}
          <span className="text-sm font-normal text-slate-400">/{metrics.totalTeamCount}</span>
        </div>
        <p className="text-[11px] text-slate-400">
          Members with in-progress tasks
        </p>
      </div>
    </div>
  );
};

export default ProjectKpiCards;
