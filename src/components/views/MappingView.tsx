"use client";

import { useApp } from "@/context/AppContext";
import { CODES } from "@/config/codes";
import { FilterBar } from "@/components/shared/FilterBar";
import { ProvisionCard } from "@/components/provisions/ProvisionCard";
import { createBlankProvision } from "@/lib/utils";
import { Plus, BookOpen } from "lucide-react";
import { useMemo } from "react";

export function MappingView() {
  const {
    activeCode,
    filteredProvisions,
    canEdit,
    setEditingProvision,
  } = useApp();

  const cObj = CODES[activeCode];

  // Group by chapter
  const chapters = useMemo(() => {
    const map: Record<string, { name: string; items: typeof filteredProvisions }> = {};
    filteredProvisions.forEach((p) => {
      if (!map[p.ch]) map[p.ch] = { name: p.chName, items: [] };
      map[p.ch].items.push(p);
    });
    return Object.entries(map).sort(
      ([a], [b]) => (parseInt(a) || 999) - (parseInt(b) || 999)
    );
  }, [filteredProvisions]);

  return (
    <div>
      <FilterBar />

      {chapters.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">
            No provisions mapped for {cObj.s} yet
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            {canEdit
              ? "Get started by adding your first provision."
              : "Switch to editor mode to add provisions."}
          </p>
          {canEdit && (
            <button
              onClick={() => setEditingProvision(createBlankProvision(activeCode))}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              Add First Provision
            </button>
          )}
        </div>
      )}

      {chapters.map(([chNum, ch]) => (
        <details key={chNum} open={chapters.length <= 5} className="mb-2">
          <summary
            className="py-2 text-sm font-bold cursor-pointer select-none flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 transition-colors"
            style={{ color: cObj.c }}
          >
            <span>
              Chapter {chNum}: {ch.name}
            </span>
            <span className="text-xs text-gray-400 font-normal">
              ({ch.items.length})
            </span>
          </summary>
          <div className="pl-1 pb-2">
            {ch.items.map((p) => (
              <ProvisionCard key={p.id} provision={p} />
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
