"use client";

import { useState, useEffect } from "react";
import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { Save, X } from "lucide-react";
import { CommentSection } from "./CommentSection";
import { addComment } from "@/app/actions/provisions";
import { createBlankOldMapping } from "@/lib/utils";
import type { Provision, OldMapping, ComplianceItem, Comment } from "@/types/provision";
import { BasicInfoFields } from "./BasicInfoFields";
import { StatuteFields } from "./StatuteFields";
import { RepealedMappingFields } from "./RepealedMappingFields";
import { PenaltyFields } from "./PenaltyFields";
import { RulesAndFormsFields } from "./RulesAndFormsFields";
import { ComplianceFields } from "./ComplianceFields";
import { StateWideFields } from "./StateWideFields";
import { TimelineFields } from "./TimelineFields";
import { MetadataFields } from "./MetadataFields";

import { HierarchyConnectors } from "./HierarchyConnectors";

export function EditorModal() {
  const { editingProvision, setEditingProvision } = useUI();
  const { saveProvision, users } = useData();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<Provision | null>(null);

  useEffect(() => {
    if (editingProvision) {
      setForm(JSON.parse(JSON.stringify(editingProvision)));
    }
  }, [editingProvision]);

  if (!editingProvision || !form) return null;

  const prov = editingProvision;
  const inputCls = "w-full p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-zinc-200 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none";
  const labelCls = "block text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 ml-1";
  const sectionCls = "p-8 bg-slate-50/50 dark:bg-zinc-900/50 rounded-[40px] border border-slate-100 dark:border-zinc-800/50 space-y-6";
  const textareaCls = "w-full p-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl text-sm font-bold text-slate-700 dark:text-zinc-200 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-sans min-h-[120px]";

  function update<K extends keyof Provision>(key: K, val: Provision[K]) {
    setForm((prev) => prev ? ({ ...prev, [key]: val }) : null);
  }

  function toggleInArray(key: "changeTags" | "workflowTags", val: string) {
    setForm((prev) => {
      if (!prev) return null;
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val],
      };
    });
  }

  function updateOldMapping(idx: number, key: keyof OldMapping, val: any) {
    setForm((prev) => {
      if (!prev) return null;
      const mappings = [...prev.oldMappings];
      mappings[idx] = { ...mappings[idx], [key]: val };
      return { ...prev, oldMappings: mappings };
    });
  }

  function toggleOldMappingTag(idx: number, tag: string) {
    setForm((prev) => {
      if (!prev) return null;
      const mappings = [...prev.oldMappings];
      const tags = mappings[idx].changeTags || [];
      mappings[idx] = {
        ...mappings[idx],
        changeTags: tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag],
      };
      return { ...prev, oldMappings: mappings };
    });
  }

  function addArrayItem(key: "draftRules" | "repealedRules" | "forms") {
    update(key, [...(form![key] || []), { ref: "", summary: "" }]);
  }

  function removeArrayItem(key: "draftRules" | "repealedRules" | "forms", idx: number) {
    update(key, (form![key] || []).filter((_, i) => i !== idx));
  }

  function updateArrayItem(key: "draftRules" | "repealedRules" | "forms", idx: number, field: string, val: string) {
    const arr = [...(form![key] || [])];
    arr[idx] = { ...arr[idx], [field]: val };
    update(key, arr);
  }

  function addCompItem() {
    update("compItems", [...(form!.compItems || []), { task: "", assignee: "", due: "" }]);
  }

  function removeCompItem(idx: number) {
    update("compItems", (form!.compItems || []).filter((_, i) => i !== idx));
  }

  function updateCompItem(idx: number, field: keyof ComplianceItem, val: string) {
    const arr = [...(form!.compItems || [])];
    arr[idx] = { ...arr[idx], [field]: val };
    update("compItems", arr);
  }

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-950 rounded-[56px] w-[95%] max-w-[1100px] max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in zoom-in-95 duration-500 ease-out">
        <div className="flex items-center justify-between p-10 pb-6 border-b border-slate-50 dark:border-zinc-900">
          <div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {prov.id.includes("temp-") ? "Initialize" : "Optimize"} Provision
            </h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Intelligence Layer Editor</p>
          </div>
          <button onClick={() => setEditingProvision(null)} className="p-4 bg-slate-50 dark:bg-zinc-900 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-3xl transition-all hover:scale-110 active:scale-90 cursor-pointer">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow overflow-auto p-10 space-y-10 custom-scrollbar">
          <HierarchyConnectors 
            form={form} 
            update={update} 
            labelCls={labelCls} 
            sectionCls={sectionCls} 
          />

          <BasicInfoFields form={form} update={update} inputCls={inputCls} labelCls={labelCls} sectionCls={sectionCls} />
          
          <StatuteFields 
            form={form} 
            update={update} 
            toggleInArray={toggleInArray} 
            inputCls={inputCls} 
            textareaCls={textareaCls}
            labelCls={labelCls} 
            sectionCls={sectionCls} 
          />

          <RepealedMappingFields 
            form={form} 
            updateOldMapping={updateOldMapping} 
            toggleOldMappingTag={toggleOldMappingTag} 
            addOldMapping={() => update("oldMappings", [...form.oldMappings, createBlankOldMapping()])}
            removeOldMapping={(idx) => update("oldMappings", form.oldMappings.filter((_, i) => i !== idx))}
            inputCls={inputCls} 
            textareaCls={textareaCls}
            labelCls={labelCls} 
            sectionCls={sectionCls} 
          />

          <PenaltyFields form={form} update={update} inputCls={inputCls} labelCls={labelCls} sectionCls={sectionCls} />

          <RulesAndFormsFields 
            form={form} 
            addArrayItem={addArrayItem}
            removeArrayItem={removeArrayItem}
            updateArrayItem={updateArrayItem}
            update={update}
            inputCls={inputCls} 
            labelCls={labelCls}
            sectionCls={sectionCls} 
          />

          <ComplianceFields 
            form={form} 
            users={users} 
            addCompItem={addCompItem}
            removeCompItem={removeCompItem}
            updateCompItem={updateCompItem}
            inputCls={inputCls} 
            sectionCls={sectionCls} 
          />

          <StateWideFields form={form} update={update} inputCls={inputCls} sectionCls={sectionCls} />

          <TimelineFields form={form} update={update} inputCls={inputCls} sectionCls={sectionCls} />

          <MetadataFields form={form} users={users} update={update} inputCls={inputCls} labelCls={labelCls} sectionCls={sectionCls} />
        </div>

          <CommentSection 
            comments={form.comments} 
            onAddComment={async (body) => {
              if (prov.id.includes("temp-")) return;
              const res = await addComment(prov.id, body);
              if (res.success && res.comment) {
                setForm(prev => prev ? ({ ...prev, comments: [...(prev.comments || []), res.comment as Comment] }) : null);
              }
            }} 
          />

          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800 mt-6">
            <button
              onClick={async () => {
                setIsSaving(true);
                try {
                  await saveProvision(form);
                  setEditingProvision(null);
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} /> 
              {isSaving ? "Saving..." : "Save Provision"}
            </button>
            <button onClick={() => setEditingProvision(null)} disabled={isSaving} className="px-6 py-2.5 bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 rounded-xl text-sm hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors cursor-pointer disabled:opacity-50">
              Cancel
            </button>
        </div>
      </div>
    </div>
  );
}
