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
  Clock,
  AlertTriangle,
  GitCompare,
} from "lucide-react";

const VIEWS = [
  { id: "mapping", label: "Mapping", icon: Map },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "stateTracker", label: "States", icon: Globe },
  { id: "timeline", label: "Timeline", icon: Clock },
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

        {/* Code tabs */}
        <div className="flex items-center gap-2 py-1.5">
          {(Object.entries(CODES) as [CodeKey, typeof CODES[CodeKey]][]).map(
            ([key, code]) => (
              <button
                key={key}
                onClick={() => {
                  setActiveCode(key);
                  setExpandedProvision(null);
                  setFilter("chapter", "All");
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer border border-transparent ${
                  activeCode === key
                    ? "shadow-sm border-opacity-20"
                    : "text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
                style={
                  activeCode === key
                    ? {
                        borderColor: code.c,
                        color: code.c,
                        backgroundColor: `${code.c}20`,
                      }
                    : undefined
                }
              >
                {code.s}
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
