"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DEFAULT_TABLE_SORT,
  isTableSortActive,
  nextTableSortState,
  sortRowsClientSide,
  type TableSortDirection,
  type TableSortState,
} from "@/lib/common/table-sort";
import {
  countActiveFilters,
  filterRowsClientSide,
  type TableColumnFilterValue,
  type TableFilterState,
} from "@/lib/common/table-filter";
import type { DataTableColumnFilterConfig } from "@/lib/common/table-filter";
import {
  clampPage,
  getTotalPages,
  paginateRowsClientSide,
  shouldShowTablePagination,
  type TablePaginationState,
} from "@/lib/common/table-pagination";

export type DataTableControlsMode = "client" | "server";

export type UseDataTableControlsOptions<T> = {
  rows: T[];
  /** Show sort icons in headers. Default false. */
  sorting?: boolean;
  /** Enable client-side column filters. Default false. */
  filtering?: boolean;
  /** Column filter configs keyed by column id. */
  filterConfigs?: Record<string, DataTableColumnFilterConfig>;
  /** Enable pagination UI. Default false. */
  pagination?: boolean;
  pageSize?: number;
  /** Client = sort/paginate in browser. Server = call API handlers. */
  mode?: DataTableControlsMode;
  /** Apply sorting/filtering to the currently loaded rows in server mode. */
  clientTransformationsInServerMode?: boolean;
  initialPage?: number;
  initialSort?: TableSortState;
  /** Required for client sorting or server sort callbacks. */
  getSortValue?: (row: T, columnId: string) => string | number | null | undefined;
  /** Server-side total item count (all pages). */
  totalItems?: number;
  /** Server-provided total page count. */
  totalPages?: number;
  /** Controlled server page (1-indexed). */
  page?: number;
  /** Controlled server sort state. */
  sortState?: TableSortState;
  filterState?: TableFilterState;
  onPageChange?: (page: number) => void;
  onSortChange?: (sort: TableSortState) => void;
  onFilterChange?: (filters: TableFilterState) => void;
  initialFilters?: TableFilterState;
};

export type DataTableControlsResult<T> = {
  displayRows: T[];
  sortingEnabled: boolean;
  filteringEnabled: boolean;
  paginationEnabled: boolean;
  sortState: TableSortState;
  filterState: TableFilterState;
  cycleSort: (columnId: string) => void;
  applyFilter: (columnId: string, value: TableColumnFilterValue) => void;
  clearFilter: (columnId: string) => void;
  clearAllFilters: () => void;
  /** Clear active sorting and every column filter together. */
  clearAllControls: () => void;
  /** True when sorting or at least one filter is active. */
  hasActiveControls: boolean;
  pagination: TablePaginationState & {
    totalPages: number;
    canGoFirst: boolean;
    canGoPrev: boolean;
    canGoNext: boolean;
    canGoLast: boolean;
    goFirst: () => void;
    goPrev: () => void;
    goNext: () => void;
    goLast: () => void;
    setPage: (page: number) => void;
  };
};

