"use client";

import type { ReactNode } from "react";

import { GlassTooltipProvider } from "@/components/common/glass-tooltip";
import { cn } from "@/lib/common/utils";

type DataTableScrollProps = {
  children: ReactNode;
  /** e.g. min-w-[72rem] */
  minWidthClass?: string;
  tableClassName?: string;
  className?: string;
};

/** Scrollable table wrapper with glass tooltip provider for cell text.
 * Default clips overflow-y (avoids animation scrollbar flash).
 * Pass `overflow-y-auto` (+ height) via `className` for sticky-header body scroll.
 */
export function DataTableScroll({
  children,
  minWidthClass,
  tableClassName,
  className,
}: DataTableScrollProps) {
  return (
    <GlassTooltipProvider delayDuration={200}>
      <div
        className={cn(
          "h-full overflow-x-auto overflow-y-clip",
          className,
        )}
      >
        <table
          className={cn(
            "w-full border-collapse text-left text-sm",
            minWidthClass,
            tableClassName,
          )}
        >
          {children}
        </table>
      </div>
    </GlassTooltipProvider>
  );
}
