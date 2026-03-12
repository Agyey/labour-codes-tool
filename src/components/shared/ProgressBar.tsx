"use client";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  className?: string;
}

export function ProgressBar({ value, max, color = "#10b981", className }: ProgressBarProps) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);

  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-bold text-gray-700 min-w-[36px] text-right">
        {pct}%
      </span>
    </div>
  );
}
