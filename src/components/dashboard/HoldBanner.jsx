import React from "react";
import { PauseCircle, AlertTriangle, Calendar, User, Clock } from "lucide-react";
import { useData } from "../../context/DataContext";
import { formatDate } from "../../utils/dateUtils";

export const HoldBanner = ({ holdReason }) => {
  const { getUserById } = useData();

  if (!holdReason) return null;

  const responsibleUser = holdReason.responsibleUserId
    ? getUserById(holdReason.responsibleUserId)
    : null;

  return (
    <div className="rounded-2xl border border-amber-300/80 bg-amber-50/90 p-4.5 shadow-sm space-y-3 animate-fade-in max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-amber-200/80 pb-3 min-w-0">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs shrink-0 mt-0.5">
            <PauseCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 shrink-0">
                {holdReason.category || "On Hold"}
              </span>
              <h3 className="font-bold text-amber-900 text-sm break-words min-w-0">
                {holdReason.title}
              </h3>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed break-words min-w-0">
              {holdReason.description}
            </p>
          </div>
        </div>
      </div>

      {/* Hold Metadata row */}
      <div className="flex flex-wrap items-center gap-6 text-xs text-amber-800 dark:text-amber-300/80 pt-0.5">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Placed on Hold: <strong>{formatDate(holdReason.recordedDate)}</strong></span>
        </div>

        {holdReason.expectedReviewDate && (
          <div className="flex items-center gap-1.5 text-amber-900 dark:text-amber-200 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Target Review Date: <strong>{formatDate(holdReason.expectedReviewDate)}</strong></span>
          </div>
        )}

        {responsibleUser && (
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Review Lead: <strong>{responsibleUser.name}</strong> ({responsibleUser.role})</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default HoldBanner;
