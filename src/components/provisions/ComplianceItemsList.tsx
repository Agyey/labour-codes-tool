"use client";

import { useData } from "@/context/DataContext";
import { COMPLIANCE_STATUSES } from "@/config/tags";
import type { Provision } from "@/types/provision";

interface ComplianceItemsListProps {
  provision: Provision;
}

export function ComplianceItemsList({ provision: p }: ComplianceItemsListProps) {
  const { complianceStatuses, setComplianceStatus } = useData();

  if (!p.compItems || p.compItems.length === 0) return null;

  return (
    <div>
      <h4 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">
        Compliance ({p.compItems.length})
      </h4>
      <div className="space-y-1.5">
        {p.compItems.map((c, j) => {
          const cid = `${p.id}-${j}`;
          const st = complianceStatuses[cid] || "Not Started";
          return (
            <div
              key={j}
              className="flex items-center gap-2.5 py-1.5 border-b border-gray-100 text-xs"
            >
              <select
                value={st}
                onChange={(e) =>
                  setComplianceStatus(cid, e.target.value)
                }
                className={`px-1.5 py-1 border rounded-md text-[10px] min-w-[85px] cursor-pointer ${
                  st === "Compliant"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : st === "In Progress"
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : "bg-white border-gray-200 text-gray-600"
                }`}
              >
                {COMPLIANCE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <span className="flex-1 text-gray-700">{c.task}</span>
              {c.assignee && (
                <span className="text-[10px] text-gray-400">
                  @{c.assignee}
                </span>
              )}
              {c.due && (
                <span className="text-[10px] text-gray-400">
                  {c.due}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
