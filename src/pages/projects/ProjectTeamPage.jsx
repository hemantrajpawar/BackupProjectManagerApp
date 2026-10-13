import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  ArrowLeft,
  Mail,
  Building,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Trash2,
  Search,
  ExternalLink,
  ChevronRight,
  FolderKanban,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import Modal from "../../components/common/Modal";
import Drawer from "../../components/common/Drawer";
import StatusBadge from "../../components/common/StatusBadge";

export const ProjectTeamPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    projects,
    tasks,
    issues,
    users,
    updateProject,
  } = useData();

  const project = projects.find((p) => p.id === projectId);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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

  // Available users in org not yet on this project team
  const availableUsers = users.filter(
    (u) => !(project.teamMemberIds || []).includes(u.id)
  );

  const memberStats = useMemo(() => {
    return teamMembers.map((member) => {
      const assigned = projectTasks.filter((t) =>
        (t.assigneeIds || []).includes(member.id)
      );
      const completed = assigned.filter((t) => t.status === "Completed").length;
      const inProgress = assigned.filter((t) => t.status === "In Progress").length;
      const onHold = assigned.filter((t) => t.status === "On Hold").length;

      // Blocked issues affecting this user
      const blockedIssues = projectIssues.filter(
        (iss) =>
          iss.status !== "Resolved" &&
          assigned.some((t) => t.id === iss.affectedTaskId)
      );

      const progress =
        assigned.length > 0
          ? Math.round((completed / assigned.length) * 100)
          : 100;

      const isBlocked = blockedIssues.length > 0;
      const isActive = inProgress > 0;

      return {
        member,
        assigned,
        total: assigned.length,
        completed,
        inProgress,
        onHold,
        blockedIssues,
        progress,
        isBlocked,
        isActive,
      };
    });
  }, [teamMembers, projectTasks, projectIssues]);

  const filteredMembers = memberStats.filter(({ member }) =>
    searchQuery
      ? member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.department.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const handleAddMember = (userId) => {
    const updated = [...(project.teamMemberIds || []), userId];
    updateProject(project.id, { teamMemberIds: updated });
    setIsAddModalOpen(false);
  };

  const handleRemoveMember = (userId, userName) => {
    if (window.confirm(`Remove ${userName} from this project?`)) {
      const updated = (project.teamMemberIds || []).filter((id) => id !== userId);
      updateProject(project.id, { teamMemberIds: updated });
    }
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
              <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Project Team & Workload
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Project: <strong className="text-slate-700 dark:text-slate-300">{project.name}</strong> • {teamMembers.length} active contributors allocated.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Search Bar */}
              
        <div className="p-3 rounded-xl bg-white dark:bg-slate-900
                        border border-slate-200 dark:border-slate-800 shadow-sm">

          <div className="w-full max-w-md min-w-0">
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
                placeholder="Search team member by name, role, department..."
                className="h-full w-full min-w-0 border-0 bg-transparent
                          pr-3.5 text-xs text-slate-900 dark:text-white
                          placeholder:text-slate-400
                          outline-none focus:outline-none focus:ring-0"
              />
            </div>
          </div>
        </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map(
          ({
            member,
            assigned,
            total,
            completed,
            inProgress,
            onHold,
            blockedIssues,
            progress,
            isBlocked,
            isActive,
          }) => (
            <div
              key={member.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              {/* Member Card Header */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                        {member.initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {member.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate">{member.role}</p>
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <Building className="w-3 h-3" />
                        <span>{member.department}</span>
                      </div>
                    </div>
                  </div>
                  </div>

                {/* Blocker alert if present */}
                {isBlocked && (
                  <div
                    onClick={() => navigate(`/projects/${project.id}/issues?highlight=${blockedIssues[0].id}`)}
                    className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 space-y-1 cursor-pointer hover:bg-rose-100/60 transition-colors"
                  >
                    <div className="flex items-center justify-between font-bold text-[11px]">
                      <span>Blocked on Blocker Issue</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[10px] text-rose-600 dark:text-rose-400 truncate">
                      {blockedIssues[0].title}
                    </p>
                  </div>
                )}

                {/* Workload Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Task Completion</span>
                    <span className="font-bold text-slate-800 dark:text-white">
                      {completed}/{total} ({progress}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${progress}%` }}
                      className={`h-full rounded-full transition-all ${
                        isBlocked ? "bg-rose-500" : "bg-indigo-600"
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                    <span>{inProgress} In Progress</span>
                    <span>•</span>
                    <span>{onHold} On Hold</span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedUser(member)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View Details & Tasks</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => handleRemoveMember(member.id, member.name)}
                  title="Remove from project"
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )
        )}
      </div>

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Contributor to Project Team"
          maxWidth="max-w-md"
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-500">
              Select an available team member from the organization to assign to{" "}
              <strong>{project.name}</strong>:
            </p>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {availableUsers.length > 0 ? (
                availableUsers.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center">
                          {u.initials}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white text-xs">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.role} • {u.department}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddMember(u.id)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Assign
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-400 py-6">
                  All organization members are already assigned to this project.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Employee Details Drawer */}
      {selectedUser && (
        <Drawer
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`Contributor Details: ${selectedUser.name}`}
          width="max-w-lg"
        >
          <div className="space-y-6 text-xs">
            {/* Profile banner */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3.5">
              {selectedUser.avatar ? (
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                  {selectedUser.initials}
                </div>
              )}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedUser.name}
                </h4>
                <p className="text-slate-500 dark:text-slate-400">
                  {selectedUser.role} • {selectedUser.department}
                </p>
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{selectedUser.email}</span>
                </div>
              </div>
            </div>

            {/* Assigned Tasks List */}
            <div className="space-y-3">
              <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Assigned Project Tasks
              </h5>
              <div className="space-y-2">
                {projectTasks
                  .filter((t) => (t.assigneeIds || []).includes(selectedUser.id))
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {task.title}
                        </span>
                        <StatusBadge status={task.status} size="sm" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Due: {task.forecastEndDate}</span>
                        <span>{task.progress}% Complete</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Drawer>
      )}
    </div>
  );
};

export default ProjectTeamPage;
