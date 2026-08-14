import { endOfDay, isSameDay, isValid, parseISO, startOfDay } from "date-fns";

import type { FormSelectOption } from "@/components/common/form-select";

export type TableFilterType =
  | "text"
  | "number"
  | "select"
  | "multiselect"
  | "date";

export type DateFilterMode = "single" | "range";

export type DataTableColumnFilterConfig = {
  type: TableFilterType;
  placeholder?: string;
  label?: string;
  options?: FormSelectOption[];
  /** For `date` filters — single, range, or both (toggle in UI). Default `both`. */
  dateMode?: DateFilterMode | "both";
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  validate?: (value: TableColumnFilterValue) => string | null;
};

export type TableColumnFilterValue =
  | { type: "text"; value: string }
  | { type: "number"; value: string }
  | { type: "select"; value: string | null }
  | { type: "multiselect"; value: string[] }
  | {
      type: "date";
      mode: DateFilterMode;
      date: string | null;
      from: string | null;
      to: string | null;
    };

export type TableFilterState = Record<string, TableColumnFilterValue | undefined>;

export function resolveColumnFilterConfig(
  filter?: boolean | DataTableColumnFilterConfig,
): DataTableColumnFilterConfig | null {
  if (!filter) return null;
  if (filter === true) return { type: "text" };
  return filter;
}

export function columnHasFilter(filter?: boolean | DataTableColumnFilterConfig) {
  return Boolean(resolveColumnFilterConfig(filter));
}

export function createEmptyFilterValue(
  type: TableFilterType,
  config?: Pick<DataTableColumnFilterConfig, "dateMode">,
): TableColumnFilterValue {
  switch (type) {
    case "text":
      return { type: "text", value: "" };
    case "number":
      return { type: "number", value: "" };
    case "select":
      return { type: "select", value: null };
    case "multiselect":
      return { type: "multiselect", value: [] };
    case "date":
      return {
        type: "date",
        mode: resolveDefaultDateFilterMode(config?.dateMode),
        date: null,
        from: null,
        to: null,
      };
  }
}

export function resolveDefaultDateFilterMode(
  dateMode: DataTableColumnFilterConfig["dateMode"],
): DateFilterMode {
  if (dateMode === "single") return "single";
  if (dateMode === "range") return "range";
  return "range";
}

export function isFilterValueEmpty(value: TableColumnFilterValue | undefined) {
  if (!value) return true;

  switch (value.type) {
    case "text":
    case "number":
      return !value.value.trim();
    case "select":
      return !value.value;
    case "multiselect":
      return value.value.length === 0;
    case "date":
      if (value.mode === "single") return !value.date;
      return !value.from && !value.to;
  }
}

export function filterValuesEqual(
  a: TableColumnFilterValue | undefined,
  b: TableColumnFilterValue | undefined,
): boolean {
  const aEmpty = isFilterValueEmpty(a);
  const bEmpty = isFilterValueEmpty(b);
  if (aEmpty && bEmpty) return true;
  if (aEmpty || bEmpty || !a || !b) return false;
  if (a.type !== b.type) return false;

  switch (a.type) {
    case "text":
    case "number":
      return b.type === a.type && a.value.trim() === b.value.trim();
    case "select":
      return b.type === "select" && a.value === b.value;
    case "multiselect": {
      if (b.type !== "multiselect") return false;
      if (a.value.length !== b.value.length) return false;
      const sortedA = [...a.value].sort();
      const sortedB = [...b.value].sort();
      return sortedA.every((item, index) => item === sortedB[index]);
    }
    case "date":
      return (
        b.type === "date" &&
        a.mode === b.mode &&
        a.date === b.date &&
        a.from === b.from &&
        a.to === b.to
      );
  }
}

export function getAppliedFilterBaseline(
  applied: TableColumnFilterValue | undefined,
  type: TableFilterType,
  config?: Pick<DataTableColumnFilterConfig, "dateMode">,
): TableColumnFilterValue {
  if (applied && !isFilterValueEmpty(applied)) {
    if (applied.type === "multiselect") {
      return { type: "multiselect", value: [...applied.value] };
    }
    if (applied.type === "date") {
      return { ...applied };
    }
    return { ...applied };
  }
  return createEmptyFilterValue(type, config);
}

export function isFilterActive(
  filterState: TableFilterState,
  columnId: string,
) {
  const value = filterState[columnId];
  return Boolean(value && !isFilterValueEmpty(value));
}

export function countActiveFilters(filterState: TableFilterState) {
  return Object.keys(filterState).filter((columnId) =>
    isFilterActive(filterState, columnId),
  ).length;
}

