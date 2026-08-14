"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { type ReactNode, useId } from "react";

import { FormSelect } from "@/components/common/form-select";
import { getVisiblePageNumbers } from "@/lib/common/table-pagination";
import { fridayBtn } from "@/lib/common/styles";
import { cn } from "@/lib/common/utils";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50];

type DataTablePaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  canGoFirst: boolean;
  canGoLast: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  onFirst: () => void;
  onLast: () => void;
  onPrev: () => void;
  onNext: () => void;
  onPageSelect: (page: number) => void;
  /** Display a rows-per-page selector when provided. */
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  pageSizeDisabled?: boolean;
  className?: string;
};

function PageButton({
  label,
  disabled,
  active = false,
  onClick,
  children,
  className,
}: {
  label: string;
  disabled?: boolean;
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={active ? "page" : undefined}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-md px-2.5 text-sm font-medium",
        "border transition-all duration-300 ease-out",
        active
          ? cn(
              fridayBtn({ variant: "gradient", size: "sm" }),
              "rounded-md border-0 px-0 shadow-[0_0_20px_rgba(23,155,140,0.35)]",
              "data-table-page-indicator-active",
            )
          : cn(
              "cursor-pointer border-white/10 bg-white/[0.06] text-white/70",
              "hover:border-[#179b8c]/35 hover:bg-white/[0.11] hover:text-white",
            ),
        "active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function DataTablePagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  canGoFirst,
  canGoLast,
  canGoPrev,
  canGoNext,
  onFirst,
  onLast,
  onPrev,
  onNext,
  onPageSelect,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  pageSizeDisabled = false,
  className,
}: DataTablePaginationProps) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  const pageItems = getVisiblePageNumbers(page, totalPages);
  const pageSizeId = useId();

  return (
    <div
      className={cn(
        "grid grid-cols-2 items-center gap-x-3 gap-y-3 border-t border-white/[0.08] px-4 py-4",
        "md:px-5",
        "lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-4",
        className,
      )}
    >
      <p
        key={`summary-${page}-${pageSize}`}
        className="data-table-page-summary justify-self-start text-xs text-white/70 sm:text-sm"
      >
        Showing{" "}
        <span className="font-medium text-white">
          {start}-{end}
        </span>{" "}
        of <span className="font-medium text-white">{totalItems}</span>
      </p>

      <nav
        aria-label="Table pagination"
        className="col-span-2 order-last flex flex-wrap items-center justify-center gap-1.5 lg:order-none lg:col-span-1 lg:col-start-2"
      >
        <PageButton
          label="Go to first page"
          disabled={!canGoFirst}
          onClick={onFirst}
        >
          <ChevronsLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </PageButton>

        <PageButton
          label="Previous page"
          disabled={!canGoPrev}
          onClick={onPrev}
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </PageButton>

        {pageItems.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-9 w-6 items-center justify-center text-sm text-white/70"
              aria-hidden
            >
              …
            </span>
          ) : (
            <PageButton
              key={item === page ? `active-page-${page}` : `page-${item}`}
              label={`Go to page ${item}`}
              active={item === page}
              onClick={() => onPageSelect(item)}
              className="w-9 px-0"
            >
              {item}
            </PageButton>
          ),
        )}

        <PageButton label="Next page" disabled={!canGoNext} onClick={onNext}>
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </PageButton>

        <PageButton
          label="Go to last page"
          disabled={!canGoLast}
          onClick={onLast}
        >
          <ChevronsRight className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        </PageButton>
      </nav>

      {onPageSizeChange ? (
        <div className="flex items-center justify-self-end gap-2 lg:col-start-3">
          <label
            htmlFor={pageSizeId}
            className="whitespace-nowrap text-xs text-white/70 sm:text-sm"
          >
            Rows per page
          </label>
          <FormSelect
            id={pageSizeId}
            value={String(pageSize)}
            options={pageSizeOptions.map((size) => ({
              value: String(size),
              label: String(size),
            }))}
            onValueChange={(value) => {
              if (value) onPageSizeChange(Number(value));
            }}
            searchable={false}
            clearable={false}
            disabled={pageSizeDisabled}
            inputSize="sm"
            surface="transparent"
            aria-label="Rows per page"
            containerClassName="w-20"
            contentClassName="w-20 min-w-20"
            showOptionIndicator={false}
            variant="square"
          />
        </div>
      ) : (
        <span className="justify-self-end" aria-hidden />
      )}
    </div>
  );
}
