"use client";

import { IMPACT_LEVELS, RULE_AUTHORITIES } from "@/config/tags";
import type { Provision } from "@/types/provision";

interface BasicInfoFieldsProps {
  form: Provision;
  update: <K extends keyof Provision>(key: K, val: Provision[K]) => void;
  inputCls: string;
  labelCls: string;
  sectionCls: string;
}

export function BasicInfoFields({ form, update, inputCls, labelCls, sectionCls }: BasicInfoFieldsProps) {
  return (
    <div className={sectionCls}>
      <h3 className="text-xs font-bold text-gray-700">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className={labelCls}>Chapter</label>
          <input value={form.ch || ""} onChange={(e) => update("ch", e.target.value)} className={inputCls} placeholder="e.g. IV" />
        </div>
        <div>
          <label className={labelCls}>Chapter Name</label>
          <input value={form.chName || ""} onChange={(e) => update("chName", e.target.value)} className={inputCls} placeholder="e.g. Registration" />
        </div>
        <div>
          <label className={labelCls}>Section</label>
          <input value={form.sec || ""} onChange={(e) => update("sec", e.target.value)} className={inputCls} placeholder="e.g. 7" />
        </div>
        <div>
          <label className={labelCls}>Sub-section</label>
          <input value={form.sub || ""} onChange={(e) => update("sub", e.target.value)} className={inputCls} placeholder="e.g. (1)" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <label className={labelCls}>Title</label>
          <input value={form.title || ""} onChange={(e) => update("title", e.target.value)} className={inputCls} placeholder="Short title..." />
        </div>
        <div>
          <label className={labelCls}>Type</label>
          <select value={form.provisionType} onChange={(e) => update("provisionType", e.target.value as any)} className={inputCls + " appearance-none capitalize font-bold text-xs"}>
            <option value="section">Section</option>
            <option value="rule">Rule</option>
            <option value="form">Form</option>
            <option value="register">Register</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Impact</label>
          <select value={form.impact} onChange={(e) => update("impact", e.target.value as Provision["impact"])} className={inputCls + " appearance-none font-bold text-xs"}>
            {IMPACT_LEVELS.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Rule Authority</label>
          <select value={form.ruleAuth} onChange={(e) => update("ruleAuth", e.target.value as Provision["ruleAuth"])} className={inputCls + " appearance-none font-bold text-xs"}>
            {RULE_AUTHORITIES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
