"use client";

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { useFilter } from "@/context/FilterContext";
import { CODES } from "@/config/codes";
import { Pin, ChevronRight } from "lucide-react";

export function MappingSubNav() {
  const { activeCode, setExpandedProvision } = useUI();
  const { provisions } = useData();
  const { setFilter } = useFilter();

  const cObj = CODES[activeCode];

  // Chapters for current code
  const chapterMap: Record<string, string> = {};
  provisions
    .filter((x) => x.code === activeCode)
    .forEach((p) => {
      if (!chapterMap[p.ch]) chapterMap[p.ch] = p.chName;
    });
  const chapters = Object.entries(chapterMap);

  const pinnedProvisions = provisions.filter(
    (x) => x.code === activeCode && x.pinned
  );

  return (
    <div className="p-3 bg-white/50 dark:bg-zinc-900/50 rounded-xl border border-slate-200 dark:border-zinc-800 mb-4 mr-4">
      <h3 className="text-xs font-bold mb-3 dark:opacity-90 flex items-center gap-2" style={{ color: cObj.c }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cObj.c }} />
        Quick Jump — {cObj.s}
      </h3>

      <div className="flex flex-wrap gap-1.5 mb-2">
        <button
          onClick={() => setFilter("chapter", "All")}
          className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:text-zinc-300"
        >
          All Chapters
        </button>

        {chapters.map(([ch, name]) => (
          <button
            key={ch}
            onClick={() => setFilter("chapter", ch)}
            className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 group"
          >
            <span className="font-bold text-slate-700 dark:text-zinc-200">Ch {ch}:</span>{" "}
            <span className="text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-zinc-200">{name}</span>
          </button>
        ))}
      </div>

      {/* Pinned provisions inline list */}
      {pinnedProvisions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-800/80 flex flex-wrap items-center gap-2">
          <h4 className="text-[10px] font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
            <Pin className="w-3 h-3 text-amber-500" />
            Pinned:
          </h4>
          {pinnedProvisions.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setExpandedProvision(p.id);
                setFilter("chapter", "All");
              }}
              className="px-2 py-0.5 rounded text-[10px] font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-zinc-700 flex items-center"
              style={{ color: cObj.c }}
            >
              S.{p.sec}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
