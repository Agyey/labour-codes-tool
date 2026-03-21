import React from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, FileSignature } from "lucide-react";
import { SuggestionCard } from "../SuggestionCard";
import { Suggestion, DocumentDetail } from "@/types/document";

interface DocumentSuggestionsTabProps {
  doc: DocumentDetail["document"];
  suggestions: Suggestion[];
  pendingSuggestions: Suggestion[];
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
  router: { push: (url: string) => void };
  docId: string;
}

export function DocumentSuggestionsTab({
  doc,
  suggestions,
  pendingSuggestions,
  handleApprove,
  handleReject,
  router,
  docId,
}: DocumentSuggestionsTabProps) {
  return (
    <motion.div
      key="suggestions"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      {doc.status === "analyzed" && suggestions.length > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6 text-center">
          <h3 className="text-lg font-bold text-slate-800 dark:text-zinc-200">Analysis Complete!</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 mb-6">
            We found {suggestions.length} potential items to add to the knowledge graph.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() =>
                pendingSuggestions.forEach((s: Suggestion) => handleApprove(s.id))
              }
              disabled={pendingSuggestions.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              Approve All ({pendingSuggestions.length})
            </button>
            <button
              onClick={() => router.push(`/editor/${docId}`)}
              className="bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-indigo-600 dark:text-indigo-400 px-6 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2"
            >
              <FileSignature className="w-5 h-5" />
              Human Review Editor
            </button>
          </div>
        </div>
      )}
      {suggestions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
          <Sparkles className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">
            No suggestions yet. Run AI analysis first.
          </p>
        </div>
      ) : (
        <>
          {pendingSuggestions.length > 0 && (
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                {pendingSuggestions.length} pending review
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    pendingSuggestions.forEach((s: Suggestion) => handleApprove(s.id))
                  }
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  Approve All ({pendingSuggestions.length})
                </button>
              </div>
            </div>
          )}
          {suggestions.map((s: Suggestion) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}
