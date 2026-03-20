"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

interface PointInTimeSliderProps {
  onDateChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  currentDate?: string;
}

export default function PointInTimeSlider({
  onDateChange,
  minDate = "1950-01-26",
  maxDate,
  currentDate,
}: PointInTimeSliderProps) {
  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(currentDate || today);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    onDateChange(e.target.value);
  };

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b border-slate-200 dark:border-slate-800">
      <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      <label className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
        Point-in-Time
      </label>
      <input
        type="date"
        value={selectedDate}
        min={minDate}
        max={maxDate || today}
        onChange={handleChange}
        className="text-sm px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />
      <span className="text-xs text-slate-500 dark:text-slate-400">
        View provision as on {selectedDate}
      </span>
    </div>
  );
}
