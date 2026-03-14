import { Plus, Trash2, Link, FileText } from "lucide-react";
import type { Provision } from "@/types/provision";

interface RulesAndFormsFieldsProps {
  form: Provision;
  addArrayItem: (key: "forms") => void;
  removeArrayItem: (key: "forms", idx: number) => void;
  updateArrayItem: (key: "forms", idx: number, field: string, val: string) => void;
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
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
             <Link className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-zinc-200">Relational Sourcing</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <p className="text-[10px] text-slate-400 mt-2 italic font-medium">Rules should be uploaded as standalone provisions and linked here by their section reference.</p>
          </div>
        </div>
      </div>

      <div className={sectionCls}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
               <FileText className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-zinc-200">Forms & Registers</h3>
          </div>
          <button onClick={() => addArrayItem("forms")} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer">
            <Plus className="w-4 h-4" /> Add Form
          </button>
        </div>

        <div className="space-y-3">
          {(form.forms || []).map((r, i) => (
            <div key={i} className="flex gap-3 items-start animate-in fade-in slide-in-from-right-2 duration-300 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
              <div className="flex-1">
                <label className={labelCls}>Reference</label>
                <input value={r.ref} onChange={(e) => updateArrayItem("forms", i, "ref", e.target.value)} placeholder="e.g. Form IV" className={inputCls} />
              </div>
              <div className="flex-[2]">
                <label className={labelCls}>Description</label>
                <input value={r.summary} onChange={(e) => updateArrayItem("forms", i, "summary", e.target.value)} placeholder="e.g. Register of Overtime" className={inputCls} />
              </div>
              <button onClick={() => removeArrayItem("forms", i)} className="mt-7 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {form.forms.length === 0 && (
            <p className="text-center py-6 text-xs text-slate-400 font-medium italic">No forms or registers linked yet.</p>
          )}
        </div>
      </div>
    </>
  );
}
