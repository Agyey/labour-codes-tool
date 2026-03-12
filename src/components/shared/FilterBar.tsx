"use client";

import { useApp } from "@/context/AppContext";
import { CODES } from "@/config/codes";
import {
  IMPACT_LEVELS,
  CHANGE_TAGS,
  WORKFLOW_TAGS,
} from "@/config/tags";
import { STATES } from "@/config/states";
import { RULE_AUTHORITIES } from "@/config/tags";
import { createBlankProvision } from "@/lib/utils";
import { Search, RotateCcw, Plus, Printer } from "lucide-react";

export function FilterBar() {
  const {
    activeCode,
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    resetFilters,
    canEdit,
    setEditingProvision,
    stats,
  } = useApp();

  const cObj = CODES[activeCode];

  // Get all chapters for the current code
  const { provisions } = useApp();
  const chapterMap: Record<string, string> = {};
  provisions
    .filter((x) => x.code === activeCode)
    .forEach((p) => {
      if (!chapterMap[p.ch]) chapterMap[p.ch] = p.chName;
    });
  const chapters = Object.entries(chapterMap);

  const hasActiveFilters =
    filters.impact !== "All" ||
    filters.changeTag !== "All" ||
    filters.workflowTag !== "All" ||
    filters.ruleAuthority !== "All" ||
    filters.state !== "All" ||
    filters.chapter !== "All" ||
    searchQuery.length > 0;

  return (
    <div className="space-y-3 mb-4">
      {/* Stats line */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
        <span>
          <b style={{ color: cObj.c }}>{cObj.secs}</b> sections
        </span>
        <span className="text-gray-300">·</span>
        <span>
          <b>{stats.totalProvisions}</b> mapped
        </span>
        <span className="text-gray-300">·</span>
        <span
          className={
            stats.verified === stats.totalProvisions && stats.totalProvisions > 0
              ? "text-emerald-600"
              : ""
          }
        >
          <b>{stats.verified}</b> verified
        </span>
        <span className="text-gray-300">·</span>
        <span>
          Compliance:{" "}
          <b className="text-emerald-500">{stats.compliant}✓</b>{" "}
          <b className="text-amber-500">{stats.inProgress}◑</b>{" "}
          <b className="text-gray-400">{stats.notStarted}○</b>
        </span>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[160px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search provisions, acts, sections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
          />
        </div>

        <select
          value={filters.impact}
          onChange={(e) => setFilter("impact", e.target.value)}
          className="px-2.5 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <option value="All">Impact</option>
          {IMPACT_LEVELS.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>

        <select
          value={filters.changeTag}
          onChange={(e) => setFilter("changeTag", e.target.value)}
          className="px-2.5 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <option value="All">Change Tag</option>
          {CHANGE_TAGS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={filters.workflowTag}
          onChange={(e) => setFilter("workflowTag", e.target.value)}
          className="px-2.5 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <option value="All">Workflow</option>
          {WORKFLOW_TAGS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select
          value={filters.ruleAuthority}
          onChange={(e) => setFilter("ruleAuthority", e.target.value)}
          className="px-2.5 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <option value="All">Authority</option>
          {RULE_AUTHORITIES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          value={filters.state}
          onChange={(e) => setFilter("state", e.target.value)}
          className="px-2.5 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <option value="All">State</option>
          {STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={filters.chapter}
          onChange={(e) => setFilter("chapter", e.target.value)}
          className="px-2.5 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
        >
          <option value="All">Chapter</option>
          {chapters.map(([ch, name]) => (
            <option key={ch} value={ch}>Ch {ch}: {name}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Reset filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}

        {canEdit && (
          <button
            onClick={() => setEditingProvision(createBlankProvision(activeCode))}
            className="flex items-center gap-1 px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Provision
          </button>
        )}

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1 px-2.5 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
