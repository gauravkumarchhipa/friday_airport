export type TableSortDirection = "default" | "asc" | "desc";

export type TableSortState = {
  columnId: string | null;
  direction: TableSortDirection;
};

export const DEFAULT_TABLE_SORT: TableSortState = {
  columnId: null,
  direction: "default",
};

export function cycleTableSortDirection(
  current: TableSortDirection,
): TableSortDirection {
  if (current === "default") return "asc";
  if (current === "asc") return "desc";
  return "default";
}

export function nextTableSortState(
  state: TableSortState,
  columnId: string,
): TableSortState {
  if (state.columnId !== columnId) {
    return { columnId, direction: "asc" };
  }

  const direction = cycleTableSortDirection(state.direction);
  if (direction === "default") {
    return DEFAULT_TABLE_SORT;
  }

  return { columnId, direction };
}

export function isTableSortActive(state: TableSortState): boolean {
  return state.direction !== "default" && Boolean(state.columnId);
}

export function compareSortValues(
  left: string | number | null | undefined,
  right: string | number | null | undefined,
): number {
  if (left == null && right == null) return 0;
  if (left == null) return 1;
  if (right == null) return -1;

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function sortRowsClientSide<T>(
  rows: T[],
  state: TableSortState,
  getSortValue: (row: T, columnId: string) => string | number | null | undefined,
): T[] {
  if (!isTableSortActive(state) || !state.columnId) return rows;

  const sorted = [...rows];
  const columnId = state.columnId;
  const factor = state.direction === "asc" ? 1 : -1;

  sorted.sort((a, b) => factor * compareSortValues(getSortValue(a, columnId), getSortValue(b, columnId)));
  return sorted;
}
