"use client";

import { motion } from "framer-motion";
import { Globe } from "lucide-react";

const JURISDICTIONS = [
  { id: "in", name: "India", icon: Globe, desc: "BSE, NSE, MCA, RBI Compliances" },
  { id: "sg", name: "Singapore", icon: Globe, desc: "ACRA, MAS Regulations" },
  { id: "us", name: "United States (Delaware)", icon: Globe, desc: "SEC, Delaware General Corp Law" },
];

interface JurisdictionStepProps {
  jurisdiction: string;
  setJurisdiction: (val: string) => void;
}

export function JurisdictionStep({ jurisdiction, setJurisdiction }: JurisdictionStepProps) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 flex-1">
      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Select Target Jurisdiction</h2>
      <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">Which regulatory body governs this transaction?</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {JURISDICTIONS.map((j) => {
          const isSelected = jurisdiction === j.id;
          const Icon = j.icon;
          return (
            <button key={j.id} onClick={() => setJurisdiction(j.id)} className={`p-5 rounded-2xl text-left border-2 transition-all ${isSelected ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500" : "border-slate-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-500/30"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 dark:text-white mb-1">{j.name}</div>
              <div className="text-xs text-slate-500 dark:text-zinc-400">{j.desc}</div>
            </button>
          )
        })}
      </div>
    </motion.div>
  );
}
