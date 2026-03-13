"use client";

import { CHANGE_TAGS, WORKFLOW_TAGS, CHANGE_TAG_COLORS, WORKFLOW_TAG_COLORS } from "@/config/tags";
import { TagChip } from "@/components/shared/TagChip";
import type { Provision } from "@/types/provision";

interface StatuteFieldsProps {
  form: Provision;
  update: <K extends keyof Provision>(key: K, val: Provision[K]) => void;
  toggleInArray: (key: "changeTags" | "workflowTags", val: string) => void;
  inputCls: string;
  textareaCls: string;
  labelCls: string;
  sectionCls: string;
}

export function StatuteFields({
  form,
  update,
  toggleInArray,
  inputCls,
  textareaCls,
  labelCls,
  sectionCls
}: StatuteFieldsProps) {
  return (
    <>
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

      <div className={sectionCls}>
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-700">Sub-sections / Provisos</h3>
          <button 
            onClick={() => update("subSections", [...(form.subSections || []), { marker: "", text: "" }])}
            className="text-[10px] font-bold text-blue-500 hover:text-blue-600 uppercase tracking-widest"
          >
            + Add Sub-sec
          </button>
        </div>
        <div className="space-y-2">
          {(form.subSections || []).map((ss, i) => (
            <div key={i} className="flex gap-2">
              <input 
                value={ss.marker} 
                onChange={(e) => {
                  const items = [...form.subSections];
                  items[i] = { ...items[i], marker: e.target.value };
                  update("subSections", items);
                }}
                placeholder="(x)" 
                className={`${inputCls} w-16 text-center`} 
              />
              <input 
                value={ss.text} 
                onChange={(e) => {
                  const items = [...form.subSections];
                  items[i] = { ...items[i], text: e.target.value };
                  update("subSections", items);
                }}
                placeholder="Text content..." 
                className={inputCls} 
              />
              <button 
                onClick={() => update("subSections", form.subSections.filter((_, idx) => idx !== i))}
                className="text-red-400 hover:text-red-600 text-xs px-1"
              >
                ×
              </button>
            </div>
          ))}
          {(!form.subSections || form.subSections.length === 0) && (
            <p className="text-[10px] text-slate-400 italic">No structural sub-sections defined.</p>
          )}
        </div>
      </div>

      <div className={sectionCls}>
        <h3 className="text-xs font-bold text-gray-700">Change Tags</h3>
        <div className="flex flex-wrap gap-1.5">
          {CHANGE_TAGS.map((t) => (
            <TagChip
              key={t}
              tag={t}
              colorMap={CHANGE_TAG_COLORS}
              onClick={() => toggleInArray("changeTags", t)}
              active={(form.changeTags || []).includes(t)}
            />
          ))}
        </div>
      </div>

      <div className={sectionCls}>
        <h3 className="text-xs font-bold text-gray-700">Workflow Tags</h3>
        <div className="flex flex-wrap gap-1.5">
          {WORKFLOW_TAGS.map((t) => (
            <TagChip
              key={t}
              tag={t}
              colorMap={WORKFLOW_TAG_COLORS}
              onClick={() => toggleInArray("workflowTags", t)}
              active={(form.workflowTags || []).includes(t)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
