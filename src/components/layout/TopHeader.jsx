import React, { useState, useRef, useEffect } from "react";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronRight,
  LogOut,
  User as UserIcon,
  RefreshCw,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

export const TopHeader = () => {
  const { currentUser, logout, availableDemoUsers, loginAsDemo } = useAuth();
  const { projects, resetToDefaults } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId } = useParams();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const currentProject = projects.find((p) => p.id === projectId);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute breadcrumbs
  const getBreadcrumbs = () => {
    const path = location.pathname;
    const crumbs = [{ label: "Projects", to: "/projects" }];

    if (path.includes("/projects/new")) {
      crumbs.push({ label: "New Project", to: "/projects/new" });
    } else if (currentProject) {
      crumbs.push({
        label: currentProject.name,
        to: `/projects/${currentProject.id}/dashboard`,
      });

      if (path.includes("/tasks")) {
        crumbs.push({ label: "Tasks", to: null });
      } else if (path.includes("/team")) {
        crumbs.push({ label: "Team", to: null });
      } else if (path.includes("/issues")) {
        crumbs.push({ label: "Issues", to: null });
      } else if (path.includes("/history")) {
        crumbs.push({ label: "Project History", to: null });
      } else {
        crumbs.push({ label: "Dashboard", to: null });
      }
    } else if (path.includes("/profile")) {
      crumbs.push({ label: "Settings", to: null });
    }

    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 select-none transition-colors">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />}
              {isLast || !crumb.to ? (
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.to}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors truncate max-w-xs"
                >
                  {crumb.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Reset Demo Data Helper */}
        <button
          onClick={() => {
            if (window.confirm("Reset all prototype data to default seed values?")) {
              resetToDefaults();
              window.location.reload();
            }
          }}
          title="Reset Demo Data"
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Profile Dropdown Menu */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 pl-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
          >
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-semibold text-xs flex items-center justify-center">
                {currentUser?.initials || "PM"}
              </div>
            )}
            <div className="hidden sm:block text-left text-xs">
              <span className="font-semibold text-slate-800 dark:text-white block leading-tight">
                {currentUser?.name || "Demo User"}
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight">
                {currentUser?.role || "Project Manager"}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown Overlay */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs text-slate-700 dark:text-slate-300 animate-fade-in">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-semibold text-slate-900 dark:text-white">
                  {currentUser?.name}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {currentUser?.email}
                </p>
              </div>

              {/* Demo switch accounts */}
              <div className="py-1">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Switch Demo Account
                </div>
                {availableDemoUsers.slice(0, 3).map((usr) => (
                  <button
                    key={usr.id}
                    onClick={() => {
                      loginAsDemo(usr.id);
                      setProfileOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                      currentUser?.id === usr.id
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <span className="truncate">{usr.name}</span>
                    <span className="text-[10px] text-slate-400">{usr.role.split(" ")[0]}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-1 space-y-0.5">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    navigate("/login");
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
