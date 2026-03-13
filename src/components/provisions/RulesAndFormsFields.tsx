"use client";

import { Plus, Trash2 } from "lucide-react";
import type { Provision } from "@/types/provision";

interface RulesAndFormsFieldsProps {
  form: Provision;
  addArrayItem: (key: "draftRules" | "repealedRules" | "forms") => void;
  removeArrayItem: (key: "draftRules" | "repealedRules" | "forms", idx: number) => void;
  updateArrayItem: (key: "draftRules" | "repealedRules" | "forms", idx: number, field: string, val: string) => void;
  update: <K extends keyof Provision>(key: K, val: Provision[K]) => void;
  inputCls: string;
  labelCls: string;
  sectionCls: string;
}

export function RulesAndFormsFields({
  form,
  addArrayItem,
  removeArrayItem,
  updateArrayItem,
  update,
  inputCls,
  labelCls,
  sectionCls
}: RulesAndFormsFieldsProps) {
  return (
    <>
      <div className={sectionCls}>
        <h3 className="text-xs font-bold text-gray-700">Relational Mapping</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Parent Section (For Rules)</label>
            <input 
              value={form.parentSection || ""} 
              onChange={(e) => update("parentSection", e.target.value)} 
              placeholder="e.g. 67"
              className={inputCls} 
            />
          </div>
          <div>
            <label className={labelCls}>Linked Rule Refs (Comma Separated)</label>
            <input 
              value={(form.linkedRuleRefs || []).join(", ")} 
              onChange={(e) => update("linkedRuleRefs", e.target.value.split(",").map(t => t.trim()).filter(Boolean))} 
              placeholder="e.g. 12, 13, 14"
              className={inputCls} 
            />
          </div>
        </div>
      </div>

      {(["draftRules", "repealedRules", "forms"] as const).map((key) => {
        const titles = { draftRules: "New Rules", repealedRules: "Old Rules", forms: "Forms / Registers" };
        const placeholders = { draftRules: ["Rule ref", "Summary"], repealedRules: ["Old rule", "Summary"], forms: ["Form ref", "Description"] };
        return (
          <div key={key} className={sectionCls}>
            <h3 className="text-xs font-bold text-gray-700">{titles[key]}</h3>
            {(form[key] || []).map((r, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input value={r.ref} onChange={(e) => updateArrayItem(key, i, "ref", e.target.value)} placeholder={placeholders[key][0]} className={`${inputCls} w-48`} />
                <input value={r.summary} onChange={(e) => updateArrayItem(key, i, "summary", e.target.value)} placeholder={placeholders[key][1]} className={inputCls} />
                <button onClick={() => removeArrayItem(key, i)} className="p-1 text-red-400 hover:text-red-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <button onClick={() => addArrayItem(key)} className="flex items-center gap-1 px-2.5 py-1 bg-gray-200 text-gray-600 rounded-lg text-[10px] hover:bg-gray-300 transition-colors cursor-pointer">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
        );
      })}
    </>
  );
}
