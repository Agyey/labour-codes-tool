"use client";

import { useData } from "@/context/DataContext";
import { FolderKanban, Scale, ChevronDown } from "lucide-react";
import { Provision } from "@/types/provision";

interface HierarchyConnectorsProps {
  form: Provision;
  update: <K extends keyof Provision>(key: K, val: Provision[K]) => void;
  labelCls: string;
  sectionCls: string;
}

export function HierarchyConnectors({ form, update, labelCls, sectionCls }: HierarchyConnectorsProps) {
  const { frameworks, legislations } = useData();

  const selectedFramework = frameworks.find(f => f.id === form.frameworkId);
  const relevantLegislations = legislations.filter(l => l.frameworkId === form.frameworkId);

  return (
    <div className={sectionCls}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
           <FolderKanban className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-zinc-200">Hierarchical Placement</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className={labelCls}>Target Framework (Bucket)</label>
          <div className="relative">
            <select
              value={form.frameworkId || ""}
              onChange={(e) => {
                const fid = e.target.value;
                update("frameworkId", fid || undefined);
                // Clear legislation if it doesn't belong to the new framework
                const leg = legislations.find(l => l.id === form.legislationId);
                if (leg && leg.frameworkId !== fid) {
                  update("legislationId", undefined);
                }
              }}
              className="w-full appearance-none p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer pr-10"
            >
              <option value="">Select Bucket...</option>
              {frameworks.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className={labelCls}>Legislative Tile</label>
          <div className="relative">
            <select
              value={form.legislationId || ""}
              onChange={(e) => update("legislationId", e.target.value)}
              disabled={!form.frameworkId}
              className="w-full appearance-none p-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer pr-10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Select Legislation...</option>
              {relevantLegislations.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {selectedFramework && (
        <div className="mt-4 p-4 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-[24px] border border-indigo-100 dark:border-indigo-500/10 flex items-center gap-4">
           <div 
             className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/20"
             style={{ backgroundColor: '#6366f1' }}
           >
              <Scale className="w-5 h-5" />
           </div>
           <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Contextual Awareness</p>
              <p className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                This provision will be mapped to the <span className="text-slate-900 dark:text-white">{selectedFramework.name}</span> framework cluster.
              </p>
           </div>
        </div>
      )}
    </div>
  );
}
