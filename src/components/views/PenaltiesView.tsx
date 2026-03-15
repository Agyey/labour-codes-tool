"use client";

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { CODES } from "@/config/codes";
import { Badge } from "@/components/shared/Badge";
import { AlertCircle, FileCheck, ShieldAlert, ArrowRight } from "lucide-react";
import { useMemo } from "react";
import type { Provision, ComplianceItem } from "@/types/provision";

interface MatrixRow {
  id: string;
  provision: Provision;
  compItem?: ComplianceItem;
  hasPenalty: boolean;
  isCritical: boolean;
}

export function PenaltiesView() {
  const { activeCode, setExpandedProvision } = useUI();
  const { provisions } = useData();
  const cObj = CODES[activeCode as keyof typeof CODES] || {
    n: activeCode,
    s: activeCode,
    c: "#6366f1"
  };

  const matrixData = useMemo(() => {
    const data: MatrixRow[] = [];
    const activeProvisions = provisions.filter((x) => x.code === activeCode);

    activeProvisions.forEach((p) => {
      const hasPenalty = !!(p.penaltyOld || p.penaltyNew);
      // Simple heuristic for critical penalty (imprisonment)
      const isCritical = hasPenalty && (
        p.penaltyNew?.toLowerCase().includes("imprisonment") ||
        p.penaltyOld?.toLowerCase().includes("imprisonment") ||
        p.penaltyNew?.toLowerCase().includes("jail")
      ) || false;

      if (p.compItems && p.compItems.length > 0) {
        p.compItems.forEach((ci, i) => {
          data.push({
            id: `${p.id}-comp-${i}`,
            provision: p,
            compItem: ci,
            hasPenalty,
            isCritical,
          });
        });
      } else if (hasPenalty) {
        data.push({
          id: `${p.id}-pen`,
          provision: p,
          hasPenalty,
          isCritical,
        });
      }
    });
    return data;
  }, [provisions, activeCode]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight flex items-center gap-3">
          <ShieldAlert className="w-6 h-6 text-rose-500" />
          Compliance & Penalties Center
        </h2>
        <Badge text={cObj.s} color={cObj.c} className="text-sm px-4 py-1.5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Requirements</div>
          <div className="text-3xl font-black text-slate-800 dark:text-zinc-100">{matrixData.filter(d => d.compItem).length}</div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Penalty Clauses</div>
          <div className="text-3xl font-black text-slate-800 dark:text-zinc-100">{matrixData.filter(d => d.hasPenalty).length}</div>
        </div>
        <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-5 shadow-sm">
          <div className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Critical Risks
          </div>
          <div className="text-3xl font-black text-rose-600 dark:text-rose-400">{matrixData.filter(d => d.isCritical).length}</div>
        </div>
      </div>

      {matrixData.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 border-dashed">
          <FileCheck className="w-10 h-10 text-slate-300 dark:text-zinc-600 mb-3" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-300">No Data Available</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1 max-w-sm">
            There are no compliance items or penalties mapped for this framework yet.
          </p>
        </div>
      ) : (
        <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest w-[15%]">Provision</th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest w-[35%]">Requirement / Obligation</th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest w-[40%]">Statutory Penalty</th>
                  <th className="px-5 py-4 text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest w-[10%] text-center">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
                {matrixData.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 group">
                    <td className="px-5 py-4 align-top">
                      <button 
                        onClick={() => setExpandedProvision(row.provision.id)}
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-start flex-col gap-0.5"
                      >
                        <span className="text-xs">S.{row.provision.sec}{row.provision.sub}</span>
                        <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 truncate max-w-[120px]" title={row.provision.title}>
                          {row.provision.title}
                        </span>
                      </button>
                    </td>
                    <td className="px-5 py-4 align-top">
                      {row.compItem ? (
                        <div className="text-sm text-slate-800 dark:text-zinc-200 font-medium leading-relaxed">
                          {row.compItem.task}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 dark:text-zinc-500 italic">
                          General Statutory Obligation
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top text-sm">
                      {!row.hasPenalty ? (
                        <span className="text-slate-400 dark:text-zinc-500 italic">No specific penalty</span>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <div className="bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/30 p-2.5 rounded-xl text-emerald-800 dark:text-emerald-300 leading-relaxed text-[13px]">
                            <span className="text-[9px] font-bold uppercase tracking-wider block mb-1 opacity-70">Current Penalty</span>
                            {row.provision.penaltyNew || "—"}
                          </div>
                          {row.provision.penaltyOld && (
                            <div className="flex items-center gap-2 opacity-60">
                              <ArrowRight className="w-3 h-3 text-slate-400" />
                              <span className="text-xs text-slate-500 line-through truncate max-w-[200px]" title="Old Penalty">
                                {row.provision.penaltyOld}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 align-top text-center">
                      {row.isCritical ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 px-2.5 py-1 rounded-lg">
                          <AlertCircle className="w-3 h-3" /> Critical
                        </span>
                      ) : row.hasPenalty ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded-lg">
                          Moderate
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-400 px-2.5 py-1 rounded-lg">
                          Low
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
