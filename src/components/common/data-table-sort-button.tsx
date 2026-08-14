"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

import type { TableSortDirection, TableSortState } from "@/lib/common/table-sort";
import { cn } from "@/lib/common/utils";

type DataTableSortButtonProps = {
  columnId: string;
  label: string;
  align?: "left" | "center" | "right";
  sortState: TableSortState;
  onCycle: (columnId: string) => void;
  className?: string;
  /** Icon-only button for use beside header text. */
  iconOnly?: boolean;
};

function SortIcon({ direction }: { direction: TableSortDirection }) {
  const className = "h-3.5 w-3.5";

  if (direction === "asc") {
    return <ArrowUp className={className} strokeWidth={2} aria-hidden />;
  }

  if (direction === "desc") {
    return <ArrowDown className={className} strokeWidth={2} aria-hidden />;
  }

  return <ArrowUpDown className={className} strokeWidth={1.75} aria-hidden />;
}

export function DataTableSortButton({
  columnId,
  label,
  align = "left",
  sortState,
  onCycle,
  className,
  iconOnly = false,
}: DataTableSortButtonProps) {
  const isActive = sortState.columnId === columnId && sortState.direction !== "default";
  const direction =
    sortState.columnId === columnId ? sortState.direction : ("default" as const);

  return (
    <button
      type="button"
      onClick={() => onCycle(columnId)}
      className={cn(
        iconOnly
          ? cn(
              "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md",
              "transition-colors duration-200 hover:bg-white/[0.06]",
              isActive ? "text-white" : "text-white/60 hover:text-white/80",
            )
          : cn(
              "group inline-flex max-w-full items-center gap-1.5 rounded-md px-1 py-0.5",
              "transition-colors duration-200 hover:bg-white/[0.04] hover:text-white/75",
              isActive && "text-white/85",
            ),
        align === "center" && "mx-auto",
        align === "right" && "ml-auto",
        className,
      )}
      aria-label={`Sort ${label} ${direction === "default" ? "ascending" : direction === "asc" ? "descending" : "default"}`}
      aria-pressed={isActive}
    >
      {iconOnly ? (
        <SortIcon direction={direction} />
      ) : (
        <>
          <span className="truncate">{label}</span>
          <span
            className={cn(
              "shrink-0 transition-transform duration-200",
              "group-hover:scale-110",
              isActive && "scale-110",
            )}
          >
            <SortIcon direction={direction} />
          </span>
        </>
      )}
    </button>
  );
}
