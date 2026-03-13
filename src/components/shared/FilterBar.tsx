"use client";

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { useFilter } from "@/context/FilterContext";
import { CODES } from "@/config/codes";
import {
  IMPACT_LEVELS,
  CHANGE_TAGS,
  WORKFLOW_TAGS,
} from "@/config/tags";
import { STATES } from "@/config/states";
import { createBlankProvision } from "@/lib/utils";
import { Search, RotateCcw, Plus, Printer } from "lucide-react";

export function FilterBar() {
  const { activeCode, setEditingProvision } = useUI();
  const { canEdit, stats } = useData();
  const { searchQuery, setSearchQuery, filters, setFilter, resetFilters } = useFilter();

  const cObj = CODES[activeCode];

  const hasActiveFilters =
    filters.impact !== "All" ||
    filters.changeTag !== "All" ||
    filters.workflowTag !== "All" ||
    filters.state !== "All" ||
    searchQuery.length > 0;

  return (
    <div className="space-y-4 mb-8">
      {/* Top Header info with glass pill */}
      <div className="flex items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3 py-1.5 px-3 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md rounded-2xl border border-white/60 dark:border-zinc-800/60 shadow-premium-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: cObj.c }} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">{cObj.secs} Sections</span>
          </div>
          <div className="w-px h-3 bg-slate-200 dark:bg-zinc-800" />
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-zinc-400">{stats.totalProvisions} Mapped</span>
          </div>
          <div className="w-px h-3 bg-slate-200 dark:bg-zinc-800" />
          <div className="flex items-center gap-2">
            <div className="flex items-center -space-x-1">
              <span className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-md text-[9px] font-black border border-emerald-200/50 dark:border-emerald-900/50">{stats.compliant} OK</span>
              <span className="bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-md text-[9px] font-black border border-amber-200/50 dark:border-amber-900/50">{stats.inProgress} ACT</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => setEditingProvision(createBlankProvision(activeCode))}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-white transition-all cursor-pointer shadow-lg shadow-slate-900/10 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              New Provision
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="p-2 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md text-slate-600 dark:text-zinc-400 rounded-xl border border-white/80 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Filter Bar */}
      <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl p-2 rounded-[24px] border border-white/60 dark:border-zinc-800 shadow-premium flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-zinc-100 transition-colors" />
          <input
            type="text"
            placeholder="Search legal provisions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/80 dark:bg-zinc-900/80 border border-white/40 dark:border-zinc-800 rounded-[18px] text-sm font-medium text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-4 focus:ring-slate-900/5 dark:focus:ring-zinc-100/5 focus:border-slate-200 dark:focus:border-zinc-700 transition-all shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <select
            value={filters.impact}
            onChange={(e) => setFilter("impact", e.target.value)}
            className="px-3 py-2.5 bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800 rounded-[18px] text-xs font-bold text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all"
          >
            <option value="All" className="bg-white dark:bg-slate-900">Impact</option>
            {IMPACT_LEVELS.map((i) => (
              <option key={i} value={i} className="bg-white dark:bg-slate-900">{i}</option>
            ))}
          </select>

          <select
            value={filters.changeTag}
            onChange={(e) => setFilter("changeTag", e.target.value)}
            className="px-3 py-2.5 bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800 rounded-[18px] text-xs font-bold text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all"
          >
            <option value="All" className="bg-white dark:bg-slate-900">Changes</option>
            {CHANGE_TAGS.map((t) => (
              <option key={t} value={t} className="bg-white dark:bg-slate-900">{t}</option>
            ))}
          </select>

          <select
            value={filters.workflowTag}
            onChange={(e) => setFilter("workflowTag", e.target.value)}
            className="px-3 py-2.5 bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800 rounded-[18px] text-xs font-bold text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all"
          >
            <option value="All" className="bg-white dark:bg-slate-900">Workflow</option>
            {WORKFLOW_TAGS.map((t) => (
              <option key={t} value={t} className="bg-white dark:bg-slate-900">{t}</option>
            ))}
          </select>

          <select
            value={filters.state}
            onChange={(e) => setFilter("state", e.target.value)}
            className="px-3 py-2.5 bg-white/60 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800 rounded-[18px] text-xs font-bold text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-900/5 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-all"
          >
            <option value="All" className="bg-white dark:bg-slate-900">State</option>
            {STATES.map((s) => (
              <option key={s} value={s} className="bg-white dark:bg-slate-900">{s}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="p-2.5 bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-[18px] border border-rose-100 dark:border-rose-900 transition-all active:scale-90"
              title="Reset filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
