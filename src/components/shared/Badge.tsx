"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  text: string;
  color?: string;
  bgColor?: string;
  className?: string;
}

export function Badge({ text, color, bgColor, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap leading-4",
        className
      )}
      style={{
        color: color || "#fff",
        backgroundColor: bgColor || "#6b7280",
      }}
    >
      {text}
    </span>
  );
}
