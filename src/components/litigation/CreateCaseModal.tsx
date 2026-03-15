"use client";

import { useState } from "react";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { createCase } from "@/app/actions/litigation";
import toast from "react-hot-toast";

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  matters: any[];
  onSuccess: (newCase: any) => void;
}

export function CreateCaseModal({ isOpen, onClose, matters, onSuccess }: CreateCaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    caseNumber: "",
    court: "",
    bench: "",
    status: "Active",
    stage: "Notice",
    description: "",
    opposition: "",
    matterId: "",
    exposureAmount: "",
    currency: "INR"
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createCase(formData);
      if (res.success) {
        toast.success("Case tracked successfully!");
        onSuccess(res.case);
        onClose();
      } else {
        toast.error(res.error || "Failed to create case");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800">
        
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Track New Case</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Litigation Nexus • Intake</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Case Name */}
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Case Title / Caption</label>
              <input 
                required
                placeholder="e.g. Acme Corp vs. Labour Commissioner"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* Case Number */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Case Number</label>
              <input 
                placeholder="e.g. WP 1234/2023"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white"
                value={formData.caseNumber}
                onChange={e => setFormData({...formData, caseNumber: e.target.value})}
              />
            </div>

            {/* Court */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Court / Forum</label>
              <input 
                placeholder="e.g. Bombay High Court"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white"
                value={formData.court}
                onChange={e => setFormData({...formData, court: e.target.value})}
              />
            </div>

             {/* Matter Linking */}
             <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Associate with Matter</label>
              <select 
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white appearance-none"
                value={formData.matterId}
                onChange={e => setFormData({...formData, matterId: e.target.value})}
              >
                <option value="">None (Independent)</option>
                {matters.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            {/* Stage */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Stage</label>
              <select 
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white appearance-none"
                value={formData.stage}
                onChange={e => setFormData({...formData, stage: e.target.value})}
              >
                {["Notice", "Pleadings", "Evidence", "Arguments", "Judgment"].map(s => (
                  <option key={s} value={s}>{s} Stage</option>
                ))}
              </select>
            </div>

            {/* Exposure Amount */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Financial Exposure</label>
              <div className="flex gap-2">
                <select 
                  className="w-24 px-3 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white appearance-none"
                  value={formData.currency}
                  onChange={e => setFormData({...formData, currency: e.target.value})}
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                </select>
                <input 
                  type="number"
                  placeholder="e.g. 500000"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white"
                  value={formData.exposureAmount}
                  onChange={e => setFormData({...formData, exposureAmount: e.target.value})}
                />
              </div>
            </div>

            {/* Opposition */}
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opposing Party</label>
              <input 
                placeholder="Name of opposing counsel or party"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-slate-900 dark:text-white"
                value={formData.opposition}
                onChange={e => setFormData({...formData, opposition: e.target.value})}
              />
            </div>

          </div>

          <div className="flex gap-4 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-4 bg-indigo-600 rounded-2xl font-black uppercase tracking-widest text-[10px] text-white hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Commence Tracking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
