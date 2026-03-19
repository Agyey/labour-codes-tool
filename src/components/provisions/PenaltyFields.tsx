"use client";

import type { Provision } from "@/types/provision";

interface PenaltyFieldsProps {
  form: Provision;
  update: <K extends keyof Provision>(key: K, val: Provision[K]) => void;
  inputCls: string;
  labelCls: string;
  sectionCls: string;
}

export function PenaltyFields({
  form,
  update,
  inputCls,
  labelCls,
  sectionCls
}: PenaltyFieldsProps) {
  return (
    <div className={sectionCls}>
      <h3 className="text-xs font-bold text-gray-700">Penalty Comparison</h3>
      <div className="grid grid-cols-2 gap-3">
        <div><label className={labelCls}>Old Penalty</label><textarea value={form.penaltyOld || ""} onChange={(e) => update("penaltyOld", e.target.value)} rows={2} className={inputCls} /></div>
        <div><label className={labelCls}>New Penalty</label><textarea value={form.penaltyNew || ""} onChange={(e) => update("penaltyNew", e.target.value)} rows={2} className={inputCls} /></div>
      </div>
    </div>
  );
}
