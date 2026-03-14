"use client";

import type { Provision, User } from "@/types/provision";
import { FolderKanban, ChevronDown } from "lucide-react";

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
       <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-slate-50 dark:bg-zinc-800 rounded-xl text-slate-500">
           <FolderKanban className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-zinc-200">Processing Metadata</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className={labelCls}>Overall Assignee</label>
          <div className="relative">
            <select value={form.assignee || ""} onChange={(e) => update("assignee", e.target.value)} className={inputCls + " appearance-none"}>
              <option value="">Unassigned</option>
              {(users || []).map(u => (
                <option key={u.id} value={u.name || u.email || ""}>{u.name || u.email}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className={labelCls}>Overall Due Date</label>
          <input type="date" value={form.dueDate || ""} onChange={(e) => update("dueDate", e.target.value)} className={inputCls} />
        </div>
      </div>

      <div>
        <label className={labelCls}>Internal Research Notes</label>
        <textarea value={form.notes || ""} onChange={(e) => update("notes", e.target.value)} rows={3} className={inputCls + " min-h-[100px]"} placeholder="Add any background context or research notes here..." />
      </div>
    </div>
  );
}
