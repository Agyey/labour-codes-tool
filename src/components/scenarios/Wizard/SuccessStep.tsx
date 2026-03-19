"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface SuccessStepProps {
  scenarioName: string;
  createMatter: () => void;
}

export function SuccessStep({ scenarioName, createMatter }: SuccessStepProps) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 flex-1 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
      </div>
      <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2">Workflow Ready</h2>
      <p className="text-slate-500 dark:text-zinc-400 max-w-sm mb-8 text-sm leading-relaxed">
        The engine mapped <strong>{scenarioName}</strong> across the selected jurisdiction and generated tailored compliance tasks.
      </p>
      <button onClick={createMatter} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 px-8 py-3.5 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10">
        Configure Deal Room <ArrowRight className="w-4 h-4 mt-0.5" />
      </button>
    </motion.div>
  );
}
