"use client";

import { Briefcase, BarChart3, AlertCircle } from "lucide-react";

export function DiligenceProductView() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-zinc-900/50 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm mt-4">
      <div className="w-16 h-16 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mb-6">
        <Briefcase className="w-8 h-8 text-amber-600 dark:text-amber-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-2">Due Diligence Checklist</h2>
      <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto mb-8">
        A 5-window investigation suite covering cap tables, corporate hygiene, penalty risks, and key business contracts.
      </p>
      
      <div className="flex gap-4">
        <div className="px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl text-left border border-slate-100 dark:border-zinc-800">
          <BarChart3 className="w-4 h-4 text-slate-400 mb-2" />
          <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">Cap Table Analytics</div>
          <div className="text-[10px] text-slate-500">Pre/post money tracking</div>
        </div>
        <div className="px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl text-left border border-slate-100 dark:border-zinc-800">
          <AlertCircle className="w-4 h-4 text-slate-400 mb-2" />
          <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">Hygiene Monitor</div>
          <div className="text-[10px] text-slate-500">Identify unfiled forms</div>
        </div>
      </div>

      <div className="mt-8 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-lg w-fit mx-auto border border-amber-100 dark:border-amber-900/50">
        Module Deployment In Progress
      </div>
    </div>
  );
}
