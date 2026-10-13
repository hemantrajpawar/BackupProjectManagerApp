import React, { useEffect, useRef } from "react";
import { User, CheckSquare, Mail, Briefcase, ExternalLink, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const EmployeeContextMenu = ({ user, position, projectId = null, onClose }) => {
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!user || !position) return null;

  // View Profile action: navigate to team page or open drawer
  const handleViewProfile = () => {
    onClose();
    if (projectId) {
      navigate(`/projects/${projectId}/team?user=${user.id}`);
    } else {
      navigate(`/profile?user=${user.id}`);
    }
  };

  const handleAssignedTasks = () => {
    onClose();
    if (projectId) {
      navigate(`/projects/${projectId}/tasks?assignee=${user.id}`);
    }
  };

  // Adjust position so it doesn't clip screen boundaries
  const adjustedX = Math.min(position.x, window.innerWidth - 260);
  const adjustedY = Math.min(position.y, window.innerHeight - 260);

  return (
    <div
      ref={menuRef}
      style={{ top: `${adjustedY}px`, left: `${adjustedX}px` }}
      className="fixed z-50 w-64 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl text-slate-200 overflow-hidden text-xs animate-fade-in"
      role="menu"
    >
      {/* Header with employee details */}
      <div className="p-3 bg-slate-800/80 border-b border-slate-700/80 flex items-center gap-2.5">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-600"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-indigo-600 font-semibold flex items-center justify-center text-white text-xs">
            {user.initials || user.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white truncate text-sm">{user.name}</p>
          <p className="text-[11px] text-slate-400 truncate">{user.role}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700/60"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Info Details */}
      <div className="p-2.5 space-y-1.5 border-b border-slate-800 text-[11px] text-slate-300">
        <div className="flex items-center gap-2">
          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{user.email}</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{user.department || "Engineering"}</span>
        </div>
      </div>

      {/* Menu Actions */}
      <div className="p-1 space-y-0.5">
        <button
          onClick={handleViewProfile}
          className="w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-lg text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
        >
          <User className="w-3.5 h-3.5" />
          <span>View Team Profile</span>
        </button>

        {projectId && (
          <button
            onClick={handleAssignedTasks}
            className="w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-lg text-slate-200 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Filter Assigned Tasks</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default EmployeeContextMenu;
