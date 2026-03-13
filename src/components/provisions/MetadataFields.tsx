"use client";

import type { Provision, User } from "@/types/provision";

interface MetadataFieldsProps {
  form: Provision;
  users: User[];
  update: <K extends keyof Provision>(key: K, val: Provision[K]) => void;
  inputCls: string;
  labelCls: string;
  sectionCls: string;
}

export function MetadataFields({
  form,
  users,
  update,
  inputCls,
  labelCls,
  sectionCls
}: MetadataFieldsProps) {
  return (
    <div className={sectionCls}>
      <h3 className="text-xs font-bold text-gray-700">Metadata</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Overall Assignee</label>
          <select value={form.assignee || ""} onChange={(e) => update("assignee", e.target.value)} className={inputCls}>
            <option value="">Unassigned</option>
            {(users || []).map(u => (
              <option key={u.id} value={u.name || u.email || ""}>{u.name || u.email}</option>
            ))}
          </select>
        </div>
        <div><label className={labelCls}>Overall Due Date</label><input type="date" value={form.dueDate || ""} onChange={(e) => update("dueDate", e.target.value)} className={inputCls} /></div>
      </div>
      <div><label className={labelCls}>Internal Notes</label><textarea value={form.notes || ""} onChange={(e) => update("notes", e.target.value)} rows={2} className={inputCls} /></div>
    </div>
  );
}
