"use client";
/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Search, BookOpen, Scale } from "lucide-react";
import { 
  getComplianceObligations, 
  addObligationToScenario, 
  removeObligationFromScenario 
} from "@/app/actions/scenarios";
import toast from "react-hot-toast";

interface ScenarioEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: any;
  onUpdate: () => void;
}

export function ScenarioEditorModal({ isOpen, onClose, scenario, onUpdate }: ScenarioEditorModalProps) {
  const [obligations, setObligations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadObligations();
    }
  }, [isOpen]);

  async function loadObligations() {
    const data = await getComplianceObligations();
    setObligations(data);
  }

  async function handleAdd(obId: string) {
    setLoading(true);
    const res = await addObligationToScenario(scenario.id, obId);
    if (res.success) {
      toast.success("Requirement added to workflow");
      onUpdate();
    } else {
      toast.error(res.error || "Failed to add requirement");
    }
    setLoading(false);
  }

  async function handleRemove(ruleId: string) {
    setLoading(true);
    const res = await removeObligationFromScenario(ruleId);
    if (res.success) {
      toast.success("Requirement removed");
      onUpdate();
    }
    setLoading(false);
  }

  // ⚡ Bolt: Memoize filteredObligations to avoid searching through all obligations on every render
  const filteredObligations = useMemo(() => {
    if (!search) return obligations;
    const lowerSearch = search.toLowerCase();
    return obligations.filter(ob =>
      (ob.title && ob.title.toLowerCase().includes(lowerSearch)) ||
      (ob.description && ob.description.toLowerCase().includes(lowerSearch))
    );
  }, [obligations, search]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-5xl h-[80vh] bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-2xl flex">
            
            {/* Left: Workflow Current State */}
            <div className="w-1/2 border-r border-slate-100 dark:border-zinc-800 flex flex-col">
              <div className="p-8 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">{scenario.name}</h3>
                  <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-loose">{scenario.rules.length} Active Requirements</p>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {scenario.rules.map((rule: any) => (
                  <div key={rule.id} className="p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-slate-100 dark:border-zinc-800 group relative">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase mb-1">{rule.obligation.authority || "General"}</div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{rule.obligation.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{rule.obligation.description}</p>
                      </div>
                      <button 
                        disabled={loading}
                        onClick={() => handleRemove(rule.id)}
                        className="p-2 text-slate-300 hover:text-rose-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {scenario.rules.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                      <Plus className="w-6 h-6" />
                    </div>
                    <p className="text-sm text-slate-400">No requirements added to this workflow yet.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Obligation Browser */}
            <div className="w-1/2 bg-slate-50/50 dark:bg-zinc-950/50 flex flex-col">
              <div className="p-8 border-b border-slate-100 dark:border-zinc-800">
                <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Requirement Library</h4>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search compliance obligations..."
                    className="w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                {filteredObligations.map(ob => {
                  const alreadyIn = scenario.rules.some((r: any) => r.obligation_id === ob.id);
                  return (
                    <div key={ob.id} className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[8px] font-black rounded uppercase">{ob.section?.act?.shortName || "Act"}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">S. {ob.section?.number}</span>
                          </div>
                          <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-tight">{ob.title}</h5>
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">{ob.description}</p>
                        </div>
                        <button 
                          disabled={loading || alreadyIn}
                          onClick={() => handleAdd(ob.id)}
                          className={`p-2 rounded-xl transition-all ${alreadyIn ? "bg-emerald-50 text-emerald-600 cursor-default" : "bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-zinc-900"}`}
                        >
                          {alreadyIn ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
