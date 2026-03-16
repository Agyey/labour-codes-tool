/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, ArrowLeft, Loader2, Sparkles, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { StatusBadge } from "./StatusBadge";
import { SuggestionCard } from "./SuggestionCard";
import { DocumentDetail } from "@/types/document";

export function DocumentDetailView({ docId, onBack }: { docId: string; onBack: () => void }) {
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "suggestions" | "structure">("summary");

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents?id=${docId}`);
      const data = await res.json();
      setDetail(data);
    } catch { toast.error("Failed to load document"); }
    finally { setLoading(false); }
  }, [docId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/documents?id=${docId}&action=analyze`);
      const data = await res.json();
      if (res.ok) {
        toast.success(`Analysis complete! ${data.suggestion_count} suggestions generated.`);
        fetchDetail();
      } else {
        toast.error(data.detail || "Analysis failed");
      }
    } catch { toast.error("Analysis failed"); }
    finally { setAnalyzing(false); }
  }, [docId, fetchDetail]);

  const handleApprove = useCallback(async (suggestionId: string) => {
    try {
      const res = await fetch(`/api/documents?suggestionId=${suggestionId}&action=approve`, { method: "PATCH" });
      if (res.ok) {
        toast.success("Suggestion approved & materialized!");
        fetchDetail();
      } else { toast.error("Approval failed"); }
    } catch { toast.error("Approval failed"); }
  }, [fetchDetail]);

  const handleReject = useCallback(async (suggestionId: string) => {
    try {
      const res = await fetch(`/api/documents?suggestionId=${suggestionId}&action=reject`, { method: "PATCH" });
      if (res.ok) {
        toast.success("Suggestion rejected.");
        fetchDetail();
      } else { toast.error("Rejection failed"); }
    } catch { toast.error("Rejection failed"); }
  }, [fetchDetail]);

  const pendingSuggestions = useMemo(() => detail?.suggestions.filter(s => s.status === "pending") || [], [detail?.suggestions]);
  const approvedSuggestions = useMemo(() => detail?.suggestions.filter(s => s.status === "approved") || [], [detail?.suggestions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }
  if (!detail) return null;

  const { document: doc, analysis, suggestions } = detail;
  const tabs = [
    { key: "summary", label: "Summary", count: null },
    { key: "suggestions", label: "Suggestions", count: pendingSuggestions.length },
    { key: "structure", label: "Structure", count: null },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-zinc-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{doc.name}</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">
            {doc.file_name} · {doc.page_count} pages · {(doc.file_size / 1024).toFixed(0)} KB
          </p>
        </div>
        <StatusBadge status={doc.status} />
        {doc.status === "uploaded" && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-2xl hover:scale-105 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2 disabled:opacity-50"
          >
            {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {analyzing ? "Analyzing..." : "Analyze with AI"}
          </button>
        )}
      </div>

      {analysis && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Graph Nodes", value: analysis.graph_nodes, color: "text-indigo-600 dark:text-indigo-400" },
            { label: "Relationships", value: analysis.graph_relationships, color: "text-violet-600 dark:text-violet-400" },
            { label: "Pending Review", value: pendingSuggestions.length, color: "text-amber-600 dark:text-amber-400" },
            { label: "Approved", value: approvedSuggestions.length, color: "text-emerald-600 dark:text-emerald-400" },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 text-center">
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {analysis && (
        <>
          <div className="flex gap-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl p-1">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-sm"
                    : "text-slate-500 dark:text-zinc-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px]">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "summary" && (
              <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">AI Executive Summary</h3>
                <p className="text-slate-700 dark:text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap">
                  {analysis.summary || "No summary generated yet."}
                </p>
                {analysis.document_type && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-2">Type:</span>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 capitalize">{analysis.document_type}</span>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "suggestions" && (
              <motion.div key="suggestions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {suggestions.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
                    <Sparkles className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No suggestions yet. Run AI analysis first.</p>
                  </div>
                ) : (
                  <>
                    {pendingSuggestions.length > 0 && (
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                          {pendingSuggestions.length} pending review
                        </h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => pendingSuggestions.forEach(s => handleApprove(s.id))}
                            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                          >
                            Approve All ({pendingSuggestions.length})
                          </button>
                        </div>
                      </div>
                    )}
                    {suggestions.map(s => (
                      <SuggestionCard key={s.id} suggestion={s} onApprove={handleApprove} onReject={handleReject} />
                    ))}
                  </>
                )}
              </motion.div>
            )}

            {activeTab === "structure" && (
              <motion.div key="structure" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4">Document Structure (Vectorless RAG Tree)</h3>
                {analysis.structured_data?.chapters ? (
                  <div className="space-y-3">
                    {analysis.structured_data.chapters.map((ch: any, i: number) => (
                      <details key={i} className="group">
                        <summary className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 p-3 rounded-xl transition-colors">
                          <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Ch. {ch.chapter_number}</span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200">{ch.chapter_name}</span>
                          <span className="ml-auto text-[10px] text-slate-400">{ch.sections?.length || 0} sections</span>
                        </summary>
                        <div className="ml-8 mt-1 space-y-1">
                          <p className="text-xs text-slate-500 dark:text-zinc-500 mb-2 italic">{ch.summary}</p>
                          {ch.sections?.map((sec: any, j: number) => (
                            <details key={j} className="group/sec">
                              <summary className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 p-2 rounded-lg transition-colors">
                                <ChevronRight className="w-3 h-3 text-slate-400 group-open/sec:rotate-90 transition-transform" />
                                <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400">§{sec.section_number}</span>
                                <span className="text-xs text-slate-700 dark:text-zinc-300">{sec.title}</span>
                              </summary>
                              <div className="ml-6 p-2">
                                <p className="text-xs text-slate-500 dark:text-zinc-500">{sec.summary}</p>
                              </div>
                            </details>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Structure data not available.</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {doc.status === "uploaded" && !analysis && (
        <div className="text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/5 dark:to-purple-500/5 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-500/20">
          <Brain className="w-16 h-16 text-indigo-300 dark:text-indigo-500/50 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-300 mb-2">Document uploaded successfully</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-500 mb-6 max-w-md mx-auto">
            Click below to analyze this document with AI. It will extract the full legal hierarchy, generate compliance suggestions, and build a vectorless RAG graph.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-2xl hover:scale-105 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 mx-auto disabled:opacity-50"
          >
            {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {analyzing ? "Analyzing with Gemini..." : "Analyze Document"}
          </button>
        </div>
      )}

      {analyzing && (
        <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-300 mb-2">Analyzing with Gemini 2.5 Pro...</h3>
          <p className="text-sm text-slate-500 dark:text-zinc-500">Extracting legal hierarchy, building graph, generating suggestions...</p>
        </div>
      )}
    </div>
  );
}
