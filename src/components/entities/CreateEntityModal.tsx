"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */

import { useState } from "react";
import { X, Building2, ShieldCheck, Activity, Globe, Save } from "lucide-react";
import { createEntity } from "@/app/actions/entities";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CreateEntityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateEntityModal({ isOpen, onClose }: CreateEntityModalProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "Private Limited",
    industry: "Manufacturing",
    status: "Healthy",
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await createEntity(formData);
      if (res.success) {
        toast.success("Entity created successfully");
        onClose();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create entity");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = "w-full p-4 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-slate-700 dark:text-zinc-200 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none";
  const labelCls = "block text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 ml-1";

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-zinc-950 rounded-[48px] w-full max-w-lg overflow-hidden flex flex-col shadow-2xl border border-slate-200 dark:border-zinc-800 animate-in zoom-in-95 duration-500">
        <div className="p-8 pb-4 flex items-center justify-between border-b border-slate-50 dark:border-zinc-900">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-emerald-500" />
              Initialize Entity
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">New Client Onboarding</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 dark:bg-zinc-900 text-slate-400 hover:text-rose-500 rounded-2xl transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Legal Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Phoenix Global Logistics LLC"
                  className={`${inputCls} pl-12`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Corporate Type</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className={`${inputCls} pl-12 appearance-none`}
                  >
                    <option>Private Limited</option>
                    <option>Public Limited</option>
                    <option>LLP</option>
                    <option>Partnership</option>
                    <option>Proprietorship</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Industry Sector</label>
                <div className="relative">
                  <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className={`${inputCls} pl-12 appearance-none`}
                  >
                    <option>Manufacturing</option>
                    <option>Technology</option>
                    <option>Services</option>
                    <option>Retail</option>
                    <option>Logistics</option>
                    <option>Healthcare</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Initial Hygiene Pulse</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={`${inputCls} pl-12 appearance-none`}
                >
                  <option value="Healthy">Healthy (Compliant)</option>
                  <option value="Warning">Warning (Minor Gaps)</option>
                  <option value="Critical">Critical (Immediate Action)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
              {isSaving ? "Initializing..." : "Register Entity"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-4 bg-slate-50 dark:bg-zinc-800 text-slate-400 dark:text-zinc-300 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
