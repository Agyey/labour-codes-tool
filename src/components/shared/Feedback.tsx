import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export function LoadingCard({ message = "Loading data..." }: { message?: string }) {
  return (
    <div className="w-full min-h-[200px] flex flex-col items-center justify-center p-8 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-slate-200 dark:border-zinc-800 rounded-3xl animate-in fade-in duration-500">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
      </div>
      <p className="text-sm font-bold text-slate-500 dark:text-zinc-400 animate-pulse">{message}</p>
    </div>
  );
}

export function ErrorMessage({ 
  title = "Initialization Error", 
  message = "We couldn't load this component. Please check your connection.",
  onRetry
}: { 
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="w-full flex flex-col items-center justify-center p-12 text-center bg-rose-50/30 dark:bg-rose-950/10 border border-rose-200 dark:border-rose-900/30 rounded-3xl animate-in zoom-in-95 duration-300">
      <div className="w-14 h-14 bg-rose-100 dark:bg-rose-500/20 rounded-2xl flex items-center justify-center mb-4">
        <AlertCircle className="w-7 h-7 text-rose-600 dark:text-rose-400" />
      </div>
      <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-sm mb-6 font-medium">{message}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-slate-900/10"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      )}
    </div>
  );
}

export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-100 dark:bg-zinc-800 rounded-lg ${className}`} />
  );
}
