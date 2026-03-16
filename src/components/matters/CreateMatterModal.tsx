"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

import { useState, useEffect } from "react";
import { X, Briefcase, Building2, Calendar, FileText, Save } from "lucide-react";
import { createMatter } from "@/app/actions/matters";
import { getEntities } from "@/app/actions/entities";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface CreateMatterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateMatterModal({ isOpen, onClose }: CreateMatterModalProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [entities, setEntities] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    entityId: "",
    status: "Active",
  });

  useEffect(() => {
    if (isOpen) {
      getEntities().then(setEntities);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await createMatter(formData);
      if (res.success) {
        toast.success("Matter created successfully");
        onClose();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to create matter");
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
              <Briefcase className="w-6 h-6 text-indigo-500" />
              Initialize Matter
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Direct Case Creation</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 dark:bg-zinc-900 text-slate-400 hover:text-rose-500 rounded-2xl transition-all cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Matter Title</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Project Apollo Acquisition"
                  className={`${inputCls} pl-12`}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Associated Client (Entity)</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={formData.entityId}
                  onChange={(e) => setFormData({ ...formData, entityId: e.target.value })}
                  className={`${inputCls} pl-12 appearance-none`}
                >
                  <option value="">Independent (No Entity)</option>
                  {entities.map(ent => (
                    <option key={ent.id} value={ent.id}>{ent.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Brief Description</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="High-level objectives or case scope..."
                  className={`${inputCls} pl-12 min-h-[100px] py-4 resize-none`}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Current Workflow Status</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className={`${inputCls} pl-12 appearance-none`}
                >
                  <option>Active</option>
                  <option>Review</option>
                  <option>On Hold</option>
                  <option>Completed</option>
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
              {isSaving ? "Initializing..." : "Create Deal Room"}
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
