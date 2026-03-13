"use client";

import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { CODES } from "@/config/codes";
import { IMPACT_COLORS } from "@/config/tags";
import { Badge } from "@/components/shared/Badge";
import { GitCompare, ArrowLeftRight } from "lucide-react";

import { useMemo } from "react";

export function CompareView() {
  const { activeCode, compareA, compareB, setCompareA, setCompareB } = useUI();
  const { provisions } = useData();
  const cObj = CODES[activeCode];
  
  const codeProvisions = useMemo(() => provisions.filter((x) => x.code === activeCode), [provisions, activeCode]);

  const a = useMemo(() => compareA ? codeProvisions.find((x) => x.id === compareA) : null, [compareA, codeProvisions]);
  const b = useMemo(() => compareB ? codeProvisions.find((x) => x.id === compareB) : null, [compareB, codeProvisions]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
        Compare Provisions
      </h2>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
            Provision A
          </label>
          <select
            value={compareA || ""}
            onChange={(e) => setCompareA(e.target.value || null)}
            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="">Select provision</option>
            {codeProvisions.map((p) => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900">
                S.{p.sec}
                {p.sub} — {p.title}
              </option>
            ))}
          </select>
        </div>

        <ArrowLeftRight className="w-5 h-5 text-slate-300 dark:text-slate-700 mb-2" />

        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">
            Provision B
          </label>
          <select
            value={compareB || ""}
            onChange={(e) => setCompareB(e.target.value || null)}
            className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="">Select provision</option>
            {codeProvisions.map((p) => (
              <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900">
                S.{p.sec}
                {p.sub} — {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {a && b ? (
        <div className="grid grid-cols-2 gap-4">
          {[a, b].map((p) => (
            <div
              key={p.id}
              className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 bg-white dark:bg-slate-900 shadow-sm"
            >
              <div
                className="text-base font-bold"
                style={{ color: cObj.c }}
              >
                S.{p.sec}
                {p.sub} — {p.title}
              </div>
              <div className="flex gap-1.5">
                <Badge
                  text={p.impact}
                  color={IMPACT_COLORS[p.impact]}
                />
                <Badge text={p.ruleAuth} color="#6b7280" />
              </div>
              <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {p.summary}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-500 space-y-0.5">
                <div>
                  <b className="text-slate-700 dark:text-slate-400">Old Mappings:</b> {(p.oldMappings || []).length}
                </div>
                <div>
                  <b className="text-slate-700 dark:text-slate-400">Compliance Items:</b> {(p.compItems || []).length}
                </div>
                <div>
                  <b className="text-slate-700 dark:text-slate-400">Draft Rules:</b> {(p.draftRules || []).length}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-12 text-center">
          <GitCompare className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-sm text-slate-400 dark:text-slate-500">
            Select two provisions above to compare them side-by-side.
          </p>
        </div>
      )}
    </div>
  );
}
