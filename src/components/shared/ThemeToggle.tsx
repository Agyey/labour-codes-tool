"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-700/50 animate-pulse" />
    );
  }

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <button
      onClick={cycleTheme}
      className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-white/80 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-300 group overflow-hidden"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ y: 20, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -20, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.2, ease: "circOut" }}
          className="relative z-10"
        >
          {theme === "light" && <Sun className="w-[18px] h-[18px] text-amber-500" />}
          {theme === "dark" && <Moon className="w-[18px] h-[18px] text-blue-400" />}
          {theme === "system" && <Monitor className="w-[18px] h-[18px] text-slate-500 dark:text-slate-400" />}
        </motion.div>
      </AnimatePresence>
      
      {/* Dynamic Background Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-emerald-500/5 dark:from-blue-400/10 dark:to-emerald-400/10" />
      </div>
    </button>
  );
}
