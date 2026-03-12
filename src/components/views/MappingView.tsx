"use client";

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { useFilter } from "@/context/FilterContext";
import { CODES } from "@/config/codes";
import { FilterBar } from "@/components/shared/FilterBar";
import { ProvisionCard } from "@/components/provisions/ProvisionCard";
import { createBlankProvision } from "@/lib/utils";
import { Plus, BookOpen, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function MappingView() {
  const { activeCode, setEditingProvision } = useUI();
  const { canEdit } = useData();
  const { filteredProvisions } = useFilter();

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

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {chapters.map(([chNum, ch], i) => (
          <motion.details 
            key={chNum} 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            open={chapters.length <= 5} 
            className="group bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden 
                       [&_summary::-webkit-details-marker]:hidden"
          >
            <summary
              className="py-4 px-6 text-sm font-extrabold cursor-pointer select-none flex items-center gap-3 bg-slate-50/50 hover:bg-slate-100/60 transition-colors border-b border-transparent group-open:border-slate-100"
            >
              <div 
                className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] shadow-sm transform group-open:rotate-90 transition-transform duration-200"
                style={{ backgroundColor: cObj.c }}
              >
                <ChevronRight className="w-4 h-4" />
              </div>
              <span className="text-slate-900 tracking-tight">
                {ch.name} <span className="text-slate-400 font-medium ml-1">Chapter {chNum}</span>
              </span>
              <span className="ml-auto bg-slate-200 text-slate-600 font-semibold px-2 py-0.5 rounded-md text-[10px]">
                {ch.items.length} {ch.items.length === 1 ? 'Provision' : 'Provisions'}
              </span>
            </summary>
            
            <div className="p-4 bg-slate-50/30">
              <div className="space-y-4 pl-1 pb-2">
                {ch.items.map((p) => (
                  <ProvisionCard key={p.id} provision={p} />
                ))}
              </div>
            </div>
          </motion.details>
        ))}
      </motion.div>
    </div>
  );
}
