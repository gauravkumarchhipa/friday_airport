"use client";

import { AlertTriangle, Plane, TrendingUp, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { SummaryMetricCard } from "@/components/afterlogin/overview/clusters/summary-metric-card";
import { DataTable } from "@/components/common/data-table";
import {
  buildFilterConfigsFromColumns,
  cellCol,
  defineColumns,
  mutedCol,
  textCol,
} from "@/components/common/data-table-columns";
import { DashboardSurfaceCard } from "@/components/common/dashboard-surface-card";
import { EChartsProgressBar } from "@/components/common/echarts-progress-bar";
import { FormSelect } from "@/components/common/form-select";
import { FridayButton } from "@/components/common/friday-button";
import {
  GlassTooltipProvider,
  GlassTooltipWrap,
} from "@/components/common/glass-tooltip";
import {
  CHECK_IN_META,
  getReviewSnapshot,
  PATTERN_HOURS,
  PRESSURE_BANDS,
  PRESSURE_DAYS,
  REVIEW_AIRLINE_FILTER_OPTIONS,
  REVIEW_SCOPE_FILTER_OPTIONS,
} from "@/data/afterlogin/check-in-ops/static-data";
import type {
  LeagueRow,
  PressureCell,
} from "@/data/afterlogin/check-in-ops/types";
import { useDataTableControls } from "@/hooks/common/use-data-table-controls";
import {
  downloadReviewCsv,
  downloadReviewPdf,
} from "@/lib/afterlogin/check-in-ops/export-review";
import { cn } from "@/lib/common/utils";

import { OpsCard } from "../check-in-ops-ui";

/** Parse "4m12s" / "10m28s" → total seconds for numeric sort/filter. */
function medianWaitSeconds(value: string): number {
  const match = value.trim().match(/^(\d+)m(\d+)s$/i);
  if (!match) return Number.NaN;
  return Number(match[1]) * 60 + Number(match[2]);
}

const DAY_FULL: Record<(typeof PRESSURE_DAYS)[number], string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

function pressureLabel(cell: PressureCell) {
  if (cell === "high") return "High pressure";
  if (cell === "medium") return "Medium pressure";
  return "Low pressure";
}

function waitBandLabel(mins: number) {
  if (mins >= 10) return "High (≥10m)";
  if (mins >= 6) return "Medium (6–10m)";
  return "Low (<6m)";
}

function pressureClass(cell: PressureCell) {
  if (cell === "high") return "bg-red-500/75";
  if (cell === "medium") return "bg-amber-400/70";
  return "bg-teal-500/55";
}

function waitTone(mins: number): string {
  if (mins >= 10) return "bg-red-500/80 text-white";
  if (mins >= 6) return "bg-orange-400/75 text-white";
  return "bg-emerald-500/65 text-white";
}

function slaTone(pct: number): string {
  if (pct >= 90) return "text-emerald-300";
  if (pct >= 85) return "text-amber-300";
  return "text-red-300";
}

const LEAGUE_COLUMNS = defineColumns<LeagueRow>(
  textCol("Island", (row) => row.group, {
    className: "min-w-[6rem] font-medium text-white",
    textClassName: "font-medium text-white",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: true,
  }),
  cellCol(
    "SLA %",
    (row) => (
      <span className={cn("font-semibold tabular-nums", slaTone(row.slaPct))}>
        {row.slaPct.toFixed(1)}%
      </span>
    ),
    {
      headerAlign: "center",
      align: "center",
      className: "min-w-[5rem]",
      sortable: true,
      filter: { type: "number", placeholder: "SLA %" },
    },
  ),
  mutedCol("Flights", (row) => row.flights, {
    headerAlign: "center",
    align: "center",
    className: "min-w-[4.5rem]",
    sortable: true,
    filter: { type: "number", placeholder: "Flights" },
  }),
  mutedCol("Breach episodes", (row) => row.breaches, {
    headerAlign: "center",
    align: "center",
    className: "min-w-[6rem]",
    sortable: true,
    filter: { type: "number", placeholder: "Breaches" },
  }),
  mutedCol("Median est. join wait", (row) => row.medianJoinWait, {
    headerAlign: "left",
    align: "left",
    className: "min-w-[7rem]",
    sortable: true,
    filter: true,
  }),
);

const LEAGUE_FILTER_CONFIGS = buildFilterConfigsFromColumns(LEAGUE_COLUMNS);

type BreachBarColor = readonly [from: string, to: string];

const BREACH_STRUCTURAL_COLOR: BreachBarColor = ["#0284c7", "#38bdf8"];
const BREACH_AD_HOC_COLOR: BreachBarColor = ["#ea580c", "#fb923c"];

function BreachStackBar({
  structural,
  adHoc,
  structuralColor = BREACH_STRUCTURAL_COLOR,
  adHocColor = BREACH_AD_HOC_COLOR,
  barWidth = 12,
  height = 22,
}: {
  structural: number;
  adHoc: number;
  /** Gradient `[from, to]` for Structural share. */
  structuralColor?: BreachBarColor;
  /** Gradient `[from, to]` for Ad-hoc share. */
  adHocColor?: BreachBarColor;
  /** Progress bar thickness (px). */
  barWidth?: number;
  /** Chart row height (px). */
  height?: number;
}) {
  const total = Math.max(1, structural + adHoc);
  const structuralPct = (structural / total) * 100;
  const adHocPct = (adHoc / total) * 100;

  return (
    <div
      className="space-y-2"
      title={`Structural: ${structural} · Ad-hoc: ${adHoc}`}
    >
      <EChartsProgressBar
        segments={[
          { value: structural, color: structuralColor },
          { value: adHoc, color: adHocColor },
        ]}
        height={height}
        barWidth={barWidth}
      />
      <div className="flex flex-wrap gap-3 text-[11px] text-white/55">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-sm"
            style={{ backgroundColor: structuralColor[1] }}
            aria-hidden
          />
          Structural {structural}
          <span className="tabular-nums text-white/35">
            ({Math.round(structuralPct)}%)
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-sm"
            style={{ backgroundColor: adHocColor[1] }}
            aria-hidden
          />
          Ad-hoc {adHoc}
          <span className="tabular-nums text-white/35">
            ({Math.round(adHocPct)}%)
          </span>
        </span>
      </div>
    </div>
  );
}

function waitBand(mins: number): "low" | "medium" | "high" {
  if (mins >= 10) return "high";
  if (mins >= 6) return "medium";
  return "low";
}

function WeeklyPressureHeatmap({ profile }: { profile: PressureCell[][] }) {
  const [focus, setFocus] = useState<PressureCell | null>(null);

  const toggleFocus = (level: PressureCell) => {
    setFocus((prev) => (prev === level ? null : level));
  };

  const legendItems: { level: PressureCell; label: string; swatch: string }[] = [
    { level: "low", label: "Low pressure", swatch: "bg-teal-500/70" },
    { level: "medium", label: "Medium pressure", swatch: "bg-amber-400/70" },
    { level: "high", label: "High pressure", swatch: "bg-red-500/75" },
  ];

  return (
    <GlassTooltipProvider delayDuration={120}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/50">
          {legendItems.map((item) => {
            const active = focus === item.level;
            const dimmed = focus !== null && !active;
            return (
              <button
                key={item.level}
                type="button"
                onClick={() => toggleFocus(item.level)}
                aria-pressed={active}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-1 py-0.5 transition-opacity",
                  active ? "text-white" : "text-white/50 hover:text-white/80",
                  dimmed && "opacity-45",
                )}
              >
                <span className={cn("h-2.5 w-2.5 rounded-sm", item.swatch)} />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="friday-slim-scrollbar overflow-x-auto">
          <div
            className="grid min-w-[420px] gap-1"
            style={{
              gridTemplateColumns: `3.5rem repeat(${PRESSURE_DAYS.length}, minmax(0, 1fr))`,
            }}
          >
            <div />
            {PRESSURE_DAYS.map((day) => (
              <div
                key={day}
                className="pb-1 text-center text-[10px] font-medium tracking-wide text-white/45 uppercase"
              >
                {day}
              </div>
            ))}
            {PRESSURE_BANDS.map((band, bi) => (
              <div key={band} className="contents">
                <div className="flex items-center text-[10px] font-medium text-white/55">
                  {band}
                </div>
                {(profile[bi] ?? []).map((cell, di) => {
                  const day = PRESSURE_DAYS[di]!;
                  const highlighted = focus === null || focus === cell;
                  return (
                    <GlassTooltipWrap
                      key={`${band}-${day}`}
                      side="top"
                      label={`${DAY_FULL[day]} · ${band} — ${pressureLabel(cell)}`}
                    >
                      <button
                        type="button"
                        className={cn(
                          "h-9 w-full rounded-sm border-0 p-0 transition-opacity duration-200",
                          pressureClass(cell),
                          highlighted ? "opacity-100" : "opacity-20",
                        )}
                        aria-label={`${DAY_FULL[day]} ${band} ${pressureLabel(cell)}`}
                      />
                    </GlassTooltipWrap>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassTooltipProvider>
  );
}

function PatternWaitHeatmap({ matrix }: { matrix: number[][] }) {
  const [focus, setFocus] = useState<"low" | "medium" | "high" | null>(null);

  const toggleFocus = (level: "low" | "medium" | "high") => {
    setFocus((prev) => (prev === level ? null : level));
  };

  const legendItems: {
    level: "low" | "medium" | "high";
    label: string;
    swatch: string;
  }[] = [
    { level: "low", label: "Low (<6m)", swatch: "bg-emerald-500/70" },
    { level: "medium", label: "Medium (6–10m)", swatch: "bg-orange-400/75" },
    { level: "high", label: "High (≥10m)", swatch: "bg-red-500/80" },
  ];

  return (
    <GlassTooltipProvider delayDuration={120}>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/50">
          {legendItems.map((item) => {
            const active = focus === item.level;
            const dimmed = focus !== null && !active;
            return (
              <button
                key={item.level}
                type="button"
                onClick={() => toggleFocus(item.level)}
                aria-pressed={active}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-md px-1 py-0.5 transition-opacity",
                  active ? "text-white" : "text-white/50 hover:text-white/80",
                  dimmed && "opacity-45",
                )}
              >
                <span className={cn("h-2.5 w-2.5 rounded-sm", item.swatch)} />
                {item.label}
              </button>
            );
          })}
        </div>
        <div className="friday-slim-scrollbar overflow-x-auto">
          <div
            className="grid min-w-[720px] gap-1"
            style={{
              gridTemplateColumns: `2.5rem repeat(${PATTERN_HOURS.length}, minmax(2.75rem, 1fr))`,
            }}
          >
            <div />
            {PATTERN_HOURS.map((h) => (
              <div
                key={h}
                className="pb-1 text-center text-[9px] font-medium tracking-wide text-white/40"
              >
                {h}
              </div>
            ))}
            {PRESSURE_DAYS.map((day, di) => (
              <div key={day} className="contents">
                <div className="flex items-center text-[10px] font-medium text-white/55">
                  {day}
                </div>
                {(matrix[di] ?? []).map((mins, hi) => {
                  const hour = PATTERN_HOURS[hi]!;
                  const band = waitBand(mins);
                  const highlighted = focus === null || focus === band;
                  return (
                    <GlassTooltipWrap
                      key={`${day}-${hour}`}
                      side="top"
                      label={`${DAY_FULL[day]} · ${hour} — Median est. join wait ${mins.toFixed(1)} mins (${waitBandLabel(mins)})`}
                    >
                      <button
                        type="button"
                        className={cn(
                          "flex h-8 w-full items-center justify-center rounded-sm border-0 p-0 text-[10px] font-semibold tabular-nums transition-opacity duration-200",
                          waitTone(mins),
                          highlighted ? "opacity-100" : "opacity-20",
                        )}
                        aria-label={`${DAY_FULL[day]} ${hour} ${mins.toFixed(1)} minutes`}
                      >
                        {mins.toFixed(1)}
                      </button>
                    </GlassTooltipWrap>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassTooltipProvider>
  );
}

export function ManagementReviewPanel() {
  const [airlineFilter, setAirlineFilter] = useState("all");
  const [scopeFilter, setScopeFilter] = useState("all-outbound");

  const view = useMemo(
    () => getReviewSnapshot(airlineFilter, scopeFilter),
    [airlineFilter, scopeFilter],
  );

  const leagueTable = useDataTableControls({
    rows: view.league,
    sorting: true,
    filtering: true,
    filterConfigs: LEAGUE_FILTER_CONFIGS,
    mode: "client",
    getSortValue: (row, columnId) => {
      switch (columnId) {
        case "island":
          return row.group;
        case "sla-%":
          return row.slaPct;
        case "flights":
          return row.flights;
        case "breach-episodes":
          return row.breaches;
        case "median-est-join-wait":
          return medianWaitSeconds(row.medianJoinWait);
        default:
          return "";
      }
    },
  });

  const airlineLabel =
    REVIEW_AIRLINE_FILTER_OPTIONS.find((o) => o.value === airlineFilter)?.label ??
    "All islands";

  const scopeLabel =
    REVIEW_SCOPE_FILTER_OPTIONS.find((o) => o.value === scopeFilter)?.label ??
    "All outbound check-in counters";

  const exportMeta = useMemo(
    () => ({
      airlineLabel,
      scopeLabel,
      slaTargetPct: CHECK_IN_META.slaTargetPct,
      slaWindowMin: CHECK_IN_META.slaWindowMin,
    }),
    [airlineLabel, scopeLabel],
  );

  const handleExportCsv = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadReviewCsv(view, exportMeta, `management-review-${stamp}.csv`);
  };

  const handleExportPdf = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadReviewPdf(view, exportMeta, `management-review-${stamp}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-semibold text-white">Airport Management Review</h3>
          <p className="text-[12px] text-white/40">
            {view.kpis.dateRangeLabel} · SLA target {CHECK_IN_META.slaTargetPct}% /{" "}
            {CHECK_IN_META.slaWindowMin} min · {scopeLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <FormSelect
            options={[...REVIEW_AIRLINE_FILTER_OPTIONS]}
            value={airlineFilter}
            onValueChange={(value) => {
              if (value) setAirlineFilter(value);
            }}
            searchable={false}
            clearable={false}
            surface="transparent"
            variant="square"
            inputSize="sm"
            containerClassName="w-[9.5rem] shrink-0 self-center"
            aria-label="Island filter"
          />
          <FormSelect
            options={[...REVIEW_SCOPE_FILTER_OPTIONS]}
            value={scopeFilter}
            onValueChange={(value) => {
              if (value) setScopeFilter(value);
            }}
            searchable={false}
            clearable={false}
            surface="transparent"
            variant="square"
            inputSize="sm"
            containerClassName="w-[14rem] shrink-0 self-center"
            aria-label="Scope filter"
          />
          <FridayButton
            variant="outline"
            size="sm"
            className="h-9 shrink-0 self-center"
            onClick={handleExportCsv}
          >
            Export CSV
          </FridayButton>
          <FridayButton
            variant="outline"
            size="sm"
            className="h-9 shrink-0 self-center"
            onClick={handleExportPdf}
          >
            Export PDF
          </FridayButton>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryMetricCard
          label="Overall SLA compliance"
          value={`${view.kpis.slaCompliance}%`}
          icon={TrendingUp}
          status={`Target: ≥${CHECK_IN_META.slaTargetPct}% within ${CHECK_IN_META.slaWindowMin} minute wait`}
          statusTone={view.kpis.slaCompliance >= 90 ? "ok" : "warn"}
        />
        <SummaryMetricCard
          label="Total flights analysed"
          value={String(view.kpis.flightsAnalysed)}
          icon={Plane}
          status={`Vietjet Air · ${view.kpis.paxCheckedIn.toLocaleString()} pax checked in`}
          statusTone="ok"
        />
        <SummaryMetricCard
          label="Breach episodes"
          value={String(view.kpis.breachEpisodes)}
          icon={AlertTriangle}
          footer={
            <BreachStackBar
              structural={view.kpis.structuralBreaches}
              adHoc={view.kpis.adHocBreaches}
              structuralColor={BREACH_STRUCTURAL_COLOR}
              adHocColor={BREACH_AD_HOC_COLOR}
              barWidth={12}
              height={22}
            />
          }
        />
        <SummaryMetricCard
          label="Passengers impacted by breach"
          value={`${view.kpis.paxImpacted.toLocaleString()} pax`}
          icon={Users}
          status={`${view.kpis.paxImpactedPct}% of analysed pax`}
          statusTone="warn"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2 xl:items-stretch">
        <OpsCard title="Summary">
          <p className="text-[13px] leading-relaxed text-white/70">{view.summary}</p>
        </OpsCard>
        <OpsCard title="Weekly pressure profile">
          <WeeklyPressureHeatmap profile={view.pressure} />
        </OpsCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] xl:items-stretch">
        <OpsCard title="Pattern view — median est. join wait (mins)" fill className="h-full min-h-0">
          <PatternWaitHeatmap matrix={view.pattern} />
        </OpsCard>

        <OpsCard title="Island SLA league" flush fill className="h-full min-h-0">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <DataTable
              columns={LEAGUE_COLUMNS}
              rows={leagueTable.displayRows}
              getRowKey={(row) => row.group}
              minWidthClass="min-w-[420px]"
              scrollClassName="friday-slim-scrollbar h-full min-h-0 overflow-y-auto"
              sorting={leagueTable.sortingEnabled}
              filtering={leagueTable.filteringEnabled}
              sortState={leagueTable.sortState}
              filterState={leagueTable.filterState}
              onSortCycle={leagueTable.cycleSort}
              onFilterApply={leagueTable.applyFilter}
              onFilterClear={leagueTable.clearFilter}
              rowClassName={(row) =>
                row.highlight ? "bg-red-500/[0.08]" : undefined
              }
              emptyMessage="No islands match your filters"
              emptyDescription="Try changing filters or sorting, or clear them to show all islands."
              emptyActionLabel="Clear filters"
              onEmptyAction={leagueTable.clearAllControls}
              pageKey={`${airlineFilter}-${scopeFilter}`}
            />
          </div>
        </OpsCard>
      </div>

      <OpsCard title="Root cause & accountability view">
        <ul className="grid gap-3 md:grid-cols-3">
          {view.rootCauses.map((r) => (
            <li key={r.title}>
              <DashboardSurfaceCard className="h-full">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide uppercase",
                    r.category === "structural"
                      ? "bg-sky-500/15 text-sky-200"
                      : "bg-amber-500/15 text-amber-200",
                  )}
                >
                  {r.category}
                </span>
                <p className="mt-2 text-[13px] font-medium text-white">{r.title}</p>
                <p className="mt-1 text-[11px] leading-snug text-white/45">{r.detail}</p>
              </DashboardSurfaceCard>
            </li>
          ))}
        </ul>
      </OpsCard>
    </div>
  );
}
