"use client";

import { ArrowLeft, ArrowRight, Play } from "lucide-react";

interface WizardFooterProps {
  step: number;
  handleBack: () => void;
  handleNext: () => void;
  canContinue: boolean;
}

export function WizardFooter({ step, handleBack, handleNext, canContinue }: WizardFooterProps) {
  return (
    <div className="border-t border-slate-100 dark:border-zinc-800 p-5 bg-slate-50/50 dark:bg-zinc-950/50 flex items-center justify-between">
      <button 
        onClick={handleBack} 
        disabled={step === 1} 
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <button 
        onClick={handleNext} 
        disabled={!canContinue} 
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20"
      >
        {step === 3 ? "Generate Workflow" : "Continue"} {step === 3 ? <Play className="w-4 h-4 fill-current" /> : <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );
}
