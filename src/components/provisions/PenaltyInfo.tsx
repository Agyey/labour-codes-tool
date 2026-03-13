"use client";

import type { Provision } from "@/types/provision";

interface PenaltyInfoProps {
  provision: Provision;
}

export function PenaltyInfo({ provision: p }: PenaltyInfoProps) {
  if (!p.penaltyOld && !p.penaltyNew) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 bg-red-50 rounded-xl border border-red-200">
        <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
          Old Penalty
        </div>
        <div className="text-xs mt-1.5">{p.penaltyOld || "—"}</div>
      </div>
      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
        <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
          New Penalty
        </div>
        <div className="text-xs mt-1.5">{p.penaltyNew || "—"}</div>
      </div>
    </div>
  );
}
