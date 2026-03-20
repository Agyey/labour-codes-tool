"use client";

import { Network, Link2, FileText, ArrowRight } from "lucide-react";

interface Node {
  id: string;
  title: string;
  type: "Source" | "Target" | "Definition";
  rel: string;
}

const mockGraph: Node[] = [
  { id: "n1", title: "Section 2(20) — 'Company'", type: "Definition", rel: "Defined In" },
  { id: "n2", title: "Section 3 — Formation of Company", type: "Target", rel: "Subject To" },
  { id: "n3", title: "Section 4 — Memorandum", type: "Target", rel: "Read With" },
  { id: "n4", title: "Companies (Incorporation) Rules, 2014", type: "Target", rel: "Rules Made Under" },
];

export default function CrossRefGraph() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm h-full flex flex-col">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Network className="w-5 h-5 text-indigo-500" />
          Cross-Reference Graph
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Visual map of related definitions, rules, and provisions
        </p>
      </div>

      <div className="flex-1 p-8 flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/50">
        {/* Simplified conceptual visual layout using flex/CSS (no bloated d3/canvas libs needed for MVP) */}
        
        <div className="relative w-full max-w-lg flex flex-col items-center gap-12">
          
          {/* Central Node */}
          <div className="relative z-10 w-64 p-4 rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/20 text-center border-2 border-indigo-400">
            <p className="text-xs text-indigo-200 font-semibold uppercase tracking-wider mb-1">Current Provision</p>
            <h3 className="text-sm font-bold text-white">Section 7 — Incorporation</h3>
          </div>

          {/* Lines going down */}
          <div className="absolute top-16 bottom-16 left-1/2 w-0.5 bg-slate-300 dark:bg-slate-700 -translate-x-1/2 z-0"></div>

          {/* Surrounding Connected Nodes */}
          <div className="w-full grid grid-cols-2 gap-8 relative z-10">
            {mockGraph.map((node, i) => (
              <div key={node.id} className={`p-4 rounded-xl border bg-white dark:bg-slate-900 shadow-sm relative group cursor-pointer hover:border-indigo-400 transition-colors ${i % 2 === 0 ? 'translate-y-8' : '-translate-y-8'}`}>
                
                {/* Connecting branch line */}
                <div className={`absolute top-1/2 w-8 h-0.5 bg-slate-300 dark:bg-slate-700 ${i % 2 === 0 ? '-right-8' : '-left-8'} hidden md:block`}></div>

                <div className="flex items-center gap-1.5 mb-2">
                  <Link2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    {node.rel}
                  </span>
                </div>
                
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-0.5 text-indigo-500 shrink-0" />
                  {node.title}
                </h4>

                <div className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Navigate <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
