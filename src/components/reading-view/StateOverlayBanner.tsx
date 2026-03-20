"use client";

import { Info } from "lucide-react";

interface StateOverlayBannerProps {
  stateName: string;
}

export function StateOverlayBanner({ stateName }: StateOverlayBannerProps) {
  if (!stateName) return null;

  return (
    <div className="w-full bg-indigo-50 border-b border-indigo-100 dark:bg-indigo-500/10 dark:border-indigo-500/20 px-6 py-2.5 flex items-start sm:items-center gap-3">
      <div className="p-1 bg-indigo-100/50 dark:bg-indigo-500/20 rounded-md shrink-0 mt-0.5 sm:mt-0">
        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
      </div>
      <p className="text-sm text-indigo-800 dark:text-indigo-300">
        <span className="font-semibold">State rules applied:</span> You are viewing the document with overlays for <b>{stateName}</b>. Local amendments and state-specific rules are injected into the relevant sections below.
      </p>
    </div>
  );
}
