import React, { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";

// Lazy load pages for fast bundle loading
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const ProjectPortfolioPage = lazy(() => import("../pages/projects/ProjectPortfolioPage"));
const CreateProjectPage = lazy(() => import("../pages/projects/CreateProjectPage"));
const ProjectDashboardPage = lazy(() => import("../pages/projects/ProjectDashboardPage"));
const ProjectTasksPage = lazy(() => import("../pages/projects/ProjectTasksPage"));
const ProjectTeamPage = lazy(() => import("../pages/projects/ProjectTeamPage"));
const ProjectIssuesPage = lazy(() => import("../pages/projects/ProjectIssuesPage"));
const ProjectHistoryPage = lazy(() => import("../pages/projects/ProjectHistoryPage"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));

const LoadingFallback = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
        Loading ProjectManagerApp...
      </span>
    </div>
  </div>
);

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Auth Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Workspace Shell */}
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/projects" replace />} />
            <Route path="/projects" element={<ProjectPortfolioPage />} />
            <Route path="/projects/new" element={<CreateProjectPage />} />
            <Route
              path="/projects/:projectId"
              element={<Navigate to="dashboard" replace />}
            />
            <Route
              path="/projects/:projectId/dashboard"
              element={<ProjectDashboardPage />}
            />
            <Route
              path="/projects/:projectId/tasks"
              element={<ProjectTasksPage />}
            />
            <Route
              path="/projects/:projectId/team"
              element={<ProjectTeamPage />}
            />
            <Route
              path="/projects/:projectId/issues"
              element={<ProjectIssuesPage />}
            />
            <Route
              path="/projects/:projectId/history"
              element={<ProjectHistoryPage />}
            />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
