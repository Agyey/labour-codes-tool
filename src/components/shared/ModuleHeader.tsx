"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

interface ModuleHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
  iconColor?: string;
}

export function ModuleHeader({ 
  title, 
  description, 
  icon: Icon, 
  actions,
  iconColor = "text-indigo-500"
}: ModuleHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-start gap-4">
        <div className={`p-3 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-200 dark:border-zinc-800 ${iconColor}`}>
          <Icon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            {title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1 max-w-2xl">
            {description}
          </p>
        </div>
      </div>
      
      {actions && (
        <div className="flex items-center gap-3 w-full md:w-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
