"use client";

import { useState, useEffect } from "react";
import { X, Scale, Gavel } from "lucide-react";
import { useData } from "@/context/DataContext";
import { Legislation } from "@/types/provision";
import { motion, AnimatePresence } from "framer-motion";

interface LegislationModalProps {
  isOpen: boolean;
  onClose: () => void;
  frameworkId: string;
  editingLegislation?: Legislation | null;
}

export function LegislationModal({ isOpen, onClose, frameworkId, editingLegislation }: LegislationModalProps) {
  const { createLegislation } = useData();
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [type, setType] = useState("act");
  const [isRepealed, setIsRepealed] = useState(false);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [color, setColor] = useState("#6366f1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingLegislation) {
      setName(editingLegislation.name);
      setShortName(editingLegislation.shortName);
      setType(editingLegislation.type);
      setIsRepealed(editingLegislation.isRepealed);
      setYear(editingLegislation.year || new Date().getFullYear());
      setColor(editingLegislation.color || "#6366f1");
    } else {
      setName("");
      setShortName("");
      setType("act");
      setIsRepealed(false);
      setYear(new Date().getFullYear());
      setColor("#6366f1");
    }
  }, [editingLegislation, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await createLegislation({ 
      frameworkId, 
      name, 
      shortName, 
      type, 
      isRepealed, 
      year, 
      color 
    });
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
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
            
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div 
                className="p-4 rounded-3xl text-white shadow-xl flex-shrink-0"
                style={{ backgroundColor: color }}
              >
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1.5">
                  {editingLegislation ? "Edit Legislation" : "New Legislation"}
                </h3>
                <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md inline-block">Tile Configuration</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Full Legislation Name</label>
                <input 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Code on Wages, 2019"
                  className="w-full px-5 py-4 bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all placeholder:text-slate-300 dark:placeholder:text-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Identifier</label>
                   <input 
                     required
                     value={shortName}
                     onChange={e => setShortName(e.target.value)}
                     placeholder="COW19"
                     className="w-full px-5 py-4 bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Year</label>
                   <input 
                     type="number"
                     required
                     value={year}
                     onChange={e => setYear(parseInt(e.target.value))}
                     className="w-full px-5 py-4 bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                   />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={type}
                      onChange={e => setType(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all appearance-none"
                    >
                      <option value="act">Act / Code</option>
                      <option value="rules">Rules</option>
                      <option value="regulations">Regulations</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Lifecycle Status</label>
                    <button
                      type="button"
                      onClick={() => setIsRepealed(!isRepealed)}
                      className={`w-full px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
                        isRepealed 
                        ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-900/20 dark:border-rose-500/30 dark:text-rose-400" 
                        : "bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-500/30 dark:text-emerald-400"
                      }`}
                    >
                       <div className={`w-2 h-2 rounded-full animate-pulse ${isRepealed ? "bg-rose-500" : "bg-emerald-500"}`} />
                       {isRepealed ? "Repealed" : "Live"}
                    </button>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest ml-1">Visual Theme</label>
                 <div className="flex gap-3">
                    <input 
                      type="color"
                      value={color}
                      onChange={e => setColor(e.target.value)}
                      className="w-16 h-14 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-1.5 cursor-pointer"
                    />
                    <div className="flex-grow flex items-center px-5 bg-slate-50/50 dark:bg-zinc-950/50 border border-slate-200 dark:border-zinc-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Hex: {color.toUpperCase()}
                    </div>
                 </div>
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
                  {isSubmitting ? "Saving..." : (editingLegislation ? "Update Legislation" : "Create Legislation")}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
