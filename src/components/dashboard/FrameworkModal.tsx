"use client";

import { useState, useEffect } from "react";
import { X, FolderKanban } from "lucide-react";
import { useData } from "@/context/DataContext";
import { Framework } from "@/types/provision";

interface FrameworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingFramework?: Framework | null;
}

export function FrameworkModal({ isOpen, onClose, editingFramework }: FrameworkModalProps) {
  const { createFramework, updateFramework } = useData();
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingFramework) {
      setName(editingFramework.name || "");
      setShortName(editingFramework.shortName || "");
      setDescription(editingFramework.description || "");
    } else {
      setName("");
      setShortName("");
      setDescription("");
    }
  }, [editingFramework, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let success = false;
    if (editingFramework) {
      success = await updateFramework(editingFramework.id, { name, shortName, description });
    } else {
      success = await createFramework({ name, shortName, description });
    }
    
    setIsSubmitting(false);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-zinc-800 p-8 relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {editingFramework ? "Edit Framework" : "New Framework"}
            </h3>
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Legal Hierarchy Container</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bucket Name</label>
            <input 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Labour Codes 2019"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short identifier</label>
            <input 
              required
              value={shortName}
              onChange={e => setShortName(e.target.value)}
              placeholder="e.g. LABOUR_CODES"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Purpose / Description</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief overview of what this bucket contains..."
              rows={3}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20 mt-4 disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : (editingFramework ? "Update Bucket" : "Create Bucket")}
          </button>
        </form>
      </div>
    </div>
  );
}
