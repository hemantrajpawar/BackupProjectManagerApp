import React from "react";
import { NavLink, useLocation, useParams, useNavigate } from "react-router-dom";
import {
  FolderKanban,
  LayoutDashboard,
  CheckSquare,
  Users,
  AlertCircle,
  History,
  ArrowLeft,
  Settings,
  ChevronRight,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import StatusBadge from "../common/StatusBadge";

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { projects, getHoldReasonById } = useData();

  const currentProject = projects.find((p) => p.id === projectId);
  const holdReason = currentProject ? getHoldReasonById(currentProject.holdReasonId) : null;

  return (
    <aside className="w-64 bg-white text-slate-700 flex flex-col shrink-0 border-r border-slate-200 min-h-screen shadow-sm select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 bg-white">
        <div
          onClick={() => navigate("/projects")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
            <FolderKanban className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm tracking-tight block">
              ProjectManager<span className="text-indigo-600">App</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">
              Control Platform
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Body */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {/* Project Context Navigation (if inside a project) */}
        {currentProject ? (
          <div className="space-y-4">
            {/* Back to Portfolio Button */}
            <button
              onClick={() => navigate("/projects")}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Projects</span>
            </button>

            {/* Current Project Card Info */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Active Project
              </div>
              <h2 className="text-xs font-bold text-slate-900 truncate" title={currentProject.name}>
                {currentProject.name}
              </h2>
              <div className="flex items-center justify-between pt-1">
                <StatusBadge status={currentProject.status} holdReason={holdReason} size="sm" />
                <span className="text-[11px] font-medium text-slate-600">
                  {currentProject.visibility}
                </span>
              </div>
            </div>

            {/* Contextual Project Tabs */}
            <div className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Project
              </div>

              <NavLink
                to={`/projects/${projectId}/dashboard`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                <LayoutDashboard className="w-4 h-4 shrink-0" />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to={`/projects/${projectId}/tasks`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                <CheckSquare className="w-4 h-4 shrink-0" />
                <span>Tasks</span>
              </NavLink>

              <NavLink
                to={`/projects/${projectId}/team`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                <Users className="w-4 h-4 shrink-0" />
                <span>Team</span>
              </NavLink>

              <NavLink
                to={`/projects/${projectId}/issues`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Issues</span>
              </NavLink>

              <NavLink
                to={`/projects/${projectId}/history`}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                <History className="w-4 h-4 shrink-0" />
                <span>Project History</span>
              </NavLink>
            </div>
          </div>
        ) : (
          /* Portfolio-Level Global Navigation */
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Overview
              </div>

              <NavLink
                to="/projects"
                end
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <FolderKanban className="w-4 h-4 shrink-0" />
                  <span>Projects</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {projects.length}
                </span>
              </NavLink>

              <NavLink
                to="/projects/new"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white font-semibold shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>New Project</span>
              </NavLink>
            </div>

            {/* Quick Projects List */}
            <div className="space-y-1 pt-2">
              <div className="px-3 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Recent Projects
              </div>
              {projects.slice(0, 5).map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => navigate(`/projects/${proj.id}/dashboard`)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-left transition-colors cursor-pointer group"
                >
                  <span className="truncate pr-2">{proj.name}</span>
                  <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-slate-600 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer / Profile Link */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            }`
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
