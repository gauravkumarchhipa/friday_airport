"use client";

import { addMonths, format, isValid, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";

import FormSelect, {
  type FormSelectOption,
} from "@/components/common/form-select";
import { Calendar } from "@/components/ui/calendar";
import type {
  DataTableColumnFilterConfig,
  DateFilterMode,
  TableColumnFilterValue,
} from "@/lib/common/table-filter";
import { cn } from "@/lib/common/utils";

type DateFilterValue = Extract<TableColumnFilterValue, { type: "date" }>;

type FormDateFilterProps = {
  config: DataTableColumnFilterConfig;
  draft: DateFilterValue;
  error?: string;
  onDraftChange: (next: DateFilterValue) => void;
  /** Hide the field label when the parent already shows a heading. */
  hideFieldLabel?: boolean;
};

const DISPLAY_FORMAT = "dd MMM yyyy";
const CURRENT_YEAR = new Date().getFullYear();
const FIRST_YEAR = CURRENT_YEAR - 50;
const LAST_YEAR = CURRENT_YEAR + 50;

const MONTH_OPTIONS: FormSelectOption[] = Array.from({ length: 12 }, (_, month) => ({
  value: String(month),
  label: format(new Date(2020, month, 1), "MMM"),
}));

const YEAR_OPTIONS: FormSelectOption[] = Array.from(
  { length: LAST_YEAR - FIRST_YEAR + 1 },
  (_, index) => {
    const year = FIRST_YEAR + index;
    return { value: String(year), label: String(year) };
  },
);

function toIsoDate(date: Date | undefined | null): string | null {
  if (!date || !isValid(date)) return null;
  return format(date, "yyyy-MM-dd");
}

function fromIsoDate(value: string | null | undefined): Date | undefined {
  if (!value) return undefined;
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : undefined;
}

function formatIsoDate(value: string | null | undefined) {
  const parsed = fromIsoDate(value);
  return parsed ? format(parsed, DISPLAY_FORMAT) : null;
}

function buildDateSummary(value: DateFilterValue) {
  if (value.mode === "single") {
    return formatIsoDate(value.date) ?? "No date selected";
  }

  const fromLabel = formatIsoDate(value.from);
  const toLabel = formatIsoDate(value.to);

  if (fromLabel && toLabel) return `${fromLabel} – ${toLabel}`;
  if (fromLabel) return `From ${fromLabel}`;
  if (toLabel) return `Until ${toLabel}`;
  return "No range selected";
}

const FRIDAY_CALENDAR_CLASS_NAMES = {
  root: "w-full bg-transparent p-0",
  months: "relative w-full",
  month: "w-full gap-3",
  nav: "absolute inset-x-0 top-0 flex items-center justify-between",
  button_previous:
    "inline-flex h-8 w-8 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white",
  button_next:
    "inline-flex h-8 w-8 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white",
  month_caption: "hidden",
  month_grid: "w-full table-fixed border-collapse",
  table: "w-full table-fixed border-collapse",
  weekdays: "mt-2 flex w-full",
  weekday:
    "flex-1 text-center text-[10px] font-semibold uppercase tracking-wide text-white/35",
  weeks: "block w-full",
  week: "mt-1 flex w-full",
  day: "min-w-0 flex-1 aspect-square p-0 text-center",
  outside: "text-white/20",
  disabled: "text-white/20 opacity-40",
  hidden: "invisible",
  today: "font-semibold text-[#2ab5a3]",
  range_start: "rounded-l-md bg-[#11564f]/35",
  range_middle: "rounded-none bg-[#179b8c]/18 text-white",
  range_end: "rounded-r-md bg-[#11564f]/35",
} as const;

function CalendarMonthHeader({
  month,
  onMonthChange,
}: {
  month: Date;
  onMonthChange: (month: Date) => void;
}) {
  const updateMonth = (monthIndex: number) => {
    onMonthChange(new Date(month.getFullYear(), monthIndex, 1));
  };

  const updateYear = (year: number) => {
    onMonthChange(new Date(year, month.getMonth(), 1));
  };

  return (
    <div className="mb-3 flex items-center gap-1.5">
      <button
        type="button"
        aria-label="Previous month"
        onClick={() => onMonthChange(addMonths(month, -1))}
        disabled={
          month.getFullYear() === FIRST_YEAR && month.getMonth() === 0
        }
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-25"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>

      <FormSelect
        options={MONTH_OPTIONS}
        value={String(month.getMonth())}
        onValueChange={(value) => {
          if (value !== null) updateMonth(Number(value));
        }}
        searchable={false}
        clearable={false}
        surface="filled"
        inputSize="md"
        containerClassName="min-w-0 flex-1"
        className="h-8 border border-white/15 px-2 text-xs hover:border-[#179b8c]/45"
        contentClassName="min-w-[7.5rem]"
        optionsClassName="friday-slim-scrollbar max-h-44"
        showOptionIndicator={false}
      />

      <FormSelect
        options={YEAR_OPTIONS}
        value={String(month.getFullYear())}
        onValueChange={(value) => {
          if (value !== null) updateYear(Number(value));
        }}
        searchable={false}
        clearable={false}
        surface="filled"
        inputSize="md"
        containerClassName="w-[6rem] shrink-0"
        className="h-8 border border-white/15 px-2 pr-1.5 text-xs tabular-nums hover:border-[#179b8c]/45"
        contentClassName="!w-[6rem] min-w-[6rem]"
        optionsClassName="friday-slim-scrollbar max-h-44"
        showOptionIndicator={false}
      />

      <button
        type="button"
        aria-label="Next month"
        onClick={() => onMonthChange(addMonths(month, 1))}
        disabled={
          month.getFullYear() === LAST_YEAR && month.getMonth() === 11
        }
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-25"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function ModeToggle({
  mode,
  allowBoth,
  onChange,
}: {
  mode: DateFilterMode;
  allowBoth: boolean;
  onChange: (mode: DateFilterMode) => void;
}) {
  if (!allowBoth) return null;

  return (
    <div className="grid grid-cols-2 gap-1 rounded-none border border-white/10 bg-white/[0.03] p-1">
      {(["single", "range"] as const).map((option) => {
        const active = mode === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-none px-2 py-1.5 text-xs font-medium capitalize transition-all duration-200",
              active
                ? "bg-gradient-to-r from-[#11564f] to-[#179b8c] text-white shadow-[0_4px_14px_rgba(23,155,140,0.25)]"
                : "text-white/55 hover:bg-white/[0.04] hover:text-white/80",
            )}
          >
            {option === "single" ? "Single date" : "Date range"}
          </button>
        );
      })}
    </div>
  );
}

