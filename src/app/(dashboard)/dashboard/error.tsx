"use client";

import { useEffect } from "react";
import { ErrorMessage } from "@/components/shared/Feedback";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Standardized logging for client-side errors
    console.error("[DASHBOARD_ERROR_BOUNDARY]", error);
  }, [error]);

  return (
    <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
      <ErrorMessage 
        title="Dashboard Offline"
        message="We encountered an issue while aggregating your firm's data. This might be a temporary connection issue."
        onRetry={() => reset()}
      />
    </div>
  );
}
