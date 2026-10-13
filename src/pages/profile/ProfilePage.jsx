import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Shield,
  Mail,
  Building,
  RotateCcw,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  FolderKanban,
  CheckSquare,
  Users,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import Modal from "../../components/common/Modal";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { currentUser, loginAsDemo, logout } = useAuth();
  const { users, projects, tasks, issues, resetAllData } = useData();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  // Demo user options
  const demoUsers = users.slice(0, 5);

  const userProjects = projects.filter((p) =>
    (p.teamMemberIds || []).includes(currentUser?.id) || p.ownerId === currentUser?.id
  );
  const userTasks = tasks.filter((t) => (t.assigneeIds || []).includes(currentUser?.id));
  const completedTasks = userTasks.filter((t) => t.status === "Completed").length;

  const handleResetData = () => {
    resetAllData();
    setIsResetConfirmOpen(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage profile details, switch demo personas, or reset prototype data.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Demo dataset successfully restored to original baseline mock seeds.</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-indigo-50 dark:ring-slate-800"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white font-bold text-xl flex items-center justify-center">
                {currentUser?.initials || "PM"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {currentUser?.name}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
                  {currentUser?.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser?.department} • ID: {currentUser?.id}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{currentUser?.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Activity & Contribution Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {userProjects.length}
            </div>
            <div className="text-[11px] text-slate-400">Projects Involved</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {userTasks.length}
            </div>
            <div className="text-[11px] text-slate-400">Assigned Tasks</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center">
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {completedTasks}
            </div>
            <div className="text-[11px] text-slate-400">Tasks Completed</div>
          </div>
        </div>
      </div>

      {/* Switch Demo Persona */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Instant Demo Account Switcher
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Demonstrate how ProjectManagerApp looks and behaves for various organizational roles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {demoUsers.map((u) => {
            const isCurrent = currentUser?.id === u.id;
            return (
              <div
                key={u.id}
                onClick={() => loginAsDemo(u.id)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  isCurrent
                    ? "bg-indigo-50/70 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-700 ring-2 ring-indigo-400/30"
                    : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {u.avatar ? (
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center">
                      {u.initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                      {u.name}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{u.role}</p>
                  </div>
                </div>

                {isCurrent && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo Data Management */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              Demo Data Reset
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
              If during client demonstrations you add new tasks or resolve blockers and want to return to the original clean demo state, click below to restore the baseline mock seeds.
            </p>
          </div>

          <button
            onClick={() => setIsResetConfirmOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <Modal
          isOpen={isResetConfirmOpen}
          onClose={() => setIsResetConfirmOpen(false)}
          title="Confirm Demo Data Reset"
          maxWidth="max-w-md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-200">
                  Reset LocalStorage Prototype State?
                </p>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  This will erase newly added tasks, projects, and edits made during this session, restoring the 5 curated demonstration projects and tasks.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-1.5 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-xs cursor-pointer"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProfilePage;
