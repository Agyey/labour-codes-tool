/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  ArrowLeft,
  Loader2,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Trash2,
  Ban,
  TreePine,
  Network,
  FileSearch,
  Shield,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import { StatusBadge } from "./StatusBadge";
import { SuggestionCard } from "./SuggestionCard";
import { DocumentDetail } from "@/types/document";

// ──────────────────────────────────────────────
// Types for streaming events
// ──────────────────────────────────────────────

interface StreamEvent {
  phase: string;
  status: "running" | "done";
  message: string;
  detail?: string;
  elapsed?: string;
  chapters?: Array<{
    chapter: string;
    name: string;
    sections: Array<{ number: string; title: string }>;
  }>;
}

// ──────────────────────────────────────────────
// Phase icon mapping
// ──────────────────────────────────────────────

const PHASE_ICONS: Record<string, React.ReactNode> = {
  init: <Zap className="w-4 h-4" />,
  extraction: <Brain className="w-4 h-4" />,
  structure: <TreePine className="w-4 h-4" />,
  graph: <Network className="w-4 h-4" />,
  finalize: <Shield className="w-4 h-4" />,
};

const PHASE_COLORS: Record<string, string> = {
  init: "text-blue-500",
  extraction: "text-purple-500",
  structure: "text-emerald-500",
  graph: "text-amber-500",
  finalize: "text-indigo-500",
};

// ──────────────────────────────────────────────
// Streaming Analysis Panel
// ──────────────────────────────────────────────

