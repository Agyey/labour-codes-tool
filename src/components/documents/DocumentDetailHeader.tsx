import { ArrowLeft, Loader2, Trash2, Ban, Brain } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { DocumentDetail } from "@/types/document";

interface Props {
  doc: DocumentDetail["document"];
  onBack: () => void;
  handleDelete: () => void;
  deleting: boolean;
  analyzing: boolean;
  handleCancel: () => void;
  handleAnalyze: () => void;
}

export function DocumentDetailHeader({ doc, onBack, handleDelete, deleting, analyzing, handleCancel, handleAnalyze }: Props) {
  return (
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-zinc-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{doc.name}</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">
            {doc.file_name} · {doc.page_count} pages · {(doc.file_size / 1024).toFixed(0)} KB
          </p>
        </div>
        <StatusBadge status={doc.status} />

        <button type="button" onClick={handleDelete} disabled={deleting} className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-30 group" title="Delete document">
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />}
        </button>

        {analyzing && (
           <button onClick={handleCancel} className="px-4 py-2.5 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-red-500/20 transition-all flex items-center gap-2">
             <Ban className="w-4 h-4" /> Cancel
           </button>
        )}

        {doc.status === "uploaded" && !analyzing && (
          <button onClick={handleAnalyze} className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-2xl hover:scale-105 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2">
            <Brain className="w-4 h-4" /> Analyze with AI
          </button>
        )}
      </div>
  );
}
