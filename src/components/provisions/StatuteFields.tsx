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
