"use client";

import React, { useMemo, useState, useRef, useCallback, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Provision } from "@/types/provision";
import { CODES } from "@/config/codes";
import { IMPACT_COLORS } from "@/config/tags";
import { Badge } from "@/components/shared/Badge";
import { ChevronDown, ChevronUp, FileText, ArrowUpDown, ExternalLink, Pencil, Trash2, CheckCircle, Pin, Scale, Gavel, BookOpen } from "lucide-react";
import { useUI } from "@/context/UIContext";
import { useDataActions, useDataState } from "@/context/DataContext";
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
  const { deleteProvision, deleteProvisions, toggleVerify, togglePin } = useDataActions();
  const { canEdit } = useDataState();
  
  const [sorting, setSorting] = useState<SortingState>([{ id: "reference", desc: false }]);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const parentRef = useRef<HTMLDivElement>(null);

  const toggleExpand = useCallback((id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev => {
        if (prev.size === data.length) return new Set();
        return new Set(data.map(p => p.id));
    });
  }, [data]);

  const columns = useMemo<ColumnDef<Provision>[]>(() => [
    {
      id: "select",
      size: 40,
      header: () => (
        <input 
          type="checkbox" 
          className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          checked={selectedIds.size === data.length && data.length > 0}
          onChange={toggleSelectAll}
        />
      ),
      cell: ({ row }) => (
        <input 
          type="checkbox" 
          className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          checked={selectedIds.has(row.original.id)}
          onChange={() => toggleSelect(row.original.id)}
        />
      ),
    },
    {
      accessorKey: "code",
      header: "Framework",
      size: 120,
      cell: ({ row }) => {
        const cObj = CODES[row.original.code as keyof typeof CODES];
        return (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cObj?.c || "#94a3b8" }} />
            <span className="font-semibold text-slate-700 dark:text-zinc-200 text-xs truncate">
              {cObj?.s || row.original.code}
            </span>
          </div>
        );
      },
    },
    {
      id: "type",
      header: "Type",
      size: 100,
      cell: ({ row }) => {
        const type = row.original.provisionType || 'section';
        const config = {
          section: { icon: Scale, styles: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20', label: 'Section' },
          rule: { icon: Gavel, styles: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20', label: 'Rule' },
          form: { icon: FileText, styles: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20', label: 'Form' },
          register: { icon: BookOpen, styles: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20', label: 'Register' },
        }[type] || { icon: Scale, styles: 'bg-slate-50 text-slate-700 dark:bg-slate-900/20', label: type };
        
        const Icon = config.icon;
        return (
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${config.styles}`}>
            <Icon className="w-3 h-3 inline mr-1 -mt-0.5" /> {config.label}
          </span>
        );
      },
    },
    {
      id: "reference",
      accessorFn: (row) => `${row.ch} ${row.sec}`,
      header: ({ column }) => (
        <button className="flex items-center gap-1 hover:text-slate-900" onClick={() => column.toggleSorting()}>
          Ref <ArrowUpDown className="w-3 h-3" />
        </button>
      ),
      cell: ({ row }) => {
        const p = row.original;
        const isChild = !!p.parentSection && p.provisionType !== 'section';
        return (
          <div className={`flex flex-col ${isChild ? 'pl-2 border-l-2' : ''}`}>
            <span className="text-[9px] text-slate-400 uppercase truncate">
              {p.provisionType === 'section' ? `Ch ${p.ch}` : `Ref S.${p.parentSection}`}
            </span>
            <span className="text-sm font-bold text-slate-800 dark:text-zinc-100">{p.sec}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      size: 200,
      cell: ({ row }) => (
        <div className="truncate font-medium text-sm text-slate-700 dark:text-zinc-200">
          {row.getValue("title")}
        </div>
      ),
    },
    {
      accessorKey: "impact",
      header: "Impact",
      size: 90,
      cell: ({ row }) => {
        const impact = row.getValue("impact") as string;
        return <Badge text={impact} color={IMPACT_COLORS[impact] || "#6b7280"} className="text-[9px]" />;
      },
    },
    {
      id: "actions",
      header: "",
      size: 100,
      cell: ({ row }) => {
        const isExpanded = expandedRows[row.original.id];
        return (
          <div className="flex items-center justify-end gap-1">
            <button onClick={() => setExpandedProvision(row.original.id)} className="p-1 hover:text-indigo-600"><ExternalLink className="w-4 h-4" /></button>
            {canEdit && <button onClick={() => deleteProvision(row.original.id)} className="p-1 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>}
            <button onClick={() => toggleExpand(row.original.id)} className="p-1">{isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
          </div>
        );
      },
    },
  ], [selectedIds, data, expandedRows, canEdit, toggleExpand, toggleSelect, toggleSelectAll, setExpandedProvision, deleteProvision]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: useCallback((index) => {
        const id = rows[index].original.id;
        return expandedRows[id] ? 600 : 54;
    }, [expandedRows, rows]),
    overscan: 5,
  });

  // Re-measure when expanded state changes
  useEffect(() => {
    rowVirtualizer.measure();
  }, [expandedRows, rowVirtualizer]);

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col h-[75vh] min-h-[500px]">
      <div ref={parentRef} className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-slate-200">
        <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          <table className="w-full text-left border-collapse table-fixed">
            <thead className="sticky top-0 z-20 bg-slate-50 dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shadow-sm">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th key={header.id} style={{ width: header.getSize() }} className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-zinc-900">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
            </thead>
            <tbody>
              {rowVirtualizer.getVirtualItems().map(virtualRow => {
                const row = rows[virtualRow.index];
                const isExpanded = expandedRows[row.original.id];
                
                return (
                  <React.Fragment key={row.id}>
                    <tr 
                      className={`absolute left-0 w-full transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/30 border-b border-slate-100 dark:border-zinc-800/50 ${isExpanded ? 'bg-indigo-50/20 z-10' : ''}`}
                      style={{ height: `${virtualRow.size}px`, transform: `translateY(${virtualRow.start}px)` }}
                    >
                      <td colSpan={columns.length} className="p-0 align-top h-full">
                        <div className="flex h-[54px] items-center">
                           {row.getVisibleCells().map(cell => (
                            <div key={cell.id} style={{ width: cell.column.getSize() }} className="px-4 truncate">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </div>
                          ))}
                        </div>
                        
                        {isExpanded && (
                          <div className="p-6 bg-slate-50/50 dark:bg-zinc-950/20 border-t border-indigo-100 dark:border-indigo-900/50 overflow-auto h-[546px]">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                              <StatuteView provision={row.original} codeShortName={CODES[row.original.code as keyof typeof CODES]?.s} />
                              <RepealedAnalysis provision={row.original} />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6 border-t border-slate-200 dark:border-zinc-800">
                              <PenaltyInfo provision={row.original} />
                              <RulesAndForms provision={row.original} />
                              <ComplianceItemsList provision={row.original} />
                            </div>
                            <StateNotesTable provision={row.original} />
                            <div className="mt-6 flex gap-4">
                                <button onClick={() => toggleVerify(row.original.id)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border rounded-xl text-xs font-bold">
                                   <CheckCircle className={`w-4 h-4 ${row.original.verified ? 'text-emerald-500' : 'text-slate-300'}`} /> {row.original.verified ? 'Verified' : 'Verify'}
                                </button>
                                <button onClick={() => togglePin(row.original.id)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border rounded-xl text-xs font-bold">
                                   <Pin className={`w-4 h-4 ${row.original.pinned ? 'text-amber-500' : 'text-slate-300'}`} /> {row.original.pinned ? 'Pinned' : 'Pin'}
                                </button>
                                {canEdit && <button onClick={() => setEditingProvision(row.original)} className="p-2 bg-white dark:bg-zinc-800 border rounded-xl text-xs font-bold ml-auto"><Pencil className="w-4 h-4" /></button>}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
