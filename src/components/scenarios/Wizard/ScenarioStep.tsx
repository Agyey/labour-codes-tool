"use client";

import { motion } from "framer-motion";
import { Plus, CheckCircle2, Settings2 } from "lucide-react";

interface ScenarioStepProps {
  scenarios: any[];
  scenarioId: string;
  setScenarioId: (id: string) => void;
  setShowCreateModal: (val: boolean) => void;
  setEditingScenario: (s: any) => void;
}

export function ScenarioStep({
  scenarios,
  scenarioId,
  setScenarioId,
  setShowCreateModal,
  setEditingScenario
}: ScenarioStepProps) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 flex-1">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Identify the Scenario</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">What transaction or event are we executing?</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20"
        >
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {scenarios.map((s) => {
          const isSelected = scenarioId === s.id;
          return (
            <div key={s.id} className="relative group">
              <button
                onClick={() => setScenarioId(s.id)}
                className={`w-full p-5 rounded-2xl text-left border-2 transition-all ${isSelected ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500" : "border-slate-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-500/30"}`}
              >
                <div className="flex items-start justify-between mb-2">
                   <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded ${isSelected ? "bg-indigo-600/20 text-indigo-700 dark:text-indigo-300" : "bg-slate-100 dark:bg-zinc-800 text-slate-500"}`}>COMPLIANCE</span>
                   {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <div className="font-bold text-slate-900 dark:text-white mb-1">{s.name}</div>
                <div className="text-xs text-slate-500 dark:text-zinc-400 mb-2">{s.description || "Custom compliance workflow."}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.rules?.length || 0} REQUIREMENTS</div>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setEditingScenario(s); }}
                className="absolute top-4 right-4 p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-slate-100 dark:border-zinc-700 opacity-0 group-hover:opacity-100 transition-all hover:text-indigo-600"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
          )
        })}
        {scenarios.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
            No scenario templates found. Create one to get started.
          </div>
        )}
      </div>
    </motion.div>
  );
}
