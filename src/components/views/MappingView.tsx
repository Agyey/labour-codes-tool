"use client";

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { useFilter } from "@/context/FilterContext";
import { CODES } from "@/config/codes";
import { FilterBar } from "@/components/shared/FilterBar";
import { ProvisionCard } from "@/components/provisions/ProvisionCard";
import { MappingSubNav } from "@/components/layout/MappingSubNav";
import { createBlankProvision } from "@/lib/utils";
import { Plus, BookOpen, Database } from "lucide-react";
import { motion } from "framer-motion";
import { LibraryTable } from "@/components/library/LibraryTable";

export function MappingView() {
  const { activeCode, setEditingProvision } = useUI();
  const { canEdit } = useData();
  const { filteredProvisions } = useFilter();

  const cObj = CODES[activeCode];

  return (
    <div>
      <MappingSubNav />
      <FilterBar />

      {filteredProvisions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm mt-4">
          <Database className="w-12 h-12 text-slate-300 dark:text-zinc-700 mb-4" />
          <h3 className="text-lg font-semibold text-slate-400 dark:text-zinc-500 mb-2">
            No provisions mapped for {cObj.s} yet
          </h3>
          <p className="text-sm text-slate-400 dark:text-zinc-500 mb-4">
            {canEdit
              ? "Get started by adding your first provision."
              : "Switch to editor mode to add provisions."}
          </p>
          {canEdit && (
            <button
              onClick={() => setEditingProvision(createBlankProvision(activeCode))}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              Add First Provision
            </button>
          )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <LibraryTable data={filteredProvisions} />
        </motion.div>
      )}
    </div>
  );
}
