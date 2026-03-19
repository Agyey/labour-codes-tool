"use client";

import { Globe } from "lucide-react";
import type { Provision } from "@/types/provision";

interface ApplicabilityFieldsProps {
  form: Provision;
  update: <K extends keyof Provision>(key: K, val: Provision[K]) => void;
  textareaCls: string;
  labelCls: string;
  sectionCls: string;
}

export function ApplicabilityFields({
  form,
  update,
  textareaCls,
  labelCls,
  sectionCls
}: ApplicabilityFieldsProps) {
  return (
    <div className={sectionCls}>
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
           <Globe className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-zinc-200">Applicability Context</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Scope of Application (Geographical & Industrial)</label>
          <textarea 
            value={form.applicability || ""} 
            onChange={(e) => update("applicability", e.target.value)}
            placeholder="e.g. Applicable to the whole of India; applied to every establishment employing 20 or more persons..."
            className={textareaCls} 
          />
        </div>
      </div>
    </div>
  );
}
