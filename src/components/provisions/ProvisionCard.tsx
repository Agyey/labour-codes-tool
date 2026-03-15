"use client";

import { useState, memo } from "react";
import toast from "react-hot-toast";
import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { CODES } from "@/config/codes";
import { IMPACT_COLORS, WORKFLOW_TAG_COLORS } from "@/config/tags";
import { Badge } from "@/components/shared/Badge";
import type { Provision } from "@/types/provision";
import { Star,
  ChevronDown,
  ChevronUp,
  Pencil,
  CheckCircle,
  Pin,
  Trash2,
  Download,
  Scale,
  Gavel,
  FileText,
  ScrollText,
  Shield,
  BookOpen,
  MapPin,
  ClipboardList,
} from "lucide-react";
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

type TabKey = 'statute' | 'repealed' | 'rules' | 'compliance' | 'states';

const TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'statute', label: 'Statute', icon: FileText },
  { key: 'repealed', label: 'Repealed', icon: ScrollText },
  { key: 'rules', label: 'Rules & Forms', icon: BookOpen },
  { key: 'compliance', label: 'Compliance', icon: ClipboardList },
  { key: 'states', label: 'State Notes', icon: MapPin },
];

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
  const [activeTab, setActiveTab] = useState<TabKey>('statute');

  const isRule = p.provisionType === 'rule';
  const TypeIcon = isRule ? Gavel : Scale;

  const exportPDF = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExporting(true);
    try {
      const element = document.getElementById(`prov-${p.id}`);
      if (!element) return;
      
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

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

  // Check which tabs have content
  const hasRepealed = (p.oldMappings || []).length > 0;
  const hasRules = (p.draftRules || []).length > 0 || (p.repealedRules || []).length > 0 || (p.forms || []).length > 0;
  const hasCompliance = (p.compItems || []).length > 0 || p.penaltyOld || p.penaltyNew;
  const hasStates = Object.values(p.stateNotes || {}).some(v => v);

  return (
    <motion.div 
      layout
      id={`prov-${p.id}`}
      initial={false}
      transition={{ 
        layout: { duration: 0.4, ease: [0.23, 1, 0.32, 1] },
        opacity: { duration: 0.2 }
      }}
      className={`group relative bg-white dark:bg-zinc-900 rounded-2xl border transition-all duration-400 overflow-hidden mb-4 ${
        isExpanded 
          ? 'border-slate-300 dark:border-zinc-700 shadow-premium-hover ring-4 ring-slate-100/50 dark:ring-white/5' 
          : 'border-slate-200 dark:border-zinc-800/80 hover:shadow-premium hover:border-slate-300 dark:hover:border-zinc-700'
      }`}
      style={{ borderLeftWidth: 4, borderLeftColor: impactColor }}
    >
      {/* Header */}
      <button
        onClick={() => setExpandedProvision(isExpanded ? null : p.id)}
        aria-label={isExpanded ? "Collapse" : "Expand"}
        className="w-full flex items-center px-5 py-4 text-left gap-4 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
      >
        {p.pinned && <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />}
        
        {/* Type badge + Section reference */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
            isRule 
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
              : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
          }`}>
            <TypeIcon className="w-3 h-3 inline-block mr-0.5 -mt-0.5" />
            {isRule ? 'R' : 'S'}
          </span>
          <span className="text-sm font-extrabold tracking-tight min-w-[40px]" style={{ color: cObj.c }}>
            {p.sec}{p.sub}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-1 truncate transition-colors group-hover:text-slate-900 dark:group-hover:text-white">{p.title}</h3>
          <div className="flex items-center gap-3 mt-1">
            <Badge text={p.impact} color={impactColor} />
            <div className="flex items-center gap-1">
              {(p.workflowTags || []).map(t => (
                <Badge key={t} text={t} color={WORKFLOW_TAG_COLORS[t]} />
              ))}
            </div>
            {(p.subSections || []).length > 0 && (
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                {p.subSections.length} sub-secs
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {p.verified && <CheckCircle className="w-4 h-4 text-emerald-500" />}
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400 dark:text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
              <div className="px-5 pb-6 border-t border-slate-100 dark:border-zinc-800/80">
                
                {/* Tab Navigation */}
                <div className="flex items-center gap-1 py-4 border-b border-slate-100 dark:border-zinc-800 -mx-5 px-5 overflow-x-auto">
                  {TABS.map(tab => {
                    // Hide empty tabs
                    if (tab.key === 'repealed' && !hasRepealed) return null;
                    if (tab.key === 'rules' && !hasRules) return null;
                    if (tab.key === 'compliance' && !hasCompliance) return null;
                    if (tab.key === 'states' && !hasStates) return null;

                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                          isActive
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                            : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tab.label}
                        {tab.key === 'repealed' && hasRepealed && (
                          <span className={`text-[9px] ml-1 px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                            {p.oldMappings.length}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Tab Content */}
                <div className="py-6">
                  {activeTab === 'statute' && (
                    <StatuteView provision={p} codeShortName={cObj.n} />
                  )}
                  {activeTab === 'repealed' && (
                    <RepealedAnalysis provision={p} />
                  )}
                  {activeTab === 'rules' && (
                    <RulesAndForms provision={p} />
                  )}
                  {activeTab === 'compliance' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <PenaltyInfo provision={p} />
                      <ComplianceItemsList provision={p} />
                    </div>
                  )}
                  {activeTab === 'states' && (
                    <StateNotesTable provision={p} />
                  )}
                </div>

              {/* Action Footer */}
              <div className="mt-4 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button onClick={() => toggleVerify(p.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${p.verified ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 hover:text-slate-900 dark:hover:text-white'}`}>
                    <CheckCircle className="w-4 h-4" /> {p.verified ? "Verified" : "Verify Content"}
                  </button>
                  <button onClick={() => togglePin(p.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${p.pinned ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20' : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700 hover:text-slate-900 dark:hover:text-white'}`}>
                    <Pin className="w-4 h-4" /> {p.pinned ? "Unpinned" : "Pin for Review"}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={exportPDF} disabled={isExporting} className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all" title="Export PDF">
                    <Download className={`w-5 h-5 ${isExporting ? 'animate-bounce' : ''}`} />
                  </button>
                  {canEdit && (
                    <>
                      <button onClick={() => setEditingProvision(p)} className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"><Pencil className="w-5 h-5" /></button>
                      <button onClick={() => { if (confirm("Delete?")) deleteProvision(p.id); }} className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
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
