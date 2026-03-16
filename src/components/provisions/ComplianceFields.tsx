"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Provision, ComplianceItem, User } from "@/types/provision";

interface ComplianceFieldsProps {
  form: Provision;
  users: User[];
  addCompItem: () => void;
  removeCompItem: (idx: number) => void;
  updateCompItem: (idx: number, field: keyof ComplianceItem, val: string) => void;
  inputCls: string;
  sectionCls: string;
}

export function ComplianceFields({
  form,
  users,
  addCompItem,
  removeCompItem,
  updateCompItem,
  inputCls,
  sectionCls
}: ComplianceFieldsProps) {
  return (
    <div className={sectionCls}>
      <h3 className="text-xs font-bold text-gray-700">Compliance Action Items</h3>
      {(form.compItems || []).map((c, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input value={c.task} onChange={(e) => updateCompItem(i, "task", e.target.value)} placeholder="Task" className={inputCls} />
          <select value={c.assignee || ""} onChange={(e) => updateCompItem(i, "assignee", e.target.value)} className={`${inputCls} w-32`}>
            <option value="">Unassigned</option>
            {(users || []).map(u => (
              <option key={u.id} value={u.name || u.email || ""}>{u.name || u.email}</option>
            ))}
          </select>
          <input type="date" value={c.due} onChange={(e) => updateCompItem(i, "due", e.target.value)} className={`${inputCls} w-32`} />
          <button onClick={() => removeCompItem(i)} className="p-1 text-red-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ))}
      <button onClick={addCompItem} className="flex items-center gap-1 px-2.5 py-1 bg-gray-200 text-gray-600 rounded-lg text-[10px] hover:bg-gray-300 transition-colors cursor-pointer">
        <Plus className="w-3 h-3" /> Add Compliance Item
      </button>
    </div>
  );
}
