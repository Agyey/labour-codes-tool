import { CHANGE_TAGS, CHANGE_TAG_COLORS } from "@/config/tags";
import { TagChip } from "@/components/shared/TagChip";
import { Plus, Trash2, Link, Search } from "lucide-react";
import type { Provision, OldMapping } from "@/types/provision";
import { useData } from "@/context/DataContext";
import { CODES } from "@/config/codes";
import { useState } from "react";

interface RepealedMappingFieldsProps {
  form: Provision;
  updateOldMapping: (idx: number, key: keyof OldMapping, val: any) => void;
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
  const { provisions } = useData();
  const [search, setSearch] = useState("");

  // Only show provisions from the same bucket (framework)
  const availableProvisions = provisions.filter(p => 
    p.frameworkId === form.frameworkId && 
    p.id !== form.id
  );

  const filtered = availableProvisions.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.sec.toLowerCase().includes(search.toLowerCase()) ||
    p.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={sectionCls}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-black text-slate-800 dark:text-zinc-200 uppercase tracking-widest">Cross-Act Relational Mapping</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Link this provision to repealed acts or related regulations</p>
        </div>
        <button onClick={addOldMapping} className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-500/20 active:scale-95 cursor-pointer">
          <Plus className="w-4 h-4" /> Add Mapping
        </button>
      </div>

      {(form.oldMappings || []).map((m, i) => (
        <div key={i} className="border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 bg-white dark:bg-zinc-900/50 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-rose-500" />
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Mapping Entry #{i + 1}</span>
            </div>
            <button onClick={() => removeOldMapping(i)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all cursor-pointer">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <label className={labelCls}>Direct Link (Bucket Search)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <select 
                    className={inputCls + " pl-10 appearance-none"}
                    value={m.linkedProvisionId || ""}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const p = provisions.find(x => x.id === selectedId);
                      if (p) {
                         updateOldMapping(i, "linkedProvisionId", p.id);
                         updateOldMapping(i, "act", CODES[p.code as keyof typeof CODES]?.n || p.code);
                         updateOldMapping(i, "sec", p.sec);
                         updateOldMapping(i, "summary", p.summary);
                         updateOldMapping(i, "fullText", p.fullText);
                      } else {
                         updateOldMapping(i, "linkedProvisionId", "");
                      }
                    }}
                  >
                    <option value="">-- Manually Entry or Select Provision --</option>
                    {filtered.map(p => (
                      <option key={p.id} value={p.id}>
                        [{CODES[p.code as keyof typeof CODES]?.s || p.code}] S.{p.sec}{p.sub} - {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-1">
                <label className={labelCls}>Repealed Act</label>
                <input value={m.act || ""} onChange={(e) => updateOldMapping(i, "act", e.target.value)} className={inputCls} placeholder="e.g. Factories Act, 1948" />
              </div>
              <div className="md:col-span-1">
                <label className={labelCls}>Old Section</label>
                <input value={m.sec || ""} onChange={(e) => updateOldMapping(i, "sec", e.target.value)} className={inputCls} placeholder="e.g. 11" />
              </div>
              <div className="md:col-span-1">
                <label className={labelCls}>Old Sub-sec</label>
                <input value={m.subSec || ""} onChange={(e) => updateOldMapping(i, "subSec", e.target.value)} className={inputCls} placeholder="(1)(a)" />
              </div>
              <div className="md:col-span-1">
                <label className={labelCls}>Target Sub</label>
                <input value={m.targetSubSec || ""} onChange={(e) => updateOldMapping(i, "targetSubSec", e.target.value)} className={inputCls} placeholder="(2)" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Summary of Old Provision</label>
                <textarea value={m.summary || ""} onChange={(e) => updateOldMapping(i, "summary", e.target.value)} rows={3} className={textareaCls} />
              </div>
              <div>
                <label className={labelCls}>Functional Change / Analysis</label>
                <textarea value={m.change || ""} onChange={(e) => updateOldMapping(i, "change", e.target.value)} rows={3} className={textareaCls} placeholder="How does this new provision compare?" />
              </div>
            </div>

            <div>
              <label className={labelCls}>Change Classification Tags</label>
              <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-100 dark:border-zinc-800">
                {CHANGE_TAGS.map((t) => (
                  <TagChip key={t} tag={t} colorMap={CHANGE_TAG_COLORS} small onClick={() => toggleOldMappingTag(i, t)} active={(m.changeTags || []).includes(t)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {form.oldMappings.length === 0 && (
        <div className="py-12 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-[40px] text-center">
            <Link className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No relational mappings defined</p>
            <button onClick={addOldMapping} className="mt-4 px-6 py-2 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer">
              Add First Mapping
            </button>
        </div>
      )}
    </div>
  );
}
