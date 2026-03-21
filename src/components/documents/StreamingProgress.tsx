/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Loader2,
  CheckCircle2,
  XCircle,
  TreePine,
  Network,
  FileSearch,
  Shield,
  Zap,
} from "lucide-react";

// ──────────────────────────────────────────────
// Types for streaming events
// ──────────────────────────────────────────────

export interface StreamEvent {
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

export function StreamingProgress({
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

        {displayEvents.map((evt: any, i: number) => (
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
                  <div className="mt-2 ml-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3 relative overflow-hidden group">
                    {evt.status === "running" && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent h-[200%] animate-[pulse_2s_ease-in-out_infinite] pointer-events-none" />
                    )}
                    <p className="text-[11px] text-zinc-400 font-mono leading-relaxed whitespace-pre-wrap break-all relative z-10">
                      {evt.detail.length > 300 
                        ? `...${evt.detail.slice(-300)}` 
                        : evt.detail}
                    </p>
                  </div>
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

        {/* Gap Loader */}
        {!isComplete && !error && displayEvents.length > 0 && displayEvents[displayEvents.length - 1].status === "done" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 mt-4 ml-6 text-zinc-600"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs font-semibold">Processing extracted data...</span>
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
