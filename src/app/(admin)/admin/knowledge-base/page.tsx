"use client";

import { useState } from "react";
import { 
  Database, 
  CheckCircle2, 
  XOctagon, 
  Settings2,
  AlertCircle,
  ExternalLink,
  Bot
} from "lucide-react";

export default function KnowledgeBaseVerification() {
  const [selectedDraft, setSelectedDraft] = useState<string | null>("draft_1");

  // Mock AI Drafts scraped from the web
  const drafts = [
    { 
      id: "draft_1", 
      source: "TaxGuru.in", 
      title: "Private Placement Procedure (Companies Act 2013)",
      confidence: 94,
      dateScraped: "2 hours ago",
      tasks: [
        { name: "Convene Board Meeting to approve Draft Offer Letter", assignee: "Firm", dueLogic: "Before issuing PAS-4" },
        { name: "File Form MGT-14 with ROC", assignee: "Firm", dueLogic: "Within 30 days of Board Res." },
        { name: "Open Separate Bank Account", assignee: "Client", dueLogic: "Before receiving funds" }
      ]
    },
    { 
      id: "draft_2", 
      source: "ClearTax.in", 
      title: "GST Registration Process for E-Commerce",
      confidence: 72,
      dateScraped: "5 hours ago",
      tasks: [
        { name: "Collect PAN, Aadhaar, and Address Proof", assignee: "Client", dueLogic: "Prerequisite" },
        { name: "Submit Part A on GST Portal", assignee: "Firm", dueLogic: "Post document collection" }
      ]
    }
  ];

  const activeDoc = drafts.find(d => d.id === selectedDraft);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-[calc(100vh-140px)] flex flex-col">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3 mb-2">
          <Database className="w-8 h-8 text-indigo-500" /> AI Verification Queue
        </h1>
        <p className="text-slate-500 dark:text-zinc-400">Review LLM-parsed checklists extracted from open web crawlers before publishing them to the global Scenario Engine.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 min-h-0">
        
        {/* Left Column: Draft List */}
        <div className="w-full lg:w-1/3 flex flex-col overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl">
          <div className="p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
            Pending Review
            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 rounded-full text-xs">2 items</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {drafts.map(draft => (
              <button
                key={draft.id}
                onClick={() => setSelectedDraft(draft.id)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all ${
                  selectedDraft === draft.id 
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" 
                    : "border-slate-100 hover:border-indigo-200 dark:border-zinc-800 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{draft.source}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${draft.confidence > 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    <Bot className="w-3 h-3" /> {draft.confidence}% Match
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-2">{draft.title}</h3>
                <div className="text-xs text-slate-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Extracted {draft.dateScraped}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: AI Translation Review */}
        {activeDoc ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl">
            <div className="p-6 md:p-8 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2">{activeDoc.title}</h2>
                  <a 
                    href={activeDoc.source === 'TaxGuru.in' ? "https://taxguru.in/company-law/private-placement-procedure-companies-act-2013.html" : "https://cleartax.in/s/gst-registration"} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Original Source Article <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-100 transition-colors font-bold text-sm rounded-xl flex items-center gap-2">
                    <XOctagon className="w-4 h-4" /> Reject
                  </button>
                  <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" /> Approve to Production
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 dark:bg-zinc-950/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-indigo-500" /> Extracted Execution Parameters
              </h3>

              <div className="space-y-4">
                {activeDoc.tasks.map((task, i) => (
                  <div key={i} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-slate-500">{i + 1}</div>
                      <h4 className="font-bold text-slate-900 dark:text-white flex-1">{task.name}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pl-9">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Assignee Mapping</div>
                        <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{task.assignee}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Extracted Due Logic</div>
                        <div className="text-sm font-medium text-slate-700 dark:text-zinc-300">{task.dueLogic}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center border border-dashed border-slate-300 dark:border-zinc-800 rounded-3xl">
            <span className="text-slate-400 font-medium">Select a draft to review</span>
          </div>
        )}

      </div>
    </div>
  );
}
