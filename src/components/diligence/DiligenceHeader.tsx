"use client";

import React from "react";
import { Plus } from "lucide-react";
import { ModuleHeader } from "@/components/shared/ModuleHeader";
import { Briefcase } from "lucide-react";

interface DiligenceHeaderProps {
  onCreateNew: () => void;
}

export function DiligenceHeader({ onCreateNew }: DiligenceHeaderProps) {
  return (
    <ModuleHeader 
      title="Due Diligence"
      description="Manage target company audits and requisition workflows."
      icon={Briefcase}
      actions={
        <button 
          onClick={onCreateNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      }
    />
  );
}