export function FormDateFilter({
  config,
  draft,
  error,
  onDraftChange,
  hideFieldLabel = false,
}: FormDateFilterProps) {
  const allowBoth = config.dateMode === "both" || config.dateMode === undefined;
  const lockedMode =
    config.dateMode === "single" || config.dateMode === "range"
      ? config.dateMode
      : draft.mode;

  const summary = useMemo(() => buildDateSummary(draft), [draft]);
  const selectedAnchor =
    fromIsoDate(
      lockedMode === "single"
        ? draft.date
        : draft.from ?? draft.to,
    ) ?? new Date();
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(selectedAnchor.getFullYear(), selectedAnchor.getMonth(), 1),
  );

  useEffect(() => {
    setVisibleMonth(
      new Date(selectedAnchor.getFullYear(), selectedAnchor.getMonth(), 1),
    );
  }, [selectedAnchor.getFullYear(), selectedAnchor.getMonth()]);

  const handleModeChange = (mode: DateFilterMode) => {
    onDraftChange({
      type: "date",
      mode,
      date: mode === "single" ? draft.date : null,
      from: mode === "range" ? draft.from : null,
      to: mode === "range" ? draft.to : null,
    });
  };

  const fieldLabel = config.label ?? config.placeholder ?? "Date";

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {!hideFieldLabel ? (
          <p className="text-xs font-medium text-white/55">{fieldLabel}</p>
        ) : null}
        <ModeToggle
          mode={lockedMode}
          allowBoth={allowBoth}
          onChange={handleModeChange}
        />
      </div>

      <div className="rounded-none border border-white/10 bg-[#081214]/60 p-2">
        <CalendarMonthHeader
          month={visibleMonth}
          onMonthChange={setVisibleMonth}
        />
        {lockedMode === "single" ? (
          <Calendar
            mode="single"
            selected={fromIsoDate(draft.date)}
            onSelect={(date) =>
              onDraftChange({
                type: "date",
                mode: "single",
                date: toIsoDate(date),
                from: null,
                to: null,
              })
            }
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            startMonth={new Date(FIRST_YEAR, 0)}
            endMonth={new Date(LAST_YEAR, 11)}
            hideNavigation
            showOutsideDays
            className="friday-date-filter-calendar"
            classNames={FRIDAY_CALENDAR_CLASS_NAMES}
          />
        ) : (
          <Calendar
            mode="range"
            selected={{
              from: fromIsoDate(draft.from),
              to: fromIsoDate(draft.to),
            }}
            onSelect={(range: DateRange | undefined) =>
              onDraftChange({
                type: "date",
                mode: "range",
                date: null,
                from: toIsoDate(range?.from),
                to: toIsoDate(range?.to),
              })
            }
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            startMonth={new Date(FIRST_YEAR, 0)}
            endMonth={new Date(LAST_YEAR, 11)}
            hideNavigation
            showOutsideDays
            className="friday-date-filter-calendar"
            classNames={FRIDAY_CALENDAR_CLASS_NAMES}
          />
        )}
      </div>

      <p className="text-xs text-white/45">
        Selected: <span className="font-medium text-white/75">{summary}</span>
      </p>

      {error ? <p className="text-xs text-red-400">{error}</p> : null}
    </div>
  );
}

export default FormDateFilter;
