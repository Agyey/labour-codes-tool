"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { Provision } from "@/types/provision";
import { CODES } from "@/config/codes";
import { IMPACT_COLORS, WORKFLOW_TAG_COLORS } from "@/config/tags";
import { Badge } from "@/components/shared/Badge";
import { ChevronDown, ChevronRight, ChevronUp, FileText, ArrowUpDown, ExternalLink, Pencil, Trash2, CheckCircle, Pin, Scale, Gavel, BookOpen } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { useData } from "@/context/DataContext";
import { StatuteView } from "@/components/provisions/StatuteView";
import { RepealedAnalysis } from "@/components/provisions/RepealedAnalysis";
import { PenaltyInfo } from "@/components/provisions/PenaltyInfo";
import { RulesAndForms } from "@/components/provisions/RulesAndForms";
import { StateNotesTable } from "@/components/provisions/StateNotesTable";
import { ComplianceItemsList } from "@/components/provisions/ComplianceItemsList";

interface LibraryTableProps {
  data: Provision[];
}

export function LibraryTable({ data }: LibraryTableProps) {
  const { setExpandedProvision, setEditingProvision } = useUI();
  const { canEdit, deleteProvision, toggleVerify, togglePin } = useData();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map(p => p.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} provisions?`)) return;
    
    // Process one by one for now as the action handles single IDs
    for (const id of Array.from(selectedIds)) {
      await deleteProvision(id);
    }
    setSelectedIds(new Set());
  };

  const columns = useMemo<ColumnDef<Provision>[]>(() => [
    {
      id: "select",
      header: () => (
        <div className="flex items-center">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            checked={selectedIds.size === data.length && data.length > 0}
            onChange={toggleSelectAll}
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          <input 
            type="checkbox" 
            className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            checked={selectedIds.has(row.original.id)}
            onChange={() => toggleSelect(row.original.id)}
          />
        </div>
      ),
    },
    {
      accessorKey: "code",
      header: "Framework",
      cell: ({ row }) => {
        const cObj = CODES[row.original.code as keyof typeof CODES];
        return (
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: cObj?.c || "#94a3b8" }}
            />
            <span className="font-semibold text-slate-700 dark:text-zinc-200 text-xs">
              {cObj?.s || row.original.code}
            </span>
          </div>
        );
      },
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.provisionType || 'section';
        let icon = <Scale className="w-3 h-3 inline mr-0.5 -mt-0.5" />;
        let styles = 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300';
        let label = 'Section';
        
        if (type === 'rule') {
          icon = <Gavel className="w-3 h-3 inline mr-0.5 -mt-0.5" />;
          styles = 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
          label = 'Rule';
        } else if (type === 'form') {
          icon = <FileText className="w-3 h-3 inline mr-0.5 -mt-0.5" />;
          styles = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
          label = 'Form';
        } else if (type === 'register') {
          icon = <BookOpen className="w-3 h-3 inline mr-0.5 -mt-0.5" />;
          styles = 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-300';
          label = 'Register';
        }

        return (
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${styles}`}>
            {icon} {label}
          </span>
        );
      },
    },
    {
      accessorFn: (row) => `${row.ch} ${row.sec}`,
      id: "reference",
      sortingFn: (rowA, rowB) => {
        const a = rowA.original;
        const b = rowB.original;
        
        const getSortKey = (p: Provision) => {
          // Grouping logic: Rules/Forms fall under their parentSection
          const groupSec = p.parentSection || p.sec;
          const secNum = parseInt(groupSec.replace(/\D/g, "")) || 0;
          const typeWeight = p.provisionType === "section" ? 0 : 1;
          const innerSecNum = parseInt(p.sec.replace(/\D/g, "")) || 0;
          
          return `${p.ch.padStart(3, "0")}-${secNum.toString().padStart(5, "0")}-${typeWeight}-${innerSecNum.toString().padStart(5, "0")}`;
        };

        return getSortKey(a).localeCompare(getSortKey(b));
      },
      header: ({ column }) => {
        return (
          <button
            className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Reference
            <ArrowUpDown className="w-3 h-3" />
          </button>
        )
      },
      cell: ({ row }) => {
        const p = row.original;
        const isChild = !!p.parentSection && p.provisionType !== 'section';
        
        return (
          <div className={`flex flex-col ${isChild ? 'pl-4 border-l-2 border-slate-100 dark:border-zinc-800' : ''}`}>
            <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500 uppercase">
              {p.provisionType === 'section' ? `Ch ${p.ch}` : `Ref Sec ${p.parentSection || '?'}`}
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-zinc-100">
              {p.provisionType === 'section' ? 'Sec' : p.provisionType.charAt(0).toUpperCase() + p.provisionType.slice(1)} {p.sec}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Provision Title",
      cell: ({ row }) => (
        <div className="max-w-[200px] truncate font-medium text-sm text-slate-700 dark:text-zinc-200">
          {row.getValue("title")}
        </div>
      ),
    },
    {
      accessorKey: "impact",
      header: "Impact",
      cell: ({ row }) => {
        const impact = row.getValue("impact") as string;
        return (
          <div className="hidden md:block">
            <Badge 
              text={impact} 
              color={IMPACT_COLORS[impact] || "#6b7280"} 
              className="text-[10px]"
            />
          </div>
        );
      },
    },
    {
      accessorKey: "workflowTags",
      header: "Workflow Tags",
      cell: ({ row }) => {
        const tags = row.getValue("workflowTags") as string[] || [];
        if (tags.length === 0) return <span className="text-xs text-slate-400 hidden md:inline">-</span>;
        
        return (
          <div className="flex flex-wrap gap-1 hidden md:flex">
            {tags.slice(0, 2).map(tag => (
              <Badge 
                key={tag} 
                text={tag} 
                color={WORKFLOW_TAG_COLORS[tag] || "#6b7280"} 
                className="text-[9px] py-0.5 px-1.5"
              />
            ))}
            {tags.length > 2 && (
              <span className="text-[10px] text-slate-500 font-medium ml-1">
                +{tags.length - 2}
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const isExpanded = expandedRows[row.original.id];
        return (
          <div className="flex items-center justify-end gap-1 pr-2">
            <button
              onClick={() => setExpandedProvision(row.original.id)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
              title="Open full view"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            {canEdit && (
              <button
                onClick={() => { if (confirm("Delete this provision?")) deleteProvision(row.original.id); }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                title="Delete provision"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => toggleExpand(row.original.id)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg transition-colors"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        );
      },
    },
  ], [expandedRows, selectedIds, canEdit, data]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      sorting: [
        { id: "reference", desc: false }
      ],
      pagination: {
        pageSize: 50, // More suitable for bulk deletions
      },
    },
  });

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Table Action Header */}
      {selectedIds.size > 0 && (
        <div className="bg-indigo-50 dark:bg-indigo-950/30 px-4 py-3 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between animate-in slide-in-from-top-2 duration-200">
          <div className="text-sm font-bold text-indigo-700 dark:text-indigo-400">
            {selectedIds.size} provisions selected
          </div>
          <button 
            onClick={handleBulkDelete}
            className="flex items-center gap-2 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition-all shadow-md shadow-rose-600/20"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete Selected
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id} className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                {headerGroup.headers.map(header => {
                  const hideOnMobile = header.id === 'impact' || header.id === 'workflowTags';
                  return (
                    <th key={header.id} className={`px-4 py-3 text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider whitespace-nowrap ${hideOnMobile ? 'hidden md:table-cell' : ''}`}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => {
                const isExpanded = expandedRows[row.original.id];
                return (
                  <React.Fragment key={row.id}>
                    <tr className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 ${isExpanded ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                      {row.getVisibleCells().map(cell => {
                        const hideOnMobile = cell.column.id === 'impact' || cell.column.id === 'workflowTags';
                        return (
                          <td key={cell.id} className={`px-4 py-3 align-middle ${hideOnMobile ? 'hidden md:table-cell' : ''}`}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        );
                      })}
                    </tr>
                    {isExpanded && (
                      <tr className="bg-slate-50 dark:bg-zinc-950/20">
                        <td colSpan={columns.length} className="p-0 border-b-2 border-indigo-100 dark:border-indigo-900 overflow-hidden">
                          <div className="p-6 bg-slate-50/80 dark:bg-zinc-950/50 shadow-inner">
                            {/* Original ProvisionCard Data Layout */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
                              <StatuteView provision={row.original} codeShortName={CODES[row.original.code as keyof typeof CODES]?.n} />
                              <RepealedAnalysis provision={row.original} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6 border-t border-slate-200/60 dark:border-zinc-800/80">
                              <PenaltyInfo provision={row.original} />
                              <RulesAndForms provision={row.original} />
                              <ComplianceItemsList provision={row.original} />
                            </div>

                            <StateNotesTable provision={row.original} />

                            {/* Actions Bar */}
                            <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-zinc-800/80 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <button onClick={() => toggleVerify(row.original.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${row.original.verified ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20' : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700 hover:text-slate-900 border border-slate-200 dark:border-zinc-700'}`}>
                                  <CheckCircle className="w-4 h-4" /> {row.original.verified ? "Verified" : "Verify Content"}
                                </button>
                                <button onClick={() => togglePin(row.original.id)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${row.original.pinned ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20' : 'bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700 hover:text-slate-900 border border-slate-200 dark:border-zinc-700'}`}>
                                  <Pin className="w-4 h-4" /> {row.original.pinned ? "Unpinned" : "Pin for Review"}
                                </button>
                              </div>

                              {canEdit && (
                                <div className="flex items-center gap-2">
                                  <button onClick={() => setEditingProvision(row.original)} className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-transparent hover:border-amber-200 dark:hover:border-amber-700/30 rounded-xl transition-all shadow-sm">
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => { if (confirm("Delete this provision?")) deleteProvision(row.original.id); }} className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 border border-transparent hover:border-rose-200 dark:hover:border-rose-700/30 rounded-xl transition-all shadow-sm">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500 dark:text-zinc-400">
                  No provisions found matching these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
        <div className="text-xs text-slate-500 dark:text-zinc-400">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{' '}
          {table.getFilteredRowModel().rows.length} provisions
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-zinc-700 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
