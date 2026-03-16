"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { useState } from "react";
import { X, CheckCircle2, Loader2, Star } from "lucide-react";
import { createCounsel } from "@/app/actions/litigation";
import toast from "react-hot-toast";

interface CreateCounselModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCounsel: any) => void;
}

export function CreateCounselModal({ isOpen, onClose, onSuccess }: CreateCounselModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    representativeName: "",
    firm: "",
    specialization: "",
    email: "",
    phone: "",
    rating: "4.5",
    hourlyRate: ""
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createCounsel(formData);
      if (res.success) {
        toast.success("Counsel empanelled successfully!");
        onSuccess(res.counsel);
        onClose();
      } else {
        toast.error(res.error || "Failed to empanel counsel");
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
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Empanel New Counsel</h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-widest mt-0.5">Litigation Nexus • Professional Registry</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Counsel Name */}
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Counsel / Firm Name</label>
              <input 
                required
                placeholder="e.g. Adv. Arvind Kumar or Legacy Law Chambers"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-slate-500 transition-all font-bold text-slate-900 dark:text-white"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

             {/* Representative Name */}
             <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Representative</label>
              <input 
                placeholder="Name of Lead Partner"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-slate-500 transition-all font-bold text-slate-900 dark:text-white"
                value={formData.representativeName}
                onChange={e => setFormData({...formData, representativeName: e.target.value})}
              />
            </div>

            {/* Specialization */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Specialization</label>
              <select 
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-slate-500 transition-all font-bold text-slate-900 dark:text-white appearance-none"
                value={formData.specialization}
                onChange={e => setFormData({...formData, specialization: e.target.value})}
              >
                <option value="">Select Domain...</option>
                {["Arbitration", "Labour", "Criminal", "Civil", "Tax", "Intellectual Property"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Professional Email</label>
              <input 
                type="email"
                placeholder="counsel@firm.com"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-slate-500 transition-all font-bold text-slate-900 dark:text-white"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contact Number</label>
              <input 
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-slate-500 transition-all font-bold text-slate-900 dark:text-white"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>

             {/* Hourly Rate */}
             <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hourly Rate (₹)</label>
              <input 
                type="number"
                placeholder="e.g. 5000"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-slate-500 transition-all font-bold text-slate-900 dark:text-white"
                value={formData.hourlyRate}
                onChange={e => setFormData({...formData, hourlyRate: e.target.value})}
              />
            </div>

             {/* Rating */}
             <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                Internal Rating <Star className="w-2.5 h-2.5 text-amber-500" />
              </label>
              <select 
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-slate-500 transition-all font-bold text-slate-900 dark:text-white appearance-none"
                value={formData.rating}
                onChange={e => setFormData({...formData, rating: e.target.value})}
              >
                {[1, 2, 3, 4, 5].map(r => (
                  <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>
                ))}
                <option value="4.5">4.5 Stars</option>
              </select>
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
              className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Confirm Empanelment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
