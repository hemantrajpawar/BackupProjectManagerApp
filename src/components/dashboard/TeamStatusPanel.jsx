import React, { useState } from "react";
import { Users, CheckCircle2, Clock, AlertTriangle, ShieldAlert, ChevronRight } from "lucide-react";
import EmployeeContextMenu from "../common/EmployeeContextMenu";
import Drawer from "../common/Drawer";
import StatusBadge from "../common/StatusBadge";
import { useData } from "../../context/DataContext";

export const TeamStatusPanel = ({ project, tasks, issues }) => {
  const { users, getUserWorkload } = useData();
  const [selectedUser, setSelectedUser] = useState(null);

  const teamMembers = (project.teamMemberIds || [])
    .map((id) => users.find((u) => u.id === id))
    .filter(Boolean);

  const memberStats = teamMembers.map((member) => {
    const memberTasks = tasks.filter((t) => (t.assigneeIds || []).includes(member.id));
    const completedTasks = memberTasks.filter((t) => t.status === "Completed");
    const inProgressTasks = memberTasks.filter((t) => t.status === "In Progress");
    const onHoldTasks = memberTasks.filter((t) => t.status === "On Hold");

    // Overdue tasks
    const overdueTasks = memberTasks.filter(
      (t) => t.status !== "Completed" && new Date(t.plannedEndDate) < new Date("2026-10-11")
    );

    // Blocker issues affecting member tasks
    const blockedIssues = issues.filter(
      (iss) =>
        iss.status !== "Resolved" &&
        memberTasks.some((t) => t.id === iss.affectedTaskId)
    );

    const completionRate =
      memberTasks.length > 0
        ? Math.round((completedTasks.length / memberTasks.length) * 100)
        : 100;

    const isActive = inProgressTasks.length > 0;
    const isBlocked = blockedIssues.length > 0;
    const hasOverdue = overdueTasks.length > 0;

    return {
      member,
      tasks: memberTasks,
      total: memberTasks.length,
      completed: completedTasks.length,
      inProgress: inProgressTasks.length,
      onHold: onHoldTasks.length,
      overdue: overdueTasks.length,
      blockedIssues,
      completionRate,
      isActive,
      isBlocked,
      hasOverdue,
    };
  });

  const activeCount = memberStats.filter((m) => m.isActive).length;
  const blockedCount = memberStats.filter((m) => m.isBlocked).length;
  const overdueCount = memberStats.filter((m) => m.hasOverdue).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-5">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Project Team Allocation & Workload
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time delivery progress, active assignments, and blocker bottlenecks per contributor.
          </p>
        </div>

        {/* Compact Summary Pills */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-900/60">
            {activeCount}/{teamMembers.length} Active
          </span>
          {blockedCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-semibold border border-rose-200 dark:border-rose-900/60">
              {blockedCount} Blocked
            </span>
          )}
          {overdueCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-semibold border border-amber-200 dark:border-amber-900/60">
              {overdueCount} Overdue
            </span>
          )}
        </div>
      </div>

      {/* Team Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {memberStats.map(
          ({
            member,
            total,
            completed,
            inProgress,
            completionRate,
            isActive,
            isBlocked,
            hasOverdue,
            blockedIssues,
          }) => (
            <div
              key={member.id}
              onClick={() => setSelectedUser(member)}
              className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xs transition-all cursor-pointer group space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-white dark:ring-slate-800"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                      {member.initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                      {member.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 truncate">{member.role}</p>
                  </div>
                </div>


              </div>

              {/* Workload Progress & Stats */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Project Tasks: {completed}/{total} Completed</span>
                  <span className="font-semibold text-slate-800 dark:text-white">
                    {completionRate}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${completionRate}%` }}
                    className={`h-full rounded-full transition-all ${
                      isBlocked ? "bg-rose-500" : "bg-indigo-600"
                    }`}
                  />
                </div>
              </div>

              {/* Blocker alert snippet */}
              {isBlocked && (
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-[10px] text-rose-700 dark:text-rose-300 truncate">
                  Blocked by: {blockedIssues[0].title}
                </div>
              )}
            </div>
          )
        )}
      </div>

      {/* Member Details Drawer */}
      {selectedUser && (
        <Drawer
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`Contributor Overview: ${selectedUser.name}`}
          width="max-w-lg"
        >
          <div className="space-y-6 text-xs">
            {/* Header profile card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center gap-3.5">
              {selectedUser.avatar ? (
                <img
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-base flex items-center justify-center">
                  {selectedUser.initials}
                </div>
              )}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {selectedUser.name}
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs">
                  {selectedUser.role} • {selectedUser.department}
                </p>
                <p className="text-indigo-600 dark:text-indigo-400 text-[11px] mt-0.5">
                  {selectedUser.email}
                </p>
              </div>
            </div>

            {/* Assigned Tasks in this project */}
            <div className="space-y-3">
              <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Assigned Project Tasks
              </h5>
              <div className="space-y-2">
                {tasks
                  .filter((t) => (t.assigneeIds || []).includes(selectedUser.id))
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {task.title}
                        </span>
                        <StatusBadge status={task.status} size="sm" />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Deadline: {task.forecastEndDate}</span>
                        <span>Progress: {task.progress}%</span>
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

export default TeamStatusPanel;
