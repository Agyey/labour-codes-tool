"use client";

import { FileText, Wand2, Database } from "lucide-react";

export function AgreementsProductView() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-zinc-900/50 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm mt-4">
      <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-6">
        <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-2">Modular Contract Drafting</h2>
      <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto mb-8">
        Upload firm templates, identify variables, and generate automated guided intake forms for junior associates.
      </p>
      
      <div className="flex gap-4">
        <div className="px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl text-left border border-slate-100 dark:border-zinc-800">
          <Wand2 className="w-4 h-4 text-slate-400 mb-2" />
          <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">Template Logic</div>
          <div className="text-[10px] text-slate-500">Auto-extract variables</div>
        </div>
        <div className="px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl text-left border border-slate-100 dark:border-zinc-800">
          <Database className="w-4 h-4 text-slate-400 mb-2" />
          <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">Doc Generation</div>
          <div className="text-[10px] text-slate-500">Merge forms to PDF/Docx</div>
        </div>
      </div>

      <div className="mt-8 px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-xs font-bold rounded-lg w-fit mx-auto border border-purple-100 dark:border-purple-900/50">
        Module Deployment In Progress
      </div>
    </div>
  );
}
