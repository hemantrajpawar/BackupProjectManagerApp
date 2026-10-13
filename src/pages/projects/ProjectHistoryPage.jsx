import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Activity, CheckCircle2, CircleDot, AlertCircle, CalendarDays, History, ArrowLeft } from "lucide-react";
import { useData } from "../../context/DataContext";

const formatDate = (value) => {
  if (!value) return "Date not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

export default function ProjectHistoryPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, tasks, issues } = useData();
  const project = projects.find((item) => item.id === projectId);

  const entries = useMemo(() => {
    if (!project) return [];
    const events = [];
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    const projectIssues = issues.filter((issue) => issue.projectId === project.id);
    const createdDate = project.createdAt || project.createdDate || project.startDate;
    events.push({
      id: `project-${project.id}`,
      date: createdDate || project.updatedAt || project.updatedDate || "",
      title: "Project created / registered",
      detail: `${project.name} was added to the project portfolio.`,
      type: "project",
      status: project.status || "Project",
    });
    projectTasks.forEach((task) => {
      const due = task.completedAt || task.completedDate || (task.status === "Completed" ? task.actualEndDate || task.plannedEndDate || task.forecastEndDate : null) || task.updatedAt || task.createdAt || task.startDate || task.plannedStartDate;
      events.push({
        id: `task-${task.id}`,
        date: due || "",
        title: task.status === "Completed" ? `Task completed: ${task.title}` : `Task: ${task.title}`,
        detail: `Status: ${task.status || "Not set"}${task.progress != null ? ` • ${task.progress}% complete` : ""}`,
        type: task.status === "Completed" ? "completed" : "task",
        status: task.status || "Task",
      });
    });
    projectIssues.forEach((issue) => {
      events.push({
        id: `issue-${issue.id}`,
        date: issue.resolvedDate || issue.updatedAt || issue.reportedDate || issue.createdAt || "",
        title: issue.status === "Resolved" ? `Issue resolved: ${issue.title}` : `Issue reported: ${issue.title}`,
        detail: `${issue.severity || "Normal"} priority • ${issue.status || "Open"}${issue.scheduleImpactDays ? ` • ${issue.scheduleImpactDays} schedule-impact day(s)` : ""}`,
        type: issue.status === "Resolved" ? "completed" : "issue",
        status: issue.status || "Issue",
      });
    });
    return events.sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });
  }, [project, tasks, issues]);

  if (!project) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center"><h2 className="font-semibold text-slate-900">Project not found</h2><button onClick={() => navigate("/projects")} className="mt-4 text-sm font-semibold text-indigo-600">Back to Projects</button></div>;

  const iconFor = (type) => {
    if (type === "completed") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    if (type === "issue") return <AlertCircle className="h-4 w-4 text-rose-600" />;
    if (type === "project") return <History className="h-4 w-4 text-indigo-600" />;
    return <CircleDot className="h-4 w-4 text-blue-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-indigo-50 p-3"><Activity className="h-5 w-5 text-indigo-600" /></div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Project History</h1>
            <p className="mt-1 text-sm text-slate-600">A chronological activity log for <span className="font-semibold text-slate-800">{project.name}</span>.</p>
          </div>
        </div>
        <button onClick={() => navigate(`/projects/${project.id}/issues`)} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"><ArrowLeft className="h-3.5 w-3.5" /> Back to Issues</button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-medium text-slate-500">Log entries</p><p className="mt-1 text-2xl font-bold text-slate-900">{entries.length}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-medium text-slate-500">Completed tasks</p><p className="mt-1 text-2xl font-bold text-emerald-600">{tasks.filter((t) => t.projectId === project.id && t.status === "Completed").length}</p></div>
        <div className="rounded-xl border border-slate-200 bg-white p-4"><p className="text-xs font-medium text-slate-500">Open issues</p><p className="mt-1 text-2xl font-bold text-rose-600">{issues.filter((i) => i.projectId === project.id && i.status !== "Resolved").length}</p></div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div><h2 className="text-sm font-bold text-slate-900">Activity log</h2><p className="mt-1 text-xs text-slate-500">Latest recorded project, task, and issue information first</p></div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{entries.length} entries</span>
        </div>
        {entries.length ? <div className="divide-y divide-slate-100">{entries.map((entry) => <div key={entry.id} className="flex gap-3 px-5 py-4 hover:bg-slate-50/80">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-50 ring-1 ring-slate-200">{iconFor(entry.type)}</div>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><p className="text-sm font-semibold text-slate-900">{entry.title}</p><span className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] text-slate-500"><CalendarDays className="h-3 w-3" />{formatDate(entry.date)}</span></div><p className="mt-1 text-xs leading-5 text-slate-600">{entry.detail}</p></div>
        </div>)}</div> : <div className="p-10 text-center text-sm text-slate-500">No history entries available yet.</div>}
      </section>
      <p className="text-[11px] leading-5 text-slate-500">Note: This prototype history is assembled from the project’s current task and issue records. A full audit log that records every edit with the exact actor and timestamp would require logging each change when it occurs.</p>
    </div>
  );
}
