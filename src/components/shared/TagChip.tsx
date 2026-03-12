"use client";

import { Badge } from "./Badge";
import { cn } from "@/lib/utils";

interface TagChipProps {
  tag: string;
  colorMap: Record<string, string>;
  small?: boolean;
  active?: boolean;
  onClick?: () => void;
}

export function TagChip({ tag, colorMap, small, active, onClick }: TagChipProps) {
  const color = colorMap[tag] || "#6b7280";

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "rounded-full border cursor-pointer transition-all duration-200",
          small ? "px-1.5 text-[8px] leading-[14px]" : "px-2 py-0.5 text-[10px] leading-4",
          active ? "font-bold" : "font-normal hover:opacity-80"
        )}
        style={{
          color: active ? "#fff" : color,
          backgroundColor: active ? color : `${color}18`,
          borderColor: active ? color : `${color}40`,
        }}
      >
        {tag}
      </button>
    );
  }

  return <Badge text={tag} bgColor={color} />;
}
