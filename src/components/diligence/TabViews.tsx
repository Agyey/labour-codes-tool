"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities */

import React, { useState } from "react";
import { 
  FileText, 
  ExternalLink, 
  FileUp, 
  AlertTriangle, 
  ShieldCheck, 
  FileBarChart 
} from "lucide-react";
import { generateDiligenceReport } from "@/app/actions/diligence";
import toast from "react-hot-toast";

export function DocumentView({ project }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {project.requisitions.flatMap((r: any) => r.documents).map((doc: any) => (
         <div key={doc.id} className="p-4 bg-white dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-zinc-800 flex flex-col items-center text-center group cursor-pointer hover:border-indigo-500 transition-all">
            <div className="w-16 h-20 bg-slate-50 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 transition-all">
               <FileText className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 transition-all" />
               <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                  <ExternalLink className="w-5 h-5 text-indigo-600" />
               </div>
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-white line-clamp-1 truncate w-full px-2">{doc.name}</div>
            <div className="text-[10px] text-slate-400 mt-1 uppercase">v{doc.version} • {new Date(doc.uploaded_at).toLocaleDateString()}</div>
         </div>
      ))}
      {project.requisitions.flatMap((r: any) => r.documents).length === 0 && (
        <div className="col-span-full py-20 text-center bg-slate-50/50 dark:bg-zinc-800/20 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800">
          <FileUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold">No documents uploaded</h3>
          <p className="text-sm text-slate-500">Wait for the target company to upload requested files.</p>
        </div>
      )}
    </div>
  );
}

export function RiskLog({ project }: any) {
  const findings = project.requisitions.flatMap((r: any) => r.findings.map((f: any) => ({...f, reqTitle: r.title, bucket: r.bucket?.name})));
  
  return (
    <div className="space-y-6">
      {findings.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm">
          <ShieldCheck className="w-12 h-12 text-emerald-500/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold">Safe Horizon</h3>
          <p className="text-sm text-slate-500">No high-risk issues flagged in the review process yet.</p>
        </div>
      ) : (
        findings.map((finding: any) => (
          <div key={finding.id} className="p-6 bg-white dark:bg-zinc-900/50 rounded-2xl border border-slate-200 dark:border-zinc-800 flex gap-6 items-start">
            <div className={`p-3 rounded-xl ${
              finding.severity === 'Deal Breaker' ? 'bg-rose-100 text-rose-600' : 
              finding.severity === 'High' ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <div>
                   <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{finding.bucket || "General"} • {finding.reqTitle}</div>
                   <h4 className="text-lg font-bold text-slate-900 dark:text-white">{finding.description}</h4>
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                  finding.severity === 'Deal Breaker' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {finding.severity}
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">{finding.analysis}</p>
              <div className="mt-4 p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border border-slate-100 dark:border-zinc-800">
                 <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Recommendation</div>
                 <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">{finding.recommendation}</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export function ReportPreview({ project }: { project: any }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<any>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    const res = await generateDiligenceReport(project.id);
    if (res.success) {
      setReport(res.report);
      toast.success("Draft report generated");
    }
    setIsGenerating(false);
  }

  return (
    <div className="p-12 bg-white dark:bg-zinc-900/50 rounded-[40px] border border-slate-200 dark:border-zinc-800 shadow-xl max-w-4xl mx-auto min-h-[600px] flex flex-col relative overflow-hidden">
      {!report && (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
           <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mb-6">
              <FileBarChart className="w-10 h-10 text-indigo-600" />
           </div>
           <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Generate Final Report</h3>
           <p className="text-slate-500 mb-8 max-w-md">Our engine will aggregate all flagged findings, risk analysis, and supporting evidence into a structured draft.</p>
           <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-50"
          >
            {isGenerating ? "Processing Finds..." : "Initialize Draft Generation"}
          </button>
        </div>
      )}

      {report && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">
           <div className="border-b-4 border-indigo-600 pb-8 flex justify-between items-end">
              <div>
                 <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase leading-none mb-2">DD Report</h1>
                 <div className="text-sm font-bold text-slate-400 uppercase tracking-[4px]">{project.target_company}</div>
              </div>
              <div className="text-right text-[10px] font-bold text-slate-400">
                GEN-ID: {project.id.slice(-8)}<br/>
                DATE: {new Date().toLocaleDateString().toUpperCase()}
              </div>
           </div>

           <section className="space-y-4">
              <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">I. Executive Summary</h3>
              <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                This report provides a comprehensive legal due diligence review of {project.target_company} ("Target") in connection with the proposed {project.type} transaction by {project.client_name} ("Client"). The review focused on corporate hygiene, material contracts, and regulatory compliance.
              </p>
           </section>

           <section className="space-y-6">
              <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-100 pb-2">II. Critical Findings</h3>
              {report.findings.critical.length === 0 ? (
                <div className="text-xs text-slate-500 italic">No Deal-Breaker or High-Risk issues identified.</div>
              ) : (
                report.findings.critical.map((f: any, i: number) => (
                  <div key={i} className="p-6 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border-l-[6px] border-rose-600">
                     <div className="text-[10px] font-black text-rose-600 uppercase mb-1">{f.severity}</div>
                     <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">{f.description}</h4>
                     <p className="text-sm text-slate-600 dark:text-zinc-400">{f.analysis}</p>
                  </div>
                ))
              )}
           </section>

           <div className="pt-10 flex justify-end gap-3 no-print">
              <button onClick={() => setReport(null)} className="px-5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800">Clear</button>
              <button className="px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black rounded-xl text-xs flex items-center gap-2">
                <FileUp className="w-4 h-4" />
                Export to DOCX
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
