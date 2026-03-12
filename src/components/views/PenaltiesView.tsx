"use client";

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { CODES } from "@/config/codes";
import { AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";

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
            className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className="px-4 py-2.5 font-bold text-sm flex items-center gap-2"
              style={{ color: cObj.c, background: cObj.bg }}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              S.{p.sec}
              {p.sub} — {p.title}
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-stretch">
              <div className="p-4 bg-red-50">
                <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-2">
                  Old Penalty
                </div>
                <div className="text-sm text-gray-700 leading-relaxed">
                  {p.penaltyOld || "—"}
                </div>
              </div>
              <div className="flex items-center px-2 bg-gray-50">
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
              <div className="p-4 bg-emerald-50">
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">
                  New Penalty
                </div>
                <div className="text-sm text-gray-700 leading-relaxed">
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
