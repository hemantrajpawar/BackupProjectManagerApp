import React, { useState } from "react";
import EmployeeContextMenu from "./EmployeeContextMenu";

export const AvatarStack = ({
  users = [],
  max = 4,
  size = "md",
  showTooltip = true,
  onUserClick = null,
  projectId = null,
}) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);

  const visibleUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  const sizeClasses = {
    sm: "w-6 h-6 text-[10px]",
    md: "w-7 h-7 text-xs",
    lg: "w-9 h-9 text-sm",
  };

  const handleContextMenu = (e, user) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedUser(user);
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleClick = (e, user) => {
    if (onUserClick) {
      onUserClick(user);
    } else {
      // Also trigger employee context menu on simple click
      setSelectedUser(user);
      setMenuPosition({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div className="flex items-center -space-x-1.5 overflow-visible">
      {visibleUsers.map((user) => (
        <div
          key={user.id}
          className="relative group shrink-0"
          onContextMenu={(e) => handleContextMenu(e, user)}
          onClick={(e) => handleClick(e, user)}
        >
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className={`${sizeClasses[size] || sizeClasses.md} rounded-full object-cover ring-2 ring-white dark:ring-slate-900 cursor-pointer transition-transform hover:scale-110 hover:z-20`}
            />
          ) : (
            <div
              className={`${
                sizeClasses[size] || sizeClasses.md
              } rounded-full bg-slate-700 text-white font-semibold flex items-center justify-center ring-2 ring-white dark:ring-slate-900 cursor-pointer transition-transform hover:scale-110 hover:z-20`}
            >
              {user.initials || user.name.slice(0, 2).toUpperCase()}
            </div>
          )}

          {/* Simple Hover Tooltip */}
          {showTooltip && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center z-30 pointer-events-none">
              <div className="bg-slate-900 text-white text-[11px] py-1 px-2 rounded shadow-md whitespace-nowrap">
                <span className="font-semibold">{user.name}</span>
                <span className="text-slate-400 block text-[10px]">{user.role}</span>
              </div>
            </div>
          )}
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={`${
            sizeClasses[size] || sizeClasses.md
          } rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center justify-center ring-2 ring-white dark:ring-slate-900 text-[10px] shrink-0 cursor-default`}
        >
          +{remainingCount}
        </div>
      )}

      {/* Custom Context Menu */}
      {selectedUser && menuPosition && (
        <EmployeeContextMenu
          user={selectedUser}
          position={menuPosition}
          projectId={projectId}
          onClose={() => {
            setSelectedUser(null);
            setMenuPosition(null);
          }}
        />
      )}
    </div>
  );
};

export default AvatarStack;
