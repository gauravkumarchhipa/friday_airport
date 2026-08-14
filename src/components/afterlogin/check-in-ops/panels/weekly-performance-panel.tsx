"use client";

import { format, isValid, parseISO, subDays } from "date-fns";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DataTable } from "@/components/common/data-table";
import {
  buildFilterConfigsFromColumns,
  defineColumns,
  mutedCol,
  textCol,
} from "@/components/common/data-table-columns";
import { DashboardSurfaceCard } from "@/components/common/dashboard-surface-card";
import { EChartsProgressBar } from "@/components/common/echarts-progress-bar";
import FormDateFilter from "@/components/common/form-date-filter";
import { FormSelect } from "@/components/common/form-select";
import { FridayButton } from "@/components/common/friday-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getWeeklyView,
  WEEKLY_AIRLINE_FILTER_OPTIONS,
  WEEKLY_BANKS,
} from "@/data/afterlogin/check-in-ops/static-data";
import type {
  FlightBankRec,
  WeeklyEpisodeRow,
} from "@/data/afterlogin/check-in-ops/types";
import { useDataTableControls } from "@/hooks/common/use-data-table-controls";
import type { TableColumnFilterValue } from "@/lib/common/table-filter";
import { cn } from "@/lib/common/utils";

import { OpsCard } from "../check-in-ops-ui";

type DateRangeFilterValue = Extract<TableColumnFilterValue, { type: "date" }>;

const DATE_RANGE_CONFIG = {
  type: "date" as const,
  dateMode: "range" as const,
  label: "Date range",
  placeholder: "Select start and end dates",
};

/** Rolling last week: today − 7 days → today. */
function getLastWeekDateRange(now = new Date()): DateRangeFilterValue {
  return {
    type: "date",
    mode: "range",
    date: null,
    from: format(subDays(now, 7), "yyyy-MM-dd"),
    to: format(now, "yyyy-MM-dd"),
  };
}

function formatIsoDisplay(value: string | null | undefined) {
  if (!value) return null;
  const parsed = parseISO(value);
  return isValid(parsed) ? format(parsed, "dd MMM yyyy") : null;
}

function formatDateRangeLabel(value: DateRangeFilterValue) {
  const fromLabel = formatIsoDisplay(value.from);
  const toLabel = formatIsoDisplay(value.to);
  if (fromLabel && toLabel) return `${fromLabel} – ${toLabel}`;
  if (fromLabel) return `From ${fromLabel}`;
  if (toLabel) return `Until ${toLabel}`;
  return "Select date range";
}

