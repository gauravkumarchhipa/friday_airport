import type { ReactNode } from "react";

import type { DataTableColumn } from "@/components/common/data-table";
import {
  resolveColumnFilterConfig,
  type DataTableColumnFilterConfig,
} from "@/lib/common/table-filter";

export { TableCellEmpty, TableCellText } from "@/components/common/table-cell-text";
export { TextTruncate } from "@/components/common/text-truncate";
export type { TextTruncateProps } from "@/components/common/text-truncate";
export { DataTableLoadingOverlay } from "@/components/common/data-table-loading-overlay";
export { DataTablePagination } from "@/components/common/data-table-pagination";
export { DataTableFilterPopover } from "@/components/common/data-table-filter-popover";
export { DataTableSortButton } from "@/components/common/data-table-sort-button";

export { useDataTableControls } from "@/hooks/common/use-data-table-controls";
export type {
  DataTableControlsMode,
  UseDataTableControlsOptions,
} from "@/hooks/common/use-data-table-controls";
export {
  DEFAULT_TABLE_SORT,
  cycleTableSortDirection,
  type TableSortDirection,
  type TableSortState,
} from "@/lib/common/table-sort";
export {
  getTotalPages,
  getVisiblePageNumbers,
  shouldShowTablePagination,
  type PageNumberItem,
  type TablePaginationState,
} from "@/lib/common/table-pagination";
export {
  resolveColumnFilterConfig,
  type DataTableColumnFilterConfig,
  type TableColumnFilterValue,
  type TableFilterState,
  type TableFilterType,
} from "@/lib/common/table-filter";

export function buildFilterConfigsFromColumns<T>(
  columns: DataTableColumn<T>[],
): Record<string, DataTableColumnFilterConfig> {
  const configs: Record<string, DataTableColumnFilterConfig> = {};

  for (const column of columns) {
    const config = resolveColumnFilterConfig(column.filter);
    if (config) configs[column.id] = config;
  }

  return configs;
}

export const TABLE_TEXT = {
  monoLink: "font-mono text-[13px] text-[#9ecbff]",
  monoMuted: "font-mono text-[12px] text-white/70",
  muted: "text-white/70",
  faint: "text-white/55",
} as const;

type RowValue = string | number | null | undefined;
type AccessorFn<T> = (row: T, index: number) => RowValue;
type CellFn<T> = (row: T, index: number) => ReactNode;

type ColumnOptions<T> = Omit<
  DataTableColumn<T>,
  "id" | "header" | "accessor" | "cell"
> & {
  id?: string;
  header?: string;
};

function columnId(header: string, id?: string) {
  return id ?? header.toLowerCase().replace(/\s+/g, "-");
}

function resolveAccessor<T>(
  accessor: AccessorFn<T>,
): DataTableColumn<T>["accessor"] {
  return accessor;
}

function withTextStyle<T>(
  textClassName: string,
  options?: ColumnOptions<T>,
): ColumnOptions<T> {
  return {
    className: textClassName,
    textClassName,
    ...options,
  };
}

/** Shorthand for a plain text column (1 line + ellipsis + tooltip by default). */
export function textCol<T>(
  header: string,
  accessor: AccessorFn<T>,
  options?: ColumnOptions<T>,
): DataTableColumn<T> {
  return {
    id: columnId(header, options?.id),
    header,
    accessor: resolveAccessor(accessor),
    lines: 1,
    ...options,
  };
}

/** Mono link-style text column. */
export function monoCol<T>(
  header: string,
  accessor: AccessorFn<T>,
  options?: ColumnOptions<T>,
): DataTableColumn<T> {
  return textCol(header, accessor, {
    ...withTextStyle(TABLE_TEXT.monoLink, options),
    ...options,
  });
}

/** Muted text column (`text-white/70`). */
export function mutedCol<T>(
  header: string,
  accessor: AccessorFn<T>,
  options?: ColumnOptions<T>,
): DataTableColumn<T> {
  return textCol(header, accessor, withTextStyle(TABLE_TEXT.muted, options));
}

/** Faint text column (`text-white/55`). */
export function faintCol<T>(
  header: string,
  accessor: AccessorFn<T>,
  options?: ColumnOptions<T>,
): DataTableColumn<T> {
  return textCol(header, accessor, withTextStyle(TABLE_TEXT.faint, options));
}

/** Custom render column. */
export function cellCol<T>(
  header: string,
  cell: CellFn<T>,
  options?: ColumnOptions<T>,
): DataTableColumn<T> {
  return {
    id: columnId(header, options?.id),
    header,
    cell,
    ...options,
  };
}

/** Center-aligned custom column (header + content). */
export function centerCol<T>(
  header: string,
  cell: CellFn<T>,
  options?: ColumnOptions<T>,
): DataTableColumn<T> {
  return cellCol(header, cell, { align: "center", ...options });
}

/** Actions column — centered header, right-aligned content (never sortable). */
export function actionsCol<T>(
  cell: CellFn<T>,
  options?: ColumnOptions<T>,
): DataTableColumn<T> {
  return {
    ...options,
    id: options?.id ?? "actions",
    header: options?.header ?? "Actions",
    headerAlign: "center",
    align: "right",
    sortable: false,
    cell,
  };
}

/** Typed column list helper. */
export function defineColumns<T>(
  ...columns: DataTableColumn<T>[]
): DataTableColumn<T>[] {
  return columns;
}
