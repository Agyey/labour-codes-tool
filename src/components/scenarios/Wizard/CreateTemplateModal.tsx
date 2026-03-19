"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CreateTemplateModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newScenarioName: string;
  setNewScenarioName: (val: string) => void;
}

export function CreateTemplateModal({
  show,
  onClose,
  onSubmit,
  newScenarioName,
  setNewScenarioName
}: CreateTemplateModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] p-8 shadow-2xl">
            <h3 className="text-xl font-bold mb-6">New Scenario Template</h3>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Workflow Name</label>
                <input required value={newScenarioName} onChange={e => setNewScenarioName(e.target.value)} placeholder="e.g. Rights Issue" className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800" />
              </div>
              <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 mt-4">Create Template</button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
