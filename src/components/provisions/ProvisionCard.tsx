"use client";

import { useState, memo } from "react";
import toast from "react-hot-toast";
import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { CODES } from "@/config/codes";
import { IMPACT_COLORS, WORKFLOW_TAG_COLORS } from "@/config/tags";
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
  Download,
} from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { StatuteView } from "./StatuteView";
import { RepealedAnalysis } from "./RepealedAnalysis";
import { PenaltyInfo } from "./PenaltyInfo";
import { RulesAndForms } from "./RulesAndForms";
import { StateNotesTable } from "./StateNotesTable";
import { ComplianceItemsList } from "./ComplianceItemsList";
import { motion, AnimatePresence } from "framer-motion";

interface ProvisionCardProps {
  provision: Provision;
}

export const ProvisionCard = memo(function ProvisionCard({ provision: p }: ProvisionCardProps) {
  const {
    activeCode,
    expandedProvisionId,
    setExpandedProvision,
    setEditingProvision,
  } = useUI();
  const {
    canEdit,
    toggleVerify,
    togglePin,
    deleteProvision,
  } = useData();

  const cObj = CODES[activeCode];
  const isExpanded = expandedProvisionId === p.id;
  const impactColor = IMPACT_COLORS[p.impact] || "#6b7280";
  const [isExporting, setIsExporting] = useState(false);

  const exportPDF = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExporting(true);
    try {
      const element = document.getElementById(`prov-${p.id}`);
      if (!element) return;
      
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`provision-${p.code}-${p.sec}.pdf`);
      toast.success("PDF exported successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div 
      layout
      id={`prov-${p.id}`}
      initial={false}
      transition={{ 
        layout: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
        opacity: { duration: 0.2 }
      }}
      className={`group relative bg-white rounded-2xl border ${
        isExpanded 
          ? 'border-slate-300 shadow-premium-hover ring-4 ring-slate-100/50' 
          : 'border-slate-200 hover:shadow-premium hover:border-slate-300'
      } transition-all duration-300 overflow-hidden mb-4`}
      style={{ borderLeftWidth: 4, borderLeftColor: impactColor }}
    >
      <button
        onClick={() => setExpandedProvision(isExpanded ? null : p.id)}
        aria-label={isExpanded ? "Collapse" : "Expand"}
        className="w-full flex items-center px-5 py-4 text-left gap-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
      >
        {p.pinned && <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />}
        <span className="text-sm font-extrabold tracking-tight min-w-[60px] flex-shrink-0" style={{ color: cObj.c }}>
          S.{p.sec}{p.sub}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800 line-clamp-1 truncate">{p.title}</h3>
          <div className="flex items-center gap-3 mt-1">
            <Badge text={p.impact} color={impactColor} />
            <div className="flex items-center gap-1">
              {(p.workflowTags || []).map(t => (
                <Badge key={t} text={t} color={WORKFLOW_TAG_COLORS[t]} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {p.verified && <CheckCircle className="w-4 h-4 text-emerald-500" />}
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 border-t border-slate-100">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
                <StatuteView provision={p} codeShortName={cObj.n} />
                <RepealedAnalysis provision={p} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6 border-t border-slate-100">
                <PenaltyInfo provision={p} />
                <RulesAndForms provision={p} />
                <ComplianceItemsList provision={p} />
              </div>

              <StateNotesTable provision={p} />

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleVerify(p.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${p.verified ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    <CheckCircle className="w-4 h-4" /> {p.verified ? "Verified" : "Verify Content"}
                  </button>
                  <button onClick={() => togglePin(p.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${p.pinned ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                    <Pin className="w-4 h-4" /> {p.pinned ? "Unpinned" : "Pin for Review"}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={exportPDF} disabled={isExporting} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Export PDF">
                    <Download className={`w-5 h-5 ${isExporting ? 'animate-bounce' : ''}`} />
                  </button>
                  {canEdit && (
                    <>
                      <button onClick={() => setEditingProvision(p)} className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"><Pencil className="w-5 h-5" /></button>
                      <button onClick={() => { if (confirm("Delete?")) deleteProvision(p.id); }} className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