export function validateFilterValue(
  value: TableColumnFilterValue,
  config: DataTableColumnFilterConfig,
): string | null {
  if (config.validate) {
    const custom = config.validate(value);
    if (custom) return custom;
  }

  if (config.required && isFilterValueEmpty(value)) {
    return "This filter is required.";
  }

  switch (value.type) {
    case "text": {
      const trimmed = value.value.trim();
      if (!trimmed) return null;
      if (config.minLength && trimmed.length < config.minLength) {
        return `Enter at least ${config.minLength} characters.`;
      }
      if (config.maxLength && trimmed.length > config.maxLength) {
        return `Enter at most ${config.maxLength} characters.`;
      }
      return null;
    }
    case "number": {
      const trimmed = value.value.trim();
      if (!trimmed) return null;
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed)) {
        return "Enter a valid number.";
      }
      if (config.min !== undefined && parsed < config.min) {
        return `Value must be at least ${config.min}.`;
      }
      if (config.max !== undefined && parsed > config.max) {
        return `Value must be at most ${config.max}.`;
      }
      return null;
    }
    case "select":
      if (config.required && !value.value) {
        return "Select an option.";
      }
      return null;
    case "multiselect":
      if (config.required && value.value.length === 0) {
        return "Select at least one option.";
      }
      return null;
    case "date": {
      if (value.mode === "single") {
        if (!value.date) return null;
        const parsed = parseISO(value.date);
        return isValid(parsed) ? null : "Select a valid date.";
      }

      if (!value.from && !value.to) return null;

      if (value.from) {
        const fromDate = parseISO(value.from);
        if (!isValid(fromDate)) return "Select a valid start date.";
      }

      if (value.to) {
        const toDate = parseISO(value.to);
        if (!isValid(toDate)) return "Select a valid end date.";
      }

      if (value.from && value.to) {
        const fromDate = parseISO(value.from);
        const toDate = parseISO(value.to);
        if (fromDate.getTime() > toDate.getTime()) {
          return "Start date must be before end date.";
        }
      }

      return null;
    }
  }
}

function normalizeCellString(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  return String(value).trim().toLowerCase();
}

export function rowMatchesFilter(
  cellValue: string | number | null | undefined,
  filterValue: TableColumnFilterValue,
): boolean {
  if (isFilterValueEmpty(filterValue)) return true;

  const normalizedCell = normalizeCellString(cellValue);

  switch (filterValue.type) {
    case "text":
      return normalizedCell.includes(filterValue.value.trim().toLowerCase());
    case "number": {
      const query = filterValue.value.trim();
      if (!query) return true;
      const cellText = normalizeCellString(cellValue);
      if (cellText.includes(query.toLowerCase())) return true;
      const parsedCell = Number(cellValue);
      const parsedQuery = Number(query);
      return (
        Number.isFinite(parsedCell) &&
        Number.isFinite(parsedQuery) &&
        parsedCell === parsedQuery
      );
    }
    case "select":
      return normalizedCell === normalizeCellString(filterValue.value);
    case "multiselect":
      return filterValue.value.some(
        (item) => normalizedCell === normalizeCellString(item),
      );
    case "date": {
      const timestamp = typeof cellValue === "number" ? cellValue : Number(cellValue);
      if (!Number.isFinite(timestamp)) return false;
      const cellDate = new Date(timestamp);

      if (filterValue.mode === "single") {
        if (!filterValue.date) return true;
        const filterDate = parseISO(filterValue.date);
        if (!isValid(filterDate)) return true;
        return isSameDay(cellDate, filterDate);
      }

      const fromDate = filterValue.from ? parseISO(filterValue.from) : null;
      const toDate = filterValue.to ? parseISO(filterValue.to) : null;

      if (fromDate && isValid(fromDate) && toDate && isValid(toDate)) {
        return (
          timestamp >= startOfDay(fromDate).getTime() &&
          timestamp <= endOfDay(toDate).getTime()
        );
      }

      if (fromDate && isValid(fromDate)) {
        return timestamp >= startOfDay(fromDate).getTime();
      }

      if (toDate && isValid(toDate)) {
        return timestamp <= endOfDay(toDate).getTime();
      }

      return true;
    }
    default:
      return true;
  }
}

export function filterRowsClientSide<T>(
  rows: T[],
  filterState: TableFilterState,
  filterConfigs: Record<string, DataTableColumnFilterConfig>,
  getCellValue: (row: T, columnId: string) => string | number | null | undefined,
): T[] {
  const activeEntries = Object.entries(filterState).filter(
    ([, value]) => value && !isFilterValueEmpty(value),
  );

  if (activeEntries.length === 0) return rows;

  return rows.filter((row) =>
    activeEntries.every(([columnId, filterValue]) => {
      const config = filterConfigs[columnId];
      if (!config || !filterValue) return true;
      const cellValue = getCellValue(row, columnId);
      return rowMatchesFilter(cellValue, filterValue);
    }),
  );
}
