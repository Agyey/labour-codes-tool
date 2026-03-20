"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Clock, FileText, ChevronDown, ChevronUp } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "blocked";
  relatedUnitId?: string;
  relatedUnitTitle?: string;
}

interface Workflow {
  id: string;
  transactionType: string;
  progress: number;
  steps: Step[];
}

const mockWorkflow: Workflow = {
  id: "wf-1",
  transactionType: "Private Company Incorporation",
  progress: 25,
  steps: [
    { id: "s1", title: "Name Approval", description: "Reserve name via SPICe+ Part A", status: "completed", relatedUnitTitle: "Section 4 — Memorandum" },
    { id: "s2", title: "Drafting MoA & AoA", description: "Draft Memorandum and Articles of Association", status: "in-progress", relatedUnitTitle: "Section 4 & 5" },
    { id: "s3", title: "File SPICe+ Part B", description: "Submit incorporation forms and pay stamp duty", status: "pending", relatedUnitTitle: "Section 7 — Incorporation" },
    { id: "s4", title: "Certificate of Incorporation", description: "Receive COI, PAN, and TAN", status: "pending" }
  ]
};

export default function TransactionWorkflow() {
  const [expandedId, setExpandedId] = useState<string | null>("s2");
  
  const statusColors = {
    "completed": "text-emerald-500 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/20 dark:border-emerald-800",
    "in-progress": "text-blue-500 bg-blue-50 border-blue-200 dark:text-blue-400 dark:bg-blue-900/20 dark:border-blue-800",
    "pending": "text-slate-400 bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700",
    "blocked": "text-red-500 bg-red-50 border-red-200 dark:text-red-400 dark:bg-red-900/20 dark:border-red-800"
  };

  const statusIcons = {
    "completed": <CheckCircle2 className="w-5 h-5" />,
    "in-progress": <Clock className="w-5 h-5 animate-pulse" />,
    "pending": <Circle className="w-5 h-5" />,
    "blocked": <Circle className="w-5 h-5 text-red-500 fill-red-50" />
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Active Transaction Workflow</h2>
          <span className="text-xs font-semibold px-2 py-1 bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 rounded-full">
            {mockWorkflow.transactionType}
          </span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: `${mockWorkflow.progress}%` }}></div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 font-medium">
          <span>Overall Progress</span>
          <span>{mockWorkflow.progress}%</span>
        </div>
      </div>

      <div className="p-2">
        {mockWorkflow.steps.map((step, idx) => (
          <div key={step.id} className="relative flex p-4">
            {/* Timeline Line */}
            {idx < mockWorkflow.steps.length - 1 && (
              <div className="absolute left-[31px] top-12 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800 -mb-4 z-0"></div>
            )}
            
            {/* Status Icon */}
            <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border shadow-sm shrink-0 mr-4 ${statusColors[step.status]}`}>
              {statusIcons[step.status]}
            </div>

            {/* Content */}
            <div className={`flex-1 rounded-xl border transition-all ${expandedId === step.id ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 p-4 shadow-sm' : 'border-transparent p-2 hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}>
              <button 
                onClick={() => setExpandedId(expandedId === step.id ? null : step.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div>
                  <h3 className={`text-sm font-bold ${step.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                    {step.title}
                  </h3>
                  {expandedId !== step.id && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{step.description}</p>
                  )}
                </div>
                {expandedId === step.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {expandedId === step.id && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 text-sm">
                  <p className="text-slate-600 dark:text-slate-400">{step.description}</p>
                  
                  {step.relatedUnitTitle && (
                    <div className="mt-4 flex items-center gap-2 p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase text-slate-400">Legal Requirement</p>
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{step.relatedUnitTitle}</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors">
                      Mark Complete
                    </button>
                    <button className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium px-3 py-1.5 rounded-lg transition-colors">
                      Add Note
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
