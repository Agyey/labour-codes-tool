"use client";

import { ShieldCheck, CalendarClock, Target } from "lucide-react";

export function ComplianceProductView() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-zinc-900/50 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm mt-4">
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
        <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-2">Entity Compliance Tracker</h2>
      <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-md mx-auto mb-8">
        Map provisions to specific corporate entities and automate applicability checks, audit dates, and risk pipelines.
      </p>
      
      <div className="flex gap-4">
        <div className="px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl text-left border border-slate-100 dark:border-zinc-800">
          <CalendarClock className="w-4 h-4 text-slate-400 mb-2" />
          <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">Automated Audits</div>
          <div className="text-[10px] text-slate-500">Track upcoming deadlines</div>
        </div>
        <div className="px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl text-left border border-slate-100 dark:border-zinc-800">
          <Target className="w-4 h-4 text-slate-400 mb-2" />
          <div className="text-xs font-bold text-slate-700 dark:text-zinc-300">Applicability Engine</div>
          <div className="text-[10px] text-slate-500">Filter out irrelevant laws</div>
        </div>
      </div>

      <div className="mt-8 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg w-fit mx-auto border border-blue-100 dark:border-blue-900/50">
        Module Deployment In Progress
      </div>
    </div>
  );
}
