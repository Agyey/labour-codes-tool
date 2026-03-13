"use client";

import { useUI } from "@/context/UIContext";
import { useFilter } from "@/context/FilterContext";
import { useLegalOS } from "@/context/LegalOSContext";
import { CODES } from "@/config/codes";
import type { CodeKey } from "@/types/code";
import {
  LayoutDashboard,
  Map,
  Globe,
  AlertTriangle,
  History,
  GitCompare
} from "lucide-react";

const VIEWS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "mapping", label: "Mapping", icon: Map },
  { id: "timeline", label: "Timeline", icon: History },
  { id: "penalties", label: "Penalties", icon: AlertTriangle },
  { id: "compare", label: "Compare", icon: GitCompare },
] as const;

export function AppNavigation() {
  const {
    activeView,
    setActiveView,
    activeCode,
    setActiveCode,
    setExpandedProvision,
  } = useUI();
  const { setFilter } = useFilter();
  const { activeProduct } = useLegalOS();

  if (activeProduct !== "MAPPING") {
    return null;
  }

  return (
    <nav className="sticky top-[73px] z-40 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md border-b border-slate-200/60 dark:border-zinc-800/60 shadow-sm transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto flex items-center overflow-x-auto px-4">
        {/* View tabs */}
        <div className="flex items-center gap-1 py-1.5">
          {VIEWS.map((v) => {
            const Icon = v.icon;
            return (
              <button
                key={v.id}
                onClick={() => setActiveView(v.id as typeof activeView)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeView === v.id
                    ? "bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md shadow-slate-900/10 dark:shadow-none"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {v.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        {/* Code Select Dropdown */}
        <div className="flex items-center gap-2 py-1.5 relative w-64">
          <select
            value={activeCode}
            onChange={(e) => {
              setActiveCode(e.target.value as typeof activeCode);
              setExpandedProvision(null);
              setFilter("chapter", "All");
            }}
            className="w-full appearance-none px-4 py-2 pr-10 text-sm font-bold rounded-xl bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/50 shadow-sm transition-all"
          >
            {(Object.entries(CODES) as [CodeKey, typeof CODES[CodeKey]][]).map(
              ([key, code]) => (
                <option key={key} value={key} className="font-medium text-slate-700 dark:text-zinc-200">
                  {code.n}
                </option>
              )
            )}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </nav>
  );
}
