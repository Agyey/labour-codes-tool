"use client";

import React, { useState } from "react";
import { 
  ChevronRight, 
  LayoutGrid, 
  ListChecks, 
  FileText, 
  AlertTriangle, 
  FileBarChart,
  ShieldCheck,
  Building2,
  Globe,
  Clock
} from "lucide-react";

interface ProjectDetailProps {
  project: any;
  onBack: () => void;
  requisitionTable: React.ReactNode;
  matrixView: (requisition: any) => React.ReactNode;
  documentView: React.ReactNode;
  riskLog: React.ReactNode;
  reportPreview: React.ReactNode;
}

export function ProjectDetail({ 
  project, 
  onBack, 
  requisitionTable,
  matrixView,
  documentView,
  riskLog,
  reportPreview
}: ProjectDetailProps) {
  const [activeTab, setActiveTab] = useState("requisitions");
  const [selectedRequisitionId, setSelectedRequisitionId] = useState<string | null>(null);

  if (selectedRequisitionId) {
    const req = project.requisitions.find((r: any) => r.id === selectedRequisitionId);
    return matrixView(req);
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Top Navigation */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{project.name}</h2>
          <div className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg border border-indigo-100 dark:border-indigo-800/50 uppercase">
            {project.type}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800 mb-8 overflow-x-auto no-scrollbar">
        {[
          { id: "overview", label: "Overview", icon: LayoutGrid },
          { id: "requisitions", label: "Requisitions", icon: ListChecks },
          { id: "documents", label: "Documents", icon: FileText },
          { id: "risks", label: "Risk Log", icon: AlertTriangle },
          { id: "report", label: "Report Builder", icon: FileBarChart },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedRequisitionId(null);
            }}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap ${
              activeTab === tab.id 
                ? 'text-indigo-600 border-b-2 border-indigo-600' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'opacity-100' : 'opacity-40'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-8">
        {activeTab === "overview" && <DiligenceOverview project={project} />}
        {activeTab === "requisitions" && React.cloneElement(requisitionTable as React.ReactElement, { 
          setSelectedRequisitionId 
        })}
        {activeTab === "documents" && documentView}
        {activeTab === "risks" && riskLog}
        {activeTab === "report" && reportPreview}
      </div>
    </div>
  );
}

function DiligenceOverview({ project }: { project: any }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <div className="p-8 bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Discovery Pulse</h3>
          <div className="grid grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800">
               <div className="text-3xl font-black text-indigo-600 mb-1">24%</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Project<br/>Completion</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800">
               <div className="text-3xl font-black text-emerald-600 mb-1">12</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Documents<br/>Approved</div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border border-slate-100 dark:border-zinc-800">
               <div className="text-3xl font-black text-rose-600 mb-1">3</div>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">Critical<br/>Findings</div>
            </div>
          </div>
        </div>
        
        <div className="p-8 bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Project Team</h3>
            <button className="text-indigo-600 text-xs font-bold hover:underline">+ Invite Member</button>
          </div>
          <div className="space-y-4">
            {project.matter.members.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold font-mono">
                    {m.user.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <div className="text-sm font-bold">{m.user.name}</div>
                    <div className="text-[10px] text-slate-400">{m.user.email}</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 rounded-lg text-[10px] font-bold uppercase">{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="p-8 bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Metadata</h3>
          <div className="space-y-4">
            <MetaItem label="Client" value={project.client_name} icon={ShieldCheck} />
            <MetaItem label="Target" value={project.target_company} icon={Building2} />
            <MetaItem label="Type" value={project.type} icon={Briefcase} />
            <MetaItem label="Jurisdiction" value={project.jurisdiction || "N/A"} icon={Globe} />
            <MetaItem label="Created" value={new Date(project.created_at).toLocaleDateString()} icon={Clock} />
          </div>
        </div>
        
        <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl">
          <div className="flex items-center gap-2 text-amber-600 font-bold text-sm mb-2">
            <AlertTriangle className="w-4 h-4" />
            Quick Suggestion
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-400/80 leading-relaxed">
            The target company has multiple subsidiaries in Gujarat. Consider adding "Inter-state Transfer" requisitions.
          </p>
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value, icon: Icon }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-50 dark:bg-zinc-800 rounded-lg text-slate-400">
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
        <div className="text-sm font-bold text-slate-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}

import { Briefcase } from "lucide-react";
