"use client";

import { CalendarDays, AlertCircle } from "lucide-react";

interface Obligation {
  id: string;
  title: string;
  dueDate: string;
  category: "Filing" | "Meeting" | "Tax" | "Disclosure";
  severity: "High" | "Medium" | "Low";
  status: "Upcoming" | "Overdue" | "Completed";
  relatedUnitTitle: string;
}

const mockObligations: Obligation[] = [
  { id: "1", title: "Annual Return Form MGT-7", dueDate: "2023-11-29", category: "Filing", severity: "High", status: "Upcoming", relatedUnitTitle: "Section 92" },
  { id: "2", title: "Financial Statements Form AOC-4", dueDate: "2023-10-30", category: "Filing", severity: "High", status: "Overdue", relatedUnitTitle: "Section 137" },
  { id: "3", title: "Board Meeting (Quarterly)", dueDate: "2023-12-15", category: "Meeting", severity: "Medium", status: "Upcoming", relatedUnitTitle: "Section 173" },
];

export default function ComplianceCalendar() {
  const severityColors = {
    High: "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30",
    Medium: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
    Low: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30"
  };

  const statusStyles = {
    Upcoming: "border-slate-200 dark:border-slate-700",
    Overdue: "border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10",
    Completed: "border-emerald-200 dark:border-emerald-800 opacity-60"
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-indigo-500" />
          Compliance Obligations
        </h2>
        <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700">View Calendar</button>
      </div>

      <div className="p-4 space-y-3">
        {mockObligations.map(ob => (
          <div key={ob.id} className={`p-4 rounded-xl border ${statusStyles[ob.status]}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {ob.status === "Overdue" && <AlertCircle className="w-4 h-4 text-red-500" />}
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{ob.title}</h3>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${severityColors[ob.severity]}`}>
                {ob.severity}
              </span>
            </div>
            
            <div className="flex items-center justify-between mt-3 text-xs">
              <div className="text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-slate-700 dark:text-slate-300 mr-2">Due:</span> 
                <span className={ob.status === "Overdue" ? "text-red-500 font-medium" : ""}>{new Date(ob.dueDate).toLocaleDateString()}</span>
              </div>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-400 truncate max-w-[120px]">
                {ob.relatedUnitTitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
