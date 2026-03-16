"use client";

import React from "react";
import type { Provision } from "@/types/provision";

interface PenaltyInfoProps {
  provision: Provision;
}

export const PenaltyInfo = React.memo(function PenaltyInfo({ provision: p }: PenaltyInfoProps) {
  if (!p.penaltyOld && !p.penaltyNew) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 bg-red-50/50 dark:bg-red-950/20 rounded-xl border border-red-100/50 dark:border-red-900/30 shadow-sm">
        <div className="text-[10px] font-bold text-red-600/80 dark:text-red-400 uppercase tracking-tight">
          Old Penalty
        </div>
        <div className="text-xs mt-1.5 text-slate-600 dark:text-slate-400 font-medium">{p.penaltyOld || "—"}</div>
      </div>
      <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30 shadow-sm">
        <div className="text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400 uppercase tracking-tight">
          New Penalty
        </div>
        <div className="text-xs mt-1.5 text-slate-600 dark:text-slate-400 font-medium">{p.penaltyNew || "—"}</div>
      </div>
    </div>
  );
});