function StreamingProgress({
  events,
  treeData,
  isComplete,
  error,
}: {
  events: StreamEvent[];
  treeData: StreamEvent | null;
  isComplete: boolean;
  error: string | null;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [events]);

  const displayEvents = useMemo(() => {
    const grouped: StreamEvent[] = [];
    let currentThinking: StreamEvent | null = null;

    for (const evt of events) {
      if (evt.message === "Gemini Analysis") {
        const cleanDetail = evt.detail ? evt.detail.replace(/^🤔\s*/, "") : "";
        if (!currentThinking) {
          currentThinking = {
            ...evt,
            message: "AI Thinking...",
            detail: cleanDetail,
          };
          grouped.push(currentThinking);
        } else {
          currentThinking.detail += (cleanDetail ? " " + cleanDetail : "");
          currentThinking.elapsed = evt.elapsed;
          currentThinking.status = evt.status;
        }
      } else {
        currentThinking = null;
        grouped.push(evt);
      }
    }
    return grouped;
  }, [events]);

  return (
    <div className="bg-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden font-mono">
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-5 py-3 bg-zinc-900 border-b border-zinc-800">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-amber-500/70" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
        </div>
        <span className="text-[10px] text-zinc-500 uppercase tracking-wider ml-3 font-sans font-bold">
          Analysis Pipeline
        </span>
        {!isComplete && !error && (
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400 font-sans">LIVE</span>
          </div>
        )}
        {isComplete && (
          <div className="ml-auto flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-emerald-400 font-sans font-bold">COMPLETE</span>
          </div>
        )}
        {error && (
          <div className="ml-auto flex items-center gap-2">
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[10px] text-red-400 font-sans font-bold">FAILED</span>
          </div>
        )}
      </div>

      {/* Stream content */}
      <div ref={scrollRef} className="p-5 space-y-3 max-h-[600px] overflow-y-auto">
        {displayEvents.length === 0 && !error && (
          <div className="flex items-center gap-3 text-zinc-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Connecting to analysis pipeline...</span>
          </div>
        )}

        {displayEvents.map((evt, i) => (
          <motion.div
            key={`${evt.phase}-${evt.status}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-1"
          >
            <div className="flex items-start gap-3">
              {/* Status indicator */}
              <div className="mt-0.5 flex-shrink-0">
                {evt.status === "running" ? (
                  <Loader2 className={`w-4 h-4 animate-spin ${PHASE_COLORS[evt.phase] || "text-zinc-400"}`} />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {/* Phase + message */}
                <div className="flex items-center gap-2">
                  <span className={`flex-shrink-0 ${PHASE_COLORS[evt.phase] || "text-zinc-400"}`}>
                    {PHASE_ICONS[evt.phase] || <FileSearch className="w-4 h-4" />}
                  </span>
                  <span className={`text-xs font-semibold ${
                    evt.status === "done" ? "text-zinc-300" : "text-white"
                  }`}>
                    {evt.message}
                  </span>
                  {evt.elapsed && (
                    <span className="text-[10px] text-zinc-600 ml-auto flex-shrink-0 tabular-nums">
                      {evt.elapsed}
                    </span>
                  )}
                </div>

                {/* Detail text */}
                {evt.detail && (
                  <p className="text-[11px] text-zinc-500 mt-1 ml-6 leading-relaxed">
                    {evt.detail}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Tree structure preview */}
        {treeData?.chapters && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-4 p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800"
          >
            <div className="flex items-center gap-2 mb-3">
              <TreePine className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-sans">
                Document Tree
              </span>
            </div>
            <div className="space-y-1.5">
              {treeData.chapters.map((ch, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-indigo-400 font-bold">Ch. {ch.chapter}</span>
                    <span className="text-[11px] text-zinc-300">{ch.name}</span>
                    <span className="text-[10px] text-zinc-600 ml-auto">{ch.sections.length} §</span>
                  </div>
                  <div className="ml-6 flex flex-wrap gap-1">
                    {ch.sections.slice(0, 6).map((s, j) => (
                      <span
                        key={j}
                        className="text-[9px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded"
                      >
                        §{s.number}
                      </span>
                    ))}
                    {ch.sections.length > 6 && (
                      <span className="text-[9px] px-1.5 py-0.5 text-zinc-600">
                        +{ch.sections.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-red-400">{error}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────

export function DocumentDetailView({ docId, onBack }: { docId: string; onBack: () => void }) {
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "suggestions" | "structure">("summary");
  const [deleting, setDeleting] = useState(false);

  // Streaming state
  const [streamEvents, setStreamEvents] = useState<StreamEvent[]>([]);
  const [treeData, setTreeData] = useState<StreamEvent | null>(null);
  const [streamComplete, setStreamComplete] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchDetail = useCallback(async () => {
    try {
      const res = await fetch(`/api/documents?id=${docId}`);
      const data = await res.json();
      setDetail(data);
    } catch {
      toast.error("Failed to load document");
    } finally {
      setLoading(false);
    }
  }, [docId]);

  // Poll for status when document is "analyzing" but we have no active stream
  // (user navigated away and came back)
  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  useEffect(() => {
    if (detail?.document?.status === "analyzing" && !analyzing) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/documents?id=${docId}`);
          const data = await res.json();
          setDetail(data);
          if (data.document.status !== "analyzing") {
            clearInterval(interval);
            if (data.document.status === "analyzed") {
              toast.success("Analysis completed!");
            }
          }
        } catch { /* ignore */ }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [detail?.document?.status, analyzing, docId]);

  // Streaming analysis handler
  const handleAnalyze = useCallback(async () => {
    setAnalyzing(true);
    setStreamEvents([]);
    setTreeData(null);
    setStreamComplete(false);
    setStreamError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`/api/documents/analyze-stream?id=${docId}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        setStreamError(err.detail || err.error || "Analysis failed");
        setAnalyzing(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        setStreamError("No stream available");
        setAnalyzing(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        let currentEvent = "";
        let currentData = "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            currentData = line.slice(6).trim();
          } else if (line === "" && currentEvent && currentData) {
            try {
              const parsed = JSON.parse(currentData);

              if (currentEvent === "progress") {
                setStreamEvents((prev) => [...prev, parsed as StreamEvent]);
              } else if (currentEvent === "tree") {
                setTreeData(parsed as StreamEvent);
                setStreamEvents((prev) => [...prev, {
                  phase: "structure",
                  status: "done",
                  message: parsed.message,
                } as StreamEvent]);
              } else if (currentEvent === "complete") {
                setStreamComplete(true);
                toast.success(`Analysis complete! ${parsed.suggestion_count} suggestions generated.`);
                fetchDetail();
              } else if (currentEvent === "error") {
                setStreamError(parsed.message);
              }
            } catch {
              // skip malformed JSON
            }
            currentEvent = "";
            currentData = "";
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setStreamError(err.message || "Connection lost");
      }
    } finally {
      setAnalyzing(false);
      abortRef.current = null;
    }
  }, [docId, fetchDetail]);

  // Cancel handler
  const handleCancel = useCallback(async () => {
    // Abort the stream
    abortRef.current?.abort();

    try {
      const res = await fetch(`/api/documents?id=${docId}&action=cancel`, { method: "PATCH" });
      if (res.ok) {
        toast.success("Analysis cancelled");
        setAnalyzing(false);
        setStreamEvents([]);
        setTreeData(null);
        setStreamError(null);
        setStreamComplete(false);
        fetchDetail();
      }
    } catch {
      toast.error("Failed to cancel");
    }
  }, [docId, fetchDetail]);

  // Delete handler
  const handleDelete = useCallback(async () => {
    if (!confirm("Delete this document and all associated analysis? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/documents?id=${docId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Document deleted");
        onBack();
      } else {
        const err = await res.json();
        toast.error(err.detail || err.error || "Delete failed");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  }, [docId, onBack]);

  const handleApprove = useCallback(
    async (suggestionId: string) => {
      try {
        const res = await fetch(`/api/documents?suggestionId=${suggestionId}&action=approve`, {
          method: "PATCH",
        });
        if (res.ok) {
          toast.success("Suggestion approved & materialized!");
          fetchDetail();
        } else {
          toast.error("Approval failed");
        }
      } catch {
        toast.error("Approval failed");
      }
    },
    [fetchDetail]
  );

  const handleReject = useCallback(
    async (suggestionId: string) => {
      try {
        const res = await fetch(`/api/documents?suggestionId=${suggestionId}&action=reject`, {
          method: "PATCH",
        });
        if (res.ok) {
          toast.success("Suggestion rejected.");
          fetchDetail();
        } else {
          toast.error("Rejection failed");
        }
      } catch {
        toast.error("Rejection failed");
      }
    },
    [fetchDetail]
  );

  const pendingSuggestions = useMemo(
    () => detail?.suggestions.filter((s) => s.status === "pending") || [],
    [detail?.suggestions]
  );
  const approvedSuggestions = useMemo(
    () => detail?.suggestions.filter((s) => s.status === "approved") || [],
    [detail?.suggestions]
  );

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

  const showStreamPanel = analyzing || (streamEvents.length > 0 && !streamComplete);
  const showAnalyzingBanner = doc.status === "analyzing" && !analyzing && streamEvents.length === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-zinc-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{doc.name}</h1>
          <p className="text-sm text-slate-500 dark:text-zinc-500 mt-1">
            {doc.file_name} · {doc.page_count} pages · {(doc.file_size / 1024).toFixed(0)} KB
          </p>
        </div>
        <StatusBadge status={doc.status} />

        {/* Delete button — always visible */}
        <button
          onClick={handleDelete}
          disabled={deleting || analyzing}
          className="p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-30 group"
          title="Delete document"
        >
          {deleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Cancel button — during analysis */}
        {analyzing && (
          <button
            onClick={handleCancel}
            className="px-4 py-2.5 bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider rounded-2xl hover:bg-red-500/20 transition-all flex items-center gap-2"
          >
            <Ban className="w-4 h-4" />
            Cancel
          </button>
        )}

        {/* Analyze button — when uploaded and not analyzing */}
        {doc.status === "uploaded" && !analyzing && (
          <button
            onClick={handleAnalyze}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-2xl hover:scale-105 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2"
          >
            <Brain className="w-4 h-4" />
            Analyze with AI
          </button>
        )}
      </div>

      {/* Banner: user returned while analysis is in progress */}
      {showAnalyzingBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 flex items-center gap-4"
        >
          <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
          <div>
            <p className="text-sm font-semibold text-indigo-300">Analysis in progress...</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              The document is being analyzed. Results will appear automatically when complete.
            </p>
          </div>
        </motion.div>
      )}

      {/* Streaming progress panel */}
      {showStreamPanel && (
        <StreamingProgress
          events={streamEvents}
          treeData={treeData}
          isComplete={streamComplete}
          error={streamError}
        />
      )}

      {/* Stats cards — only after analysis */}
      {analysis && (
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: "Graph Nodes",
              value: analysis.graph_nodes,
              color: "text-indigo-600 dark:text-indigo-400",
            },
            {
              label: "Relationships",
              value: analysis.graph_relationships,
              color: "text-violet-600 dark:text-violet-400",
            },
            {
              label: "Pending Review",
              value: pendingSuggestions.length,
              color: "text-amber-600 dark:text-amber-400",
            },
            {
              label: "Approved",
              value: approvedSuggestions.length,
              color: "text-emerald-600 dark:text-emerald-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 text-center"
            >
              <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-500 mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs + Content */}
      {analysis && (
        <>
          <div className="flex gap-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl p-1">
            {tabs.map((tab) => (
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
              <motion.div
                key="summary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6"
              >
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-3">
                  AI Executive Summary
                </h3>
                <p className="text-slate-700 dark:text-zinc-300 leading-relaxed text-sm whitespace-pre-wrap">
                  {analysis.summary || "No summary generated yet."}
                </p>
                {analysis.document_type && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-2">
                      Type:
                    </span>
                    <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
                      {analysis.document_type}
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "suggestions" && (
              <motion.div
                key="suggestions"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                {suggestions.length === 0 ? (
                  <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800">
                    <Sparkles className="w-10 h-10 text-slate-300 dark:text-zinc-700 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">
                      No suggestions yet. Run AI analysis first.
                    </p>
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
                            onClick={() =>
                              pendingSuggestions.forEach((s) => handleApprove(s.id))
                            }
                            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-colors"
                          >
                            Approve All ({pendingSuggestions.length})
                          </button>
                        </div>
                      </div>
                    )}
                    {suggestions.map((s) => (
                      <SuggestionCard
                        key={s.id}
                        suggestion={s}
                        onApprove={handleApprove}
                        onReject={handleReject}
                      />
                    ))}
                  </>
                )}
              </motion.div>
            )}

            {activeTab === "structure" && (
              <motion.div
                key="structure"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-6"
              >
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-4">
                  Document Structure (Vectorless RAG Tree)
                </h3>
                {analysis.structured_data?.chapters ? (
                  <div className="space-y-3">
                    {analysis.structured_data.chapters.map((ch: any, i: number) => (
                      <details key={i} className="group">
                        <summary className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 p-3 rounded-xl transition-colors">
                          <ChevronRight className="w-4 h-4 text-slate-400 group-open:rotate-90 transition-transform" />
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            Ch. {ch.chapter_number}
                          </span>
                          <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
                            {ch.chapter_name}
                          </span>
                          <span className="ml-auto text-[10px] text-slate-400">
                            {ch.sections?.length || 0} sections
                          </span>
                        </summary>
                        <div className="ml-8 mt-1 space-y-1">
                          <p className="text-xs text-slate-500 dark:text-zinc-500 mb-2 italic">
                            {ch.summary}
                          </p>
                          {ch.sections?.map((sec: any, j: number) => (
                            <details key={j} className="group/sec">
                              <summary className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-zinc-800 p-2 rounded-lg transition-colors">
                                <ChevronRight className="w-3 h-3 text-slate-400 group-open/sec:rotate-90 transition-transform" />
                                <span className="text-[11px] font-bold text-violet-600 dark:text-violet-400">
                                  §{sec.section_number}
                                </span>
                                <span className="text-xs text-slate-700 dark:text-zinc-300">
                                  {sec.title}
                                </span>
                              </summary>
                              <div className="ml-6 p-2">
                                <p className="text-xs text-slate-500 dark:text-zinc-500">
                                  {sec.summary}
                                </p>
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

      {/* CTA when no analysis and not streaming */}
      {doc.status === "uploaded" && !analysis && !showStreamPanel && (
        <div className="text-center py-16 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/5 dark:to-purple-500/5 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-500/20">
          <Brain className="w-16 h-16 text-indigo-300 dark:text-indigo-500/50 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-zinc-300 mb-2">
            Document uploaded successfully
          </h3>
          <p className="text-sm text-slate-500 dark:text-zinc-500 mb-6 max-w-md mx-auto">
            Click below to analyze this document with AI. It will extract the full legal hierarchy,
            generate compliance suggestions, and build a vectorless RAG graph.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-2xl hover:scale-105 transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 mx-auto disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            Analyze Document
          </button>
        </div>
      )}
    </div>
  );
}
