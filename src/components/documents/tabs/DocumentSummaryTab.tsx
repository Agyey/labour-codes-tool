import React from "react";
import { motion } from "framer-motion";

interface DocumentSummaryTabProps {
  analysis: any;
}

export function DocumentSummaryTab({ analysis }: DocumentSummaryTabProps) {
  return (
    <motion.div
      key="summary"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6"
    >
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">
        AI Executive Summary
      </h3>
      <p className="text-slate-700 dark:text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap">
        {analysis?.summary || "No summary generated yet."}
      </p>
      {analysis?.document_type && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-2">
            Type:
          </span>
          <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
            {analysis.document_type}
          </span>
        </div>
      )}
    </motion.div>
  );
}
