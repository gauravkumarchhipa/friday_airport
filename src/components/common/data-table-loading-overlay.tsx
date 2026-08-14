"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/common/utils";

type DataTableLoadingOverlayProps = {
  loading?: boolean;
  children: ReactNode;
  className?: string;
};

/** Centered spinner + dimmed table (75%) while Redux `isLoading` / API refresh is pending. */
export function DataTableLoadingOverlay({
  loading = false,
  children,
  className,
}: DataTableLoadingOverlayProps) {
  return (
    <div className={cn("relative flex min-h-[12rem] min-h-0 flex-col", className)}>
      <div
        className={cn(
          "min-h-0 flex-1 transition-opacity duration-200",
          loading && "pointer-events-none select-none opacity-75",
        )}
      >
        {children}
      </div>
      {loading ? (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center bg-[#0a1218]/25"
          aria-busy="true"
          aria-live="polite"
          aria-label="Loading table data"
        >
          <Loader2
            className="h-7 w-7 animate-spin text-[#179b8c]"
            strokeWidth={1.75}
            aria-hidden
          />
        </div>
      ) : null}
    </div>
  );
}
