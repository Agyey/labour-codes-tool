"use client";

import { CHANGE_TAGS, CHANGE_TAG_COLORS } from "@/config/tags";
import { TagChip } from "@/components/shared/TagChip";
import { Plus, Trash2 } from "lucide-react";
import type { Provision, OldMapping } from "@/types/provision";

interface RepealedMappingFieldsProps {
  form: Provision;
  updateOldMapping: (idx: number, key: keyof OldMapping, val: string | string[]) => void;
  toggleOldMappingTag: (idx: number, tag: string) => void;
  addOldMapping: () => void;
  removeOldMapping: (idx: number) => void;
  inputCls: string;
  textareaCls: string;
  labelCls: string;
  sectionCls: string;
}

export function RepealedMappingFields({
  form,
  updateOldMapping,
  toggleOldMappingTag,
  addOldMapping,
  removeOldMapping,
  inputCls,
  textareaCls,
  labelCls,
  sectionCls
}: RepealedMappingFieldsProps) {
  return (
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
  );
}
