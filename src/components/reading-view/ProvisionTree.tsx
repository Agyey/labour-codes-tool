"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, FileText, Book, Scale } from "lucide-react";

interface TreeNode {
  id: string;
  unit_type: string;
  number?: string;
  title?: string;
  depth_level: number;
  children: TreeNode[];
}

interface ProvisionTreeProps {
  nodes: TreeNode[];
  onSelect: (id: string) => void;
  selectedId?: string;
}

const unitTypeIcons: Record<string, React.ReactNode> = {
  Chapter: <Book className="w-4 h-4 text-amber-500" />,
  Part: <Book className="w-4 h-4 text-blue-500" />,
  Section: <FileText className="w-4 h-4 text-emerald-500" />,
  Schedule: <Scale className="w-4 h-4 text-purple-500" />,
};

function TreeItem({
  node,
  onSelect,
  selectedId,
  level = 0,
}: {
  node: TreeNode;
  onSelect: (id: string) => void;
  selectedId?: string;
  level?: number;
}) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = node.id === selectedId;

  const label = [node.unit_type, node.number, node.title]
    .filter(Boolean)
    .join(" — ");

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          onSelect(node.id);
        }}
        className={`
          w-full flex items-center gap-2 px-3 py-2 text-sm text-left rounded-lg
          transition-all duration-150 hover:bg-slate-100 dark:hover:bg-slate-800
          ${isSelected ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium" : "text-slate-700 dark:text-slate-300"}
        `}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="w-4 h-4 shrink-0 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 shrink-0 text-slate-400" />
          )
        ) : (
          <span className="w-4 shrink-0" />
        )}
        {unitTypeIcons[node.unit_type] || (
          <FileText className="w-4 h-4 text-slate-400" />
        )}
        <span className="truncate">{label}</span>
      </button>

      {expanded && hasChildren && (
        <div className="border-l border-slate-200 dark:border-slate-700 ml-6">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              onSelect={onSelect}
              selectedId={selectedId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProvisionTree({
  nodes,
  onSelect,
  selectedId,
}: ProvisionTreeProps) {
  return (
    <nav className="w-80 h-full overflow-y-auto border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-2">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 py-2 mb-1">
        Table of Contents
      </h2>
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          onSelect={onSelect}
          selectedId={selectedId}
        />
      ))}
    </nav>
  );
}
