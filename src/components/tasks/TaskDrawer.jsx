import React, { useState, useEffect } from "react";
import Drawer from "../common/Drawer";
import {
  Calendar,
  Users,
  AlertTriangle,
  PauseCircle,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import { useData } from "../../context/DataContext";

export const TaskDrawer = ({
  isOpen,
  onClose,
  projectId,
  taskToEdit = null,
  parentTaskId = null,
}) => {
  const {
    tasks,
    users,
    issues,
    projects,
    addTask,
    updateTask,
    addHoldReason,
    getHoldReasonById,
  } = useData();

  const currentProject = projects.find((p) => p.id === projectId);
  const teamMembers = (currentProject?.teamMemberIds || [])
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean);

  const parentTasks = tasks.filter(
    (t) => t.projectId === projectId && !t.isSubtask && t.id !== taskToEdit?.id
  );

  const projectIssues = issues.filter((i) => i.projectId === projectId);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");
  const [status, setStatus] = useState("Not Started");
  const [priority, setPriority] = useState("Medium");
  const [assigneeIds, setAssigneeIds] = useState([]);
  const [plannedStartDate, setPlannedStartDate] = useState("2026-10-15");
  const [plannedEndDate, setPlannedEndDate] = useState("2026-10-25");
  const [progress, setProgress] = useState(0);

  // Hold reason state
  const [holdReasonTitle, setHoldReasonTitle] = useState("");
  const [holdCategory, setHoldCategory] = useState("Technical");
  const [holdDescription, setHoldDescription] = useState("");
  const [holdReviewDate, setHoldReviewDate] = useState("2026-10-20");

  // Error state
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || "");
      setDescription(taskToEdit.description || "");
      setSelectedParentId(taskToEdit.parentTaskId || "");
      setStatus(taskToEdit.status || "Not Started");
      setPriority(taskToEdit.priority || "Medium");
      setAssigneeIds(taskToEdit.assigneeIds || []);
      setPlannedStartDate(taskToEdit.plannedStartDate || "2026-10-15");
      setPlannedEndDate(taskToEdit.plannedEndDate || "2026-10-25");
      setProgress(taskToEdit.progress || 0);

      if (taskToEdit.holdReasonId) {
        const hr = getHoldReasonById(taskToEdit.holdReasonId);
        if (hr) {
          setHoldReasonTitle(hr.title);
          setHoldCategory(hr.category || "Technical");
          setHoldDescription(hr.description || "");
          setHoldReviewDate(hr.expectedReviewDate || "2026-10-20");
        }
      }
    } else {
      // Reset for new task
      setTitle("");
      setDescription("");
      setSelectedParentId(parentTaskId || "");
      setStatus("Not Started");
      setPriority("Medium");
      setAssigneeIds(teamMembers.length > 0 ? [teamMembers[0].id] : []);
      setPlannedStartDate("2026-10-15");
      setPlannedEndDate("2026-10-25");
      setProgress(0);
      setHoldReasonTitle("");
      setHoldDescription("");
    }
    setErrors({});
  }, [taskToEdit, parentTaskId, isOpen]);


  const validate = () => {
    const errs = {};
    if (!title.trim()) errs.title = "Task title is required.";
    if (!plannedStartDate) errs.plannedStartDate = "Planned start date is required.";
    if (!plannedEndDate) errs.plannedEndDate = "Planned end date is required.";
    if (new Date(plannedEndDate) < new Date(plannedStartDate)) {
      errs.plannedEndDate = "Planned end date cannot be earlier than start date.";
    }
    if (status === "On Hold" && !holdReasonTitle.trim()) {
      errs.holdReason = "Hold reason title is required when task is placed on hold.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAssigneeToggle = (userId) => {
    if (assigneeIds.includes(userId)) {
      setAssigneeIds(assigneeIds.filter((id) => id !== userId));
    } else {
      setAssigneeIds([...assigneeIds, userId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    let holdReasonId = taskToEdit?.holdReasonId || null;
    if (status === "On Hold" && holdReasonTitle.trim()) {
      const createdHold = addHoldReason({
        title: holdReasonTitle.trim(),
        category: holdCategory,
        description: holdDescription.trim(),
        recordedDate: "2026-10-11",
        expectedReviewDate: holdReviewDate,
        responsibleUserId: assigneeIds[0] || currentProject?.ownerId || "usr-1",
      });
      holdReasonId = createdHold.id;
    } else if (status !== "On Hold") {
      holdReasonId = null;
    }

    // Forecast is calculated by the system from baseline dates and task progress;
    // managers no longer manually edit forecast dates in this form.
    const startMs = new Date(`${plannedStartDate}T00:00:00`).getTime();
    const endMs = new Date(`${plannedEndDate}T00:00:00`).getTime();
    const plannedDuration = Math.max(0, endMs - startMs);
    const effectiveProgress = status === "Completed" ? 100 : Number(progress);
    const remainingRatio = effectiveProgress > 0 ? (100 - effectiveProgress) / 100 : 1;
    const estimatedEnd = status === "Completed" ? plannedEndDate : new Date(endMs + plannedDuration * remainingRatio * 0.15).toISOString().slice(0, 10);
    const taskPayload = {
      projectId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      assigneeIds,
      plannedStartDate,
      plannedEndDate,
      forecastStartDate: plannedStartDate,
      forecastEndDate: estimatedEnd,
      progress: effectiveProgress,
      completedAt: status === "Completed" ? (taskToEdit?.completedAt || new Date().toISOString().slice(0, 10)) : null,
      parentTaskId: selectedParentId || null,
      isSubtask: !!selectedParentId,
      holdReasonId,
    };

    if (taskToEdit) {
      updateTask(taskToEdit.id, taskPayload);
    } else {
      addTask(taskPayload);
    }

    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        taskToEdit
          ? `Edit Task: ${taskToEdit.title}`
          : selectedParentId
          ? "Create Nested Subtask"
          : "Create New Project Task"
      }
      width="max-w-xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{taskToEdit ? "Save Task Changes" : "Create Task"}</span>
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Title & Description */}
        <div className="space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design authentication token lifecycle"
              className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-slate-900 dark:text-white focus:outline-hidden ${
                errors.title ? "border-rose-500" : "border-slate-200 dark:border-slate-700"
              }`}
            />
            {errors.title && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed technical requirements, acceptance criteria, dependencies..."
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Parent Task Selector (Hierarchy) */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Hierarchy Level (Parent Task)
          </label>
          <select
            value={selectedParentId}
            onChange={(e) => setSelectedParentId(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="">None (Top-Level Parent Milestone Task)</option>
            {parentTasks.map((pt) => (
              <option key={pt.id} value={pt.id}>
                Subtask under: {pt.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Assignees Multi-select */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block font-semibold text-slate-700 dark:text-slate-300">
              Assigned Team Members ({assigneeIds.length})
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/60">
            {teamMembers.map((member) => {
              const isAssigned = assigneeIds.includes(member.id);
              return (
                <div
                  key={member.id}
                  onClick={() => handleAssigneeToggle(member.id)}
                  className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition-colors ${
                    isAssigned
                      ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200"
                      : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-700 text-white text-[9px] font-bold flex items-center justify-center">
                      {member.initials}
                    </div>
                  )}
                  <span className="truncate font-medium">{member.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule Baseline (Planned) */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            1. Baseline Schedule (Planned)
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Planned Start</label>
              <input
                type="date"
                value={plannedStartDate}
                onChange={(e) => setPlannedStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">Planned End</label>
              <input
                type="date"
                value={plannedEndDate}
                onChange={(e) => setPlannedEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
          {errors.plannedEndDate && (
            <p className="text-[11px] text-rose-500">{errors.plannedEndDate}</p>
          )}
        </div>

        

        {/* On Hold Section (Conditional) */}
        {status === "On Hold" && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold">
              <PauseCircle className="w-4 h-4 text-amber-500" />
              <span>Hold Reason Configuration</span>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                Reason Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={holdReasonTitle}
                onChange={(e) => setHoldReasonTitle(e.target.value)}
                placeholder="e.g. Blocked on third-party security audit approval"
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
              {errors.holdReason && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.holdReason}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Category
                </label>
                <select
                  value={holdCategory}
                  onChange={(e) => setHoldCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="Dependency">Dependency</option>
                  <option value="Technical">Technical</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Resource">Resource</option>
                  <option value="Client">Client</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                  Target Review Date
                </label>
                <input
                  type="date"
                  value={holdReviewDate}
                  onChange={(e) => setHoldReviewDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                Detailed Context & Unblock Action
              </label>
              <textarea
                rows={2}
                value={holdDescription}
                onChange={(e) => setHoldDescription(e.target.value)}
                placeholder="Steps required to resume task..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </form>
    </Drawer>
  );
};

export default TaskDrawer;
