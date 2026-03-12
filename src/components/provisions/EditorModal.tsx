"use client";

import { useState } from "react";
import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { CODES } from "@/config/codes";
import {
  CHANGE_TAGS,
  WORKFLOW_TAGS,
  IMPACT_LEVELS,
  RULE_AUTHORITIES,
  COMPLIANCE_STATUSES,
  CHANGE_TAG_COLORS,
  WORKFLOW_TAG_COLORS,
} from "@/config/tags";
import { STATES } from "@/config/states";
import { TagChip } from "@/components/shared/TagChip";
import { createBlankOldMapping } from "@/lib/utils";
import type { Provision, OldMapping, ComplianceItem } from "@/types/provision";
import { X, Plus, Trash2, Save } from "lucide-react";
import { CommentSection } from "./CommentSection";
import { addComment } from "@/app/actions/provisions";

export function EditorModal() {
  const { editingProvision, setEditingProvision, activeCode } = useUI();
  const { saveProvision, users } = useData();

  const prov = editingProvision;
  if (!prov) return null;

  const [form, setForm] = useState<Provision>(JSON.parse(JSON.stringify(prov)));

  const cObj = CODES[activeCode];

  function update<K extends keyof Provision>(key: K, val: Provision[K]) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  function toggleInArray(key: "changeTags" | "workflowTags", val: string) {
    setForm((prev) => {
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
      };
    });
  }

  function updateOldMapping(idx: number, key: keyof OldMapping, val: string | string[]) {
    setForm((prev) => {
      const mappings = [...prev.oldMappings];
      mappings[idx] = { ...mappings[idx], [key]: val };
      return { ...prev, oldMappings: mappings };
    });
  }

  function toggleOldMappingTag(idx: number, tag: string) {
    setForm((prev) => {
      const mappings = [...prev.oldMappings];
      const tags = mappings[idx].changeTags || [];
      mappings[idx] = {
        ...mappings[idx],
        changeTags: tags.includes(tag)
          ? tags.filter((t) => t !== tag)
          : [...tags, tag],
      };
      return { ...prev, oldMappings: mappings };
    });
  }

  function addOldMapping() {
    setForm((prev) => ({
      ...prev,
      oldMappings: [...prev.oldMappings, createBlankOldMapping()],
    }));
  }

  function removeOldMapping(idx: number) {
    setForm((prev) => ({
      ...prev,
      oldMappings: prev.oldMappings.filter((_, i) => i !== idx),
    }));
  }

  function addArrayItem(key: "draftRules" | "repealedRules" | "forms") {
    setForm((prev) => ({
      ...prev,
      [key]: [...(prev[key] || []), { ref: "", summary: "" }],
    }));
  }

  function removeArrayItem(key: "draftRules" | "repealedRules" | "forms", idx: number) {
    setForm((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== idx),
    }));
  }

  function updateArrayItem(
    key: "draftRules" | "repealedRules" | "forms",
    idx: number,
    field: string,
    val: string
  ) {
    setForm((prev) => {
      const arr = [...(prev[key] || [])];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...prev, [key]: arr };
    });
  }

  function addCompItem() {
    setForm((prev) => ({
      ...prev,
      compItems: [...(prev.compItems || []), { task: "", assignee: "", due: "" }],
    }));
  }

  function removeCompItem(idx: number) {
    setForm((prev) => ({
      ...prev,
      compItems: (prev.compItems || []).filter((_, i) => i !== idx),
    }));
  }

  function updateCompItem(idx: number, field: keyof ComplianceItem, val: string) {
    setForm((prev) => {
      const items = [...(prev.compItems || [])];
      items[idx] = { ...items[idx], [field]: val };
      return { ...prev, compItems: items };
    });
  }

  const inputCls =
    "w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all";
  const textareaCls = `${inputCls} font-mono resize-y`;
  const labelCls = "text-[10px] font-semibold text-gray-500 mb-0.5 block";
  const sectionCls = "p-4 bg-gray-50 rounded-xl space-y-3";

  return (
    <div className="fixed inset-0 bg-black/50 z-[1000] flex justify-center items-start pt-5 overflow-auto">
      <div className="bg-white rounded-2xl w-[95%] max-w-[900px] max-h-[90vh] overflow-auto p-6 shadow-2xl animate-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-gray-800">
            {prov.id.includes(String(Date.now())) ? "Add" : "Edit"} Provision
          </h2>
          <button
            onClick={() => setEditingProvision(null)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className={sectionCls}>
            <h3 className="text-xs font-bold text-gray-700">Basic Information</h3>
            <div className="grid grid-cols-[70px_1fr_70px_70px] gap-3">
              <div>
                <label className={labelCls}>Chapter</label>
                <input value={form.ch} onChange={(e) => update("ch", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Chapter Name</label>
                <input value={form.chName} onChange={(e) => update("chName", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Section</label>
                <input value={form.sec} onChange={(e) => update("sec", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Sub-sec</label>
                <input value={form.sub} onChange={(e) => update("sub", e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="grid grid-cols-[2fr_1fr_1fr] gap-3">
              <div>
                <label className={labelCls}>Title</label>
                <input value={form.title} onChange={(e) => update("title", e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Impact</label>
                <select value={form.impact} onChange={(e) => update("impact", e.target.value as Provision["impact"])} className={inputCls}>
                  {IMPACT_LEVELS.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Rule Authority</label>
                <select value={form.ruleAuth} onChange={(e) => update("ruleAuth", e.target.value as Provision["ruleAuth"])} className={inputCls}>
                  {RULE_AUTHORITIES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Summary + Full Text */}
          <div className={sectionCls}>
            <h3 className="text-xs font-bold text-gray-700">New Provision</h3>
            <div>
              <label className={labelCls}>Summary</label>
              <textarea value={form.summary} onChange={(e) => update("summary", e.target.value)} rows={3} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Full Statutory Text</label>
              <textarea value={form.fullText} onChange={(e) => update("fullText", e.target.value)} rows={4} className={textareaCls} />
            </div>
          </div>

          {/* Tags */}
          <div className={sectionCls}>
            <h3 className="text-xs font-bold text-gray-700">Change Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {CHANGE_TAGS.map((t) => (
                <TagChip key={t} tag={t} colorMap={CHANGE_TAG_COLORS} onClick={() => toggleInArray("changeTags", t)} active={(form.changeTags || []).includes(t)} />
              ))}
            </div>
          </div>

          <div className={sectionCls}>
            <h3 className="text-xs font-bold text-gray-700">Workflow Tags</h3>
            <div className="flex flex-wrap gap-1.5">
              {WORKFLOW_TAGS.map((t) => (
                <TagChip key={t} tag={t} colorMap={WORKFLOW_TAG_COLORS} onClick={() => toggleInArray("workflowTags", t)} active={(form.workflowTags || []).includes(t)} />
              ))}
            </div>
          </div>

          {/* Old Mappings */}
          <div className={sectionCls}>
            <h3 className="text-xs font-bold text-gray-700">Per-Act Change Analysis (Repealed Provisions)</h3>
            {(form.oldMappings || []).map((m, i) => (
              <div key={i} className="border border-red-200 rounded-xl p-3 bg-red-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-red-600">Repealed Act #{i + 1}</span>
                  <button onClick={() => removeOldMapping(i)} className="text-xs text-red-500 hover:text-red-700 cursor-pointer flex items-center gap-0.5"><Trash2 className="w-3 h-3" /> Remove</button>
                </div>
                <div className="grid grid-cols-[2fr_1fr] gap-2">
                  <div><label className={labelCls}>Act Name</label><input value={m.act} onChange={(e) => updateOldMapping(i, "act", e.target.value)} className={inputCls} /></div>
                  <div><label className={labelCls}>Section</label><input value={m.sec} onChange={(e) => updateOldMapping(i, "sec", e.target.value)} className={inputCls} /></div>
                </div>
                <div><label className={labelCls}>Summary of old provision</label><textarea value={m.summary} onChange={(e) => updateOldMapping(i, "summary", e.target.value)} rows={2} className={inputCls} /></div>
                <div><label className={labelCls}>Full text</label><textarea value={m.fullText} onChange={(e) => updateOldMapping(i, "fullText", e.target.value)} rows={2} className={textareaCls} /></div>
                <div><label className={labelCls}>What changed</label><textarea value={m.change} onChange={(e) => updateOldMapping(i, "change", e.target.value)} rows={2} className={inputCls} /></div>
                <div>
                  <label className={labelCls}>Per-Act Change Tags</label>
                  <div className="flex flex-wrap gap-1">
                    {CHANGE_TAGS.map((t) => (
                      <TagChip key={t} tag={t} colorMap={CHANGE_TAG_COLORS} small onClick={() => toggleOldMappingTag(i, t)} active={(m.changeTags || []).includes(t)} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addOldMapping} className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors cursor-pointer">
              <Plus className="w-3 h-3" /> Add Repealed Act Mapping
            </button>
          </div>

          {/* Penalty */}
          <div className={sectionCls}>
            <h3 className="text-xs font-bold text-gray-700">Penalty Comparison</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Old Penalty</label><textarea value={form.penaltyOld || ""} onChange={(e) => update("penaltyOld", e.target.value)} rows={2} className={inputCls} /></div>
              <div><label className={labelCls}>New Penalty</label><textarea value={form.penaltyNew || ""} onChange={(e) => update("penaltyNew", e.target.value)} rows={2} className={inputCls} /></div>
            </div>
          </div>

          {/* Draft Rules / Repealed Rules / Forms */}
          {(["draftRules", "repealedRules", "forms"] as const).map((key) => {
            const titles = { draftRules: "Draft Central Rules", repealedRules: "Repealed Central Rules", forms: "Forms / Registers" };
            const placeholders = { draftRules: ["Rule ref", "Summary"], repealedRules: ["Repealed rule", "Summary"], forms: ["Form ref", "Description"] };
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

          {/* Compliance Items */}
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

          {/* State-wise */}
          <div className={sectionCls}>
            <h3 className="text-xs font-bold text-gray-700">State-wise Information</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2 text-left font-bold">State</th>
                    <th className="p-2 text-left font-bold">Notes / Variations</th>
                    <th className="p-2 text-left font-bold">State Rule Text</th>
                    <th className="p-2 text-left font-bold w-24">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {STATES.map((s) => (
                    <tr key={s} className="border-b border-gray-100">
                      <td className="p-2 font-semibold">{s}</td>
                      <td className="p-2"><input value={(form.stateNotes || {})[s] || ""} onChange={(e) => update("stateNotes", { ...form.stateNotes, [s]: e.target.value })} className={inputCls} /></td>
                      <td className="p-2"><input value={(form.stateRuleText || {})[s] || ""} onChange={(e) => update("stateRuleText", { ...form.stateRuleText, [s]: e.target.value })} className={inputCls} /></td>
                      <td className="p-2">
                        <select value={(form.stateCompStatus || {})[s] || "Not Started"} onChange={(e) => update("stateCompStatus", { ...form.stateCompStatus, [s]: e.target.value as any })} className={inputCls}>
                          {COMPLIANCE_STATUSES.map((x) => <option key={x} value={x}>{x}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Timeline Dates */}
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

          {/* Metadata */}
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

          {/* Comment Section (Internal Discussion) */}
          <CommentSection 
            comments={form.comments} 
            provisionId={prov.id} 
            onAddComment={async (body) => {
              // Ignore temporary IDs for uncreated provisions
              if (prov.id.includes(String(Date.now()))) return;
              
              const res = await addComment(prov.id, body);
              if (res.success && res.comment) {
                // Optimistically add to local form state to show immediately
                setForm(prev => ({
                  ...prev,
                  comments: [...(prev.comments || []), res.comment as any]
                }));
              }
            }} 
          />

          {/* Save / Cancel */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => saveProvision(form)}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" /> Save Provision
            </button>
            <button
              onClick={() => setEditingProvision(null)}
              className="px-6 py-2.5 bg-gray-200 text-gray-600 rounded-xl text-sm hover:bg-gray-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
