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
          "rounded-full border transition-all duration-200",
          small ? "px-1.5 text-[8px] leading-[14px]" : "px-2.5 py-0.5 text-[10px] leading-4",
          active ? "ring-2 ring-offset-1" : "hover:opacity-80"
        )}
        style={{
          color: active ? "#ffffff" : color,
          backgroundColor: active ? color : `color-mix(in srgb, ${color}, transparent 92%)`,
          borderColor: active ? color : `color-mix(in srgb, ${color}, transparent 75%)`,
        }}
      >
        {tag}
      </button>
    );
  }

  return <Badge text={tag} color={color} />;
}
