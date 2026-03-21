"use client";

import { motion } from "framer-motion";
import { 
  FileText, 
  ChevronRight, 
  Trash2,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock
} from "lucide-react";

export interface IngestJob {
  id: string; // Document ID
  job_id: string;
  name: string;
  file_name: string;
  file_size: number;
  page_count: number;
  status: "uploaded" | "processing" | "analyzed" | "failed";
  uploaded_at: string;
}

interface IngestJobCardProps {
  job: IngestJob;
  onClick: (id: string, isJob: boolean) => void;
  onDelete: (e: React.MouseEvent, docId: string, name: string) => void;
}

export function IngestJobCard({ job, onClick, onDelete }: IngestJobCardProps) {
  const isProcessing = job.status === "processing";
  const isFailed = job.status === "failed";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick(isProcessing ? job.job_id : job.id, isProcessing)}
      className={`group flex flex-col md:flex-row md:items-center gap-4 p-5 bg-white dark:bg-zinc-900 rounded-3xl border transition-all cursor-pointer ${
        isProcessing ? "border-indigo-200 dark:border-indigo-500/30 shadow-md shadow-indigo-500/5 relative overflow-hidden" 
        : isFailed ? "border-red-200 dark:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5"
        : "border-slate-200 dark:border-zinc-800 hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-200 dark:hover:border-indigo-500/30"
      }`}
    >
      {/* Animated processing background border effect */}
      {isProcessing && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse" />
      )}

      {/* Icon */}
      <div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 flex-shrink-0 ${
        isProcessing ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
        : isFailed ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
        : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      }`}>
        <FileText className="w-6 h-6" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-slate-800 dark:text-zinc-200 truncate">{job.name}</h3>
        <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 flex items-center gap-2">
          {job.page_count} pages • {(job.file_size / 1024).toFixed(0)} KB
          {job.uploaded_at && (
            <>
              <span>•</span>
              <Clock className="w-3 h-3" />
              <span>{new Date(job.uploaded_at).toLocaleDateString()}</span>
            </>
          )}
        </p>
      </div>

      {/* Status Badge */}
      <div className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
        isProcessing ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
        : isFailed ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
      }`}>
        {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : isFailed ? <XCircle className="w-3.5 h-3.5" />
        : <CheckCircle2 className="w-3.5 h-3.5" />}
        {isProcessing ? "Pipeline Running" : job.status}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 md:pl-4 md:border-l border-slate-100 dark:border-zinc-800">
        {true && (
          <button
            type="button"
            onClick={(e) => onDelete(e, job.id, job.name)}
            className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all md:opacity-0 group-hover:opacity-100"
            title="Delete document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <div className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-zinc-800/50 rounded-xl group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/20 transition-colors">
          <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isProcessing ? "group-hover:text-indigo-500 group-hover:translate-x-1" : "group-hover:text-emerald-500 group-hover:translate-x-1"}`} />
        </div>
      </div>
    </motion.div>
  );
}
