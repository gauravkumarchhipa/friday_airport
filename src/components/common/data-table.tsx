"use client";

import { SearchX } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

import { DataTableFilterPopover } from "@/components/common/data-table-filter-popover";
import { DataTableScroll } from "@/components/common/data-table-scroll";
import { DataTableSortButton } from "@/components/common/data-table-sort-button";
import { FridayButton } from "@/components/common/friday-button";
import { TableCellText } from "@/components/common/table-cell-text";
import {
  resolveColumnFilterConfig,
  type TableColumnFilterValue,
  type TableFilterState,
} from "@/lib/common/table-filter";
import type { DataTableColumnFilterConfig } from "@/lib/common/table-filter";
import type { TableSortState } from "@/lib/common/table-sort";
import { cn } from "@/lib/common/utils";

export type DataTableAlign = "left" | "center" | "right";

const ALIGN_CLASS: Record<DataTableAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export function getDataTableAlignClass(align: DataTableAlign = "left") {
  return ALIGN_CLASS[align];
}

function DataTableCellContent({
  align = "left",
  custom,
  children,
}: {
  align?: DataTableAlign;
  custom?: boolean;
  children: ReactNode;
}) {
  if (align === "left") {
    return <>{children}</>;
  }

  return (
    <div
      className={cn(
        "flex w-full min-w-0 items-center",
        custom && "flex-wrap gap-2",
        align === "center" && "justify-center",
        align === "right" && "justify-end",
      )}
    >
      {children}
    </div>
  );
}

export type DataTableColumn<T> = {
  id: string;
  header: string;
  headerAlign?: DataTableAlign;
  align?: DataTableAlign;
  /** Tailwind width class on `<col>`. */
  width?: string;
  /** Inline width on `<col>`, e.g. `"34%"` — keeps grouped tables aligned. */
  colWidth?: string;
  className?: string;
  headerClassName?: string;
  maxWidthClass?: string;
  lines?: 1 | 2 | 3;
  textClassName?: string;
  /**
   * Pin this column while the table scrolls horizontally at `xl` and above.
   * Below `xl`, it becomes a normal scrolling column.
   * `true` infers left, except for the last column which infers right.
   */
  fixed?: boolean | "left" | "right";
  /** Offset from the pinned edge, useful when stacking fixed columns. */
  fixedOffset?: number | string;
  /** Enable sort cycle for this column when table `sorting` is true. */
  sortable?: boolean;
  /** Enable column filter popover. `true` = text search. */
  filter?: boolean | DataTableColumnFilterConfig;
  accessor?: (row: T, index: number) => string | number | null | undefined;
  cell?: (row: T, index: number) => ReactNode;
};

export type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T, index: number) => string;
  minWidthClass?: string;
  tableClassName?: string;
  scrollClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string | undefined);
  onRowClick?: (row: T, index: number) => void;
  emptyMessage?: ReactNode;
  emptyDescription?: ReactNode;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  emptyStateClassName?: string;
  fixed?: boolean;
  hideHeader?: boolean;
  /** Show sort icons in sortable headers. Default false. */
  sorting?: boolean;
  /** Show filter icons in filterable headers. Default false. */
  filtering?: boolean;
  sortState?: TableSortState;
  filterState?: TableFilterState;
  onSortCycle?: (columnId: string) => void;
  onFilterApply?: (columnId: string, value: TableColumnFilterValue) => void;
  onFilterClear?: (columnId: string) => void;
  /** Changes trigger a page-enter animation on table rows. */
  pageKey?: string | number;
};

const HEADER_ROW_CLASS =
  "border-b border-white/[0.08] text-[11px] font-medium tracking-wide text-white/70 uppercase";
const HEADER_CELL_CLASS = "px-4 py-3 font-medium md:px-5";
export const DATA_TABLE_BODY_CELL_CLASS = "px-4 py-3.5 align-middle md:px-5";
const BODY_CLASS = "divide-y divide-white/[0.06]";
const ROW_CLASS = "group hover:bg-white/[0.02]";

export function columnsHaveFixedLayout<T>(columns: DataTableColumn<T>[]) {
  return columns.some((column) => column.width || column.colWidth);
}

export function columnsHaveFixedPosition<T>(columns: DataTableColumn<T>[]) {
  return columns.some((column) => Boolean(column.fixed));
}

function getColumnHeaderAlign<T>(column: DataTableColumn<T>): DataTableAlign {
  return column.headerAlign ?? "center";
}

function getColumnCellAlign<T>(column: DataTableColumn<T>): DataTableAlign {
  return column.align ?? "left";
}

type DataTableFixedSide = "left" | "right";

