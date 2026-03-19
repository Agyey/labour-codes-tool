"use client";

import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

const ENTITIES = [
  { id: "pvt", name: "Private Limited Company", icon: Building2 },
  { id: "pub", name: "Public Limited Company", icon: Building2 },
  { id: "llp", name: "Limited Liability Partnership", icon: Building2 },
];

interface EntityStepProps {
  entity: string;
  setEntity: (val: string) => void;
}

export function EntityStep({ entity, setEntity }: EntityStepProps) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 flex-1">
      <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Specify Entity Structure</h2>
      <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">Obligations vary drastically by company structure.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ENTITIES.map((e) => {
          const isSelected = entity === e.id;
          const Icon = e.icon;
          return (
            <button key={e.id} onClick={() => setEntity(e.id)} className={`p-5 rounded-2xl text-left border-2 transition-all flex flex-col items-center text-center ${isSelected ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:border-indigo-500" : "border-slate-100 dark:border-zinc-800 hover:border-indigo-200 dark:hover:border-indigo-500/30"}`}>
              <Icon className={`w-8 h-8 mb-3 ${isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-zinc-500"}`} />
              <span className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{e.name}</span>
            </button>
          )
        })}
      </div>
    </motion.div>
  );
}
