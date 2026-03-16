"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { 
  Database, 
  CheckCircle2, 
  XOctagon, 
  Settings2,
  AlertCircle,
  ExternalLink,
  Bot,
  Loader2
} from "lucide-react";
import { getDraftScenarios, approveDraftScenario, rejectDraftScenario } from "@/app/actions/knowledge";
import toast from "react-hot-toast";

export default function KnowledgeBaseVerification() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDraft, setSelectedDraft] = useState<string | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await getDraftScenarios();
    // Only show pending items
    const pending = data.filter((d: any) => d.status === 'Pending Review');
    setDrafts(pending);
    if (pending.length > 0) setSelectedDraft(pending[0].id);
    else setSelectedDraft(null);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (id: string, action: 'approve' | 'reject') => {
    setIsReviewing(true);
    const res = action === 'approve' ? await approveDraftScenario(id) : await rejectDraftScenario(id);
    if (res.success) {
      toast.success(`Scenario ${action}ed successfully.`);
      await loadData();
    } else {
      toast.error(`Failed to ${action} scenario.`);
    }
    setIsReviewing(false);
  };

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
            <span className="px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 rounded-full text-xs">{drafts.length} items</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <span className="text-sm">Fetching Knowledge Base...</span>
              </div>
            ) : drafts.map(draft => (
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
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{draft.raw_scrape?.source_name || "Web Source"}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${draft.confidence > 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    <Bot className="w-3 h-3" /> 92% Match
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight mb-2">{draft.name}</h3>
                <div className="text-[10px] font-mono font-medium text-slate-400 bg-slate-50 dark:bg-zinc-800 px-2 py-1 rounded-lg mb-2 inline-block">ID: {draft.raw_scrape?.metadata?.gazetteId || 'N/A'}</div>
                <div className="text-xs text-slate-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Extracted Recently</div>
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
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2">{activeDoc.name}</h2>
                  <a 
                    href={activeDoc.raw_scrape?.source_url || "#"} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    View Original Source Article <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    disabled={isReviewing}
                    onClick={() => handleReview(activeDoc.id, 'reject')}
                    className="px-4 py-2 bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 hover:bg-rose-100 transition-colors font-bold text-sm rounded-xl flex items-center gap-2 disabled:opacity-50"
                  >
                    <XOctagon className="w-4 h-4" /> Reject
                  </button>
                  <button 
                    disabled={isReviewing}
                    onClick={() => handleReview(activeDoc.id, 'approve')}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                  >
                    {isReviewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Approve to Production
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 dark:bg-zinc-950/50">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-indigo-500" /> Extracted Execution Parameters
              </h3>

              <div className="space-y-4">
                {activeDoc.tasks.map((task: any, i: number) => (
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
                        <div className="text-sm font-medium text-slate-700 dark:text-zinc-300">{task.due_logic}</div>
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