function getColumnFixedSide<T>(
  column: DataTableColumn<T>,
  index: number,
  columnCount: number,
): DataTableFixedSide | null {
  if (column.fixed === "left" || column.fixed === "right") {
    return column.fixed;
  }
  if (!column.fixed) return null;
  return index === columnCount - 1 ? "right" : "left";
}

function getColumnFixedStyle<T>(
  column: DataTableColumn<T>,
  side: DataTableFixedSide | null,
): CSSProperties | undefined {
  if (!side) return undefined;
  const offset =
    typeof column.fixedOffset === "number"
      ? `${column.fixedOffset}px`
      : (column.fixedOffset ?? "0px");
  return { [side]: offset };
}

function getFixedColumnClass(
  side: DataTableFixedSide | null,
  header = false,
) {
  if (!side) return undefined;

  return cn(
    "xl:sticky xl:bg-[#0c1b1e]",
    header
      ? "xl:top-0 xl:z-40"
      : "xl:z-20 xl:group-hover:bg-[#112023]",
  );
}

function renderDefaultCell<T>(
  column: DataTableColumn<T>,
  row: T,
  index: number,
) {
  return (
    <TableCellText
      value={column.accessor?.(row, index)}
      lines={column.lines ?? 1}
      className={column.textClassName}
    />
  );
}

export function DataTableColGroup<T>({ columns }: { columns: DataTableColumn<T>[] }) {
  if (!columnsHaveFixedLayout(columns)) return null;

  return (
    <colgroup>
      {columns.map((column) => (
        <col
          key={column.id}
          className={column.width}
          style={column.colWidth ? { width: column.colWidth } : undefined}
        />
      ))}
    </colgroup>
  );
}

