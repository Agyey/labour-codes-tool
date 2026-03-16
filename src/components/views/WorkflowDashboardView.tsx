"use client";

import { LayoutDashboard, Users, Clock, ArrowRight } from "lucide-react";

export function WorkflowDashboardView() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-zinc-900/50 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm mt-4">
      <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
        <LayoutDashboard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-2">Firm Operations Overview</h2>
      <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-lg mx-auto mb-8">
        A global kanban board tracking every active deal room, timeline blocking, and firm-wide associate task distribution.
      </p>
      
      <div className="flex gap-4">
        <div className="px-5 py-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 text-left w-48">
          <Clock className="w-5 h-5 text-indigo-500 mb-3" />
          <div className="text-2xl font-bold text-slate-800 dark:text-zinc-100">14</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Active Deal Rooms</div>
        </div>
        <div className="px-5 py-4 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-100 dark:border-zinc-800 text-left w-48">
          <Users className="w-5 h-5 text-indigo-500 mb-3" />
          <div className="text-2xl font-bold text-slate-800 dark:text-zinc-100">112</div>
          <div className="text-xs font-semibold text-slate-500 mt-1">Pending Tasks</div>
        </div>
      </div>

      <button className="mt-8 flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all">
        Launch New Workspace <ArrowRight className="w-4 h-4" />
      </button>

      <div className="mt-6 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] uppercase font-bold tracking-widest rounded-lg border border-indigo-100 dark:border-indigo-900/50">
        Module Under Construction
      </div>
    </div>
  );
}
