import React, { createContext, useContext, useState, useEffect } from "react";
import initialProjects from "../data/projects.json";
import initialTasks from "../data/tasks.json";
import initialUsers from "../data/users.json";
import initialIssues from "../data/issues.json";
import initialHoldReasons from "../data/holdReasons.json";
import initialDocuments from "../data/documents.json";
import { calculateDelayDays, isOverdue } from "../utils/dateUtils";

const DataContext = createContext(null);

const STORAGE_KEYS = {
  PROJECTS: "pma_projects",
  TASKS: "pma_tasks",
  ISSUES: "pma_issues",
  DOCUMENTS: "pma_documents",
};

export const DataProvider = ({ children }) => {
  const [projects, setProjects] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      return saved ? JSON.parse(saved) : initialProjects;
    } catch {
      return initialProjects;
    }
  });

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [users] = useState(initialUsers);
  const [holdReasons] = useState(initialHoldReasons);

  const [issues, setIssues] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ISSUES);
      return saved ? JSON.parse(saved) : initialIssues;
    } catch {
      return initialIssues;
    }
  });

  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      return saved ? JSON.parse(saved) : initialDocuments;
    } catch {
      return initialDocuments;
    }
  });

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ISSUES, JSON.stringify(issues));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }, [issues]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }, [documents]);

  // Resolvers & Selectors
  const getUserById = (userId) => users.find((u) => u.id === userId) || null;
  const getHoldReasonById = (reasonId) => holdReasons.find((r) => r.id === reasonId) || null;
  const getDocumentById = (docId) => documents.find((d) => d.id === docId) || null;
  const getIssueById = (issueId) => issues.find((i) => i.id === issueId) || null;

  const getProjectTasks = (projectId) => {
    return tasks.filter((t) => t.projectId === projectId);
  };

  const getProjectIssues = (projectId) => {
    return issues.filter((i) => i.projectId === projectId);
  };

  const getProjectDocuments = (projectId) => {
    return documents.filter((d) => d.relatedProjectId === projectId);
  };

  const getProjectTeam = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return [];
    return project.teamMemberIds
      .map((id) => getUserById(id))
      .filter(Boolean);
  };

  /**
   * Project Calculated Metrics:
   * Progress % = average progress across tasks (or completed / total)
   * Active team members = members who have at least one In Progress task
   * Overdue tasks count
   */
  const getProjectMetrics = (projectId) => {
    const projectTasks = getProjectTasks(projectId);
    const projectIssues = getProjectIssues(projectId);
    const teamMembers = getProjectTeam(projectId);

    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter((t) => t.status === "Completed").length;
    const inProgressTasks = projectTasks.filter((t) => t.status === "In Progress").length;
    const onHoldTasks = projectTasks.filter((t) => t.status === "On Hold").length;

    // Overdue tasks: today > plannedEndDate and not completed
    const overdueTasks = projectTasks.filter((t) => isOverdue(t.plannedEndDate, t.status)).length;

    // Completion percentage:
    // If tasks exist, calculate sum(progress) / totalTasks
    const overallProgress = totalTasks > 0
      ? Math.round(projectTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / totalTasks)
      : 0;

    // Active members: members assigned to at least one In Progress task
    const activeMemberIds = new Set();
    projectTasks
      .filter((t) => t.status === "In Progress")
      .forEach((t) => {
        (t.assigneeIds || []).forEach((id) => activeMemberIds.add(id));
      });

    const activeTeamCount = activeMemberIds.size;
    const totalTeamCount = teamMembers.length;

    // Issues metrics
    const openIssues = projectIssues.filter((i) => i.status !== "Resolved").length;
    const criticalIssues = projectIssues.filter(
      (i) => i.status !== "Resolved" && (i.severity === "Critical" || i.severity === "High")
    ).length;
    const scheduleImpactingIssues = projectIssues.filter(
      (i) => i.status !== "Resolved" && i.scheduleImpactDays > 0
    ).length;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      onHoldTasks,
      overdueTasks,
      overallProgress,
      activeTeamCount,
      totalTeamCount,
      openIssues,
      criticalIssues,
      scheduleImpactingIssues,
    };
  };

  /**
   * User metrics within a project or overall
   */
  const getUserWorkload = (userId, projectId = null) => {
    let relevantTasks = tasks.filter((t) => (t.assigneeIds || []).includes(userId));
    if (projectId) {
      relevantTasks = relevantTasks.filter((t) => t.projectId === projectId);
    }

    const assignedCount = relevantTasks.length;
    const completedCount = relevantTasks.filter((t) => t.status === "Completed").length;
    const inProgressCount = relevantTasks.filter((t) => t.status === "In Progress").length;
    const overdueCount = relevantTasks.filter((t) => isOverdue(t.plannedEndDate, t.status)).length;

    // Completion %
    const completionPct = assignedCount > 0
      ? Math.round((completedCount / assignedCount) * 100)
      : 0;

    // Workload %: in-progress tasks as proportion of max standard active load (e.g., 4 tasks = 100%)
    const workloadPct = Math.min(100, Math.round((inProgressCount / 3) * 100));

    // Linked blockers / issues affecting user's tasks
    const userTaskIds = new Set(relevantTasks.map((t) => t.id));
    const linkedBlockers = issues.filter(
      (i) => i.status !== "Resolved" && userTaskIds.has(i.taskId)
    );

    return {
      assignedCount,
      completedCount,
      inProgressCount,
      overdueCount,
      completionPct,
      workloadPct,
      linkedBlockers,
      tasks: relevantTasks,
    };
  };

  // Mutators
  const addProject = (newProject) => {
    const id = `proj-${Date.now().toString().slice(-4)}`;
    const created = {
      id,
      ...newProject,
      taskIds: newProject.taskIds || [],
      documentIds: newProject.documentIds || [],
    };
    setProjects((prev) => [created, ...prev]);
    return created;
  };

  const updateProject = (projectId, updates) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
    );
  };

  const addTask = (newTask) => {
    const id = newTask.parentTaskId
      ? `sub-${Date.now().toString().slice(-4)}`
      : `task-${Date.now().toString().slice(-4)}`;
    const created = {
      id,
      ...newTask,
      issueIds: newTask.issueIds || [],
      documentIds: newTask.documentIds || [],
      dependencyIds: newTask.dependencyIds || [],
      progress: Number(newTask.progress || 0),
    };

    setTasks((prev) => [...prev, created]);

    // If top-level, add to project.taskIds
    if (!created.parentTaskId && created.projectId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === created.projectId
            ? { ...p, taskIds: [...(p.taskIds || []), created.id] }
            : p
        )
      );
    }

    return created;
  };

  const updateTask = (taskId, updates) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t))
    );
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId && t.parentTaskId !== taskId));
    setProjects((prev) =>
      prev.map((p) => ({
        ...p,
        taskIds: (p.taskIds || []).filter((id) => id !== taskId),
      }))
    );
  };

  const addIssue = (newIssue) => {
    const id = `iss-${Date.now().toString().slice(-4)}`;
    const created = {
      id,
      reportedDate: new Date().toISOString().split("T")[0],
      status: "Open",
      scheduleImpactDays: Number(newIssue.scheduleImpactDays || 0),
      ...newIssue,
    };

    setIssues((prev) => [created, ...prev]);

    // Link issue to task if taskId provided
    if (created.taskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === created.taskId
            ? { ...t, issueIds: Array.from(new Set([...(t.issueIds || []), id])) }
            : t
        )
      );
    }

    return created;
  };

  const updateIssue = (issueId, updates) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, ...updates } : i))
    );
  };

  const resolveIssue = (issueId, resolutionNote = "") => {
    setIssues((prev) =>
      prev.map((i) =>
        i.id === issueId
          ? {
              ...i,
              status: "Resolved",
              resolutionNote: resolutionNote || i.resolutionNote || "Resolved and verified in demo.",
              scheduleImpactDays: 0,
            }
          : i
      )
    );
  };

  const addDocument = (newDoc) => {
    const id = `doc-${Date.now().toString().slice(-4)}`;
    const created = {
      id,
      ...newDoc,
    };
    setDocuments((prev) => [...prev, created]);

    if (created.relatedProjectId) {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === created.relatedProjectId
            ? { ...p, documentIds: Array.from(new Set([...(p.documentIds || []), id])) }
            : p
        )
      );
    }
    return created;
  };

  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEYS.PROJECTS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.ISSUES);
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    setProjects(initialProjects);
    setTasks(initialTasks);
    setIssues(initialIssues);
    setDocuments(initialDocuments);
  };

  return (
    <DataContext.Provider
      value={{
        projects,
        tasks,
        users,
        issues,
        holdReasons,
        documents,
        getUserById,
        getHoldReasonById,
        getDocumentById,
        getIssueById,
        getProjectTasks,
        getProjectIssues,
        getProjectDocuments,
        getProjectTeam,
        getProjectMetrics,
        getUserWorkload,
        addProject,
        updateProject,
        addTask,
        updateTask,
        deleteTask,
        addIssue,
        updateIssue,
        resolveIssue,
        addDocument,
        resetToDefaults,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
