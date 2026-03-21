import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { StreamingProgress } from "./StreamingProgress";
import toast from "react-hot-toast";
import { DocumentDetail } from "@/types/document";
import { StreamEvent } from "./StreamingProgress";
import { DocumentSummaryTab } from "./tabs/DocumentSummaryTab";
import { DocumentSuggestionsTab } from "./tabs/DocumentSuggestionsTab";
import { DocumentStructureTab } from "./tabs/DocumentStructureTab";
import { DocumentDetailHeader } from "./DocumentDetailHeader";
import { DocumentDetailStats } from "./DocumentDetailStats";
import { DocumentDetailCTA } from "./DocumentDetailCTA";
import { confirmAction } from "@/lib/confirm";

interface StreamPayload {
  message?: string;
  suggestion_count?: number;
  [key: string]: unknown;
}


// ──────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────

export function DocumentDetailView({ docId, onBack }: { docId: string; onBack: () => void }) {
  const router = useRouter();
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
                setStreamEvents((prev: StreamEvent[]) => [...prev, parsed as StreamEvent]);
              } else if (currentEvent === "tree") {
                setTreeData(parsed as StreamEvent);
                setStreamEvents((prev: StreamEvent[]) => [...prev, {
                  phase: "structure",
                  status: "done",
                  message: (parsed as StreamPayload).message,
                } as StreamEvent]);
              } else if (currentEvent === "complete") {
                setStreamComplete(true);
                toast.success(`Analysis complete! ${(parsed as StreamPayload).suggestion_count} suggestions generated.`);
                fetchDetail();
              } else if (currentEvent === "error") {
                setStreamError((parsed as StreamPayload).message || "Unknown error component");
              }
            } catch {
              // skip malformed JSON
            }
            currentEvent = "";
            currentData = "";
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") {
        setStreamError(err.message || "Connection lost");
      } else if (!(err instanceof Error)) {
        setStreamError("Connection lost");
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
    if (!(await confirmAction("Delete this document and all associated analysis? This cannot be undone."))) return;
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
    () => detail?.suggestions.filter((s: { status: string; id: string }) => s.status === "pending") || [],
    [detail?.suggestions]
  );
  const approvedSuggestions = useMemo(
    () => detail?.suggestions.filter((s: { status: string; id: string }) => s.status === "approved") || [],
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
      <DocumentDetailHeader
        doc={doc}
        onBack={onBack}
        handleDelete={handleDelete}
        deleting={deleting}
        analyzing={analyzing}
        handleCancel={handleCancel}
        handleAnalyze={handleAnalyze}
      />

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
        <DocumentDetailStats
          analysis={analysis}
          pendingCount={pendingSuggestions.length}
          approvedCount={approvedSuggestions.length}
        />
      )}

      {/* Tabs + Content */}
      {analysis && (
        <>
          <div className="flex gap-1 bg-slate-100 dark:bg-zinc-800 rounded-2xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as "summary" | "suggestions" | "structure")}
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
              <DocumentSummaryTab analysis={analysis} />
            )}
            {activeTab === "suggestions" && (
              <DocumentSuggestionsTab
                doc={doc}
                suggestions={suggestions}
                pendingSuggestions={pendingSuggestions}
                handleApprove={handleApprove}
                handleReject={handleReject}
                router={router}
                docId={docId}
              />
            )}
            {activeTab === "structure" && (
              <DocumentStructureTab analysis={analysis} />
            )}
          </AnimatePresence>
        </>
      )}

      <DocumentDetailCTA
        doc={doc}
        analysis={analysis}
        showStreamPanel={showStreamPanel}
        analyzing={analyzing}
        handleAnalyze={handleAnalyze}
      />
    </div>
  );
}
