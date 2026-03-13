"use client";

import { useState, useEffect } from "react";
import { Check, Edit3, Settings } from "lucide-react";
import { motion } from "framer-motion";

interface VariableFormProps {
  variables: string[];
  onSubmit: (values: Record<string, string>) => void;
  fileName: string;
}

export function VariableForm({ variables, onSubmit, fileName }: VariableFormProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  // Initialize empty values
  useEffect(() => {
    const initial: Record<string, string> = {};
    variables.forEach(v => { initial[v] = ""; });
    setValues(initial);
  }, [variables]);

  const handleChange = (key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const isComplete = variables.every(v => values[v]?.trim().length > 0);

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800">
      <div className="p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50">
        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-800 dark:text-zinc-200">
          <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          Guided Assembly
        </h3>
        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
          Extracting {variables.length} parameters from <span className="font-mono text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-1 rounded">{fileName}</span>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {variables.map((variable, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={variable} 
            className="space-y-1.5"
          >
            <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              {variable.replace(/_/g, " ")}
              {values[variable]?.trim() && <Check className="w-3.5 h-3.5 text-emerald-500" />}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                <Edit3 className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={values[variable] || ""}
                onChange={(e) => handleChange(variable, e.target.value)}
                placeholder={`Enter ${variable.toLowerCase().replace(/_/g, " ")}...`}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 dark:focus:border-purple-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50">
        <button
          onClick={() => onSubmit(values)}
          disabled={!isComplete}
          className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            isComplete
              ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 cursor-pointer"
              : "bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed"
          }`}
        >
          <FileText className="w-4 h-4" />
          Generate Final Document
        </button>
        {!isComplete && (
          <p className="text-[10px] text-center text-slate-500 mt-2 font-medium">
            Fill all {variables.length} parameters to proceed.
          </p>
        )}
      </div>
    </div>
  );
}
