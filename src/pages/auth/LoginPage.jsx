import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Eye, EyeOff, LogIn, Sparkles, Shield, UserCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginAsDemo, availableDemoUsers } = useAuth();

  const [email, setEmail] = useState("alex.rivera@company.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);
      if (res.success) {
        navigate("/projects");
      } else {
        setError(res.error || "Authentication failed.");
      }
    }, 350);
  };

  const handleDemoLogin = (userId) => {
    setIsLoading(true);
    setTimeout(() => {
      loginAsDemo(userId);
      setIsLoading(false);
      navigate("/projects");
    }, 250);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-900 text-slate-100 relative overflow-hidden select-none">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-slate-950/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/30 text-white mb-1">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            ProjectManager<span className="text-indigo-400">App</span>
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Manager-First Project Control Platform. Monitor portfolios, forecast schedule delays, and resolve blockers.
          </p>
        </div>

        {/* Prototype Environment Notice */}
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800/50 text-[11px] text-indigo-300">
          <Shield className="w-4 h-4 shrink-0 text-indigo-400" />
          <span>Interactive Prototype Demo Environment (Local State)</span>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Work Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex.rivera@company.com"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? "Hide" : "Show"}</span>
              </button>
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? "Signing In..." : "Sign In to Control Center"}</span>
          </button>
        </form>

        {/* 1-Click Demo Profiles */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Quick Demo Entry
            </span>
            <span>No credentials required</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin("usr-1")}
              className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">
                  AR
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-indigo-400">
                    Alex Rivera (Lead Project Manager)
                  </p>
                  <p className="text-[10px] text-slate-400">Full portfolio oversight & Gantt control</p>
                </div>
              </div>
              <UserCheck className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin("usr-2")}
              className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-left transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                  SC
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-emerald-400">
                    Sarah Chen (Staff Frontend Architect)
                  </p>
                  <p className="text-[10px] text-slate-400">Project contributor & tech lead view</p>
                </div>
              </div>
              <UserCheck className="w-4 h-4 text-slate-500 group-hover:text-emerald-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
