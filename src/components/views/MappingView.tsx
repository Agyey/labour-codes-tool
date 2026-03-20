/* eslint-disable @typescript-eslint/no-unused-vars */
import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { useFilter } from "@/context/FilterContext";
import { CODES } from "@/config/codes";
import { FilterBar } from "@/components/shared/FilterBar";
import { ProvisionCard } from "@/components/provisions/ProvisionCard";
import { createBlankProvision } from "@/lib/utils";
import { Plus, BookOpen, Database, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { LibraryTable } from "@/components/library/LibraryTable";
import { injectSampleData } from "@/app/actions/provisions/write";
import toast from "react-hot-toast";
import { useState } from "react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { useRouter } from "next/navigation";

export function MappingView() {
  const router = useRouter();
  const { activeCode, setEditingProvision } = useUI();
  const { canEdit, frameworks } = useData();
  const { filteredProvisions } = useFilter();

  const cObj = CODES[activeCode as keyof typeof CODES] || {
    n: frameworks.find(f => f.shortName === activeCode || f.id === activeCode)?.name || activeCode,
    s: activeCode,
    c: "#6366f1",
    bg: "#f5f3ff"
  };

  const handleInjectMock = async () => {
    try {
      const framework = frameworks.find(f => f.shortName === activeCode || f.id === activeCode);
      if (!framework) {
        toast.error("Framework context not found");
        return;
      }
      const res = await injectSampleData(framework.id, activeCode);
      if (res.success) {
        toast.success("Injected the Private Placement Mock Provision!");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to inject mock");
      }
    } catch (e) {
      toast.error("Failed to inject mock");
    }
  };

  return (
    <div>
      <Breadcrumbs />
      
      <div className="flex items-center justify-between mb-4 mt-2">
        <div />
        {canEdit && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleInjectMock}
              className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 shadow-indigo-500/20"
            >
              <FileText className="w-4 h-4" />
              Inject Sample Data
            </button>
          </div>
        )}
      </div>
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
             <div className="flex gap-4 mt-2">
              <button
                onClick={() => setEditingProvision(createBlankProvision(activeCode))}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-sm font-bold hover:bg-slate-800 dark:hover:bg-zinc-100 transition-colors cursor-pointer shadow-md"
              >
                <Plus className="w-4 h-4" />
                Add Empty Provision
              </button>
              <button
                onClick={handleInjectMock}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors cursor-pointer shadow-lg shadow-indigo-500/20"
              >
                <FileText className="w-4 h-4" />
                Load Detailed Mock Data
              </button>
             </div>
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
