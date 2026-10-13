import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Calendar,
  Lock,
  Globe,
  Edit3,
  CheckSquare,
  AlertCircle,
  Users,
  ArrowLeft,
  Share2,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import StatusBadge from "../../components/common/StatusBadge";
import AvatarStack from "../../components/common/AvatarStack";
import Modal from "../../components/common/Modal";
import HoldBanner from "../../components/dashboard/HoldBanner";
import ProjectKpiCards from "../../components/dashboard/ProjectKpiCards";
import GanttChart from "../../components/gantt/GanttChart";
import TeamStatusPanel from "../../components/dashboard/TeamStatusPanel";
import { formatDate } from "../../utils/dateUtils";

export const ProjectDashboardPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    tasks,
    issues,
    users,
    getHoldReasonById,
    getProjectMetrics,
    updateProject,
  } = useData();

  const [isEditing, setIsEditing] = useState(false);

  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="p-12 text-center space-y-4">
        <FolderKanban className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Project Not Found</h2>
        <p className="text-xs text-slate-400">The requested project identifier does not exist.</p>
        <button
          onClick={() => navigate("/projects")}
          className="px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl"
        >
          Return to Portfolio
        </button>
      </div>
    );
  }

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const projectIssues = issues.filter((i) => i.projectId === project.id);
  const metrics = getProjectMetrics(project.id);
  const holdReason = getHoldReasonById(project.holdReasonId);
  const owner = users.find((u) => u.id === project.ownerId);

  const teamMembers = (project.teamMemberIds || [])
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean);

  const [editForm, setEditForm] = useState({
    name: project.name,
    description: project.description,
    status: project.status,
    visibility: project.visibility,
  });

  const handleEditSubmit = (e) => {
    e.preventDefault();
    updateProject(project.id, editForm);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* SECTION A: Project Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                  project.visibility === "Public"
                    ? "bg-slate-100 text-slate-600 border-slate-200"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                }`}
              >
                {project.visibility === "Public" ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                <span>{project.visibility}</span>
              </span>

              <StatusBadge status={project.status} holdReason={holdReason} size="md" />

              <span className="text-xs text-slate-400 font-mono">ID: {project.id}</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 break-words min-w-0">
              {project.name}
            </h1>

            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed break-words min-w-0">
              {project.description}
            </p>
          </div>

          {/* Header Quick Actions & PM info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:self-start shrink-0">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs min-w-0">
              {owner?.avatar ? (
                <img
                  src={owner.avatar}
                  alt={owner.name}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  {owner?.initials || "PM"}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-bold text-slate-900 text-xs truncate">{owner?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{owner?.role || "Project Manager"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Project</span>
              </button>

              <button
                onClick={() => navigate(`/projects/${project.id}/tasks`)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckSquare className="w-3.5 h-3.5" />
                <span>Tasks</span>
              </button>
            </div>
          </div>
        </div>

        {/* Timeline & Team allocation strip */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                Baseline: <strong>{formatDate(project.startDate, false)}</strong> →{" "}
                <strong>{formatDate(project.plannedEndDate, false)}</strong>
              </span>
            </div>

            {project.forecastEndDate !== project.plannedEndDate && (
              <div className="text-rose-500 dark:text-rose-400 font-semibold">
                Forecast Completion: {formatDate(project.forecastEndDate, false)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Team:</span>
            <AvatarStack users={teamMembers} max={5} size="sm" projectId={project.id} />
          </div>
        </div>
      </div>

      {/* Prominent On Hold Banner if applicable */}
      {project.status === "On Hold" && holdReason && (
        <HoldBanner holdReason={holdReason} />
      )}

      {/* SECTION B: Calculated Project Health KPIs */}
      <ProjectKpiCards metrics={metrics} />

      {/* SECTION C: Interactive Gantt Chart */}
      <GanttChart project={project} tasks={projectTasks} issues={projectIssues} />

      {/* SECTION D: Team Status Panel */}
      <TeamStatusPanel project={project} tasks={projectTasks} issues={projectIssues} />

      {/* Edit Project Modal */}
      {isEditing && (
        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          title={`Edit Project Details: ${project.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Project Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
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
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
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
                  value={editForm.visibility}
                  onChange={(e) =>
                    setEditForm({ ...editForm, visibility: e.target.value })
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
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ProjectDashboardPage;
