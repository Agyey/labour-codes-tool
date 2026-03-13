"use client";

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { CODES } from "@/config/codes";
import { Badge } from "@/components/shared/Badge";
import { ArrowRight, ShieldAlert } from "lucide-react";

import { useMemo } from "react";

export function PenaltiesView() {
  const { activeCode } = useUI();
  const { provisions } = useData();
  const cObj = CODES[activeCode];

  const penaltyProvisions = useMemo(() => provisions.filter(
    (x) => x.code === activeCode && (x.penaltyOld || x.penaltyNew)
  ), [provisions, activeCode]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold text-gray-800">
        Penalty Comparison — {cObj.s}
      </h2>

      {penaltyProvisions.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <ShieldAlert className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-sm text-gray-400">No penalty data added yet.</p>
        </div>
      ) : (
        penaltyProvisions.map((p) => (
          <div
            key={p.id}
            className="group border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div
              className="px-5 py-3 font-bold text-sm flex items-center justify-between border-b border-slate-100"
              style={{ background: `color-mix(in srgb, ${cObj.c}, transparent 95%)` }}
            >
              <div className="flex items-center gap-2.5" style={{ color: cObj.c }}>
                <ShieldAlert className="w-4 h-4 opacity-80" />
                <span className="tracking-tight">S.{p.sec}{p.sub} — {p.title}</span>
              </div>
              <Badge text={cObj.s} color={cObj.c} className="opacity-80" />
            </div>
            <div className="grid grid-cols-[1fr_40px_1fr] items-stretch">
              <div className="p-5 bg-red-50/30">
                <div className="text-[10px] font-extrabold text-red-600/70 uppercase tracking-wider mb-2.5">
                  Old Penalty
                </div>
                <div className="text-sm text-slate-600 leading-relaxed font-medium">
                  {p.penaltyOld || "—"}
                </div>
              </div>
              <div className="flex items-center justify-center bg-slate-50 border-x border-slate-100/50">
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </div>
              <div className="p-5 bg-emerald-50/30">
                <div className="text-[10px] font-extrabold text-emerald-600/70 uppercase tracking-wider mb-2.5">
                  New Penalty
                </div>
                <div className="text-sm text-slate-600 leading-relaxed font-medium">
                  {p.penaltyNew || "—"}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
