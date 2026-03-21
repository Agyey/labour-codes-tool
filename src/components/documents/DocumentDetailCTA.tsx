import { Brain, Sparkles } from "lucide-react";
import type { DocumentDetail } from "@/types/document";

interface Props {
  doc: DocumentDetail["document"];
  analysis: DocumentDetail["analysis"] | null;
  showStreamPanel: boolean;
  analyzing: boolean;
  handleAnalyze: () => void;
}
export function DocumentDetailCTA({ doc, analysis, showStreamPanel, analyzing, handleAnalyze }: Props) {
  if (!(doc.status === "uploaded" && !analysis && !showStreamPanel)) return null;
  return (
    <div className="text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/5 dark:to-purple-500/5 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-500/20">
      <Brain className="w-16 h-16 text-indigo-300 dark:text-indigo-500/50 mx-auto mb-4" />
      <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-300 mb-2">Document uploaded successfully</h3>
      <p className="text-sm text-slate-500 dark:text-zinc-500 mb-6 max-w-md mx-auto">
        Click below to analyze this document with AI. It will extract the full legal hierarchy, generate compliance suggestions, and build a vectorless RAG graph.
      </p>
      <button onClick={handleAnalyze} disabled={analyzing} className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-2xl hover:scale-105 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 mx-auto disabled:opacity-50">
        <Sparkles className="w-5 h-5" /> Analyze Document
      </button>
    </div>
  );
}
