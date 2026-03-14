"use client";

import React from "react";
import { useData } from "@/context/DataContext";
import { COMPLIANCE_STATUSES } from "@/config/tags";
import type { Provision } from "@/types/provision";

interface ComplianceItemsListProps {
  provision: Provision;
}

export const ComplianceItemsList = React.memo(function ComplianceItemsList({ provision: p }: ComplianceItemsListProps) {
  const { complianceStatuses, setComplianceStatus } = useData();

  if (!p.compItems || p.compItems.length === 0) return null;

  return (
    <div>
      <h4 className="text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-2">
        Compliance ({p.compItems.length})
      </h4>
      <div className="space-y-1.5">
        {p.compItems.map((c, j) => {
          const cid = `${p.id}-${j}`;
          const st = complianceStatuses[cid] || "Not Started";
          return (
            <div
              key={j}
              className="flex items-center gap-2.5 py-1.5 border-b border-slate-100 dark:border-slate-800/60 text-xs"
            >
              <select
                value={st}
                onChange={(e) =>
                  setComplianceStatus(cid, e.target.value)
                }
                className={`px-1.5 py-1 border rounded-md text-[10px] min-w-[85px] cursor-pointer outline-none transition-colors ${
                  st === "Compliant"
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                    : st === "In Progress"
                      ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                {COMPLIANCE_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-white dark:bg-slate-900">
                    {s}
                  </option>
                ))}
              </select>
              <span className="flex-1 text-slate-700 dark:text-slate-300">{c.task}</span>
              {c.assignee && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  @{c.assignee}
                </span>
              )}
              {c.due && (
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  {c.due}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});
