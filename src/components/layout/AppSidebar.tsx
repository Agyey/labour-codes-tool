"use client";

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { useFilter } from "@/context/FilterContext";
import { CODES } from "@/config/codes";
import { Pin, ChevronRight } from "lucide-react";

export function AppSidebar() {
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
    <aside className="w-56 flex-shrink-0 border-r border-gray-200 bg-white min-h-[calc(100vh-120px)] overflow-y-auto">
      <div className="p-3">
        <h3 className="text-xs font-bold mb-3" style={{ color: cObj.c }}>
          Chapters — {cObj.s}
        </h3>

        <button
          onClick={() => setFilter("chapter", "All")}
          className="w-full text-left px-2.5 py-1.5 rounded-md text-xs mb-0.5 transition-colors cursor-pointer hover:bg-gray-100"
        >
          All Chapters
        </button>

        {chapters.map(([ch, name]) => (
          <button
            key={ch}
            onClick={() => setFilter("chapter", ch)}
            className="w-full text-left px-2.5 py-1.5 rounded-md text-xs mb-0.5 transition-colors cursor-pointer hover:bg-gray-100"
          >
            <span className="font-medium">Ch {ch}:</span>{" "}
            <span className="text-gray-500">{name}</span>
          </button>
        ))}

        {/* Pinned */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
            <Pin className="w-3 h-3 text-amber-500" />
            Pinned
          </h4>
          {pinnedProvisions.length === 0 ? (
            <p className="text-[10px] text-gray-400">No pins yet</p>
          ) : (
            pinnedProvisions.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  setExpandedProvision(p.id);
                  setFilter("chapter", "All");
                }}
                className="w-full text-left px-2 py-1 rounded text-[10px] cursor-pointer hover:bg-gray-100 transition-colors block"
                style={{ color: cObj.c }}
              >
                <ChevronRight className="w-2.5 h-2.5 inline mr-0.5" />
                S.{p.sec}
                {p.sub} {p.title}
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
