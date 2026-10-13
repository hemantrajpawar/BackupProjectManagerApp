import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Calendar,
  Users,
  FileText,
  Plus,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Upload,
  Search,
} from "lucide-react";
import { useData } from "../../context/DataContext";
import { useAuth } from "../../context/AuthContext";

export const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { users, addProject, addDocument } = useData();
  const { currentUser } = useAuth();

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [ownerId, setOwnerId] = useState(currentUser?.id || "usr-1");
  const [status, setStatus] = useState("Not Started");
  const [visibility, setVisibility] = useState("Public");
  const [startDate, setStartDate] = useState("2026-10-15");
  const [plannedEndDate, setPlannedEndDate] = useState("2026-11-30");

  // Team multi-select
  const [selectedMemberIds, setSelectedMemberIds] = useState([
    currentUser?.id || "usr-1",
    "usr-2",
  ]);
  const [memberSearch, setMemberSearch] = useState("");
  const [memberDropdownOpen, setMemberDropdownOpen] = useState(false);
  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return users.slice(0, 8);
    return users.filter((u) => `${u.name} ${u.id} ${u.role}`.toLowerCase().includes(q)).slice(0, 8);
  }, [users, memberSearch]);

  // Documents state
  const [attachedDocs, setAttachedDocs] = useState([
    {
      id: "temp-doc-1",
      name: "Project_Charter_v1.0.pdf",
      type: "pdf",
      size: "1.4 MB",
      previewContent: "Executive initiative summary and high-level deliverables overview.",
    },
  ]);
  const [newDocName, setNewDocName] = useState("");
  const [newDocType, setNewDocType] = useState("pdf");

  // Error validation state
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Project name is required.";
    if (!startDate) errs.startDate = "Start date is required.";
    if (!plannedEndDate) errs.plannedEndDate = "Expected end date is required.";
    if (startDate && plannedEndDate && new Date(plannedEndDate) < new Date(startDate)) {
      errs.plannedEndDate = "End date cannot be earlier than start date.";
    }
    if (selectedMemberIds.length === 0) {
      errs.team = "At least one team member must be assigned.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleMemberToggle = (userId) => {
    if (selectedMemberIds.includes(userId)) {
      setSelectedMemberIds(selectedMemberIds.filter((id) => id !== userId));
    } else {
      setSelectedMemberIds([...selectedMemberIds, userId]);
    }
  };

  const handleAddDemoDoc = (e) => {
    e.preventDefault();
    if (!newDocName.trim()) return;
    const docObj = {
      id: `temp-${Date.now()}`,
      name: newDocName.trim(),
      type: newDocType,
      size: "850 KB",
      previewContent: `Attached specification document for ${name || "new initiative"}.`,
    };
    setAttachedDocs([...attachedDocs, docObj]);
    setNewDocName("");
  };

  const handleRemoveDoc = (docId) => {
    setAttachedDocs(attachedDocs.filter((d) => d.id !== docId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // 1. Create Documents in DataContext
    const createdDocIds = attachedDocs.map((d) => {
      const created = addDocument({
        name: d.name,
        type: d.type,
        size: d.size,
        previewContent: d.previewContent,
      });
      return created.id;
    });

    // 2. Create Project
    const newProj = addProject({
      name: name.trim(),
      description: description.trim(),
      ownerId,
      status,
      visibility,
      startDate,
      plannedEndDate,
      forecastEndDate: plannedEndDate, // initial forecast matches planned
      holdReasonId: null,
      teamMemberIds: selectedMemberIds,
      documentIds: createdDocIds,
    });

    // 3. Navigate directly to newly created project's dashboard!
    navigate(`/projects/${newProj.id}/dashboard`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/projects")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Projects</span>
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50/50">
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-600" />
            New Project
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure project details, schedule, team members, and documents.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8 text-xs">
          {/* Section A: Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                A
              </span>
              <h2 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Basic Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. NextGen Microservices Refactor"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden ${
                    errors.name
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-slate-200 dark:border-slate-700 focus:border-indigo-500"
                  }`}
                />
                {errors.name && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Project Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize high-level objectives, business outcomes, and key deliverables..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Project Owner / Lead PM
                </label>
                <select
                  value={ownerId}
                  onChange={(e) => setOwnerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-hidden"
                >
                  <option value="Public">Public (Accessible to organization)</option>
                  <option value="Private">Private (Assigned team only)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section B: Schedule */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                B
              </span>
              <h2 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Schedule & Milestones
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Planned Start Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-slate-900 dark:text-white focus:outline-hidden ${
                    errors.startDate
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-slate-200 dark:border-slate-700 focus:border-indigo-500"
                  }`}
                />
                {errors.startDate && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Expected Completion Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={plannedEndDate}
                  onChange={(e) => setPlannedEndDate(e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border rounded-xl text-slate-900 dark:text-white focus:outline-hidden ${
                    errors.plannedEndDate
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-slate-200 dark:border-slate-700 focus:border-indigo-500"
                  }`}
                />
                {errors.plannedEndDate && (
                  <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.plannedEndDate}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section C: Project Team */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center text-[10px]">
                  C
                </span>
                <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Team Members
                </h2>
              </div>
              <span className="text-xs font-semibold text-indigo-600">
                {selectedMemberIds.length} members assigned
              </span>
            </div>

            {/* Selected Member Chips */}
            <div className="flex flex-wrap gap-2 min-h-8 p-3 rounded-xl bg-slate-50 border border-slate-200">
              {selectedMemberIds.map((id) => {
                const u = users.find((usr) => usr.id === id);
                if (!u) return null;
                return (
                  <span
                    key={u.id}
                    className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-xs text-xs font-semibold text-slate-800"
                  >
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center">
                        {u.initials}
                      </span>
                    )}
                    <span>{u.name}</span>
                    <button
                      type="button"
                      onClick={() => handleMemberToggle(u.id)}
                      className="text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                );
              })}
            </div>
            {errors.team && (
              <p className="text-[11px] text-rose-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.team}
              </p>
            )}

            {/* Searchable employee picker: scales to large employee directories */}
            <div className="space-y-2">
              <label className="block text-[11px] text-slate-500 font-medium">Find an employee by name or employee ID</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="search"
                  value={memberSearch}
                  onFocus={() => setMemberDropdownOpen(true)}
                  onChange={(e) => { setMemberSearch(e.target.value); setMemberDropdownOpen(true); }}
                  onKeyDown={(e) => { if (e.key === "Escape") setMemberDropdownOpen(false); }}
                  placeholder="Search name, ID (e.g. usr-12), or role..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                />
                {memberDropdownOpen && (
                  <div className="absolute z-30 mt-1 w-full max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
                    {filteredMembers.length ? filteredMembers.map((u) => {
                      const isSelected = selectedMemberIds.includes(u.id);
                      return <button type="button" key={u.id} onClick={() => { if (!isSelected) handleMemberToggle(u.id); setMemberSearch(""); setMemberDropdownOpen(false); }} className="w-full px-3 py-2.5 flex items-center gap-3 text-left hover:bg-indigo-50 border-b border-slate-100 last:border-0">
                        {u.avatar ? <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" /> : <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">{u.initials}</span>}
                        <span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-slate-800 truncate">{u.name}</span><span className="block text-[10px] text-slate-500">{u.id} · {u.role}</span></span>
                        {isSelected ? <span className="text-[10px] font-semibold text-emerald-600">Added</span> : <Plus className="w-4 h-4 text-indigo-600" />}
                      </button>;
                    }) : <p className="px-3 py-4 text-xs text-slate-500 text-center">No employee matches that name or ID.</p>}
                  </div>
                )}
              </div>
              {memberDropdownOpen && <button type="button" className="text-[10px] text-slate-500 hover:text-indigo-600" onClick={() => setMemberDropdownOpen(false)}>Close employee results</button>}
            </div>
          </div>

          {/* Section D: Project Documents */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-[10px]">
                D
              </span>
              <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Documents
              </h2>
            </div>

            {/* Simulated file upload row */}
            <div className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <input
                type="text"
                placeholder="Document file name (e.g. Architecture_v1.pdf)"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                className="flex-1 w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden"
              />
              <select
                value={newDocType}
                onChange={(e) => setNewDocType(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden"
              >
                <option value="pdf">PDF Document</option>
                <option value="xlsx">Spreadsheet (.xlsx)</option>
                <option value="json">Contract (.json)</option>
                <option value="md">Markdown (.md)</option>
                <option value="fig">Design (.fig)</option>
              </select>
              <button
                type="button"
                onClick={handleAddDemoDoc}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Add Document</span>
              </button>
            </div>

            {/* List of assigned docs */}
            <div className="space-y-2">
              {attachedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white border border-slate-200 shadow-2xs min-w-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 truncate" title={doc.name}>
                    <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="font-semibold text-slate-900 truncate">
                      {doc.name}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 shrink-0">
                      {doc.type}
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0">{doc.size}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate("/projects")}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectPage;