function WeeklyDateRangeFilter({
  value,
  onChange,
}: {
  value: DateRangeFilterValue;
  onChange: (next: DateRangeFilterValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  const label = formatDateRangeLabel(value);
  const canApply = Boolean(draft.from && draft.to);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Date range filter"
          className={cn(
            "inline-flex h-9 w-[16rem] shrink-0 items-center justify-between gap-2 self-center",
            "rounded-none border border-white/20 bg-transparent px-2.5 text-left text-sm text-white",
            "transition-[border-color] duration-200 hover:border-white/35",
            "focus-visible:border-[#179b8c] focus-visible:outline-none",
          )}
        >
          <span className="min-w-0 truncate">{label}</span>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-white/55" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={6}
        collisionPadding={8}
        className={cn(
          "w-[min(calc(100vw-1rem),22rem)]",
          "flex max-w-[calc(100vw-1rem)] flex-col overflow-hidden p-0",
          "rounded-none border border-white/12",
          "bg-[linear-gradient(160deg,#101f23_0%,#0c1b1e_48%,#081214_100%)]",
          "text-white shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
        )}
        style={{
          maxHeight:
            "min(calc(100dvh - 1rem), var(--radix-popover-content-available-height))",
        }}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="shrink-0 border-b border-white/[0.08] px-4 py-3">
          <p className="text-sm font-semibold text-white">Date range</p>
          <p className="mt-0.5 text-[11px] text-white/45">
            Choose start and end dates
          </p>
        </div>
        <div className="friday-slim-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
          <FormDateFilter
            config={DATE_RANGE_CONFIG}
            draft={draft}
            hideFieldLabel
            onDraftChange={(next) => {
              setDraft({
                type: "date",
                mode: "range",
                date: null,
                from: next.from,
                to: next.to,
              });
            }}
          />
        </div>
        <div className="flex shrink-0 items-center gap-2 border-t border-white/[0.08] bg-[#0c1b1e] px-3 py-3 sm:px-4">
          <FridayButton
            type="button"
            variant="dashboard"
            size="sm"
            className="flex-1"
            onClick={() => {
              const lastWeek = getLastWeekDateRange();
              setDraft(lastWeek);
              onChange(lastWeek);
              setOpen(false);
            }}
          >
            Reset
          </FridayButton>
          <FridayButton
            type="button"
            variant="primary"
            size="sm"
            className="flex-1"
            disabled={!canApply}
            onClick={() => {
              onChange({
                type: "date",
                mode: "range",
                date: null,
                from: draft.from,
                to: draft.to,
              });
              setOpen(false);
            }}
          >
            Apply
          </FridayButton>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const EPISODE_COLUMNS = defineColumns<WeeklyEpisodeRow>(
  textCol("Window", (row) => row.window, {
    className: "min-w-[9rem] font-medium text-white",
    textClassName: "font-medium text-white",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: true,
  }),
  textCol("Event", (row) => row.event, {
    className: "min-w-[12rem]",
    maxWidthClass: "max-w-[16rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: true,
  }),
  mutedCol("Peak wait", (row) => row.peakWait, {
    className: "min-w-[8rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: true,
  }),
  mutedCol("Pax affected", (row) => row.paxAffected, {
    className: "min-w-[6rem]",
    headerAlign: "center",
    align: "center",
    sortable: true,
    filter: { type: "number", placeholder: "Pax" },
  }),
  mutedCol("Impact / note", (row) => row.impact, {
    id: "impact",
    className: "min-w-[16rem]",
    maxWidthClass: "max-w-[22rem]",
    headerAlign: "left",
    align: "left",
    lines: 2,
    sortable: true,
    filter: true,
  }),
);

const EPISODE_FILTER_CONFIGS = buildFilterConfigsFromColumns(EPISODE_COLUMNS);

/** Parse primary peak from "22.4 / 17.8 min" for numeric sort. */
function peakWaitPrimaryMinutes(value: string): number {
  const match = value.match(/[\d.]+/);
  return match ? Number(match[0]) : Number.NaN;
}

function formatPaxMin(value: number) {
  return `${value.toLocaleString()} pax-min`;
}

function ScenarioBars({ bank }: { bank: FlightBankRec }) {
  const max = Math.max(bank.observedPaxMin, bank.scenarioAPaxMin, bank.scenarioBPaxMin, 1);
  const rows = [
    {
      label: "Observed",
      value: bank.observedPaxMin,
      color: ["#b91c1c", "#f87171"] as const,
      text: "text-red-200",
    },
    {
      label: "Scenario A — +1 Counter",
      value: bank.scenarioAPaxMin,
      color: ["#047857", "#34d399"] as const,
      text: "text-emerald-200",
    },
    {
      label: "Scenario B — Early Opening",
      value: bank.scenarioBPaxMin,
      color: ["#0369a1", "#38bdf8"] as const,
      text: "text-sky-200",
    },
  ] as const;

  return (
    <div className="mt-3 space-y-2">
      {rows.map((row, index) => (
        <div key={row.label}>
          <div className="mb-0.5 flex items-center justify-between gap-2 text-[10px]">
            <span className="text-white/45">{row.label}</span>
            <span className={cn("font-semibold tabular-nums", row.text)}>
              {formatPaxMin(row.value)}
            </span>
          </div>
          <EChartsProgressBar
            value={(row.value / max) * 100}
            color={row.color}
            height={20}
            barWidth={10}
            animationDelay={index * 60}
          />
        </div>
      ))}
    </div>
  );
}

function downloadWeeklyCsv(
  episodes: WeeklyEpisodeRow[],
  banks: FlightBankRec[],
  airlineLabel: string,
  dateLabel: string,
) {
  const lines = [
    "Airline Weekly Check-In Performance Report",
    `Airline,${airlineLabel}`,
    `Date range,${dateLabel}`,
    "",
    "Window,Event,Peak wait,Pax affected,Impact / note",
    ...episodes.map((row) =>
      [row.window, row.event, row.peakWait, row.paxAffected, row.impact]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    ),
    "",
    "Title,Window,Observed peak,Affected pax,Observed pax-min,Scenario A pax-min,Scenario B pax-min,Recommendation,Adopted",
    ...banks.map((row) =>
      [
        row.title,
        row.window,
        `${row.observedPeakMin} / ${row.observedPeakSecondary} min`,
        row.affectedPax,
        row.observedPaxMin,
        row.scenarioAPaxMin,
        row.scenarioBPaxMin,
        row.recommendation,
        row.adopted ? "yes" : "no",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(","),
    ),
  ];

  const blob = new Blob([`\uFEFF${lines.join("\n")}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `weekly-performance-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function WeeklyPerformancePanel() {
  const [airlineFilter, setAirlineFilter] = useState("KQ");
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>(() =>
    getLastWeekDateRange(),
  );
  const [adoptedMap, setAdoptedMap] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(WEEKLY_BANKS.map((b) => [b.id, b.adopted])),
  );

  const dateKey = `${dateRange.from ?? ""}:${dateRange.to ?? ""}`;

  const base = useMemo(
    () => getWeeklyView(airlineFilter, dateKey),
    [airlineFilter, dateKey],
  );

  const banks = useMemo(
    () =>
      base.banks.map((b) => ({
        ...b,
        adopted: adoptedMap[b.id] ?? b.adopted,
      })),
    [base.banks, adoptedMap],
  );

  const airlineLabel =
    WEEKLY_AIRLINE_FILTER_OPTIONS.find((o) => o.value === airlineFilter)?.label ??
    "All Airlines";
  const dateLabel = formatDateRangeLabel(dateRange);

  const episodesTable = useDataTableControls({
    rows: base.episodes,
    sorting: true,
    filtering: true,
    filterConfigs: EPISODE_FILTER_CONFIGS,
    mode: "client",
    getSortValue: (row, columnId) => {
      switch (columnId) {
        case "window":
          return row.window;
        case "event":
          return row.event;
        case "peak-wait":
          return peakWaitPrimaryMinutes(row.peakWait);
        case "pax-affected":
          return row.paxAffected;
        case "impact":
          return row.impact;
        default:
          return "";
      }
    },
  });

  const toggleAdopted = (id: string) => {
    setAdoptedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-semibold text-white">
            Airline Weekly Check-In Performance Report
          </h3>
          <p className="mt-0.5 text-[12px] text-white/40">
            {dateLabel} · Observed vs Scenario A (+1 counter) vs Scenario B (early opening)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FormSelect
            options={[...WEEKLY_AIRLINE_FILTER_OPTIONS]}
            value={airlineFilter}
            onValueChange={(value) => {
              if (value) setAirlineFilter(value);
            }}
            searchable={false}
            clearable={false}
            surface="transparent"
            variant="square"
            inputSize="sm"
            containerClassName="w-[12.5rem] shrink-0 self-center"
            aria-label="Airline filter"
          />
          <WeeklyDateRangeFilter value={dateRange} onChange={setDateRange} />
          <FridayButton
            variant="outline"
            size="sm"
            className="h-9 shrink-0 self-center"
            onClick={() => downloadWeeklyCsv(base.episodes, banks, airlineLabel, dateLabel)}
          >
            Export CSV
          </FridayButton>
        </div>
      </div>

      <OpsCard title="Weekly breach episodes" flush>
        <DataTable
          columns={EPISODE_COLUMNS}
          rows={episodesTable.displayRows}
          getRowKey={(row) => row.id}
          minWidthClass="min-w-[720px]"
          scrollClassName="friday-slim-scrollbar max-h-[420px] overflow-y-auto"
          sorting={episodesTable.sortingEnabled}
          filtering={episodesTable.filteringEnabled}
          sortState={episodesTable.sortState}
          filterState={episodesTable.filterState}
          onSortCycle={episodesTable.cycleSort}
          onFilterApply={episodesTable.applyFilter}
          onFilterClear={episodesTable.clearFilter}
          emptyMessage="No episodes match your filters"
          emptyDescription="Try changing filters or sorting, or clear them to show all episodes."
          emptyActionLabel="Clear filters"
          onEmptyAction={episodesTable.clearAllControls}
          pageKey={`${airlineFilter}-${dateKey}`}
        />
      </OpsCard>

      <OpsCard title="Actionable Recommendations">
        <div className="grid gap-3 md:grid-cols-3">
          {banks.map((b) => (
            <DashboardSurfaceCard key={b.id} className="flex h-full flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-white">
                    {b.title} – {b.window}
                  </p>
                  <p className="mt-1 text-[11px] text-white/50">
                    Observed peak: {b.observedPeakMin} / {b.observedPeakSecondary} min,
                    affecting {b.affectedPax} pax.
                  </p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase",
                    b.adopted
                      ? "bg-emerald-500/15 text-emerald-200"
                      : "bg-white/10 text-white/50",
                  )}
                >
                  {b.adopted ? "Adopted" : "Open"}
                </span>
              </div>

              <ScenarioBars bank={b} />

              <p className="mt-3 flex-1 text-[11px] leading-snug text-white/55">
                {b.recommendation}
              </p>

              <FridayButton
                variant="soft"
                size="xs"
                className="mt-3 w-full border border-white/12"
                onClick={() => toggleAdopted(b.id)}
              >
                {b.adopted ? "Unmark adopted" : "Mark as adopted"}
              </FridayButton>
            </DashboardSurfaceCard>
          ))}
        </div>
        {banks.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-white/45">
            No recommendations for this airline / week.
          </p>
        ) : null}
      </OpsCard>
    </div>
  );
}
