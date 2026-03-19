"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useMemo } from "react";
import { 
  Search, 
  Plus, 
  AlertTriangle, 
  FileUp, 
  Library, 
  MoreVertical, 
  ChevronDown 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { updateRequisitionStatus, seedRequisitionsFromScenario } from "@/app/actions/diligence";

interface RequisitionTableProps {
  project: any;
  items: any[];
  onUpdate: () => void;
  setSelectedRequisitionId: (id: string | null) => void;
  addRequisitionModal: React.ReactNode;
  seedScenarioModal: (onSeed: (id: string) => void) => React.ReactNode;
}

export function RequisitionTable({ 
  project, 
  items, 
  onUpdate, 
  setSelectedRequisitionId,
  addRequisitionModal,
  seedScenarioModal
}: RequisitionTableProps) {
  const [filter, setFilter] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSeedModal, setShowSeedModal] = useState(false);

  // ⚡ Bolt: Memoize filteredItems to prevent O(n) filtering on every render
  // (e.g., when modals toggle or other state changes)
  const filteredItems = useMemo(() => {
    if (!filter) return items;
    const lowerFilter = filter.toLowerCase();
    return items.filter((r: any) =>
      r.title.toLowerCase().includes(lowerFilter)
    );
  }, [items, filter]);

  const handleSeed = async (scenarioId: string) => {
    setIsSeeding(true);
    const res = await seedRequisitionsFromScenario(project.id, scenarioId);
    if (res.success) {
      toast.success(`Seeded ${res.count} items`);
      onUpdate();
      setShowSeedModal(false);
    } else {
      toast.error(res.error || "Manual seeding failed.");
    }
    setIsSeeding(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900/50 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden">
      {showSeedModal && seedScenarioModal(handleSeed)}
      
      <div className="p-6 border-b border-slate-100 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Search requisitions..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-800/40 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowSeedModal(true)}
            disabled={isSeeding || items.length > 0}
            className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
          >
            {isSeeding ? "Seeding..." : "Auto-Seed"}
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/10"
          >
            <Plus className="w-4 h-4" />
            Add Custom
          </button>
        </div>
      </div>

      {showAddModal && React.cloneElement(addRequisitionModal as React.ReactElement, {
        isOpen: showAddModal,
        onClose: () => setShowAddModal(false),
        onSuccess: onUpdate
      })}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-zinc-800/20">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Requisition Item</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Risk</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Docs</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
            {filteredItems.map((item: any) => (
              <tr 
                key={item.id} 
                onClick={() => setSelectedRequisitionId(item.id)}
                className="group hover:bg-slate-50/50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4">
                  <StatusBadge status={item.status} id={item.id} onUpdate={onUpdate} />
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{item.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {item.risk_flag ? (
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-[10px] px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-100 dark:border-rose-900/40 w-fit">
                      <AlertTriangle className="w-3 h-3" />
                      RISK
                    </div>
                  ) : (
                    <div className="text-[10px] font-bold text-slate-300">NONE</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                      <FileUp className="w-3 h-3" />
                      {item.documents.length}
                    </div>
                    {item.provision_id && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); toast.success("Opening Library Reference..."); }}
                        className="p-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 transition-all"
                        title="View Library Reference"
                      >
                        <Library className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredItems.length === 0 && (
          <div className="py-20 text-center text-slate-400 text-sm">No items found matching your filters.</div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, id, onUpdate }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const statuses = ["Requested", "Received", "Under Review", "Complete"];
  const colors: any = {
    "Requested": "bg-slate-100 text-slate-600",
    "Received": "bg-blue-100 text-blue-700",
    "Under Review": "bg-amber-100 text-amber-700",
    "Complete": "bg-emerald-100 text-emerald-700"
  };

  async function handleStatusChange(s: string) {
    const res = await updateRequisitionStatus(id, s);
    if (res.success) {
      onUpdate();
      setIsOpen(false);
    }
  }

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight flex items-center gap-1.5 transition-all ${colors[status] || 'bg-slate-100'}`}
      >
        <div className={`w-1.5 h-1.5 rounded-full ${status === 'Complete' ? 'bg-emerald-500' : 'bg-current opacity-60'}`} />
        {status}
        <ChevronDown className="w-2.5 h-2.5 opacity-50" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
              className="absolute left-0 top-full mt-2 w-40 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              {statuses.map(s => (
                <button 
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`w-full px-4 py-2 text-left text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors ${s === status ? 'text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-slate-500'}`}
                >
                  {s}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
