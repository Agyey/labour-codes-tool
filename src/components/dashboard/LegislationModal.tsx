"use client";

import { useState, useEffect } from "react";
import { X, Scale, Gavel } from "lucide-react";
import { useData } from "@/context/DataContext";
import { Legislation } from "@/types/provision";

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-zinc-800 p-8 relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl text-amber-600 dark:text-amber-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              {editingLegislation ? "Edit Legislation" : "New Legislation"}
            </h3>
            <p className="text-xs font-bold text-slate-500 dark:text-zinc-500 uppercase tracking-widest">Act or Rules Tile</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tile Title</label>
            <input 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Code on Wages, 2019"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Code</label>
               <input 
                 required
                 value={shortName}
                 onChange={e => setShortName(e.target.value)}
                 placeholder="COW19"
                 className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
               />
            </div>
            <div className="space-y-1.5">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Year</label>
               <input 
                 type="number"
                 required
                 value={year}
                 onChange={e => setYear(parseInt(e.target.value))}
                 className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Type</label>
                <select 
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="act">Act / Code</option>
                  <option value="rules">Rules</option>
                  <option value="regulations">Regulations</option>
                </select>
             </div>
             <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <div className="flex h-[46px] items-center gap-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl px-4">
                   <input 
                    type="checkbox"
                    id="repealed_check"
                    checked={isRepealed}
                    onChange={e => setIsRepealed(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                   />
                   <label htmlFor="repealed_check" className="text-xs font-bold text-slate-600 dark:text-zinc-400 cursor-pointer">Repealed</label>
                </div>
             </div>
          </div>

          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Theme Color</label>
             <input 
               type="color"
               value={color}
               onChange={e => setColor(e.target.value)}
               className="w-full h-12 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl p-1 cursor-pointer"
             />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-amber-600 text-white font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-amber-600/20 mt-4 disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : (editingLegislation ? "Update Legislation" : "Create Legislation")}
          </button>
        </form>
      </div>
    </div>
  );
}
