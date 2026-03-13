"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  text?: string;
  children?: React.ReactNode;
  color?: string;
  bgColor?: string;
  className?: string;
}

export function Badge({ text, children, color, bgColor, className }: BadgeProps) {
  const finalColor = color || bgColor || "#64748b";
  const content = children || text;
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-tight whitespace-nowrap leading-[1.2] border transition-all duration-200",
        className
      )}
      style={{
        color: finalColor,
        backgroundColor: `color-mix(in srgb, ${finalColor}, transparent 88%)`,
        borderColor: `color-mix(in srgb, ${finalColor}, transparent 70%)`,
      }}
    >
      {content}
    </span>
  );
}
