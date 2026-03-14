"use client";

import React from "react";
import { Search, Filter, X } from "lucide-react";

interface LibraryFilterProps {
  filter: string;
  setFilter: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  impactFilter: string;
  setImpactFilter: (val: string) => void;
}

export function LibraryFilter({ 
  filter, 
  setFilter, 
  typeFilter, 
  setTypeFilter,
  impactFilter, 
  setImpactFilter 
}: LibraryFilterProps) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Search by title, section, or content..."
          className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
        />
        {filter && (
          <button onClick={() => setFilter("")} className="absolute right-4 top-1/2 -translate-y-1/2">
            <X className="w-3 h-3 text-slate-400" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/50 px-3 py-2 rounded-xl border border-slate-100 dark:border-zinc-800">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select 
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-transparent text-xs font-bold outline-none cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="section">Sections</option>
            <option value="rule">Rules</option>
            <option value="form">Forms</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-800/50 px-3 py-2 rounded-xl border border-slate-100 dark:border-zinc-800">
          <select 
            value={impactFilter}
            onChange={e => setImpactFilter(e.target.value)}
            className="bg-transparent text-xs font-bold outline-none cursor-pointer"
          >
            <option value="all">Global Impact</option>
            <option value="High">High Impact</option>
            <option value="Medium">Medium Impact</option>
            <option value="Low">Low Impact</option>
          </select>
        </div>
      </div>
    </div>
  );
}
