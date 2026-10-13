import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Layers,
  List,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  FolderKanban,
  ArrowLeft,
  PauseCircle,
  CornerDownRight,
  User,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import StatusBadge from "../../components/common/StatusBadge";
import PriorityBadge from "../../components/common/PriorityBadge";
import AvatarStack from "../../components/common/AvatarStack";
import DelayIndicator from "../../components/common/DelayIndicator";
import TaskDrawer from "../../components/tasks/TaskDrawer";
import { formatDate, calculateDelayDays } from "../../utils/dateUtils";

export const ProjectTasksPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    tasks,
    users,
    issues,
    getHoldReasonById,
    deleteTask,
  } = useData();

  const project = projects.find((p) => p.id === projectId);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("hierarchy"); // 'hierarchy' | 'flat'

  // Expand / collapse for hierarchy
  const [expandedParents, setExpandedParents] = useState(() => {
    const parentIds = tasks
      .filter((t) => t.projectId === projectId && !t.isSubtask)
      .map((t) => t.id);
    return new Set(parentIds);
  });

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [parentForSubtask, setParentForSubtask] = useState(null);

  if (!project) {
    return (
      <div className="p-12 text-center space-y-4">
        <FolderKanban className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Project Not Found</h2>
        <button
          onClick={() => navigate("/projects")}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const projectTasks = useMemo(() => {
    return tasks.filter((t) => t.projectId === project.id);
  }, [tasks, project.id]);

  const teamMembers = (project.teamMemberIds || [])
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean);

  // Summary Metrics
  const summary = useMemo(() => {
    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.status === "Completed").length;
    const inProgress = projectTasks.filter((t) => t.status === "In Progress").length;
    const onHold = projectTasks.filter((t) => t.status === "On Hold").length;
    const delayed = projectTasks.filter(
      (t) => calculateDelayDays(t.plannedEndDate, t.forecastEndDate) > 0
    ).length;
    return { total, completed, inProgress, onHold, delayed };
  }, [projectTasks]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return projectTasks.filter((task) => {
      if (
        searchQuery &&
        !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.id.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (statusFilter !== "ALL" && task.status !== statusFilter) return false;
      if (priorityFilter !== "ALL" && task.priority !== priorityFilter) return false;
      if (
        assigneeFilter !== "ALL" &&
        !(task.assigneeIds || []).includes(assigneeFilter)
      ) {
        return false;
      }
      return true;
    });
  }, [projectTasks, searchQuery, statusFilter, priorityFilter, assigneeFilter]);

  // Construct display rows
  const displayRows = useMemo(() => {
    if (viewMode === "flat") {
      return filteredTasks;
    }

    // Hierarchy mode
    const parents = filteredTasks.filter((t) => !t.isSubtask);
    const subtaskMap = new Map();

    filteredTasks.forEach((t) => {
      if (t.isSubtask && t.parentTaskId) {
        if (!subtaskMap.has(t.parentTaskId)) {
          subtaskMap.set(t.parentTaskId, []);
        }
        subtaskMap.get(t.parentTaskId).push(t);
      }
    });

    const rows = [];
    parents.forEach((parent) => {
      const children = subtaskMap.get(parent.id) || [];
      rows.push({ ...parent, hasSubtasks: children.length > 0, subtaskCount: children.length });
      if (expandedParents.has(parent.id)) {
        children.forEach((sub) => {
          rows.push({ ...sub, isChild: true });
        });
      }
    });

    // Also include any orphan subtasks if search isolated them
    filteredTasks.forEach((t) => {
      if (t.isSubtask && !parents.some((p) => p.id === t.parentTaskId)) {
        rows.push({ ...t, isOrphan: true });
      }
    });

    return rows;
  }, [filteredTasks, viewMode, expandedParents]);

  const toggleParentExpand = (parentId) => {
    const next = new Set(expandedParents);
    if (next.has(parentId)) {
      next.delete(parentId);
    } else {
      next.add(parentId);
    }
    setExpandedParents(next);
  };

  const handleOpenCreateParent = () => {
    setEditingTask(null);
    setParentForSubtask(null);
    setIsDrawerOpen(true);
  };

  const handleOpenAddSubtask = (parentId) => {
    setEditingTask(null);
    setParentForSubtask(parentId);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setParentForSubtask(null);
    setIsDrawerOpen(true);
  };

  const handleDeleteTask = (taskId, taskTitle) => {
    if (window.confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
      deleteTask(taskId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/projects/${project.id}/dashboard`)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-indigo-600" />
              Tasks
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Project: <strong className="text-slate-700">{project.name}</strong> • Task hierarchy, schedules, and assignments.
          </p>
        </div>

        <button
          onClick={handleOpenCreateParent}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Project stage stepper with task details on hover */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Project journey</h2>
            <p className="mt-1 text-[11px] text-slate-500">Hover over a milestone to see its status and target date.</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold text-indigo-700">{summary.completed} of {summary.total} tasks complete</span>
        </div>
        <div className="flex items-start overflow-x-auto pb-2">
          {projectTasks.filter((task) => !task.isSubtask).sort((a, b) => new Date(a.plannedStartDate || 0) - new Date(b.plannedStartDate || 0)).map((task, index, arr) => {
            const done = task.status === "Completed";
            const active = task.status === "In Progress";
            return <div key={task.id} className="relative flex min-w-[120px] flex-1 flex-col items-center text-center group">
              {index < arr.length - 1 && <div className={`absolute left-1/2 top-3 h-0.5 w-full ${done ? "bg-emerald-400" : "bg-slate-200"}`} />}
              <div className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 ${done ? "border-emerald-500 bg-emerald-500 text-white" : active ? "border-indigo-600 bg-white text-indigo-600" : "border-slate-300 bg-white text-slate-400"}`}>
                {done ? <CheckSquare className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
              </div>
              <span className="mt-2 max-w-[125px] truncate text-[10px] font-semibold text-slate-700">{task.title}</span>
              <span className={`mt-1 text-[9px] font-medium ${done ? "text-emerald-600" : active ? "text-indigo-600" : task.status === "On Hold" ? "text-amber-600" : "text-slate-400"}`}>{task.status}</span>
              <div className="pointer-events-none absolute left-1/2 top-[-4px] z-30 hidden w-56 -translate-x-1/2 -translate-y-full rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xl group-hover:block group-focus-within:block">
                <p className="text-xs font-bold text-slate-900">{task.title}</p>
                <p className="mt-1 text-[10px] text-slate-500">Status: <span className="font-semibold text-slate-700">{task.status}</span></p>
                <p className="mt-1 text-[10px] text-slate-500">{done ? "Completed on" : "Planned end"}: <span className="font-semibold text-slate-700">{done ? formatDate(task.completedAt || task.plannedEndDate, false) : (task.plannedEndDate ? formatDate(task.plannedEndDate, false) : "Not set")}</span></p>
                {done && <p className="mt-1 text-[10px] text-emerald-600">Completed milestone</p>}
              </div>
            </div>;
          })}
          {projectTasks.filter((task) => !task.isSubtask).length === 0 && <p className="text-xs text-slate-500">Create tasks to build the project journey.</p>}
        </div>
      </section>

      {/* Mini Summary Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] text-slate-400 font-medium">Total Tasks</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {summary.total}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] text-emerald-500 font-medium">Completed</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {summary.completed}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] text-blue-500 font-medium">In Progress</div>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {summary.inProgress}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] text-amber-500 font-medium">On Hold</div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {summary.onHold}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] text-rose-500 font-medium">Delayed Schedule</div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
            {summary.delayed}
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Filters, View Modes */}
      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        {/* Search */}
      
        <div className="relative flex-1 w-full max-w-sm min-w-0">
          <div
            className="grid h-10 grid-cols-[40px_minmax(0,1fr)] items-center
                      rounded-lg border border-slate-200
                      bg-slate-50 dark:border-slate-700 dark:bg-slate-800
                      focus-within:border-indigo-500
                      focus-within:ring-1 focus-within:ring-indigo-500/30"
          >
            {/* Search icon */}
            <div className="flex h-full items-center justify-center">
              <Search
                size={18}
                strokeWidth={1.8}
                className="block shrink-0 text-slate-400"
                aria-hidden="true"
              />
            </div>

            {/* Search input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search task title or code..."
              className="h-full w-full min-w-0 border-0 bg-transparent
                        pr-3.5 text-xs text-slate-900 dark:text-white
                        placeholder:text-slate-400
                        outline-none focus:outline-none focus:ring-0"
            />
          </div>
        </div>


        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="ALL">All Assignees</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium">
            <button
              onClick={() => setViewMode("hierarchy")}
              className={`p-1.5 rounded-md flex items-center gap-1 cursor-pointer ${
                viewMode === "hierarchy"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Hierarchy Tree View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Tree</span>
            </button>
            <button
              onClick={() => setViewMode("flat")}
              className={`p-1.5 rounded-md flex items-center gap-1 cursor-pointer ${
                viewMode === "flat"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
              title="Flat Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Flat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-semibold uppercase text-[10px] tracking-wider select-none">
                <th className="py-3 px-4">Task</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Assignees</th>
                <th className="py-3 px-4">Baseline</th>
                <th className="py-3 px-4">Forecast</th>
                <th className="py-3 px-4">Progress</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {displayRows.length > 0 ? (
                displayRows.map((task) => {
                  const isParent = !task.isSubtask;
                  const isExpanded = expandedParents.has(task.id);
                  const delayDays = calculateDelayDays(
                    task.plannedEndDate,
                    task.forecastEndDate
                  );
                  const holdReason = getHoldReasonById(task.holdReasonId);

                  const assignees = (task.assigneeIds || [])
                    .map((id) => users.find((u) => u.id === id))
                    .filter(Boolean);

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        task.isChild
                          ? "bg-slate-50/30 dark:bg-slate-950/20"
                          : "bg-white dark:bg-slate-900"
                      }`}
                    >
                      {/* Task Title & Hierarchy Column */}
                      <td className="py-3 px-4 max-w-sm">
                        <div className="flex items-center gap-1.5">
                          {isParent && task.hasSubtasks ? (
                            <button
                              onClick={() => toggleParentExpand(task.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </button>
                          ) : task.isChild ? (
                            <CornerDownRight className="w-3.5 h-3.5 text-slate-400 ml-4 shrink-0" />
                          ) : (
                            <span className="w-5" />
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                onClick={() => handleOpenEdit(task)}
                                className={`truncate cursor-pointer hover:underline ${
                                  isParent
                                    ? "font-bold text-slate-900 dark:text-white"
                                    : "text-slate-700 dark:text-slate-300"
                                }`}
                                title={task.title}
                              >
                                {task.title}
                              </span>
                              {task.subtaskCount > 0 && (
                                <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-full">
                                  {task.subtaskCount} subtasks
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {task.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={task.status} holdReason={holdReason} size="sm" />
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <PriorityBadge priority={task.priority} />
                      </td>

                      {/* Assignees */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <AvatarStack users={assignees} max={3} size="sm" projectId={project.id} />
                      </td>

                      {/* Baseline Plan */}
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 text-xs">
                        {formatDate(task.plannedStartDate, false)} → {formatDate(task.plannedEndDate, false)}
                      </td>

                      {/* Forecast Timeline & Delay Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <div className="text-slate-800 dark:text-slate-200">
                            {formatDate(task.forecastStartDate, false)} → {formatDate(task.forecastEndDate, false)}
                          </div>
                          {delayDays > 0 ? (
                            <DelayIndicator days={delayDays} projectId={project.id} />
                          ) : (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                              On schedule
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Progress */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="w-24 space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Progress</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {task.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${task.progress}%` }}
                              className={`h-full rounded-full ${
                                task.status === "Completed"
                                  ? "bg-emerald-500"
                                  : delayDays > 0
                                  ? "bg-rose-500"
                                  : "bg-indigo-600"
                              }`}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isParent && (
                            <button
                              onClick={() => handleOpenAddSubtask(task.id)}
                              title="Add Nested Subtask"
                              className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEdit(task)}
                            title="Edit Task Details"
                            className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteTask(task.id, task.title)}
                            title="Delete Task"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CheckSquare className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="font-semibold text-slate-600 dark:text-slate-400">
                      No matching tasks found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Adjust your filters or create a new task.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Creation & Editing Drawer */}
      <TaskDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        projectId={project.id}
        taskToEdit={editingTask}
        parentTaskId={parentForSubtask}
      />
    </div>
  );
};

export default ProjectTasksPage;
