"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { addDiligenceRequisition } from "@/app/actions/diligence";
import toast from "react-hot-toast";

interface AddRequisitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
  buckets: any[];
}

export function AddRequisitionModal({ 
  isOpen, 
  onClose, 
  projectId, 
  onSuccess, 
  buckets 
}: AddRequisitionModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bucket_id: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await addDiligenceRequisition(projectId, formData);
    if (res.success) {
      toast.success("Requisition added successfully");
      onSuccess();
      onClose();
      setFormData({ title: "", description: "", bucket_id: "" });
    } else {
      toast.error(res.error || "Failed to add requisition");
    }
    setLoading(false);
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden shadow-2xl">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white">New Requisition</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manual addition to checklist</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Requisition Title</label>
                  <input 
                    required
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Board Minutes from 2021-2023"
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bucket (Optional)</label>
                  <select 
                    value={formData.bucket_id}
                    onChange={e => setFormData({ ...formData, bucket_id: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium appearance-none text-sm"
                  >
                    <option value="">General / Uncategorized</option>
                    {buckets?.map((b: any) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Request Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide context or specific details for the target..."
                    rows={4}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium resize-none text-sm"
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-50 mt-4 text-sm"
                >
                  {loading ? "Adding..." : "Add Requisition"}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
