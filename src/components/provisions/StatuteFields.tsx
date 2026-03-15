import { CHANGE_TAGS, WORKFLOW_TAGS, CHANGE_TAG_COLORS, WORKFLOW_TAG_COLORS } from "@/config/tags";
import { TagChip } from "@/components/shared/TagChip";
import { Scale, Gavel, PlusCircle } from "lucide-react";
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
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
             <Scale className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-zinc-200">Statutory Core</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Legal Summary</label>
            <textarea value={form.summary || ""} onChange={(e) => update("summary", e.target.value)} rows={3} className={inputCls + " min-h-[80px]"} placeholder="Briefly describe the purpose of this provision..." />
          </div>
          <div>
            <label className={labelCls}>Full Statutory Text</label>
            <textarea value={form.fullText || ""} onChange={(e) => update("fullText", e.target.value)} rows={6} className={textareaCls + " font-serif leading-relaxed"} placeholder="Paste the verbatim legal text here..." />
          </div>
        </div>
      </div>

      <div className={sectionCls}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
               <Gavel className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-zinc-200">Sub-sections & Provisos</h3>
          </div>
          <button 
            onClick={() => update("subSections", [...(form.subSections || []), { marker: "", text: "" }])}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Add Sub-sec
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
