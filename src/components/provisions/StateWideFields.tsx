/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { STATES } from "@/config/states";
import { COMPLIANCE_STATUSES } from "@/config/tags";
import { Info, PlusCircle, MinusCircle, FileEdit, Map as MapIcon } from "lucide-react";
import type { Provision } from "@/types/provision";

interface StateWideFieldsProps {
  form: Provision;
  update: <K extends keyof Provision>(key: K, val: Provision[K]) => void;
  inputCls: string;
  sectionCls: string;
}

export function StateWideFields({
  form,
  update,
  inputCls,
  sectionCls
}: StateWideFieldsProps) {
  const [expandedState, setExpandedState] = useState<string | null>(null);

  return (
    <div className={sectionCls}>
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
           <MapIcon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-zinc-200">State Variant Matrix</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Track state-wise amendments, insertions and rule variations</p>
        </div>
      </div>

      <div className="overflow-x-auto -mx-8 px-8">
        <table className="w-full text-[11px] border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-slate-100 dark:border-zinc-800">
              <th className="p-4 text-left font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-zinc-900/50 rounded-tl-2xl">State</th>
              <th className="p-4 text-left font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-zinc-900/50">Amendments</th>
              <th className="p-4 text-left font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-zinc-900/50">Insertions</th>
              <th className="p-4 text-left font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-zinc-900/50">Notes / Variations</th>
              <th className="p-4 text-left font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-zinc-900/50 w-32">Status</th>
              <th className="p-4 text-left font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-zinc-900/50 rounded-tr-2xl w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {STATES.map((s) => {
              const isExpanded = expandedState === s;
              return (
                <React.Fragment key={s}>
                  <tr className={`border-b border-slate-50 dark:border-zinc-900/50 transition-colors ${isExpanded ? 'bg-indigo-50/30 dark:bg-indigo-500/5' : 'hover:bg-slate-50/50 dark:hover:bg-zinc-900/30'}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-zinc-700" />
                         <span className="font-bold text-slate-700 dark:text-zinc-300">{s}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <input 
                        value={(form.stateAmendments || {})[s] || ""} 
                        onChange={(e) => update("stateAmendments", { ...form.stateAmendments, [s]: e.target.value })} 
                        className={inputCls + " h-9 font-medium text-[11px]"} 
                        placeholder="Sec 2(1) modified..."
                      />
                    </td>
                    <td className="p-4">
                      <input 
                        value={(form.stateInsertions || {})[s] || ""} 
                        onChange={(e) => update("stateInsertions", { ...form.stateInsertions, [s]: e.target.value })} 
                        className={inputCls + " h-9 font-medium text-[11px]"} 
                        placeholder="New Sec 2A added..."
                      />
                    </td>
                    <td className="p-4">
                      <input 
                        value={(form.stateNotes || {})[s] || ""} 
                        onChange={(e) => update("stateNotes", { ...form.stateNotes, [s]: e.target.value })} 
                        className={inputCls + " h-9 font-medium text-[11px]"} 
                        placeholder="General state context..."
                      />
                    </td>
                    <td className="p-4">
                      <select 
                        value={(form.stateCompStatus || {})[s] || "Not Started"} 
                        onChange={(e) => update("stateCompStatus", { ...form.stateCompStatus, [s]: e.target.value as any })} 
                        className={inputCls + " h-9 text-[10px] font-black uppercase appearance-none"}
                      >
                        {COMPLIANCE_STATUSES.map((x) => <option key={x} value={x}>{x}</option>)}
                      </select>
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => setExpandedState(isExpanded ? null : s)} 
                        className={`p-2 rounded-xl transition-all cursor-pointer ${isExpanded ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-zinc-800 text-slate-400 hover:text-indigo-500'}`}
                      >
                        <FileEdit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-indigo-50/20 dark:bg-indigo-500/5 animate-in slide-in-from-top-2 duration-300">
                      <td colSpan={6} className="p-6 border-b border-indigo-100 dark:border-indigo-500/10">
                        <div className="bg-white dark:bg-zinc-950 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-500/20 shadow-xl shadow-indigo-500/5">
                           <div className="flex items-center gap-2 mb-4">
                              <Info className="w-4 h-4 text-indigo-500" />
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded-full">
                                Full State Rule Text - {s}
                              </h4>
                           </div>
                           <textarea 
                             value={(form.stateRuleText || {})[s] || ""} 
                             onChange={(e) => update("stateRuleText", { ...form.stateRuleText, [s]: e.target.value })} 
                             className="w-full p-4 bg-slate-50 dark:bg-zinc-900/50 border border-slate-100 dark:border-zinc-800 rounded-2xl text-xs font-medium text-slate-600 dark:text-zinc-400 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none font-sans min-h-[200px]"
                             placeholder={`Enter the specific rule text for ${s} if it differs from the central rule...`}
                           />
                           <div className="mt-4 flex items-center gap-2">
                              <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-zinc-800">
                                <PlusCircle className="w-3 h-3 text-emerald-500" />
                                Use this section for rules that are completely unique to {s}.
                              </p>
                              <button 
                                onClick={() => setExpandedState(null)} 
                                className="ml-auto px-4 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors"
                              >
                                Close Detailed View
                              </button>
                           </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
