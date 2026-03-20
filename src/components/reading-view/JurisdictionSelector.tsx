"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ChevronDown, Check } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

interface JurisdictionSelectorProps {
  selectedState: string | null; // null means Central only
  onChange: (state: string | null) => void;
  availableStates?: string[]; // optionally restrict to states that have rules
}

export function JurisdictionSelector({ selectedState, onChange, availableStates = INDIAN_STATES }: JurisdictionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
          selectedState 
            ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/20 dark:border-indigo-500/30 dark:text-indigo-300 shadow-sm"
            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
        }`}
      >
        <MapPin className="w-4 h-4" />
        <span className="text-sm font-medium">
          {selectedState || "Central Act Only"}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[300px]"
          >
            <div className="p-2 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
              <p className="text-xs font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-wider px-2">
                Apply State Rules
              </p>
            </div>
            
            <div className="overflow-y-auto p-2 space-y-1">
              <button
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                  selectedState === null
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-medium"
                    : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                }`}
              >
                <span>Central Act Only</span>
                {selectedState === null && <Check className="w-4 h-4" />}
              </button>
              
              <div className="h-px bg-slate-100 dark:bg-zinc-800 my-1 mx-2" />

              {INDIAN_STATES.map((state) => {
                const isAvailable = availableStates.includes(state);
                const isSelected = selectedState === state;
                
                return (
                  <button
                    key={state}
                    disabled={!isAvailable}
                    onClick={() => {
                      onChange(state);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 font-medium"
                        : isAvailable
                        ? "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800"
                        : "text-slate-300 dark:text-zinc-700 cursor-not-allowed hidden" // hide completely if no rules? Or show faded. Faded: "opacity-50"
                    }`}
                  >
                    <span>{state}</span>
                    {isSelected && <Check className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
