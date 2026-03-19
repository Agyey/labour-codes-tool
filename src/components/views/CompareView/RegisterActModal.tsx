"use client";

import { X } from "lucide-react";

interface RegisterActModalProps {
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  newActName: string;
  setNewActName: (val: string) => void;
  newActShort: string;
  setNewActShort: (val: string) => void;
  targetFrameworkId: string;
  setTargetFrameworkId: (val: string) => void;
  frameworks: any[];
}

export function RegisterActModal({
  onClose,
  onSubmit,
  newActName,
  setNewActName,
  newActShort,
  setNewActShort,
  targetFrameworkId,
  setTargetFrameworkId,
  frameworks
}: RegisterActModalProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-zinc-800 p-8 relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Register Legal Container</h3>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">Define a new Act or Code to enable comparative mapping.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Act Name</label>
            <input 
              autoFocus
              required
              value={newActName}
              onChange={e => setNewActName(e.target.value)}
              placeholder="e.g. Payment of Wages Act, 1936"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Short Code</label>
            <input 
              required
              value={newActShort}
              onChange={e => setNewActShort(e.target.value)}
              placeholder="e.g. PWA36"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Framework (Bucket)</label>
            <select 
              required
              value={targetFrameworkId}
              onChange={e => setTargetFrameworkId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">Select Bucket</option>
              {frameworks.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <button 
            type="submit"
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 font-black rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/20 mt-4"
          >
            Register Act
          </button>
        </form>
      </div>
    </div>
  );
}
