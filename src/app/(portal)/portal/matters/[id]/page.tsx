"use client";

import { useState } from "react";
import { 
  Building2, 
  Files, 
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  UploadCloud,
  MessageSquare
} from "lucide-react";

export default function ClientMatterView({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState<"overview" | "documents">("overview");

  const matter = {
    name: "Reliance - Q3 Private Placement",
    progress: 45,
    dueDate: "2026-04-15",
    status: "Action Required"
  };

  const requiredActions = [
    { title: "Upload Board Resolution (Draft)", status: "Pending", due: "Today" },
    { title: "Review Valuation Report", status: "In Review", due: "Tomorrow" },
  ];

  const milestones = [
    { title: "Structuring & Due Diligence", completed: true, date: "Mar 01" },
    { title: "Documentation & Signatures", completed: false, date: "In Progress" },
    { title: "ROC Filings & Compliance", completed: false, date: "Pending" },
    { title: "Closing", completed: false, date: "Pending" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Matter Header */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-4 animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5" /> Action Required
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            {matter.name}
          </h1>
          <div className="flex items-center gap-4 text-sm font-semibold text-slate-500 dark:text-zinc-400">
            <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> Reliance Industries</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Target: {matter.dueDate}</span>
          </div>
        </div>

        <div className="text-right w-full md:w-48 flex-shrink-0">
          <div className="text-sm font-bold text-slate-900 dark:text-white mb-2">Overall Progress</div>
          <div className="flex items-center gap-3">
            <div className="w-full h-2.5 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${matter.progress}%` }} />
            </div>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{matter.progress}%</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-zinc-800 px-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "overview" 
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Deal Overview
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`flex items-center gap-2 pb-3 px-1 text-sm font-bold border-b-2 transition-colors ${
            activeTab === "documents" 
              ? "border-indigo-500 text-indigo-600 dark:text-indigo-400" 
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <Files className="w-4 h-4" /> Secure Data Room
        </button>
      </div>

      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Action Items */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Your Pending Actions</h2>
            <div className="space-y-3">
              {requiredActions.map((action, i) => (
                <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm group">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
                      Due {action.due}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-4">{action.title}</h3>
                  <button className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                    <UploadCloud className="w-4 h-4" /> Upload Document
                  </button>
                </div>
              ))}
            </div>
            
            <div className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl p-5 mt-4">
              <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4" /> Message from Alpha & Partners
              </h3>
              <p className="text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed font-medium">
                "Please review the valuation report and upload the signed board resolutions by EOD so we can file PAS-3 tomorrow morning."
              </p>
            </div>
          </div>

          {/* Deal Milestones */}
          <div className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6">Deal Milestones</h2>
            <div className="relative border-l-2 border-slate-200 dark:border-zinc-800 ml-3 space-y-8">
              {milestones.map((m, i) => (
                <div key={i} className="relative pl-6">
                  <div className={`absolute top-0 -left-[9px] w-4 h-4 rounded-full border-2 ${
                    m.completed 
                      ? 'bg-emerald-500 border-emerald-500' 
                      : i === 1 
                        ? 'bg-white dark:bg-zinc-900 border-indigo-500' 
                        : 'bg-slate-200 dark:bg-zinc-800 border-slate-200 dark:border-zinc-800'
                  }`} />
                  <h3 className={`text-sm font-bold ${m.completed ? 'text-slate-900 dark:text-white' : i === 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-600'}`}>
                    {m.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mt-1">{m.date}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {activeTab === "documents" && (
        <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center min-h-[300px]">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Secure Data Room Vault</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm">Completed transaction documents and compliance filings will appear here securely once approved by your legal team.</p>
        </div>
      )}

    </div>
  );
}
