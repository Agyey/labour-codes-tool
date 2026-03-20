"use client";

import { useState } from "react";
import { GitCommit, History, ArrowDown } from "lucide-react";

interface Amendment {
  id: string;
  date: string;
  changeNature: "Inserted" | "Substituted" | "Omitted" | "Repealed";
  amendingAct: string;
  description: string;
}

const mockAmendments: Amendment[] = [
  { id: "a1", date: "2013-08-30", changeNature: "Inserted", amendingAct: "Original Enactment", description: "Base provision established." },
  { id: "a2", date: "2015-05-25", changeNature: "Substituted", amendingAct: "Companies (Amendment) Act, 2015", description: "Sub-section (3) substituted to remove minimum paid-up capital requirement." },
  { id: "a3", date: "2017-01-03", changeNature: "Inserted", amendingAct: "Companies (Amendment) Act, 2017", description: "Proviso added to allow broader exemptions." },
  { id: "a4", date: "2020-09-28", changeNature: "Omitted", amendingAct: "Companies (Amendment) Act, 2020", description: "Omitted sub-section (5) decriminalizing certain procedural defaults." }
];

export default function AmendmentTimeline() {
  const [activeId, setActiveId] = useState<string>("a4");

  const natureColors = {
    "Inserted": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300",
    "Substituted": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300",
    "Omitted": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300",
    "Repealed": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300",
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm h-full flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-500" />
          Amendment History
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Chronological evolution of this provision
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 relative">
        <div className="absolute top-6 bottom-6 left-10 w-0.5 bg-slate-200 dark:bg-slate-800"></div>

        <div className="space-y-8 relative">
          {mockAmendments.slice().reverse().map((amend, idx) => {
            const isActive = activeId === amend.id;
            const isLatest = idx === 0;

            return (
              <div key={amend.id} className="relative flex items-start group">
                {/* Timeline Node */}
                <div className="absolute left-4 -ml-1.5 mt-1.5 w-3 h-3 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-500 z-10 shadow-[0_0_0_4px_white] dark:shadow-[0_0_0_4px_#0f172a]"></div>

                {/* Content */}
                <div className="ml-12 flex-1">
                  <button 
                    onClick={() => setActiveId(amend.id)}
                    className={`w-full text-left rounded-xl transition-all duration-200 ${isActive ? 'bg-slate-50 dark:bg-slate-800/50 p-4 shadow-sm border border-indigo-200 dark:border-indigo-800/50' : 'p-2 hover:bg-slate-50 dark:hover:bg-slate-800/30 border border-transparent'}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {new Date(amend.date).getFullYear()}
                        </span>
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${natureColors[amend.changeNature]}`}>
                          {amend.changeNature}
                        </span>
                      </div>
                      {isLatest && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-md">
                          Current
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {amend.amendingAct}
                    </h3>
                    
                    {isActive && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                        {amend.description}
                      </p>
                    )}
                  </button>
                  
                  {isActive && idx < mockAmendments.length - 1 && (
                    <div className="flex justify-center my-4 opacity-50">
                      <ArrowDown className="w-4 h-4 text-slate-400" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
