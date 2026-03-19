"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ShieldCheck, Scale } from "lucide-react";

interface ScenarioPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: any;
}

export function ScenarioPreview({ isOpen, onClose, scenario }: ScenarioPreviewProps) {
  if (!scenario) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-[2px]"
          />
          <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-zinc-950 z-[120] shadow-2xl border-l border-slate-200 dark:border-zinc-800 flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 dark:border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600">
                    <ShieldCheck className="w-5 h-5" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Workflow Preview</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">{scenario.name}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed">{scenario.description || "No description provided for this compliance workflow."}</p>
               </div>

               <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Requirements Sequence</h5>
                  {scenario.rules.map((rule: any, i: number) => (
                    <div key={rule.id} className="relative pl-8">
                       {i !== scenario.rules.length - 1 && (
                         <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-slate-100 dark:bg-zinc-800" />
                       )}
                       <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center z-10">
                         {i + 1}
                       </div>
                       <div className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-2xl border border-slate-100 dark:border-zinc-800">
                          <h6 className="text-xs font-bold text-slate-900 dark:text-white mb-1">{rule.obligation.title}</h6>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-black">
                             <Scale className="w-3 h-3" />
                             <span>{rule.obligation.authority || "Regulatory"}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-zinc-900/80 border-t border-slate-200 dark:border-zinc-800">
               <button 
                  onClick={onClose}
                  className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
               >
                  Close Preview <ArrowRight className="w-4 h-4" />
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
