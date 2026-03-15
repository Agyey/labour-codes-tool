"use client";

import { useData } from "@/context/DataContext";
import { useUI } from "@/context/UIContext";
import { LegislationTile } from "./LegislationTile";
import { ArrowLeft, Plus, LayoutGrid, Info, AlertCircle, Pencil } from "lucide-react";
import { Breadcrumbs } from "../shared/Breadcrumbs";
import { useMemo, useState } from "react";
import { LegislationModal } from "./LegislationModal";
import { FrameworkModal } from "./FrameworkModal";
import { Legislation } from "@/types/provision";
import toast from "react-hot-toast";

export function BucketExplorer() {
  const { activeCode, setActiveView, setActiveCode } = useUI();
  const { frameworks, legislations, provisions, deleteLegislation, canEdit } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFwModalOpen, setIsFwModalOpen] = useState(false);
  const [editingLeg, setEditingLeg] = useState<Legislation | null>(null);

  const framework = useMemo(() => 
    frameworks.find(f => f.shortName === activeCode || f.id === activeCode),
  [frameworks, activeCode]);

  const bucketLegislations = useMemo(() => {
    if (!framework) return [];
    return legislations.filter(l => l.frameworkId === framework.id);
  }, [legislations, framework]);

  if (!framework) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold">Bucket Not Found</h2>
        <button onClick={() => setActiveView('dashboard')} className="mt-4 text-indigo-600 font-bold">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
      <Breadcrumbs />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{framework.name}</h2>
              {canEdit && (
                <button 
                  title="Edit Framework Metadata"
                  className="p-2 text-slate-300 hover:text-indigo-500 transition-colors"
                  onClick={() => setIsFwModalOpen(true)}
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Legislation Bucket • {framework.shortName}</p>
          </div>
        </div>

        {canEdit && (
          <button 
            onClick={() => { setEditingLeg(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-xl"
          >
            <Plus className="w-4 h-4" /> Add Legislation
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" /> Core Legislations & Rules
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bucketLegislations.map(leg => (
              <LegislationTile 
                key={leg.id}
                legislation={leg}
                onSelect={() => {
                   setActiveCode(leg.shortName as any || leg.id);
                   setActiveView('mapping');
                }}
                onDelete={() => deleteLegislation(leg.id)}
                canEdit={canEdit}
              />
            ))}
            
            {canEdit && (
              <button 
                onClick={() => { setEditingLeg(null); setIsModalOpen(true); }}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[32px] hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-indigo-50/10 transition-all group"
              >
                <Plus className="w-8 h-8 text-slate-300 dark:text-zinc-700 group-hover:text-indigo-500 mb-2" />
                <span className="text-xs font-black text-slate-400 dark:text-zinc-600 uppercase tracking-widest group-hover:text-indigo-500 text-center">
                  New Act/Rule Tile
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
           <div className="p-8 bg-indigo-600 rounded-[40px] text-white shadow-2xl shadow-indigo-600/20 relative overflow-hidden">
              <div className="absolute -top-4 -right-4 opacity-10">
                <Info className="w-32 h-32" />
              </div>
              <h4 className="text-xl font-black mb-4">Bucket Insights</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/10 p-4 rounded-3xl backdrop-blur-sm">
                   <span className="text-xs font-bold uppercase tracking-widest opacity-70">Total Provisions</span>
                   <span className="text-xl font-black">
                     {legislations.filter(l => l.frameworkId === framework.id).reduce((acc, l) => acc + ((l as any).provisions?.length || 0), 0)}
                   </span>
                </div>
                <div className="flex justify-between items-center bg-white/10 p-4 rounded-3xl backdrop-blur-sm">
                   <span className="text-xs font-bold uppercase tracking-widest opacity-70">Regulatory Authority</span>
                   <span className="text-sm font-bold">
                     {provisions.find(p => p.frameworkId === framework.id)?.ruleAuth || "Central Govt"}
                   </span>
                </div>
              </div>
           </div>

            <div className="p-8 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-[40px] shadow-sm">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Transition History</h4>
              <p className="text-xs text-slate-500 dark:text-zinc-500 font-medium leading-relaxed">
                This bucket tracks the transition to the unified {framework.name}. 
                {framework.description && <span className="block mt-2">{framework.description}</span>}
              </p>
              <button 
                onClick={() => setActiveView('compare')}
                className="mt-6 w-full py-4 bg-slate-50 dark:bg-zinc-800 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors"
              >
                View Full Transition Map
              </button>
            </div>
        </div>
      </div>
      <LegislationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        editingLegislation={editingLeg}
        frameworkId={framework.id}
      />
      <FrameworkModal
        isOpen={isFwModalOpen}
        onClose={() => setIsFwModalOpen(false)}
        editingFramework={framework}
      />
    </div>
  );
}
