"use client";

import { useApp } from "@/context/AppContext";
import { CODES } from "@/config/codes";
import { IMPACT_COLORS, CHANGE_TAG_COLORS, WORKFLOW_TAG_COLORS } from "@/config/tags";
import { STATES } from "@/config/states";
import { COMPLIANCE_STATUSES } from "@/config/tags";
import { Badge } from "@/components/shared/Badge";
import type { Provision } from "@/types/provision";
import {
  Star,
  ChevronDown,
  ChevronUp,
  Pencil,
  CheckCircle,
  Pin,
  Trash2,
  FileText,
  Eye,
  EyeOff,
  Globe,
} from "lucide-react";

interface ProvisionCardProps {
  provision: Provision;
}

export function ProvisionCard({ provision: p }: ProvisionCardProps) {
  const {
    activeCode,
    expandedProvisionId,
    setExpandedProvision,
    canEdit,
    setEditingProvision,
    toggleVerify,
    togglePin,
    deleteProvision,
    showTextMap,
    toggleShowText,
    complianceStatuses,
    setComplianceStatus,
  } = useApp();

  const cObj = CODES[activeCode];
  const isExpanded = expandedProvisionId === p.id;
  const impactColor = IMPACT_COLORS[p.impact] || "#6b7280";

  return (
    <div
      className="border border-gray-200 rounded-xl mb-3 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
      style={{ borderLeftWidth: 4, borderLeftColor: impactColor }}
    >
      {/* Collapsed header */}
      <button
        onClick={() => setExpandedProvision(isExpanded ? null : p.id)}
        className="w-full flex items-center px-4 py-3 text-left gap-3 hover:bg-gray-50/80 transition-colors cursor-pointer"
      >
        {p.pinned && <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />}
        <span
          className="text-xs font-bold min-w-[55px] flex-shrink-0"
          style={{ color: cObj.c }}
        >
          S.{p.sec}
          {p.sub}
        </span>
        <span className="flex-1 text-sm font-semibold text-gray-800 truncate">
          {p.title}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {p.verified && (
            <Badge text="✓ Verified" bgColor="#d1fae5" color="#065f46" />
          )}
          {(p.workflowTags || [])
            .filter((t) => t !== "Verified")
            .slice(0, 2)
            .map((t) => (
              <Badge
                key={t}
                text={t}
                bgColor={WORKFLOW_TAG_COLORS[t]}
              />
            ))}
          <Badge
            text={(p.ruleAuth || "").split(" ")[0]}
            bgColor="#e5e7eb"
            color="#374151"
          />
          <Badge text={p.impact} bgColor={impactColor} />
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 py-4 border-t border-gray-100 space-y-4 bg-white animate-in slide-in-from-top-1 duration-200">
          {/* Admin actions */}
          {canEdit && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() =>
                  setEditingProvision(JSON.parse(JSON.stringify(p)))
                }
                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors cursor-pointer"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
              <button
                onClick={() => toggleVerify(p.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                  p.verified
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                {p.verified ? "Verified" : "Verify"}
              </button>
              <button
                onClick={() => togglePin(p.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border transition-colors cursor-pointer ${
                  p.pinned
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <Pin className="w-3 h-3" />
                {p.pinned ? "Pinned" : "Pin"}
              </button>
              <button
                onClick={() => {
                  if (confirm("Delete this provision?")) deleteProvision(p.id);
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs hover:bg-red-100 transition-colors cursor-pointer ml-auto"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {(p.changeTags || []).map((t) => (
              <Badge key={`c-${t}`} text={t} bgColor={CHANGE_TAG_COLORS[t]} />
            ))}
            {(p.workflowTags || []).map((t) => (
              <Badge key={`w-${t}`} text={t} bgColor={WORKFLOW_TAG_COLORS[t]} />
            ))}
          </div>

          {/* Summary */}
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-2">
              {cObj.s} S.{p.sec}
              {p.sub} — Summary
            </div>
            <div className="text-sm text-gray-800 leading-relaxed">
              {p.summary}
            </div>
            <button
              onClick={() => toggleShowText(`n-${p.id}`)}
              className="flex items-center gap-1 mt-3 text-xs text-emerald-600 cursor-pointer hover:text-emerald-800 transition-colors"
            >
              {showTextMap[`n-${p.id}`] ? (
                <><EyeOff className="w-3 h-3" /> Hide full statutory text</>
              ) : (
                <><Eye className="w-3 h-3" /> Show full statutory text</>
              )}
            </button>
            {showTextMap[`n-${p.id}`] && (
              <pre className="mt-2 p-3 bg-emerald-100/50 rounded-lg text-xs text-gray-700 whitespace-pre-wrap font-serif leading-relaxed max-h-[300px] overflow-auto">
                {p.fullText}
              </pre>
            )}
          </div>

          {/* Per-Act Change Analysis */}
          {(p.oldMappings || []).length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-3">
                Per-Act Change Analysis ({p.oldMappings.length})
              </h4>
              <div className="space-y-2.5">
                {p.oldMappings.map((m, i) => (
                  <div
                    key={i}
                    className="border border-red-200 rounded-xl overflow-hidden"
                  >
                    <div className="p-3 bg-red-50">
                      <div className="text-xs font-bold text-red-600 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        ✕ {m.act} — {m.sec}
                      </div>
                      <div className="text-xs text-gray-600 mt-1.5">
                        {m.summary}
                      </div>
                      <button
                        onClick={() => toggleShowText(`o-${p.id}-${i}`)}
                        className="text-[10px] text-red-500 cursor-pointer hover:text-red-700 mt-1.5 transition-colors"
                      >
                        {showTextMap[`o-${p.id}-${i}`]
                          ? "Hide full text"
                          : "Show full text"}
                      </button>
                      {showTextMap[`o-${p.id}-${i}`] && (
                        <pre className="mt-2 p-2 bg-red-100/50 rounded text-[10px] text-gray-600 whitespace-pre-wrap font-serif leading-relaxed max-h-[200px] overflow-auto">
                          {m.fullText}
                        </pre>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-blue-600 mb-1.5">
                        WHAT CHANGED (vs this Act):
                      </div>
                      <div className="text-xs text-gray-800 leading-relaxed">
                        {m.change}
                      </div>
                      {(m.changeTags || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {m.changeTags.map((t) => (
                            <Badge
                              key={t}
                              text={t}
                              bgColor={CHANGE_TAG_COLORS[t]}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Penalty comparison */}
          {(p.penaltyOld || p.penaltyNew) && (
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-50 rounded-xl border border-red-200">
                <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                  Old Penalty
                </div>
                <div className="text-xs mt-1.5">{p.penaltyOld || "—"}</div>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  New Penalty
                </div>
                <div className="text-xs mt-1.5">{p.penaltyNew || "—"}</div>
              </div>
            </div>
          )}

          {/* Draft + Repealed Rules + Forms */}
          {((p.draftRules || []).length > 0 ||
            (p.repealedRules || []).length > 0 ||
            (p.forms || []).length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(p.draftRules || []).length > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">
                    Draft Central Rules
                  </div>
                  {p.draftRules.map((r, i) => (
                    <div key={i} className="text-xs mb-1.5">
                      <b className="text-amber-800">{r.ref}</b>
                      <br />
                      <span className="text-gray-600">{r.summary}</span>
                    </div>
                  ))}
                </div>
              )}
              {(p.repealedRules || []).length > 0 && (
                <div className="p-3 bg-pink-50 rounded-xl border border-pink-200">
                  <div className="text-[10px] font-bold text-pink-700 uppercase tracking-wider mb-2">
                    Repealed Rules
                  </div>
                  {p.repealedRules.map((r, i) => (
                    <div key={i} className="text-xs mb-1.5">
                      <b className="text-pink-800">✕ {r.ref}</b>
                      <br />
                      <span className="text-gray-600">{r.summary}</span>
                    </div>
                  ))}
                </div>
              )}
              {(p.forms || []).length > 0 && (
                <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
                  <div className="text-[10px] font-bold text-sky-700 uppercase tracking-wider mb-2">
                    Forms / Registers
                  </div>
                  {p.forms.map((r, i) => (
                    <div key={i} className="text-xs mb-1.5">
                      <b className="text-sky-800">{r.ref}</b>
                      <br />
                      <span className="text-gray-600">{r.summary}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* State-wise notes */}
          {STATES.some(
            (s) => (p.stateNotes || {})[s] || (p.stateRuleText || {})[s]
          ) && (
            <details className="group">
              <summary className="text-xs font-bold text-violet-600 cursor-pointer select-none flex items-center gap-1">
                <Globe className="w-3 h-3" />
                State-wise Notes
                <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
              </summary>
              <table className="w-full text-xs border-collapse mt-2">
                <tbody>
                  {STATES.filter(
                    (s) =>
                      (p.stateNotes || {})[s] || (p.stateRuleText || {})[s]
                  ).map((s) => (
                    <tr key={s} className="border-b border-gray-100">
                      <td className="py-1.5 px-2 font-semibold w-20">{s}</td>
                      <td className="py-1.5 px-2 text-gray-600">
                        {(p.stateNotes || {})[s]}
                      </td>
                      <td className="py-1.5 px-2 text-gray-400 italic">
                        {(p.stateRuleText || {})[s]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          )}

          {/* Notes */}
          {p.notes && (
            <div className="p-2.5 bg-violet-50 rounded-lg text-xs text-violet-800">
              <b>Notes:</b> {p.notes}
            </div>
          )}

          {/* Assignee & due */}
          {(p.assignee || p.dueDate) && (
            <div className="text-xs text-gray-500">
              {p.assignee && <span><b>Assignee:</b> {p.assignee} </span>}
              {p.dueDate && <span><b>Due:</b> {p.dueDate}</span>}
            </div>
          )}

          {/* Compliance Items */}
          {(p.compItems || []).length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-2">
                Compliance ({p.compItems.length})
              </h4>
              <div className="space-y-1.5">
                {p.compItems.map((c, j) => {
                  const cid = `${p.id}-${j}`;
                  const st = complianceStatuses[cid] || "Not Started";
                  return (
                    <div
                      key={j}
                      className="flex items-center gap-2.5 py-1.5 border-b border-gray-100 text-xs"
                    >
                      <select
                        value={st}
                        onChange={(e) =>
                          setComplianceStatus(cid, e.target.value)
                        }
                        className={`px-1.5 py-1 border rounded-md text-[10px] min-w-[85px] cursor-pointer ${
                          st === "Compliant"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : st === "In Progress"
                              ? "bg-amber-50 border-amber-200 text-amber-700"
                              : "bg-white border-gray-200 text-gray-600"
                        }`}
                      >
                        {COMPLIANCE_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <span className="flex-1 text-gray-700">{c.task}</span>
                      {c.assignee && (
                        <span className="text-[10px] text-gray-400">
                          @{c.assignee}
                        </span>
                      )}
                      {c.due && (
                        <span className="text-[10px] text-gray-400">
                          {c.due}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
