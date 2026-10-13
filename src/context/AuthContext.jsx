import React, { createContext, useContext, useState, useEffect } from "react";
import initialUsers from "../data/users.json";

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = "pma_auth_user";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      // Default to Lead Project Manager (Alex Rivera) for seamless demonstration
      return initialUsers[0];
    } catch {
      return initialUsers[0];
    }
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }, [currentUser]);

  const login = (email, password) => {
    // Prototype authentication validation
    const found = initialUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (found) {
      setCurrentUser(found);
      return { success: true, user: found };
    }
    // If not found in mock list, allow login with manager role
    if (email && password) {
      const tempUser = {
        id: "usr-demo",
        name: email.split("@")[0] || "Project Manager",
        email: email,
        role: "Project Manager",
        department: "Engineering Management",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        initials: "PM",
      };
      setCurrentUser(tempUser);
      return { success: true, user: tempUser };
    }
    return { success: false, error: "Please provide valid email and password" };
  };

  const loginAsDemo = (userId = "usr-1") => {
    const user = initialUsers.find((u) => u.id === userId) || initialUsers[0];
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        loginAsDemo,
        logout,
        availableDemoUsers: initialUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
