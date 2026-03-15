"use client";

import React from "react";
import { motion } from "framer-motion";
import { Building2, Globe, ListChecks, ChevronRight } from "lucide-react";

interface Project {
  id: string;
  name: string;
  client_name: string;
  target_company: string;
  type: string;
  status: string;
  created_at: Date;
  _count: { requisitions: number };
}

interface ProjectGridProps {
  projects: Project[];
  onProjectClick: (id: string) => void;
}

export function ProjectGrid({ projects, onProjectClick }: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <motion.div 
          layoutId={project.id}
          key={project.id}
          onClick={() => onProjectClick(project.id)}
          className="group relative p-6 bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-200/60 dark:border-zinc-800/60 hover:border-indigo-500/50 transition-all cursor-pointer shadow-sm hover:shadow-xl hover:shadow-indigo-500/5"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
              project.status === "Closed" ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {project.status}
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{project.name}</h3>
          <p className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1">{project.client_name}</p>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-zinc-400">
              <Globe className="w-4 h-4 opacity-50" />
              <span>Target: {project.target_company}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-zinc-400">
              <ListChecks className="w-4 h-4 opacity-50" />
              <span>{project._count.requisitions} Requisitions</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-7 h-7 rounded-full bg-slate-200 dark:bg-zinc-800 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] font-bold">U{i}</div>
              ))}
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-all group-hover:translate-x-1" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