export function DataTableHeaderRow<T>({
  columns,
  sorting = false,
  filtering = false,
  sortState,
  filterState,
  onSortCycle,
  onFilterApply,
  onFilterClear,
}: {
  columns: DataTableColumn<T>[];
  sorting?: boolean;
  filtering?: boolean;
  sortState?: TableSortState;
  filterState?: TableFilterState;
  onSortCycle?: (columnId: string) => void;
  onFilterApply?: (columnId: string, value: TableColumnFilterValue) => void;
  onFilterClear?: (columnId: string) => void;
}) {
  const activeSort = sortState ?? { columnId: null, direction: "default" as const };
  const activeFilters = filterState ?? {};

  return (
    <thead>
      <tr className={HEADER_ROW_CLASS}>
        {columns.map((column, columnIndex) => {
          const headerAlign = getColumnHeaderAlign(column);
          const fixedSide = getColumnFixedSide(
            column,
            columnIndex,
            columns.length,
          );
          const showSort = sorting && column.sortable && onSortCycle;
          const filterConfig = resolveColumnFilterConfig(column.filter);
          const showFilter =
            filtering && filterConfig && onFilterApply && onFilterClear;
          const isSortActive =
            activeSort.columnId === column.id && activeSort.direction !== "default";

          return (
            <th
              key={column.id}
              className={cn(
                HEADER_CELL_CLASS,
                "sticky top-0 z-30 bg-[#0c1b1e]",
                getDataTableAlignClass(headerAlign),
                getFixedColumnClass(fixedSide, true),
                column.headerClassName,
              )}
              style={getColumnFixedStyle(column, fixedSide)}
            >
              <div
                className={cn(
                  "flex w-full min-w-0",
                  headerAlign === "center" && "justify-center",
                  headerAlign === "right" && "justify-end",
                  headerAlign === "left" && "justify-start",
                )}
              >
                <div
                  className={cn(
                    "inline-flex w-fit max-w-full min-w-0 items-center gap-1",
                    headerAlign === "center" && "justify-center",
                  )}
                >
                  <span
                    className={cn(
                      "min-w-0 max-h-[2.75em] overflow-hidden whitespace-normal break-words px-0.5 leading-snug transition-colors duration-200",
                      headerAlign === "center" ? "text-center" : "text-left",
                      isSortActive && "text-white",
                    )}
                  >
                    {column.header}
                  </span>
                  {showSort || showFilter ? (
                    <div className="inline-flex shrink-0 items-center gap-0.5 self-center">
                      {showSort ? (
                        <DataTableSortButton
                          columnId={column.id}
                          label={column.header}
                          sortState={activeSort}
                          onCycle={onSortCycle}
                          iconOnly
                          className="shrink-0"
                        />
                      ) : null}
                      {showFilter && filterConfig ? (
                        <DataTableFilterPopover
                          columnId={column.id}
                          label={column.header}
                          align={headerAlign}
                          config={filterConfig}
                          filterState={activeFilters}
                          onApply={onFilterApply}
                          onClear={onFilterClear}
                          className="shrink-0"
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

export function DataTableDataRow<T>({
  row,
  index,
  columns,
  rowClassName,
  onRowClick,
  animatePageEnter = false,
}: {
  row: T;
  index: number;
  columns: DataTableColumn<T>[];
  rowClassName?: string;
  onRowClick?: (row: T, index: number) => void;
  animatePageEnter?: boolean;
}) {
  return (
    <tr
      className={cn(
        ROW_CLASS,
        onRowClick && "cursor-pointer",
        rowClassName,
        animatePageEnter && "data-table-page-row-enter",
      )}
      onClick={onRowClick ? () => onRowClick(row, index) : undefined}
      style={
        animatePageEnter
          ? { animationDelay: `${Math.min(index, 5) * 20}ms` }
          : undefined
      }
    >
      {columns.map((column, columnIndex) => {
        const align = getColumnCellAlign(column);
        const fixedSide = getColumnFixedSide(
          column,
          columnIndex,
          columns.length,
        );
        const isCustom = Boolean(column.cell);
        const content = isCustom
          ? column.cell!(row, index)
          : renderDefaultCell(column, row, index);

        return (
          <td
            key={column.id}
            className={cn(
              DATA_TABLE_BODY_CELL_CLASS,
              getDataTableAlignClass(align),
              getFixedColumnClass(fixedSide, false),
              column.maxWidthClass,
              column.maxWidthClass && "overflow-hidden",
              column.className,
            )}
            style={getColumnFixedStyle(column, fixedSide)}
          >
            <DataTableCellContent align={align} custom={isCustom}>
              {content}
            </DataTableCellContent>
          </td>
        );
      })}
    </tr>
  );
}

export function DataTable<T>({
  columns,
  rows,
  getRowKey,
  minWidthClass,
  tableClassName,
  scrollClassName,
  rowClassName,
  onRowClick,
  emptyMessage,
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  emptyStateClassName,
  fixed,
  hideHeader = false,
  sorting = false,
  filtering = false,
  sortState,
  filterState,
  onSortCycle,
  onFilterApply,
  onFilterClear,
  pageKey,
}: DataTableProps<T>) {
  const useFixedLayout = fixed || columnsHaveFixedLayout(columns);
  const hasFixedColumns = columnsHaveFixedPosition(columns);
  const animatePageEnter = pageKey !== undefined;

  return (
    <DataTableScroll
      minWidthClass={minWidthClass}
      tableClassName={cn(
        useFixedLayout ? "table-fixed" : undefined,
        hasFixedColumns && "xl:bg-[#0c1b1e]",
        tableClassName,
      )}
      className={scrollClassName}
    >
      <DataTableColGroup columns={columns} />
      {hideHeader ? null : (
        <DataTableHeaderRow
          columns={columns}
          sorting={sorting}
          filtering={filtering}
          sortState={sortState}
          filterState={filterState}
          onSortCycle={onSortCycle}
          onFilterApply={onFilterApply}
          onFilterClear={onFilterClear}
        />
      )}
      <tbody key={pageKey} className={BODY_CLASS}>
        {rows.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className={cn(
                DATA_TABLE_BODY_CELL_CLASS,
                "h-64 text-center",
                emptyStateClassName,
              )}
            >
              <div className="mx-auto flex max-w-md flex-col items-center px-4 py-8">
                <span className="grid h-14 w-14 place-items-center rounded-2xl border border-[#179b8c]/30 bg-[#179b8c]/10 text-[#2ab5a3] shadow-[0_10px_30px_rgba(23,155,140,0.12)]">
                  <SearchX className="h-7 w-7" strokeWidth={1.5} aria-hidden />
                </span>
                <p className="mt-4 text-base font-semibold text-white">
                  {emptyMessage ?? "No results found"}
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-white/60">
                  {emptyDescription ??
                    "Try adjusting your search, sorting, or filter criteria."}
                </p>
                {emptyActionLabel && onEmptyAction ? (
                  <FridayButton
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onEmptyAction}
                    className="mt-5"
                  >
                    {emptyActionLabel}
                  </FridayButton>
                ) : null}
              </div>
            </td>
          </tr>
        ) : (
          rows.map((row, index) => {
            const extraRowClass =
              typeof rowClassName === "function"
                ? rowClassName(row, index)
                : rowClassName;

            return (
              <DataTableDataRow
                key={getRowKey(row, index)}
                row={row}
                index={index}
                columns={columns}
                rowClassName={extraRowClass}
                onRowClick={onRowClick}
                animatePageEnter={animatePageEnter}
              />
            );
          })
        )}
      </tbody>
    </DataTableScroll>
  );
}
