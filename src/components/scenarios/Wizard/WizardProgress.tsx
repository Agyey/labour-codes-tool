"use client";

import { CheckCircle2 } from "lucide-react";

interface WizardProgressProps {
  step: number;
}

export function WizardProgress({ step }: WizardProgressProps) {
  const labels = ["Jurisdiction", "Entity", "Scenario", "Generation"];

  return (
    <div className="mb-8 relative">
      <div className="flex items-center justify-between relative z-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm ${
                step >= i 
                  ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-indigo-500/30" 
                  : "bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-500"
              }`}
            >
              {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= i ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-zinc-600"}`}>
              {labels[i-1]}
            </span>
          </div>
        ))}
      </div>
      <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-200 dark:bg-zinc-800 -z-0">
        <div 
          className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500 ease-in-out" 
          style={{ width: `${((step - 1) / 3) * 100}%` }} 
        />
      </div>
    </div>
  );
}
