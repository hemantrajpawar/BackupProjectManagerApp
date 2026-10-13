
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Calendar,
  Users,
  PauseCircle,
  ArrowRight,
  Clock,
} from "lucide-react";

import StatusBadge from "../common/StatusBadge";
import { formatDate } from "../../utils/dateUtils";

export const GanttTooltip = ({
  task,
  projectId,
  issues = [],
  assignees = [],
  holdReason = null,
  delayDays = 0,
}) => {
  const navigate = useNavigate();

  if (!task) return null;

  const formatSafeDate = (date) => {
    return date ? formatDate(date, false) : "Not set";
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="
        box-border flex w-80 max-w-[calc(100vw-2rem)]
        max-h-[calc(100vh-2rem)] min-w-0 flex-col
        overflow-hidden rounded-xl border border-slate-700
        bg-slate-900 text-xs text-white shadow-2xl
        pointer-events-auto
      "
    >
      {/* Sticky-style header */}
      <div className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-800 p-3.5">
        <div className="min-w-0 flex-1">
          <span className="block break-words font-mono text-[10px] text-slate-400">
            {task.isSubtask ? "Subtask" : "Milestone Task"} • {task.id}
          </span>

          <h4
            className="mt-1 break-words font-bold leading-snug text-white [overflow-wrap:anywhere]"
            title={task.title}
          >
            {task.title}
          </h4>
        </div>

        <div className="shrink-0">
          <StatusBadge status={task.status} size="sm" />
        </div>
      </div>

      {/* Scrollable tooltip content */}
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden p-3.5">

        {/* Schedule comparison */}
        <section className="min-w-0 space-y-2 rounded-lg border border-slate-800/80 bg-slate-950/60 p-2.5">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="text-[11px] text-slate-400">
              Baseline Plan
            </span>

            <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-mono text-slate-300">
              <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                {formatSafeDate(task.plannedStartDate)}
                {" → "}
                {formatSafeDate(task.plannedEndDate)}
              </span>
            </div>
          </div>

          <div className="border-t border-slate-800/70 pt-2">
            <span className="text-[11px] text-slate-400">
              Forecast Schedule
            </span>

            <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] font-mono font-semibold text-indigo-300">
              <Clock className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
              <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                {formatSafeDate(task.forecastStartDate)}
                {" → "}
                {formatSafeDate(task.forecastEndDate)}
              </span>
            </div>
          </div>

          {delayDays > 0 && (
            <div className="flex min-w-0 flex-col gap-1 border-t border-slate-800 pt-2">
              <span className="text-[11px] font-semibold text-rose-400">
                Forecast Delay
              </span>

              <span className="w-fit max-w-full break-words rounded border border-rose-800/80 bg-rose-950/80 px-1.5 py-1 font-semibold text-rose-300">
                +{delayDays} days slippage
              </span>
            </div>
          )}
        </section>

        {/* Progress */}
        <section className="grid min-w-0 grid-cols-2 gap-3">
          <div className="min-w-0">
            <span className="block text-[10px] text-slate-400">
              Progress
            </span>

            <span className="mt-0.5 block break-words text-sm font-bold text-emerald-400">
              {task.progress ?? 0}%
            </span>
          </div>

          <div className="min-w-0">
            <span className="flex items-center gap-1 text-[10px] text-slate-400">
              <Users className="h-3 w-3 shrink-0" />
              Assigned
            </span>

            <span className="mt-0.5 block break-words leading-relaxed text-slate-200 [overflow-wrap:anywhere]">
              {assignees.map((person) => person.name).filter(Boolean).join(", ") ||
                "Unassigned"}
            </span>
          </div>
        </section>

        {/* Hold reason */}
        {holdReason && (
          <section className="min-w-0 space-y-2 rounded-lg border border-amber-800 bg-amber-950/60 p-2.5 text-amber-200">
            <div className="flex min-w-0 items-start gap-1.5">
              <PauseCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />

              <div className="min-w-0 flex-1">
                <h5 className="break-words font-bold leading-snug [overflow-wrap:anywhere]">
                  On Hold: {holdReason.title}
                </h5>
              </div>
            </div>

            {holdReason.description && (
              <p className="break-words text-[10px] leading-relaxed text-amber-300/80 [overflow-wrap:anywhere]">
                {holdReason.description}
              </p>
            )}

            <div className="grid min-w-0 grid-cols-1 gap-1 border-t border-amber-800/70 pt-2 text-[10px]">
              {holdReason.recordedDate && (
                <div className="break-words [overflow-wrap:anywhere]">
                  <span className="text-amber-400/80">Recorded: </span>
                  {formatSafeDate(holdReason.recordedDate)}
                </div>
              )}

              {holdReason.expectedReviewDate && (
                <div className="break-words [overflow-wrap:anywhere]">
                  <span className="text-amber-400/80">Review: </span>
                  {formatSafeDate(holdReason.expectedReviewDate)}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Linked blocker issues */}
        {issues.length > 0 && (
          <section className="min-w-0 space-y-2 border-t border-slate-800 pt-3">
            <div className="flex min-w-0 items-center gap-2">
              <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />

              <h5 className="min-w-0 break-words text-[10px] font-bold uppercase tracking-wider text-rose-400">
                Linked Blocker Issues ({issues.length})
              </h5>
            </div>

            {issues.map((issue) => (
              <div
                key={issue.id}
                className="min-w-0 space-y-2 rounded-lg border border-rose-800/60 bg-rose-950/40 p-2"
              >
                <div className="flex min-w-0 items-start justify-between gap-2">
                  <span
                    className="min-w-0 flex-1 break-words font-bold leading-snug text-rose-200 [overflow-wrap:anywhere]"
                    title={issue.title}
                  >
                    {issue.title}
                  </span>

                  {issue.severity && (
                    <span className="shrink-0 rounded bg-rose-900 px-1 py-0.5 text-[9px] font-bold uppercase text-rose-300">
                      {issue.severity}
                    </span>
                  )}
                </div>

                {issue.description && (
                  <p className="break-words text-[10px] leading-relaxed text-rose-300/80 [overflow-wrap:anywhere]">
                    {issue.description}
                  </p>
                )}

                {projectId && (
                  <div className="flex justify-end border-t border-rose-900/50 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/projects/${projectId}/issues?highlight=${encodeURIComponent(issue.id)}`
                        )
                      }
                      className="inline-flex max-w-full items-center gap-1 text-left text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:underline"
                    >
                      <span>Open Blocker Details</span>
                      <ArrowRight className="h-3 w-3 shrink-0" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default GanttTooltip;
