"use client";

import { STATES } from "@/config/states";
import { COMPLIANCE_STATUSES } from "@/config/tags";
import type { Provision } from "@/types/provision";

interface StateWideFieldsProps {
  form: Provision;
  update: <K extends keyof Provision>(key: K, val: Provision[K]) => void;
  inputCls: string;
  sectionCls: string;
}

export function StateWideFields({
  form,
  update,
  inputCls,
  sectionCls
}: StateWideFieldsProps) {
  return (
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
                  <select value={(form.stateCompStatus || {})[s] || "Not Started"} onChange={(e) => update("stateCompStatus", { ...form.stateCompStatus, [s]: e.target.value as NonNullable<Provision['stateCompStatus']>[string] })} className={inputCls}>
                    {COMPLIANCE_STATUSES.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
