export type TablePaginationState = {
  page: number;
  pageSize: number;
  totalItems: number;
};

export function clampPage(page: number, totalPages: number): number {
  if (totalPages <= 0) return 1;
  return Math.min(Math.max(page, 1), totalPages);
}

export function getTotalPages(totalItems: number, pageSize: number): number {
  if (pageSize <= 0 || totalItems <= 0) return 1;
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function paginateRowsClientSide<T>(
  rows: T[],
  page: number,
  pageSize: number,
): { pageRows: T[]; totalPages: number; totalItems: number } {
  const totalItems = rows.length;
  const totalPages = getTotalPages(totalItems, pageSize);
  const safePage = clampPage(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    pageRows: rows.slice(start, start + pageSize),
    totalPages,
    totalItems,
  };
}

export function shouldShowTablePagination(
  totalItems: number,
  _pageSize: number,
  enabled = true,
): boolean {
  return enabled && totalItems > 0;
}

export type PageNumberItem = number | "ellipsis";

/** Page numbers with ellipsis — e.g. 1 2 3 4 5 … 10 */
export function getVisiblePageNumbers(
  page: number,
  totalPages: number,
): PageNumberItem[] {
  if (totalPages <= 0) return [];
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis", totalPages];
  }

  if (page >= totalPages - 3) {
    return [
      1,
      "ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages];
}
