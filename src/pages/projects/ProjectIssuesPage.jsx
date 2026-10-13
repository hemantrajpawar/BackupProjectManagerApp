import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowLeft,
  Calendar,
  ExternalLink,
  Edit2,
  FolderKanban,
  CheckSquare,
  Sparkles,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import Modal from "../../components/common/Modal";
import StatusBadge from "../../components/common/StatusBadge";
import PriorityBadge from "../../components/common/PriorityBadge";
import { formatDate } from "../../utils/dateUtils";

export const ProjectIssuesPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightIssueId = searchParams.get("highlight");

  const {
    projects,
    tasks,
    issues,
    users,
    addIssue,
    updateIssue,
  } = useData();

  const project = projects.find((p) => p.id === projectId);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSeverity, setFormSeverity] = useState("High");
  const [formStatus, setFormStatus] = useState("Open");
  const [formCategory, setFormCategory] = useState("Technical");
  const [formAffectedTaskId, setFormAffectedTaskId] = useState("");
  const [formScheduleImpactDays, setFormScheduleImpactDays] = useState(3);
  const [formAssigneeId, setFormAssigneeId] = useState("");
  const [errors, setErrors] = useState({});

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

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const projectIssues = issues.filter((i) => i.projectId === project.id);
  const teamMembers = (project.teamMemberIds || [])
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean);

  // KPI calculations
  const kpis = useMemo(() => {
    const total = projectIssues.length;
    const openCount = projectIssues.filter((i) => i.status === "Open").length;
    const inProgressCount = projectIssues.filter((i) => i.status === "In Progress").length;
    const resolvedCount = projectIssues.filter((i) => i.status === "Resolved").length;
    const criticalCount = projectIssues.filter(
      (i) => i.status !== "Resolved" && (i.severity === "Critical" || i.severity === "High")
    ).length;

    const totalScheduleImpactDays = projectIssues
      .filter((i) => i.status !== "Resolved")
      .reduce((acc, curr) => acc + (Number(curr.scheduleImpactDays) || 0), 0);

    return {
      total,
      openCount: openCount + inProgressCount,
      resolvedCount,
      criticalCount,
      totalScheduleImpactDays,
    };
  }, [projectIssues]);

  // Filtered issues
  const filteredIssues = useMemo(() => {
    return projectIssues.filter((iss) => {
      if (
        searchQuery &&
        !iss.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !iss.id.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (severityFilter !== "ALL" && iss.severity !== severityFilter) return false;
      if (statusFilter !== "ALL" && iss.status !== statusFilter) return false;
      if (categoryFilter !== "ALL" && iss.category !== categoryFilter) return false;
      return true;
    });
  }, [projectIssues, searchQuery, severityFilter, statusFilter, categoryFilter]);

  const handleOpenCreate = () => {
    setEditingIssue(null);
    setFormTitle("");
    setFormDescription("");
    setFormSeverity("High");
    setFormStatus("Open");
    setFormCategory("Technical");
    setFormAffectedTaskId(projectTasks[0]?.id || "");
    setFormScheduleImpactDays(3);
    setFormAssigneeId(teamMembers[0]?.id || "");
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (issue) => {
    setEditingIssue(issue);
    setFormTitle(issue.title);
    setFormDescription(issue.description);
    setFormSeverity(issue.severity);
    setFormStatus(issue.status);
    setFormCategory(issue.category);
    setFormAffectedTaskId(issue.affectedTaskId || "");
    setFormScheduleImpactDays(issue.scheduleImpactDays || 0);
    setFormAssigneeId(issue.assigneeId || "");
    setErrors({});
    setIsModalOpen(true);
  };

  const handleQuickResolve = (issue) => {
    updateIssue(issue.id, {
      status: "Resolved",
      resolvedDate: "2026-10-11",
      scheduleImpactDays: 0,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setErrors({ title: "Issue title is required." });
      return;
    }

    const payload = {
      projectId: project.id,
      title: formTitle.trim(),
      description: formDescription.trim(),
      severity: formSeverity,
      status: formStatus,
      category: formCategory,
      affectedTaskId: formAffectedTaskId || null,
      scheduleImpactDays: Number(formScheduleImpactDays),
      assigneeId: formAssigneeId || null,
      reportedDate: editingIssue ? editingIssue.reportedDate : "2026-10-11",
      resolvedDate: formStatus === "Resolved" ? "2026-10-11" : null,
    };

    if (editingIssue) {
      updateIssue(editingIssue.id, payload);
    } else {
      addIssue(payload);
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/projects/${project.id}/dashboard`)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Schedule-Impacting Issues & Blockers
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Project: <strong className="text-slate-700 dark:text-slate-300">{project.name}</strong> • Live blocker tracking with forecast schedule slippage links.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Blocker</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-slate-400">Open Blockers</div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {kpis.openCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Active schedule risks</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-rose-500">Critical / High Severity</div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {kpis.criticalCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Requiring PM escalation</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-amber-500">Accumulated Schedule Slippage</div>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            +{kpis.totalScheduleImpactDays} Days
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Forecast delay impact</div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="text-[11px] font-semibold text-emerald-500">Resolved Blockers</div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {kpis.resolvedCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Unblocked deliverables</div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
                  {/* Search */}
          <div className="relative flex-1 w-full max-w-sm min-w-0">
            <div
              className="grid h-10 grid-cols-[40px_minmax(0,1fr)] items-center
                        rounded-lg border border-slate-200 bg-slate-50
                        dark:border-slate-700 dark:bg-slate-800
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
                placeholder="Search issues by title or ID..."
                className="h-full w-full min-w-0 border-0 bg-transparent
                          pr-3.5 text-xs text-slate-900 dark:text-white
                          placeholder:text-slate-400
                          outline-none focus:outline-none focus:ring-0"
              />
            </div>
          </div>


        <div className="flex flex-wrap items-center gap-2">
          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="ALL">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Dependency">Dependency</option>
            <option value="Compliance">Compliance</option>
            <option value="Resource">Resource</option>
            <option value="Client">Client</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider select-none">
                <th className="py-3 px-4">Issue Title & Details</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Schedule Impact</th>
                <th className="py-3 px-4">Affected Task</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => {
                  const affectedTask = tasks.find((t) => t.id === issue.affectedTaskId);
                  const assignee = users.find((u) => u.id === issue.assigneeId);
                  const isHighlighted = highlightIssueId === issue.id;

                  return (
                    <tr
                      key={issue.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isHighlighted
                          ? "bg-amber-50/70 dark:bg-amber-950/30 ring-2 ring-amber-400"
                          : "bg-white dark:bg-slate-900"
                      }`}
                    >
                      {/* Title & Description */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {issue.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {issue.id}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                            {issue.description}
                          </p>
                        </div>
                      </td>

                      {/* Severity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PriorityBadge priority={issue.severity} />
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={issue.status} size="sm" />
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {issue.category}
                      </td>

                      {/* Schedule Impact */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {issue.status !== "Resolved" && issue.scheduleImpactDays > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
                            <ShieldAlert className="w-3 h-3" />
                            +{issue.scheduleImpactDays}d Delay
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">None</span>
                        )}
                      </td>

                      {/* Affected Task */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {affectedTask ? (
                          <button
                            onClick={() =>
                              navigate(
                                `/projects/${project.id}/tasks?taskId=${affectedTask.id}`
                              )
                            }
                            className="text-left font-semibold text-indigo-600 dark:text-indigo-400 hover:underline truncate block max-w-[180px] cursor-pointer"
                            title={affectedTask.title}
                          >
                            {affectedTask.title}
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unlinked</span>
                        )}
                      </td>

                      {/* Assignee */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            {assignee.avatar ? (
                              <img
                                src={assignee.avatar}
                                alt={assignee.name}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-700 text-white font-bold text-[10px] flex items-center justify-center">
                                {assignee.initials}
                              </div>
                            )}
                            <span className="text-slate-700 dark:text-slate-300 font-medium">
                              {assignee.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Unassigned</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {issue.status !== "Resolved" && (
                            <button
                              onClick={() => handleQuickResolve(issue)}
                              className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 cursor-pointer flex items-center gap-1"
                              title="Mark issue resolved"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Resolve</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEdit(issue)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                            title="Edit issue"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      No issues matching your filters
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      All deliverables are running without registered blocker bottlenecks.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Blocker Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingIssue ? `Edit Blocker: ${editingIssue.title}` : "Report New Blocker Issue"}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Issue Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Identity Provider SAML token failure"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
              {errors.title && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description & Root Cause
              </label>
              <textarea
                rows={3}
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Technical explanation, impact on delivery, and mitigation path..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Severity
                </label>
                <select
                  value={formSeverity}
                  onChange={(e) => setFormSeverity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="Technical">Technical</option>
                  <option value="Dependency">Dependency</option>
                  <option value="Compliance">Compliance</option>
                  <option value="Resource">Resource</option>
                  <option value="Client">Client</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Schedule Impact (Days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formScheduleImpactDays}
                  onChange={(e) => setFormScheduleImpactDays(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Affected Deliverable / Task
              </label>
              <select
                value={formAffectedTaskId}
                onChange={(e) => setFormAffectedTaskId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="">None (General Project Issue)</option>
                {projectTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Assigned Owner
              </label>
              <select
                value={formAssigneeId}
                onChange={(e) => setFormAssigneeId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              >
                <option value="">Unassigned</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs"
              >
                {editingIssue ? "Save Changes" : "Create Blocker"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProjectIssuesPage;