export function useDataTableControls<T>({
  rows,
  sorting = false,
  filtering = false,
  filterConfigs = {},
  pagination = false,
  pageSize = 10,
  mode = "client",
  clientTransformationsInServerMode = false,
  initialPage = 1,
  initialSort = DEFAULT_TABLE_SORT,
  initialFilters = {},
  getSortValue,
  totalItems: totalItemsProp,
  totalPages: totalPagesProp,
  page: controlledPage,
  sortState: controlledSort,
  filterState: controlledFilters,
  onPageChange,
  onSortChange,
  onFilterChange,
}: UseDataTableControlsOptions<T>): DataTableControlsResult<T> {
  const isServer = mode === "server";

  const [localSort, setLocalSort] = useState<TableSortState>(initialSort);
  const [localPage, setLocalPage] = useState(initialPage);
  const [localFilters, setLocalFilters] = useState<TableFilterState>(initialFilters);

  const sortState = controlledSort ?? localSort;
  const page = controlledPage ?? localPage;
  const filterState = controlledFilters ?? localFilters;

  const setSortState = useCallback(
    (next: TableSortState) => {
      if (controlledSort === undefined) setLocalSort(next);
      onSortChange?.(next);
    },
    [controlledSort, onSortChange],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      const normalized = Math.max(1, nextPage);
      if (controlledPage === undefined) setLocalPage(normalized);
      onPageChange?.(normalized);
    },
    [controlledPage, onPageChange],
  );

  const setFilterState = useCallback(
    (next: TableFilterState) => {
      if (controlledFilters === undefined) setLocalFilters(next);
      onFilterChange?.(next);
    },
    [controlledFilters, onFilterChange],
  );

  const applyFilter = useCallback(
    (columnId: string, value: TableColumnFilterValue) => {
      setFilterState({ ...filterState, [columnId]: value });
      if (!isServer) setPage(1);
    },
    [filterState, isServer, setFilterState, setPage],
  );

  const clearFilter = useCallback(
    (columnId: string) => {
      const next = { ...filterState };
      delete next[columnId];
      setFilterState(next);
      if (!isServer) setPage(1);
    },
    [filterState, isServer, setFilterState, setPage],
  );

  const clearAllFilters = useCallback(() => {
    setFilterState({});
    if (!isServer) setPage(1);
  }, [isServer, setFilterState, setPage]);

  const clearAllControls = useCallback(() => {
    setSortState(DEFAULT_TABLE_SORT);
    setFilterState({});
    if (!isServer) setPage(1);
  }, [isServer, setFilterState, setPage, setSortState]);

  const cycleSort = useCallback(
    (columnId: string) => {
      const next = nextTableSortState(sortState, columnId);
      setSortState(next);
      if (!isServer) setPage(1);
    },
    [isServer, setPage, setSortState, sortState],
  );

  const filteredRows = useMemo(() => {
    if (
      (isServer && !clientTransformationsInServerMode) ||
      !filtering ||
      !getSortValue
    ) {
      return rows;
    }
    return filterRowsClientSide(rows, filterState, filterConfigs, getSortValue);
  }, [
    clientTransformationsInServerMode,
    filterConfigs,
    filterState,
    filtering,
    getSortValue,
    isServer,
    rows,
  ]);

  const sortedRows = useMemo(() => {
    if (
      (isServer && !clientTransformationsInServerMode) ||
      !sorting ||
      !isTableSortActive(sortState) ||
      !getSortValue
    ) {
      return filteredRows;
    }
    return sortRowsClientSide(filteredRows, sortState, getSortValue);
  }, [
    clientTransformationsInServerMode,
    filteredRows,
    getSortValue,
    isServer,
    sortState,
    sorting,
  ]);

  const totalItems = isServer ? (totalItemsProp ?? rows.length) : sortedRows.length;
  const totalPages = isServer
    ? (totalPagesProp ?? getTotalPages(totalItems, pageSize))
    : getTotalPages(totalItems, pageSize);

  useEffect(() => {
    if (!pagination) return;
    const safe = clampPage(page, totalPages);
    if (safe !== page) setPage(safe);
  }, [page, pagination, setPage, totalPages]);

  const clientSlice = useMemo(() => {
    if (!pagination || isServer) {
      return {
        pageRows: sortedRows,
        totalPages,
        totalItems,
      };
    }
    return paginateRowsClientSide(sortedRows, page, pageSize);
  }, [isServer, page, pageSize, pagination, sortedRows, totalItems, totalPages]);

  const displayRows =
    isServer && clientTransformationsInServerMode
      ? sortedRows
      : isServer
        ? rows
        : clientSlice.pageRows;
  const paginationEnabled = shouldShowTablePagination(totalItems, pageSize, pagination);
  const hasActiveControls =
    (sorting && isTableSortActive(sortState)) ||
    (filtering && countActiveFilters(filterState) > 0);

  const goFirst = useCallback(() => setPage(1), [setPage]);
  const goPrev = useCallback(() => setPage(page - 1), [page, setPage]);
  const goNext = useCallback(() => setPage(page + 1), [page, setPage]);
  const goLast = useCallback(() => setPage(totalPages), [setPage, totalPages]);

  return {
    displayRows,
    sortingEnabled: sorting,
    filteringEnabled: filtering,
    paginationEnabled,
    sortState,
    filterState,
    cycleSort,
    applyFilter,
    clearFilter,
    clearAllFilters,
    clearAllControls,
    hasActiveControls,
    pagination: {
      page: clampPage(page, totalPages),
      pageSize,
      totalItems,
      totalPages,
      canGoFirst: page > 1,
      canGoPrev: page > 1,
      canGoNext: page < totalPages,
      canGoLast: page < totalPages,
      goFirst,
      goPrev,
      goNext,
      goLast,
      setPage,
    },
  };
}

export type { TableSortDirection, TableSortState };
export type { TableColumnFilterValue, TableFilterState } from "@/lib/common/table-filter";
