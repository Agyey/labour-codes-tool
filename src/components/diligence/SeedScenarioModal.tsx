"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus } from "lucide-react";

interface SeedScenarioModalProps {
  onClose: () => void;
  onSeed: (id: string) => void;
}

export function SeedScenarioModal({ onClose, onSeed }: SeedScenarioModalProps) {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { getScenarioTemplates } = await import("@/app/actions/scenarios");
      const data = await getScenarioTemplates();
      setScenarios(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Auto-Seed Checklist</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Select a compliance workflow to seed requisitions</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm text-slate-400">Loading templates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 overflow-y-auto max-h-[50vh] pr-2">
              {scenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSeed(s.id)}
                  className="p-5 rounded-2xl text-left border-2 border-slate-100 dark:border-zinc-800 hover:border-indigo-600 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-slate-900 dark:text-white">{s.name}</div>
                    <div className="p-2 bg-indigo-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-zinc-400">{s.rules?.length || 0} Compliance Requirements</div>
                </button>
              ))}
              {scenarios.length === 0 && (
                <div className="text-center py-10">
                  <p className="text-sm text-slate-500 mb-4">No scenario templates found.</p>
                  <a href="/scenarios" className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline text-center block">Go to Scenario Engine</a>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
