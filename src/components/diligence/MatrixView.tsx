"use client";

import React, { useState, useEffect } from "react";
import { 
  ChevronRight, 
  Plus, 
  FileText, 
  BookOpen 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  getMatrix, 
  initializeMatrix, 
  addMatrixRow, 
  updateMatrixCell 
} from "@/app/actions/diligence";

export function MatrixView({ requisition, project, onBack, onUpdate }: any) {
  const [matrix, setMatrix] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddRow, setShowAddRow] = useState(false);
  const [newRowData, setNewRowData] = useState<any>({});

  useEffect(() => {
    fetchMatrix();
  }, [requisition.id]);

  async function fetchMatrix() {
    setLoading(true);
    const data = await getMatrix(requisition.id);
    setMatrix(data);
    setLoading(false);
  }

  async function handleInitialize() {
    const defaultCols = [
      { key: "item", label: "Compliance Step", type: "text" },
      { key: "status", label: "Status", type: "text" },
      { key: "comment", label: "Verification Notes", type: "text" },
    ];
    const res = await initializeMatrix(requisition.id, defaultCols);
    if (res.success) {
      toast.success("Verification matrix initialized");
      fetchMatrix();
    }
  }

  async function handleAddRow(e: React.FormEvent) {
    e.preventDefault();
    if (!matrix) return;
    const res = await addMatrixRow(matrix.id, newRowData);
    if (res.success) {
      toast.success("Row added");
      setNewRowData({});
      setShowAddRow(false);
      fetchMatrix();
    }
  }

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!matrix) {
    return (
      <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-[32px] border border-dashed border-slate-200 dark:border-zinc-800 max-w-2xl mx-auto mt-20">
        <div className="flex items-center justify-center gap-4 mb-4">
           <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg"><ChevronRight className="rotate-180 w-4 h-4" /></button>
           <h3 className="text-xl font-bold">Initialize Verification Matrix</h3>
        </div>
        <p className="text-slate-500 mb-8">This requisition requires a granular verification matrix to track multiple entities or complex compliance steps.</p>
        <button 
          onClick={handleInitialize}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20"
        >
          Initialize Matrix
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-slate-900 dark:text-white">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl">
             <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          <div className="min-w-0">
            <h2 className="text-xl font-black truncate">{requisition.title}</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{requisition.bucket?.name || "Checklist"} • Verification Matrix</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAddRow(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4" />
            Add Row
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-zinc-800/20">
                {matrix.columns.map((col: any) => (
                  <th key={col.key} className="px-6 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
              {matrix.rows.map((row: any) => (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  {matrix.columns.map((col: any) => (
                    <td key={col.key} className="px-6 py-4">
                      <MatrixCell 
                        rowId={row.id} 
                        columnKey={col.key} 
                        initialValue={row.data[col.key]} 
                        cell={row.cells.find((c: any) => c.column_key === col.key)}
                        projectDocuments={project.requisitions.flatMap((r: any) => r.documents)}
                        onUpdate={fetchMatrix}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {matrix.rows.length === 0 && (
            <div className="py-20 text-center text-slate-400 text-sm">No verification steps added yet.</div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddRow && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddRow(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[32px] p-8 shadow-2xl">
              <h3 className="text-xl font-bold mb-6">Add Verification Step</h3>
              <form onSubmit={handleAddRow} className="space-y-4">
                {matrix.columns.map((col: any) => (
                  <div key={col.key} className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{col.label}</label>
                    <input 
                      value={newRowData[col.key] || ""}
                      onChange={e => setNewRowData({...newRowData, [col.key]: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-800"
                      placeholder={`Enter ${col.label.toLowerCase()}...`}
                    />
                  </div>
                ))}
                <button className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 mt-4">Save Row</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MatrixCell({ rowId, columnKey, initialValue, cell, projectDocuments, onUpdate }: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState(cell?.comment || "");
  const [docId, setDocId] = useState(cell?.document_id || "");

  async function handleSave() {
    const res = await updateMatrixCell(rowId, columnKey, comment, docId || undefined);
    if (res.success) {
      toast.success("Updated");
      setIsEditing(false);
      onUpdate();
    }
  }

  return (
    <div className="relative group min-w-[120px]">
      <div 
        onClick={() => setIsEditing(true)}
        className="min-h-[20px] text-sm font-medium cursor-pointer"
      >
        <div className="text-slate-900 dark:text-zinc-100">{initialValue || <span className="text-slate-300 italic text-xs">Empty</span>}</div>
        {(cell?.comment || cell?.document) && (
          <div className="mt-1 flex flex-wrap gap-1">
            {cell.comment && (
              <div className="px-1.5 py-0.5 bg-slate-100 dark:bg-zinc-800 text-slate-500 text-[8px] font-bold rounded flex items-center gap-1">
                <FileText className="w-2.5 h-2.5" />
                NOTE
              </div>
            )}
            {cell.document && (
              <div className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[8px] font-bold rounded flex items-center gap-1">
                <BookOpen className="w-2.5 h-2.5" />
                DOC
              </div>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isEditing && (
          <div className="absolute z-50 left-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800">
             <div className="space-y-3">
               <div>
                  <label className="text-[10px] uppercase font-black text-slate-400">Notes / Comments</label>
                  <textarea 
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-lg text-xs"
                    rows={2}
                  />
               </div>
               <div>
                  <label className="text-[10px] uppercase font-black text-slate-400">Link Document</label>
                  <select 
                    value={docId}
                    onChange={e => setDocId(e.target.value)}
                    className="w-full mt-1 p-2 bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 rounded-lg text-xs"
                  >
                    <option value="">No Document</option>
                    {projectDocuments?.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
               </div>
               <div className="flex justify-end gap-2 pt-2">
                 <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 text-xs text-slate-500">Cancel</button>
                 <button onClick={handleSave} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-indigo-500/10">Save</button>
               </div>
             </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
