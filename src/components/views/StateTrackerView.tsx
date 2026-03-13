"use client";

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { CODES } from "@/config/codes";
import { STATES } from "@/config/states";
import { Badge } from "@/components/shared/Badge";
import { Globe, MapPin } from "lucide-react";

import { useMemo } from "react";

export function StateTrackerView() {
  const { activeCode } = useUI();
  const { provisions } = useData();
  const cObj = CODES[activeCode];

  const stateProvisions = useMemo(() => provisions
    .filter((x) => x.code === activeCode)
    .filter((p) =>
      STATES.some((s) => (p.stateNotes || {})[s] || (p.stateRuleText || {})[s])
    ), [provisions, activeCode]);

  return (
    <div className="space-y-4">
      <div className="mb-8 p-6 rounded-3xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden relative group">
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none transition-opacity group-hover:opacity-[0.05]" 
          style={{ backgroundColor: cObj.c }} 
        />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-900/5 transition-transform group-hover:scale-105"
              style={{ backgroundColor: cObj.c }}
            >
              <Globe className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge color={cObj.c}>{cObj.s}</Badge>
                <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest">State Compliance Hub</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight leading-none">
                State Tracker
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-50/80 dark:bg-zinc-800/50 p-1.5 rounded-2xl border border-slate-100 dark:border-zinc-800">
            <div className="px-4 py-2 bg-white dark:bg-zinc-900 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-800">
              <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-0.5">States Impacted</p>
              <p className="text-xl font-black text-slate-900 dark:text-zinc-100 leading-none">{stateProvisions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {stateProvisions.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <Globe className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">
            No state-specific data available for {cObj.s}
          </p>
        </div>
      ) : (
        stateProvisions.map((p) => (
          <div
            key={p.id}
            className="border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 shadow-sm"
          >
            <div
              className="px-5 py-3 font-bold text-sm flex items-center justify-between border-b border-slate-100 dark:border-zinc-800"
              style={{ background: `color-mix(in srgb, ${cObj.c}, transparent 95%)` }}
            >
              <div className="flex items-center gap-2.5" style={{ color: cObj.c }}>
                <MapPin className="w-4 h-4 opacity-80" />
                <span className="tracking-tight">S.{p.sec}{p.sub} — {p.title}</span>
              </div>
              <Badge text={cObj.s} color={cObj.c} className="opacity-80" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <tbody>
                  {STATES.filter(
                    (s) =>
                      (p.stateNotes || {})[s] || (p.stateRuleText || {})[s]
                  ).map((s) => (
                    <tr key={s} className="border-b border-slate-50 dark:border-zinc-800/50 last:border-0 hover:bg-slate-50/30 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-3 font-extrabold w-32 text-slate-700 dark:text-zinc-300 uppercase tracking-tight">
                        {s}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">
                        {(p.stateNotes || {})[s]}
                      </td>
                      <td className="px-5 py-3 italic text-slate-400 dark:text-zinc-500 font-normal">
                        {(p.stateRuleText || {})[s]}
                      </td>
                      <td className="px-5 py-3 w-32 text-right">
                        <Badge
                          text={(p.stateCompStatus || {})[s] || "Not Started"}
                          color={
                            (p.stateCompStatus || {})[s] === "Compliant"
                              ? "#10b981"
                              : (p.stateCompStatus || {})[s] === "In Progress"
                              ? "#f59e0b"
                              : "#64748b"
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
