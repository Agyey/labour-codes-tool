"use client";

import { Layers, FilePlus, CalendarCheck, CheckCircle2 } from "lucide-react";

export function WorkspaceView() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-900/50 rounded-2xl border border-slate-200/60 dark:border-zinc-800/60 shadow-sm mt-4">
      <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/20 shadow-inner rounded-xl flex items-center justify-center mb-6 border border-indigo-100 dark:border-indigo-900">
        <Layers className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-zinc-100 mb-2">Active Deal Room</h2>
      <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-lg mx-auto mb-10">
        Drive the 13-stage Venture Capital & Private Equity transaction lifecycle. Assign lawyers, attach documents, and govern timelines.
      </p>

      <div className="w-full max-w-2xl text-left bg-slate-50 dark:bg-zinc-950 p-6 rounded-2xl border border-slate-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            Project Phoenix - Series A
          </h3>
          <span className="text-xs font-semibold text-slate-500 bg-white dark:bg-zinc-900 px-3 py-1 border border-slate-200 dark:border-zinc-800 rounded-full">
            Stage 3 of 13
          </span>
        </div>

        <div className="space-y-3">
          {/* Sample tasks to show intent */}
          <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300 line-through decoration-slate-400">1. Draft Non-Binding Term Sheet</span>
            </div>
            <img src="https://i.pravatar.cc/150?u=1" className="w-6 h-6 rounded-full border border-slate-200" alt="Avatar" />
          </div>

          <div className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border border-indigo-500 shadow-sm shadow-indigo-500/10 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-indigo-500"></div>
              <span className="text-sm font-bold text-slate-900 dark:text-zinc-100">2. Execute Legal Due Diligence Matrix</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
              <CalendarCheck className="w-3.5 h-3.5" /> Due Today
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-100/50 dark:bg-zinc-900/50 border border-slate-200 border-dashed dark:border-zinc-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-zinc-600 border-dashed"></div>
              <span className="text-sm font-semibold text-slate-400">3. Draft Share Subscription Agreement</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] uppercase font-bold tracking-widest rounded-lg border border-indigo-100 dark:border-indigo-900/50">
        Module Under Construction
      </div>
    </div>
  );
}
