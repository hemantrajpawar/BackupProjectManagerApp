
import React, { useState } from "react";
import { AlertCircle, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const DelayIndicator = ({
  days,
  issues = [],
  projectId = null,
  showIcon = true,
  className = "",
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();

  if (!days || days <= 0) return null;

  const handleOpenIssue = (issueId, e) => {
    e.stopPropagation();

    if (projectId) {
      navigate(`/projects/${projectId}/issues?highlight=${issueId}`);
    }
  };

  return (
    <div
      className="relative inline-flex align-middle"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Delay badge */}
      <span
        className={`inline-flex items-center gap-1 whitespace-nowrap text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 cursor-help transition-transform hover:scale-105 ${className}`}
      >
        {showIcon && (
          <AlertCircle className="w-3 h-3 shrink-0 text-rose-500" />
        )}
        <span>
          {days} {days === 1 ? "day late" : "days late"}
        </span>
      </span>

      {/* Delay tooltip */}
      {showTooltip && (
        <div
          className="
            absolute left-0 bottom-full mb-2 z-50
            box-border w-72 max-w-[calc(100vw-2rem)]
            rounded-lg border border-slate-700
            bg-slate-900 p-3 text-xs text-white
            shadow-2xl whitespace-normal break-words
          "
        >
          {/* Heading */}
          <div className="flex w-full min-w-0 items-center gap-2 mb-2 pb-2 border-b border-slate-800">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />

            <span className="min-w-0 flex-1 whitespace-normal break-words font-semibold leading-snug text-rose-400">
              Schedule Delay: +{days} days
            </span>
          </div>

          {/* Blocker details */}
          {issues.length > 0 ? (
            <div className="mt-1 space-y-2">
              <p className="whitespace-normal break-words text-[11px] font-medium text-slate-400">
                Root Cause Blocker{issues.length > 1 ? "s" : ""}:
              </p>

              {issues.map((iss) => (
                <div
                  key={iss.id}
                  className="min-w-0 space-y-2 rounded border border-slate-700 bg-slate-800/80 p-2 text-slate-200"
                >
                  <div className="flex min-w-0 items-start justify-between gap-2">
                    <span className="min-w-0 flex-1 whitespace-normal break-words font-semibold text-rose-300">
                      {iss.title}
                    </span>

                    <span className="shrink-0 rounded border border-rose-800 bg-rose-950 px-1.5 py-0.5 text-[10px] text-rose-400">
                      {iss.severity}
                    </span>
                  </div>

                  <p className="whitespace-normal break-words text-[11px] leading-relaxed text-slate-300">
                    {iss.resolutionNote || iss.description}
                  </p>

                  {projectId && (
                    <button
                      type="button"
                      onClick={(e) => handleOpenIssue(iss.id, e)}
                      className="mt-1 inline-flex max-w-full items-start gap-1 whitespace-normal break-words text-left text-[11px] font-medium text-indigo-400 underline hover:text-indigo-300"
                    >
                      <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
                      <span>Open Issue Details</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="w-full min-w-0 whitespace-normal break-words text-xs leading-relaxed text-slate-300">
              Task completion forecast has slipped past planned baseline deadline.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default DelayIndicator;
