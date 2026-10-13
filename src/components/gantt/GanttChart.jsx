
import React, { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  PauseCircle,
  Layers,
} from "lucide-react";

import GanttLegend from "./GanttLegend";
import GanttTooltip from "./GanttTooltip";
import { useData } from "../../context/DataContext";
import {
  DEMO_TODAY,
  calculateDelayDays,
  formatDate,
} from "../../utils/dateUtils";

const TASK_COLUMN_WIDTH = 360;
const HEADER_HEIGHT = 64;

const SCALE_WIDTHS = {
  day: 48,
  week: 30,
  month: 22,
};

export const GanttChart = ({
  project,
  tasks = [],
  issues = [],
}) => {
  const navigate = useNavigate();
  const { users, getHoldReasonById } = useData();

  const [scaleMode, setScaleMode] = useState("week");

  const [expandedTasks, setExpandedTasks] = useState(
    () =>
      new Set(
        tasks
          .filter((task) => !task.isSubtask)
          .map((task) => task.id)
      )
  );

  const [hoveredTask, setHoveredTask] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const scrollContainerRef = useRef(null);

  // --------------------------------------------------
  // 1. Build task hierarchy
  // --------------------------------------------------

  const hierarchicalTasks = useMemo(() => {
    const parents = tasks.filter((task) => !task.isSubtask);
    const subtaskMap = new Map();

    tasks.forEach((task) => {
      if (task.isSubtask && task.parentTaskId) {
        if (!subtaskMap.has(task.parentTaskId)) {
          subtaskMap.set(task.parentTaskId, []);
        }

        subtaskMap.get(task.parentTaskId).push(task);
      }
    });

    const rows = [];

    parents.forEach((parent) => {
      const subtasks = subtaskMap.get(parent.id) || [];

      rows.push({
        ...parent,
        hasSubtasks: subtasks.length > 0,
      });

      if (expandedTasks.has(parent.id)) {
        subtasks.forEach((subtask) => {
          rows.push({
            ...subtask,
            isChild: true,
          });
        });
      }
    });

    return rows;
  }, [tasks, expandedTasks]);

  // --------------------------------------------------
  // 2. Calculate timeline boundaries
  // --------------------------------------------------

  const { minDate, totalDays } = useMemo(() => {
    const validDates = [];

    const addDate = (value) => {
      if (!value) return;

      const date = new Date(value);

      if (!Number.isNaN(date.getTime())) {
        validDates.push(date);
      }
    };

    addDate(project?.startDate);
    addDate(project?.plannedEndDate);
    addDate(project?.forecastEndDate);
    addDate(DEMO_TODAY);

    tasks.forEach((task) => {
      addDate(task.plannedStartDate);
      addDate(task.plannedEndDate);
      addDate(task.forecastStartDate);
      addDate(task.forecastEndDate);
    });

    if (validDates.length === 0) {
      return {
        minDate: new Date(DEMO_TODAY),
        totalDays: 28,
      };
    }

    const min = new Date(
      Math.min(...validDates.map((date) => date.getTime()))
    );

    const max = new Date(
      Math.max(...validDates.map((date) => date.getTime()))
    );

    min.setDate(min.getDate() - 4);
    max.setDate(max.getDate() + 7);

    const diffDays = Math.ceil(
      (max.getTime() - min.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return {
      minDate: min,
      totalDays: Math.max(diffDays, 28),
    };
  }, [project, tasks]);

  // --------------------------------------------------
  // 3. Timeline dimensions
  // --------------------------------------------------

  // More space in Month view prevents date labels from
  // appearing excessively compressed.

  const dayWidth = SCALE_WIDTHS[scaleMode];

  const timelineTotalWidth = totalDays * dayWidth;
  const chartTotalWidth = TASK_COLUMN_WIDTH + timelineTotalWidth;

  const gridColumns =
    `${TASK_COLUMN_WIDTH}px ${timelineTotalWidth}px`;

  // --------------------------------------------------
  // 4. Generate calendar headers
  // --------------------------------------------------

  const timelineHeaders = useMemo(() => {
    const headers = [];
    const current = new Date(minDate);

    for (let index = 0; index < totalDays; index++) {
      const dateKey = [
        current.getFullYear(),
        String(current.getMonth() + 1).padStart(2, "0"),
        String(current.getDate()).padStart(2, "0"),
      ].join("-");

      headers.push({
        dateKey,
        dayNumber: current.getDate(),
        dayName: current.toLocaleDateString("en-US", {
          weekday: "narrow",
        }),
        monthName: current.toLocaleDateString("en-US", {
          month: "short",
        }),
        year: current.getFullYear(),
        isWeekend:
          current.getDay() === 0 || current.getDay() === 6,
        isToday: dateKey === DEMO_TODAY,
        isMonthStart: current.getDate() === 1,
        isYearStart:
          current.getDate() === 1 &&
          current.getMonth() === 0,
      });

      current.setDate(current.getDate() + 1);
    }

    return headers;
  }, [minDate, totalDays]);

  // --------------------------------------------------
  // 5. Date-to-pixel calculations
  // --------------------------------------------------

  const getPixelOffset = (dateStr) => {
    if (!dateStr) return 0;

    const date = new Date(dateStr);

    if (Number.isNaN(date.getTime())) return 0;

    const diff = Math.floor(
      (date.getTime() - minDate.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    return Math.max(0, diff * dayWidth);
  };

  const getPixelSpan = (startStr, endStr) => {
    if (!startStr || !endStr) return dayWidth;

    const start = new Date(startStr);
    const end = new Date(endStr);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return dayWidth;
    }

    const diff = Math.max(
      1,
      Math.ceil(
        (end.getTime() - start.getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    );

    return diff * dayWidth;
  };

  const todayOffset = getPixelOffset(DEMO_TODAY);

  // --------------------------------------------------
  // 6. Expansion controls
  // --------------------------------------------------

  const toggleExpand = (taskId) => {
    setExpandedTasks((previous) => {
      const next = new Set(previous);

      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }

      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedTasks(
      new Set(
        tasks
          .filter((task) => !task.isSubtask)
          .map((task) => task.id)
      )
    );
  };

  const handleCollapseAll = () => {
    setExpandedTasks(new Set());
  };

  // --------------------------------------------------
  // 7. Scroll to Today
  // --------------------------------------------------

  const handleScrollToToday = () => {
    if (!scrollContainerRef.current) return;

    scrollContainerRef.current.scrollTo({
      left: Math.max(
        0,
        TASK_COLUMN_WIDTH + todayOffset - 250
      ),
      behavior: "smooth",
    });
  };

  // --------------------------------------------------
  // 8. Floating tooltip position
  // --------------------------------------------------

  const tooltipStyle = {
    position: "fixed",
    left: `${Math.max(
      8,
      Math.min(
        tooltipPos.x + 15,
        window.innerWidth - 336
      )
    )}px`,
    top: `${Math.max(
      8,
      Math.min(
        tooltipPos.y + 15,
        window.innerHeight - 420
      )
    )}px`,
    zIndex: 100,
    pointerEvents: "none",
  };

  // --------------------------------------------------
  // 9. Render
  // --------------------------------------------------

  return (
    <div className="w-full min-w-0 space-y-4">
      {/* Controls */}
      <div className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
            <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Project Schedule Gantt
          </span>

          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {tasks.length} total tasks &amp; subtasks
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Scale selector */}
          <div className="inline-flex items-center rounded-lg bg-slate-100 p-0.5 text-xs font-medium dark:bg-slate-800">
            {["day", "week", "month"].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setScaleMode(mode)}
                className={`rounded-md px-3 py-1 capitalize transition-colors ${
                  scaleMode === mode
                    ? "bg-white font-semibold text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Expand / collapse */}
          <button
            type="button"
            onClick={
              expandedTasks.size > 0
                ? handleCollapseAll
                : handleExpandAll
            }
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {expandedTasks.size > 0
              ? "Collapse All"
              : "Expand All"}
          </button>

          {/* Jump to Today */}
          <button
            type="button"
            onClick={handleScrollToToday}
            className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
          >
            <Calendar className="h-3.5 w-3.5" />
            Today ({formatDate(DEMO_TODAY, false)})
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div
          ref={scrollContainerRef}
          className="relative max-h-[620px] overflow-auto select-none"
        >
          <div
            className="relative"
            style={{
              width: `${chartTotalWidth}px`,
              minWidth: `${chartTotalWidth}px`,
            }}
          >
            {/* Calendar header */}
            <div
              className="sticky top-0 z-40 grid border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
              style={{
                gridTemplateColumns: gridColumns,
                width: `${chartTotalWidth}px`,
                height: `${HEADER_HEIGHT}px`,
              }}
            >
              {/* Fixed task header */}
              <div
                className="sticky left-0 z-50 flex shrink-0 items-center justify-between border-r border-slate-200 bg-slate-50 px-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                style={{
                  width: `${TASK_COLUMN_WIDTH}px`,
                  minWidth: `${TASK_COLUMN_WIDTH}px`,
                  maxWidth: `${TASK_COLUMN_WIDTH}px`,
                  boxSizing: "border-box",
                }}
              >
                <span>Task Name / WBS</span>
                <span className="text-[10px] text-slate-400">
                  Status
                </span>
              </div>

              {/* Date headers */}
              <div
                className="relative grid h-full"
                style={{
                  gridTemplateColumns:
                    `repeat(${totalDays}, ${dayWidth}px)`,
                  width: `${timelineTotalWidth}px`,
                }}
              >
                {timelineHeaders.map((header, index) => (
                  <div
                    key={header.dateKey}
                    className={`relative flex h-full min-w-0 flex-col items-center justify-center gap-1 border-r border-slate-200/70 px-0.5 dark:border-slate-800 ${
                      header.isWeekend
                        ? "bg-slate-100/50 text-slate-400 dark:bg-slate-950/30"
                        : ""
                    } ${
                      header.isToday
                        ? "bg-amber-100/70 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                        : ""
                    } ${
                      header.isMonthStart
                        ? "border-l border-l-slate-400/50 dark:border-l-slate-600"
                        : ""
                    }`}
                    style={{
                      width: `${dayWidth}px`,
                      boxSizing: "border-box",
                    }}
                    title={`${header.dayName}, ${header.monthName} ${header.dayNumber}, ${header.year}`}
                  >
                    <span className="block w-full text-center text-[10px] leading-3">
                      {header.dayName}
                    </span>

                    <span className="block w-full text-center text-[11px] font-bold leading-4 tabular-nums">
                      {header.dayNumber}
                    </span>

                    {/* Month boundary label */}
                    {header.isMonthStart && (
                      <span className="absolute left-0 top-0 z-10 -translate-y-full whitespace-nowrap rounded-t bg-slate-700 px-1 text-[9px] leading-4 text-white dark:bg-slate-600">
                        {header.monthName}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Task rows */}
            <div className="relative">
              {/* Today vertical line and centered badge */}
              <div
                className="pointer-events-none absolute bottom-0 top-0 z-20"
                style={{
                  left: `${TASK_COLUMN_WIDTH + todayOffset}px`,
                  width: "2px",
                }}
              >
                {/* The line starts below the header.
                    The badge is centered exactly on the line. */}
                <div className="absolute left-1/2 top-2 z-30 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-500 px-3 py-1 text-[10px] font-extrabold leading-4 text-white shadow-md">
                  TODAY
                </div>

                <div className="absolute inset-x-0 bottom-0 top-0 bg-amber-500 shadow-sm" />
              </div>

              {hierarchicalTasks.map((task) => {
                const isParent = !task.isSubtask;
                const isExpanded = expandedTasks.has(task.id);

                const delayDays = calculateDelayDays(
                  task.plannedEndDate,
                  task.forecastEndDate
                );

                const holdReason = getHoldReasonById(
                  task.holdReasonId
                );

                const baselineLeft = getPixelOffset(
                  task.plannedStartDate
                );

                const baselineWidth = getPixelSpan(
                  task.plannedStartDate,
                  task.plannedEndDate
                );

                const forecastLeft = getPixelOffset(
                  task.forecastStartDate
                );

                const forecastWidth = getPixelSpan(
                  task.forecastStartDate,
                  task.forecastEndDate
                );

                const delayGapLeft =
                  baselineLeft + baselineWidth;

                const delayGapWidth = Math.max(
                  0,
                  forecastLeft +
                    forecastWidth -
                    delayGapLeft
                );

                const progress = Math.max(
                  0,
                  Math.min(100, Number(task.progress) || 0)
                );

                return (
                  <div
                    key={task.id}
                    className={`relative grid items-center ${
                      isParent
                        ? "h-12 bg-white dark:bg-slate-900"
                        : "h-10 bg-slate-50 dark:bg-slate-950"
                    }`}
                    style={{
                      gridTemplateColumns: gridColumns,
                      width: `${chartTotalWidth}px`,
                    }}
                  >
                    {/* Fixed opaque task column */}
                    <div
                      className={`sticky left-0 z-30 flex h-full shrink-0 items-center justify-between overflow-hidden border-r border-slate-200 px-4 text-xs shadow-sm dark:border-slate-800 ${
                        isParent
                          ? "bg-white dark:bg-slate-900"
                          : "bg-slate-50 dark:bg-slate-950"
                      }`}
                      style={{
                        width: `${TASK_COLUMN_WIDTH}px`,
                        minWidth: `${TASK_COLUMN_WIDTH}px`,
                        maxWidth: `${TASK_COLUMN_WIDTH}px`,
                        boxSizing: "border-box",
                      }}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-1.5 pr-2">
                        {isParent && task.hasSubtasks ? (
                          <button
                            type="button"
                            onClick={() => toggleExpand(task.id)}
                            aria-label={
                              isExpanded
                                ? "Collapse subtasks"
                                : "Expand subtasks"
                            }
                            className="shrink-0 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5" />
                            )}
                          </button>
                        ) : (
                          <span
                            className={`h-3.5 w-3.5 shrink-0 ${
                              task.isChild ? "ml-4" : ""
                            }`}
                          />
                        )}

                        <span
                          onClick={() =>
                            navigate(
                              `/projects/${project.id}/tasks?taskId=${task.id}`
                            )
                          }
                          className={`min-w-0 flex-1 cursor-pointer truncate hover:underline ${
                            isParent
                              ? "font-bold text-slate-900 dark:text-white"
                              : "font-normal text-slate-600 dark:text-slate-300"
                          }`}
                          title={task.title}
                        >
                          {task.title}
                        </span>
                      </div>

                      {/* Task status indicators */}
                      <div className="flex shrink-0 items-center gap-1.5">
                        {holdReason && (
                          <PauseCircle
                            className="h-3.5 w-3.5 shrink-0 text-amber-500"
                            title={`On Hold: ${holdReason.title}`}
                          />
                        )}

                        {delayDays > 0 && (
                          <span
                            title={`${delayDays} days forecast delay`}
                            className="rounded bg-rose-50 px-1 py-0.5 text-[10px] font-bold text-rose-500 dark:bg-rose-950/60"
                          >
                            +{delayDays}d
                          </span>
                        )}

                        <span className="text-[10px] font-semibold text-slate-400">
                          {progress}%
                        </span>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div
                      className="relative z-0 flex h-full min-w-0 items-center overflow-hidden"
                      style={{
                        width: `${timelineTotalWidth}px`,
                        minWidth: `${timelineTotalWidth}px`,
                        boxSizing: "border-box",
                      }}
                      onMouseEnter={(event) => {
                        setHoveredTask(task);
                        setTooltipPos({
                          x: event.clientX,
                          y: event.clientY,
                        });
                      }}
                      onMouseMove={(event) => {
                        setTooltipPos({
                          x: event.clientX,
                          y: event.clientY,
                        });
                      }}
                      onMouseLeave={() => setHoveredTask(null)}
                    >
                      {/* Grid background */}
                      <div
                        className="pointer-events-none absolute inset-0 z-0 grid opacity-40"
                        style={{
                          gridTemplateColumns:
                            `repeat(${totalDays}, ${dayWidth}px)`,
                        }}
                      >
                        {timelineHeaders.map((header) => (
                          <div
                            key={header.dateKey}
                            className={`h-full border-r border-slate-100 dark:border-slate-800 ${
                              header.isWeekend
                                ? "bg-slate-100/30 dark:bg-slate-900/30"
                                : ""
                            }`}
                            style={{
                              width: `${dayWidth}px`,
                              boxSizing: "border-box",
                            }}
                          />
                        ))}
                      </div>

                      {/* Baseline */}
                      <div
                        className="pointer-events-none absolute z-[1] h-3.5 rounded-sm border border-dashed border-indigo-400 bg-indigo-100/30 dark:border-indigo-500 dark:bg-indigo-900/20"
                        style={{
                          left: `${baselineLeft}px`,
                          width: `${baselineWidth}px`,
                        }}
                        title={`Baseline: ${formatDate(
                          task.plannedStartDate,
                          false
                        )} to ${formatDate(
                          task.plannedEndDate,
                          false
                        )}`}
                      />

                      {/* Forecast bar */}
                      <div
                        className={`absolute z-[10] flex h-6 items-center overflow-hidden rounded-md shadow-sm ${
                          task.status === "Completed"
                            ? "bg-emerald-600 text-white"
                            : task.status === "On Hold"
                            ? "bg-amber-600 text-white"
                            : delayDays > 0
                            ? "bg-indigo-700 text-white"
                            : "bg-indigo-600 text-white"
                        }`}
                        style={{
                          left: `${forecastLeft}px`,
                          width: `${forecastWidth}px`,
                        }}
                      >
                        {/* Completed progress */}
                        <div
                          className="pointer-events-none absolute inset-y-0 left-0 z-[1] bg-emerald-500/90"
                          style={{
                            width: `${progress}%`,
                          }}
                        />

                        {/* Bar label */}
                        <div className="relative z-[2] flex w-full min-w-0 items-center gap-1 px-2 text-[10px] font-bold">
                          <span className="min-w-0 flex-1 truncate">
                            {task.title}
                          </span>

                          <span className="shrink-0 opacity-90">
                            {progress}%
                          </span>
                        </div>
                      </div>

                      {/* Delay segment */}
                      {delayDays > 0 && delayGapWidth > 0 && (
                        <div
                          className="absolute z-[15] flex h-6 items-center justify-center overflow-hidden rounded-r-md border-r-2 border-rose-600 bg-rose-500 px-1 text-[10px] font-extrabold text-white shadow-sm"
                          style={{
                            left: `${delayGapLeft}px`,
                            width: `${delayGapWidth}px`,
                          }}
                          title={`Delayed by ${delayDays} days`}
                        >
                          +{delayDays}d
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Floating tooltip */}
        {hoveredTask && (
          <div
            style={tooltipStyle}
            className="animate-fade-in"
          >
            <GanttTooltip
              task={hoveredTask}
              projectId={project.id}
              issues={issues.filter(
                (issue) =>
                  issue.affectedTaskId === hoveredTask.id ||
                  (hoveredTask.isSubtask &&
                    issue.affectedTaskId ===
                      hoveredTask.parentTaskId)
              )}
              assignees={(hoveredTask.assigneeIds || [])
                .map((id) =>
                  users.find((user) => user.id === id)
                )
                .filter(Boolean)}
              holdReason={getHoldReasonById(
                hoveredTask.holdReasonId
              )}
              delayDays={calculateDelayDays(
                hoveredTask.plannedEndDate,
                hoveredTask.forecastEndDate
              )}
            />
          </div>
        )}
      </div>

      {/* Legend */}
      <GanttLegend />
    </div>
  );
};

export default GanttChart;
