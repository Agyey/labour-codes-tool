"use client";
import { useState } from "react";
import toast from "react-hot-toast";
import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
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
  Download,
  AlertTriangle,
  GitCompare,
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { motion } from "framer-motion";

interface ProvisionCardProps {
  provision: Provision;
}

export function ProvisionCard({ provision: p }: ProvisionCardProps) {
  const {
    activeCode,
    expandedProvisionId,
    setExpandedProvision,
    setEditingProvision,
    showTextMap,
    toggleShowText,
  } = useUI();
  const {
    canEdit,
    toggleVerify,
    togglePin,
    deleteProvision,
    complianceStatuses,
    setComplianceStatus,
  } = useData();

  const cObj = CODES[activeCode];
  const isExpanded = expandedProvisionId === p.id;
  const impactColor = IMPACT_COLORS[p.impact] || "#6b7280";
  const [isExporting, setIsExporting] = useState(false);

  const exportPDF = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExporting(true);
    try {
      const element = document.getElementById(`pdf-content-${p.id}`);
      if (!element) return;
      
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.text(`Labour Code Advisory: ${cObj.s} S.${p.sec}${p.sub}`, 10, 10);
      pdf.addImage(imgData, "PNG", 0, 15, pdfWidth, pdfHeight);
      pdf.save(`Advisory_S${p.sec}_${p.title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl mb-4 overflow-hidden shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05),_0_4px_16px_-4px_rgba(0,0,0,0.02)] border border-slate-200/60 ring-1 ring-slate-900/5 hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.08)] transition-all duration-300 transform-gpu"
      style={{ borderLeftWidth: 4, borderLeftColor: impactColor }}
    >
      {/* Collapsed header */}
      <button
        onClick={() => setExpandedProvision(isExpanded ? null : p.id)}
        className="w-full flex items-center px-5 py-4 text-left gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
      >
        {p.pinned && <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />}
        <span
          className="text-sm font-extrabold tracking-tight min-w-[60px] flex-shrink-0"
          style={{ color: cObj.c }}
        >
          S.{p.sec}
          {p.sub}
        </span>
        <span className="flex-1 text-[15px] font-bold text-slate-900 truncate tracking-tight">
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
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-5 py-5 border-t border-slate-100 space-y-5 bg-white animate-in slide-in-from-top-1 duration-200">
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
                  toast((t) => (
                    <span className="flex items-center gap-3">
                      <span className="text-sm">Delete this provision?</span>
                      <button
                        onClick={() => { deleteProvision(p.id); toast.dismiss(t.id); }}
                        className="px-2.5 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600"
                      >Delete</button>
                      <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-2.5 py-1 bg-slate-600 text-white rounded-lg text-xs font-bold hover:bg-slate-700"
                      >Cancel</button>
                    </span>
                  ), { duration: 8000 });
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs hover:bg-red-100 transition-colors cursor-pointer ml-auto"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          )}

          {/* Export PDF Button (Available to all users) */}
          <div className="flex justify-end">
            <button
              onClick={exportPDF}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" /> 
              {isExporting ? "Generating..." : "Export as PDF Report"}
            </button>
          </div>

          <div id={`pdf-content-${p.id}`} className="space-y-4 bg-white p-2">
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
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                {cObj.s} S.{p.sec}{p.sub} — Executive Summary
              </div>
              <button
                onClick={() => toggleShowText(`n-${p.id}`)}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors shadow-sm"
              >
                {showTextMap[`n-${p.id}`] ? (
                  <><EyeOff className="w-3 h-3" /> Hide Text</>
                ) : (
                  <><Eye className="w-3 h-3" /> Read Statute</>
                )}
              </button>
            </div>
            <div className="text-[15px] text-slate-800 leading-relaxed font-medium">
              {p.summary}
            </div>
            
            {showTextMap[`n-${p.id}`] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-4 pt-4 border-t border-slate-200/60"
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Original Statutory Text</div>
                <pre className="p-4 bg-white border border-slate-100 rounded-xl text-sm text-slate-700 whitespace-pre-wrap font-serif leading-relaxed max-h-[400px] overflow-auto shadow-inner">
                  {p.fullText}
                </pre>
              </motion.div>
            )}
          </div>

          {/* Per-Act Change Analysis */}
          {(p.oldMappings || []).length > 0 && (
            <div className="mt-6">
              <h4 className="text-[11px] font-extrabold text-rose-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                <GitCompare className="w-4 h-4" />
                Repealed Act Analysis ({p.oldMappings.length})
              </h4>
              <div className="space-y-3">
                {p.oldMappings.map((m, i) => (
                  <div
                    key={i}
                    className="bg-white border border-rose-100 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <div className="p-4 bg-rose-50/50 border-b border-rose-100/50">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-[13px] font-bold text-rose-700 flex items-center gap-1.5 mb-1.5">
                            <span className="bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-[4px] text-[10px] tracking-wider uppercase">Repealed</span>
                            {m.act} — {m.sec}
                          </div>
                          <div className="text-sm text-slate-700 font-medium leading-relaxed">
                            {m.summary}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleShowText(`o-${p.id}-${i}`)}
                          className="flex-shrink-0 px-2.5 py-1.5 bg-white border border-rose-100 rounded-lg text-[10px] font-bold text-rose-600 cursor-pointer hover:bg-rose-50 transition-colors shadow-sm"
                        >
                          {showTextMap[`o-${p.id}-${i}`] ? "Hide Text" : "Read Text"}
                        </button>
                      </div>
                      
                      {showTextMap[`o-${p.id}-${i}`] && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3"
                        >
                          <pre className="p-3 bg-white border border-rose-100 rounded-xl text-xs text-slate-600 whitespace-pre-wrap font-serif leading-relaxed max-h-[250px] overflow-auto shadow-inner">
                            {m.fullText}
                          </pre>
                        </motion.div>
                      )}
                    </div>
                    <div className="p-4 bg-white">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        Key Changes
                      </div>
                      <div className="text-[14px] text-slate-800 leading-relaxed font-medium">
                        {m.change}
                      </div>
                      {(m.changeTags || []).length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
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
          </div> {/* End of PDF grab area */}
        </div>
      )}
    </div>
  );
}
