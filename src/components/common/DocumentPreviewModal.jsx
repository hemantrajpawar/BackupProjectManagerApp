import React from "react";
import Modal from "./Modal";
import { FileText, FileSpreadsheet, FileCode, File, Download, ExternalLink } from "lucide-react";

export const DocumentPreviewModal = ({ doc, isOpen, onClose }) => {
  if (!doc) return null;

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FileText className="w-8 h-8 text-rose-500" />;
      case "xlsx":
        return <FileSpreadsheet className="w-8 h-8 text-emerald-500" />;
      case "json":
      case "md":
        return <FileCode className="w-8 h-8 text-blue-500" />;
      default:
        return <File className="w-8 h-8 text-indigo-500" />;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Project Document Preview"
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Demo preview environment • Simulated storage
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                alert(`Downloaded demo file: ${doc.name}`);
              }}
              className="px-3.5 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download File
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Document Header Card */}
        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-xs shrink-0">
            {getFileIcon(doc.type)}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
              {doc.name}
            </h4>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="uppercase font-semibold text-[11px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {doc.type}
              </span>
              <span>{doc.size || "1.2 MB"}</span>
              <span>Verified Clean</span>
            </div>
          </div>
        </div>

        {/* Simulated Document Preview Canvas */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px] pb-2 border-b border-slate-100 dark:border-slate-900">
            <span>PREVIEW CONTENT</span>
            <span>READ ONLY</span>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-800/80 font-sans text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {doc.previewContent || "No preview content available for this document."}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentPreviewModal;
