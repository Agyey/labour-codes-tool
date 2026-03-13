"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Provision } from "@/types/provision";

interface TimelineFieldsProps {
  form: Provision;
  update: <K extends keyof Provision>(key: K, val: Provision[K]) => void;
  inputCls: string;
  sectionCls: string;
}

export function TimelineFields({
  form,
  update,
  inputCls,
  sectionCls
}: TimelineFieldsProps) {
  return (
    <div className={sectionCls}>
      <h3 className="text-xs font-bold text-gray-700">Timeline / Key Dates</h3>
      {(form.timelineDates || []).map((d, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input type="date" value={d.date} onChange={(e) => { const dates = [...form.timelineDates]; dates[i] = { ...dates[i], date: e.target.value }; update("timelineDates", dates); }} className={`${inputCls} w-36`} />
          <input value={d.label} onChange={(e) => { const dates = [...form.timelineDates]; dates[i] = { ...dates[i], label: e.target.value }; update("timelineDates", dates); }} placeholder="What happens" className={inputCls} />
          <button onClick={() => update("timelineDates", form.timelineDates.filter((_, idx) => idx !== i))} className="p-1 text-red-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ))}
      <button onClick={() => update("timelineDates", [...(form.timelineDates || []), { date: "", label: "" }])} className="flex items-center gap-1 px-2.5 py-1 bg-gray-200 text-gray-600 rounded-lg text-[10px] hover:bg-gray-300 transition-colors cursor-pointer">
        <Plus className="w-3 h-3" /> Add Date
      </button>
    </div>
  );
}
