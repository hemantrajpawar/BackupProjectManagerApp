import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  Clock,
  CheckCircle2,
  PauseCircle,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  MoreVertical,
  Eye,
  Calendar,
  Lock,
  Globe,
  Users,
  Circle,
  X,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import StatusBadge from "../../components/common/StatusBadge";
import AvatarStack from "../../components/common/AvatarStack";
import DelayIndicator from "../../components/common/DelayIndicator";
import DocumentPreviewModal from "../../components/common/DocumentPreviewModal";
import Modal from "../../components/common/Modal";
import { formatDate, calculateDelayDays } from "../../utils/dateUtils";

export const ProjectPortfolioPage = () => {
  const navigate = useNavigate();
  const {
    projects,
    users,
    getHoldReasonById,
    getDocumentById,
    getProjectMetrics,
    updateProject,
  } = useData();

  // Search, Filter, Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [visibilityFilter, setVisibilityFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("name"); // 'name' | 'progress' | 'startDate' | 'endDate'

  // Hover Popover State for Project Documents & Stage cards
  const [hoveredProject, setHoveredProject] = useState(null);
  const [hoveredStage, setHoveredStage] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  // Edit Project Metadata Modal state
  const [editingProject, setEditingProject] = useState(null);

  // Stage definitions and dynamic project groupings
  const STAGES = ["Not Started", "In Progress", "On Hold", "Completed"];

  const stageData = useMemo(() => {
    return {
      "Not Started": {
        label: "Not Started",
        icon: Circle,
        textColor: "text-slate-600",
        iconColor: "text-slate-400",
        dotColor: "bg-slate-400",
        projects: projects.filter((p) => p.status === "Not Started"),
      },
      "In Progress": {
        label: "In Progress",
        icon: Clock,
        textColor: "text-blue-600",
        iconColor: "text-blue-500",
        dotColor: "bg-blue-500",
        projects: projects.filter((p) => p.status === "In Progress"),
      },
      "On Hold": {
        label: "On Hold",
        icon: PauseCircle,
        textColor: "text-amber-600",
        iconColor: "text-amber-500",
        dotColor: "bg-amber-500",
        projects: projects.filter((p) => p.status === "On Hold"),
      },
      "Completed": {
        label: "Completed",
        icon: CheckCircle2,
        textColor: "text-emerald-600",
        iconColor: "text-emerald-500",
        dotColor: "bg-emerald-500",
        projects: projects.filter((p) => p.status === "Completed"),
      },
    };
  }, [projects]);

  // Filtered and Sorted Projects
  const filteredProjects = useMemo(() => {
    return projects
      .filter((project) => {
        // Search filter
        const owner = users.find((u) => u.id === project.ownerId);
        const matchesSearch =
          project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (owner && owner.name.toLowerCase().includes(searchQuery.toLowerCase()));

        if (!matchesSearch) return false;

        // Status filter
        if (statusFilter !== "ALL" && project.status !== statusFilter) return false;

        // Visibility filter
        if (visibilityFilter !== "ALL" && project.visibility !== visibilityFilter)
          return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "startDate") return new Date(a.startDate) - new Date(b.startDate);
        if (sortBy === "endDate")
          return new Date(a.plannedEndDate) - new Date(b.plannedEndDate);
        if (sortBy === "progress") {
          const pA = getProjectMetrics(a.id).overallProgress;
          const pB = getProjectMetrics(b.id).overallProgress;
          return pB - pA;
        }
        return 0;
      });
  }, [projects, users, searchQuery, statusFilter, visibilityFilter, sortBy]);

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editingProject) {
      updateProject(editingProject.id, {
        name: editingProject.name,
        description: editingProject.description,
        status: editingProject.status,
        visibility: editingProject.visibility,
      });
      setEditingProject(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <FolderKanban className="w-5 h-5 text-indigo-600" />
            Projects
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Monitor project status, schedules, and team progress.
          </p>
        </div>

        <button
          onClick={() => navigate("/projects/new")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Interactive Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {STAGES.map((stageKey) => {
          const stage = stageData[stageKey];
          const Icon = stage.icon;
          const count = stage.projects.length;
          const isActiveFilter = statusFilter === stageKey;
          const isPopoverOpen = hoveredStage === stageKey;

          return (
            <div
              key={stageKey}
              onMouseEnter={() => setHoveredStage(stageKey)}
              onMouseLeave={() => setHoveredStage(null)}
              onClick={() => {
                setStatusFilter(isActiveFilter ? "ALL" : stageKey);
              }}
              className={`relative p-4 rounded-xl border transition-all cursor-pointer select-none ${
                isActiveFilter
                  ? "bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/30 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className={stage.textColor}>{stage.label}</span>
                <Icon className={`w-4 h-4 ${stage.iconColor}`} />
              </div>
              <div className="text-2xl font-bold text-slate-900 mt-2">
                {count}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>{count === 1 ? "1 project" : `${count} projects`}</span>
                {isActiveFilter && (
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-100/70 px-1.5 py-0.5 rounded">
                    Filtered
                  </span>
                )}
              </div>

              {/* Stage Popover: Displays project names with direct link to dashboard */}
              {isPopoverOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-full mt-2 z-50 w-72 p-3 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 text-xs animate-fade-in"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 pb-2 border-b border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${stage.dotColor}`} />
                      {stage.label}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {count} {count === 1 ? "project" : "projects"}
                    </span>
                  </div>

                  <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                    {stage.projects.length > 0 ? (
                      stage.projects.map((proj) => (
                        <button
                          key={proj.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${proj.id}/dashboard`);
                          }}
                          className="w-full flex items-center justify-between p-1.5 px-2 rounded-lg hover:bg-slate-50 text-left transition-colors group cursor-pointer"
                        >
                          <span className="truncate text-xs font-medium text-slate-700 group-hover:text-indigo-600">
                            {proj.name}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0" />
                        </button>
                      ))
                    ) : (
                      <p className="text-slate-400 text-xs italic py-2 text-center">
                        No projects
                      </p>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
                    Click card to {isActiveFilter ? "reset filter" : "filter list"}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Filter and Control Bar */}
      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-xs">
        {/* Search Input */}
        
        <div className="flex-1 w-full max-w-md min-w-0">
          <div className="grid grid-cols-[40px_minmax(0,1fr)] items-center h-10
                          rounded-lg border border-slate-200 dark:border-slate-700
                          bg-slate-50 dark:bg-slate-800/80
                          focus-within:border-indigo-500
                          focus-within:ring-1 focus-within:ring-indigo-500/30">

            <div className="flex items-center justify-center h-full">
              <Search
                size={18}
                strokeWidth={1.8}
                className="block shrink-0 text-slate-400"
                aria-hidden="true"
              />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name, description, or manager..."
              className="w-full min-w-0 h-full pr-3.5 bg-transparent
                        text-xs text-slate-900 dark:text-white
                        placeholder:text-slate-400
                        border-0 outline-none ring-0
                        focus:outline-none focus:ring-0"
            />
          </div>
        </div>


        {/* Filters and Sorters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Stage Filter Reset Pill */}
          {statusFilter !== "ALL" && (
            <button
              onClick={() => setStatusFilter("ALL")}
              title="Reset stage filter"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-medium hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <span>Stage: {statusFilter}</span>
              <X className="w-3 h-3" />
            </button>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Visibility Filter */}
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="ALL">All Visibility</option>
            <option value="Public">Public Only</option>
            <option value="Private">Private Only</option>
          </select>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden"
            >
              <option value="name">Sort by Name</option>
              <option value="progress">Sort by Progress %</option>
              <option value="startDate">Sort by Start Date</option>
              <option value="endDate">Sort by Expected End</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-900/75 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider select-none">
                <th className="py-3 px-4">Project & Scope</th>
                <th className="py-3 px-4">Team Allocation</th>
                <th className="py-3 px-4">Owner / PM</th>
                <th className="py-3 px-4">Status & Health</th>
                <th className="py-3 px-4">Timeline (Start → Forecast)</th>
                <th className="py-3 px-4">Visibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => {
                  const owner = users.find((u) => u.id === project.ownerId);
                  const holdReason = getHoldReasonById(project.holdReasonId);
                  const metrics = getProjectMetrics(project.id);
                  const delayDays = calculateDelayDays(
                    project.plannedEndDate,
                    project.forecastEndDate
                  );
                  const teamMembers = (project.teamMemberIds || [])
                    .map((id) => users.find((u) => u.id === id))
                    .filter(Boolean);

                  const docs = (project.documentIds || [])
                    .map((id) => getDocumentById(id))
                    .filter(Boolean);

                  return (
                    <tr
                      key={project.id}
                      onClick={() => navigate(`/projects/${project.id}/dashboard`)}
                      className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      {/* Project Name & Popover Trigger */}
                      <td className="py-3.5 px-4 max-w-xs relative">
                        <div
                          onMouseEnter={() => setHoveredProject(project)}
                          onMouseLeave={() => setHoveredProject(null)}
                          className="space-y-1"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-xs truncate">
                              {project.name}
                            </span>
                            {docs.length > 0 && (
                              <span
                                title={`${docs.length} attached document(s)`}
                                className="inline-flex items-center gap-0.5 text-[10px] text-slate-400 dark:text-slate-500"
                              >
                                <FileText className="w-3 h-3" />
                                {docs.length}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 font-normal">
                            {project.description}
                          </p>

                          {/* Progress bar */}
                          <div className="flex items-center gap-2 pt-1">
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${metrics.overallProgress}%` }}
                                className={`h-full rounded-full transition-all ${
                                  project.status === "Completed"
                                    ? "bg-emerald-500"
                                    : "bg-indigo-600"
                                }`}
                              />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                              {metrics.overallProgress}%
                            </span>
                          </div>
                        </div>

                        {/* Interactive Project Documents & Metadata Popover */}
                        {hoveredProject?.id === project.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute left-4 top-full mt-1.5 z-40 w-80 max-w-[calc(100vw-3rem)] p-3.5 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 text-xs animate-fade-in"
                          >
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <span className="font-bold text-slate-900 text-xs truncate">
                                {project.name}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                                {project.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 mb-3 leading-relaxed break-words">
                              {project.description}
                            </p>

                            {/* Documents Section */}
                            <div className="space-y-1.5 border-t border-slate-100 pt-2">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                                <span>Attached Documents</span>
                                <span>{docs.length}</span>
                              </div>
                              {docs.length > 0 ? (
                                docs.map((doc) => (
                                  <div
                                    key={doc.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPreviewDoc(doc);
                                    }}
                                    title={doc.name}
                                    className="p-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-between text-[11px] transition-colors cursor-pointer group/doc"
                                  >
                                    <div className="flex items-center gap-2 min-w-0 pr-2">
                                      <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                      <span className="truncate text-slate-700 font-medium">
                                        {doc.name}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-indigo-600 font-semibold group-hover/doc:underline shrink-0">
                                      Preview
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-[11px] text-slate-400 italic">
                                  No documents attached
                                </p>
                              )}
                            </div>

                            {/* View Details Action */}
                            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/projects/${project.id}/dashboard`);
                                }}
                                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                              >
                                <span>View Details</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Team Allocation */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1.5">
                          <AvatarStack
                            users={teamMembers}
                            max={4}
                            size="sm"
                            projectId={project.id}
                          />
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                            <span className="text-slate-700 dark:text-slate-300 font-bold">
                              {metrics.activeTeamCount}
                            </span>
                            /{metrics.totalTeamCount} active contributors
                          </div>
                        </div>
                      </td>

                      {/* Owner / PM */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {owner?.avatar ? (
                            <img
                              src={owner.avatar}
                              alt={owner.name}
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-700 text-white text-[10px] font-semibold flex items-center justify-center">
                              {owner?.initials || "PM"}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white text-xs">
                              {owner?.name || "Unassigned"}
                            </p>
                            <p className="text-[10px] text-slate-400 font-normal">
                              {owner?.role || "Project Lead"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status & Health */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <StatusBadge status={project.status} holdReason={holdReason} size="sm" />
                          {delayDays > 0 && project.status !== "Completed" && (
                            <div className="pt-0.5">
                              <DelayIndicator days={delayDays} projectId={project.id} />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Timeline */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-0.5 text-xs">
                          <div className="text-slate-700 dark:text-slate-300 font-medium">
                            {formatDate(project.startDate, false)} →{" "}
                            {formatDate(project.plannedEndDate, false)}
                          </div>
                          {delayDays > 0 ? (
                            <div className="text-[10px] text-rose-500 dark:text-rose-400 font-semibold">
                              Forecast: {formatDate(project.forecastEndDate, false)} (+{delayDays}d)
                            </div>
                          ) : (
                            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              On schedule
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Visibility */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
                            project.visibility === "Public"
                              ? "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                              : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-900/60"
                          }`}
                        >
                          {project.visibility === "Public" ? (
                            <Globe className="w-3 h-3" />
                          ) : (
                            <Lock className="w-3 h-3" />
                          )}
                          <span>{project.visibility}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        onClick={(e) => e.stopPropagation()}
                        className="py-3.5 px-4 whitespace-nowrap text-right"
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/projects/${project.id}/dashboard`)}
                            title="Open Project Dashboard"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setEditingProject(project)}
                            title="Edit Project Metadata"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-[11px] font-medium"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <FolderKanban className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    <p className="font-semibold text-slate-600 dark:text-slate-400">
                      No matching projects found
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing search terms or status filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Project Metadata Modal */}
      {editingProject && (
        <Modal
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
          title={`Edit Project: ${editingProject.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={editingProject.name}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Short Description
              </label>
              <textarea
                rows={3}
                value={editingProject.description}
                onChange={(e) =>
                  setEditingProject({ ...editingProject, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={editingProject.status}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, status: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Visibility
                </label>
                <select
                  value={editingProject.visibility}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, visibility: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="Public">Public</option>
                  <option value="Private">Private</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg cursor-pointer shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Document Preview Modal */}
      {previewDoc && (
        <DocumentPreviewModal
          doc={previewDoc}
          isOpen={!!previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};

export default ProjectPortfolioPage;
