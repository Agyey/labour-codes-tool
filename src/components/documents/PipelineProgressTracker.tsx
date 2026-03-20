"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  CircleDashed, 
  Loader2, 
  XCircle,
  FileText,
  BrainCircuit,
  Network,
  Scale,
  Link,
  Bell
} from "lucide-react";

export interface PipelineProgressTrackerProps {
  jobId: string;
  onComplete?: () => void;
}

const STAGES = [
  { id: "extraction", label: "Text Extraction", icon: FileText },
  { id: "classification", label: "Classification", icon: BrainCircuit },
  { id: "enrichment", label: "Structural Enrichment", icon: Network },
  { id: "compliance", label: "Compliance Mapping", icon: Scale },
  { id: "cross_linking", label: "Cross-Linking", icon: Link },
  { id: "propagation", label: "Propagation", icon: Bell },
];

interface StreamEvent {
  job_id: string;
  stage: string;
  status: "pending" | "running" | "completed" | "failed";
  message: string;
  timestamp: string;
}

export function PipelineProgressTracker({ jobId, onComplete }: PipelineProgressTrackerProps) {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [currentStage, setCurrentStage] = useState<string>("extraction");
  const [jobStatus, setJobStatus] = useState<"pending" | "running" | "completed" | "failed">("pending");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Auto-scroll the terminal log
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  useEffect(() => {
    if (!jobId) return;

    setJobStatus("running");
    const eventSource = new EventSource(`/api/pipeline/jobs/${jobId}/stream`);

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as StreamEvent;
        setEvents((prev) => [...prev, data]);
        
        if (data.stage) {
          setCurrentStage(data.stage);
        }

        if (data.status === "completed" && data.message.includes("Pipeline completed")) {
          setJobStatus("completed");
          eventSource.close();
          onComplete?.();
        }

        if (data.status === "failed") {
          setJobStatus("failed");
          eventSource.close();
        }
      } catch (err) {
        console.error("Failed to parse SSE event", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      eventSource.close();
      setJobStatus("failed");
    };

    return () => {
      eventSource.close();
    };
  }, [jobId, onComplete]);

  const getStageStatus = (stageId: string) => {
    const stageIndex = STAGES.findIndex(s => s.id === stageId);
    const currentIndex = STAGES.findIndex(s => s.id === currentStage);
    
    if (jobStatus === "failed" && stageId === currentStage) return "failed";
    if (jobStatus === "completed") return "completed";
    
    if (stageIndex < currentIndex) return "completed";
    if (stageIndex === currentIndex) return "running";
    return "pending";
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Pipeline Progress</h3>
        
        {/* Stages Stepper */}
        <div className="flex justify-between relative">
          <div className="absolute top-5 transition-all duration-500 left-8 right-8 h-0.5 bg-slate-200 dark:bg-zinc-800 -z-10" />
          
          {STAGES.map((stage, idx) => {
            const status = getStageStatus(stage.id);
            const Icon = stage.icon;
            
            return (
              <div key={stage.id} className="relative flex flex-col items-center gap-2 z-10 w-24">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                  status === "completed" ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" :
                  status === "running" ? "bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-500/30" :
                  status === "failed" ? "bg-red-500 text-white shadow-lg shadow-red-500/20" :
                  "bg-white dark:bg-zinc-800 border-2 border-slate-200 dark:border-zinc-700 text-slate-400"
                }`}>
                  {status === "completed" ? <CheckCircle2 className="w-5 h-5" /> :
                   status === "failed" ? <XCircle className="w-5 h-5" /> :
                   status === "running" ? <Loader2 className="w-5 h-5 animate-spin" /> :
                   <Icon className="w-5 h-5" />}
                </div>
                <div className="text-center">
                  <span className={`text-xs font-bold block ${
                    status === "completed" ? "text-emerald-600 dark:text-emerald-400" :
                    status === "running" ? "text-indigo-600 dark:text-indigo-400" :
                    status === "failed" ? "text-red-500" :
                    "text-slate-400"
                  }`}>
                    {stage.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Output */}
      <div className="bg-zinc-950 p-4">
        <div className="flex items-center gap-2 mb-3 px-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="text-[10px] text-zinc-500 font-mono font-bold ml-2 uppercase tracking-wider">
            Pipeline Activity Log
          </span>
          {jobStatus === "running" && (
            <div className="ml-auto flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
               <span className="text-[10px] text-emerald-400 font-mono font-bold">LIVE</span>
            </div>
          )}
        </div>
        
        <div ref={scrollRef} className="h-[300px] overflow-y-auto space-y-1.5 font-mono text-[11px] px-2 py-1 scrollbar-thin scrollbar-thumb-zinc-800">
          <AnimatePresence initial={false}>
            {events.length === 0 && jobStatus !== "failed" && (
               <div className="text-zinc-500 flex items-center gap-2 py-4">
                 <Loader2 className="w-3.5 h-3.5 animate-spin" />
                 Waiting for pipeline stream to begin...
               </div>
            )}
            
            {events.map((evt, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex gap-3 leading-relaxed ${
                  evt.status === "failed" ? "text-red-400" :
                  evt.status === "completed" ? "text-emerald-400" :
                  "text-zinc-300"
                }`}
              >
                <span className="text-zinc-600 shrink-0 w-16">
                  {new Date(evt.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                </span>
                <span className={`shrink-0 w-32 uppercase font-bold ${
                  evt.stage === "extraction" ? "text-blue-400" :
                  evt.stage === "classification" ? "text-purple-400" :
                  evt.stage === "enrichment" ? "text-amber-400" :
                  "text-indigo-400"
                }`}>
                  [{evt.stage || "system"}]
                </span>
                <span className="break-words">{evt.message}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
