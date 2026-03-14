"use client";

import { useState, useEffect } from "react";
import { X, FolderKanban } from "lucide-react";
import { useData } from "@/context/DataContext";
import { Framework } from "@/types/provision";
import { motion, AnimatePresence } from "framer-motion";

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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[40px] shadow-2xl border border-white/20 dark:border-white/10 p-8 py-10 relative overflow-hidden ring-1 ring-black/5"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-500/20 flex-shrink-0">
                <FolderKanban className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1.5">
                  {editingFramework ? "Edit Framework" : "New Framework"}
                </h3>
                <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md inline-block">Hierarchy Container</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Bucket Title</label>
                <input 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Labour Codes 2019"
                  className="w-full px-5 py-4 bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all placeholder:text-slate-300 dark:placeholder:text-zinc-700"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Short identifier</label>
                <input 
                  required
                  value={shortName}
                  onChange={e => setShortName(e.target.value)}
                  placeholder="e.g. LABOUR_CODES"
                  className="w-full px-5 py-4 bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Knowledge Library Purpose</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief overview of what this bucket contains..."
                  rows={3}
                  className="w-full px-5 py-4 bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-grow py-4 bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 dark:hover:bg-zinc-700 transition-all border border-slate-200 dark:border-zinc-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] py-4 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10 disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : (editingFramework ? "Update Bucket" : "Create Bucket")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
