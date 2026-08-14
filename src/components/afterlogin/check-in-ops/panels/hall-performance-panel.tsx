"use client";

import type { EChartsOption } from "echarts";
import { AlertTriangle, Percent, Users } from "lucide-react";
import dynamic from "next/dynamic";
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
import { FormSelect } from "@/components/common/form-select";
import {
  CHECK_IN_META,
  HALL_BY_TERMINAL,
  TERMINAL_FILTER_OPTIONS,
} from "@/data/afterlogin/check-in-ops/static-data";
import type {
  BreachAttribution,
  HallCounter,
  HallStatus,
  SlaPoint,
  TerminalId,
} from "@/data/afterlogin/check-in-ops/types";
import { useDataTableControls } from "@/hooks/common/use-data-table-controls";
import { cn } from "@/lib/common/utils";

import { OpsCard } from "../check-in-ops-ui";

const ReactECharts = dynamic(() => import("echarts-for-react"), {
  ssr: false,
  loading: () => (
    <div className="h-[220px] animate-pulse bg-white/[0.02]" aria-hidden />
  ),
});

function hallStatusMeta(status: HallStatus): { label: string; dot: string } {
  switch (status) {
    case "breaching":
      return { label: "Breaching", dot: "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.55)]" };
    case "at_risk":
      return { label: "At Risk", dot: "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.45)]" };
    case "busy":
      return { label: "Busy", dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]" };
    case "underused":
      return { label: "Underused", dot: "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.4)]" };
    default:
      return { label: "Stable", dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]" };
  }
}

function HallSlaChart({ series }: { series: SlaPoint[] }) {
  const option = useMemo<EChartsOption>(() => {
    const labels = series.map((p) => p.time);
    const sla = series.map((p) => p.sla);
    const target = series.map((p) => p.target);

    return {
      animationDuration: 450,
      grid: { top: 16, right: 16, bottom: 48, left: 12, containLabel: true },
      legend: {
        bottom: 0,
        left: "center",
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 20,
        textStyle: { color: "rgba(255,255,255,0.65)", fontSize: 11 },
        data: ["SLA", "Target"],
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(8, 24, 27, 0.88)",
        borderColor: "rgba(45, 212, 191, 0.32)",
        borderWidth: 1,
        textStyle: { color: "#fff", fontSize: 12 },
        extraCssText:
          "border-radius:10px;backdrop-filter:blur(12px);box-shadow:0 12px 32px rgba(0,0,0,.4);",
        axisPointer: {
          type: "line",
          lineStyle: {
            color: "rgba(255,255,255,0.2)",
            type: "dashed",
            width: 1,
          },
        },
        valueFormatter: (value) => `${value}%`,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: labels,
        axisLine: { lineStyle: { color: "rgba(255,255,255,0.12)" } },
        axisTick: { show: false },
        axisLabel: {
          color: "rgba(255,255,255,0.45)",
          fontSize: 10,
          interval: 1,
          hideOverlap: true,
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        min: 80,
        max: 100,
        interval: 5,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "rgba(255,255,255,0.45)",
          fontSize: 10,
          formatter: (v: number) => `${v}%`,
        },
        splitLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
      },
      series: [
        {
          name: "SLA",
          type: "line",
          data: sla,
          smooth: 0.25,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { width: 2.5, color: "#2dd4bf" },
          itemStyle: { color: "#2dd4bf" },
        },
        {
          name: "Target",
          type: "line",
          data: target,
          symbol: "none",
          lineStyle: {
            width: 1.5,
            color: "rgba(248,113,113,0.9)",
            type: "dashed",
          },
          itemStyle: { color: "#f87171" },
        },
      ],
    };
  }, [series]);

  return (
    <ReactECharts
      option={option}
      className="min-h-0 min-w-0 h-full"
      style={{ height: "100%", width: "100%", minHeight: 240 }}
      opts={{ renderer: "canvas" }}
      notMerge
      lazyUpdate
    />
  );
}

const COUNTER_COLUMNS = defineColumns<HallCounter>(
  mutedCol("Island", (row) => row.island, {
    className: "min-w-[6rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: true,
  }),
  textCol("Counter", (row) => row.id, {
    className: "min-w-[4.5rem] font-medium text-white",
    textClassName: "font-medium text-white",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: true,
  }),
  mutedCol("Queue", (row) => `${row.queue} pax`, {
    className: "min-w-[5rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: { type: "number", placeholder: "Queue pax" },
  }),
  mutedCol("Est. join wait", (row) => `${row.waitMin} mins`, {
    className: "min-w-[7.5rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: { type: "number", placeholder: "Wait mins" },
  }),
  mutedCol(">5m", (row) => (row.waiting5m > 0 ? row.waiting5m : "—"), {
    id: "over-5m",
    className: "min-w-[3.5rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: { type: "number", placeholder: ">5m" },
  }),
  mutedCol(">10m", (row) => (row.waiting10m > 0 ? row.waiting10m : "—"), {
    id: "over-10m",
    className: "min-w-[3.5rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: { type: "number", placeholder: ">10m" },
  }),
  mutedCol("Utilisation", (row) => `${row.utilisation}%`, {
    className: "min-w-[5.5rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: { type: "number", placeholder: "Utilisation %" },
  }),
  cellCol(
    "Status",
    (row) => {
      const meta = hallStatusMeta(row.status);
      return (
        <span className="inline-flex items-center gap-1.5 text-white/80">
          <span className={cn("h-2 w-2 shrink-0 rounded-full", meta.dot)} />
          {meta.label}
        </span>
      );
    },
    {
      className: "min-w-[7rem]",
      headerAlign: "left",
      align: "left",
      sortable: true,
      filter: true,
    },
  ),
);

const BREACH_COLUMNS = defineColumns<BreachAttribution>(
  textCol("Island / row", (row) => row.group, {
    id: "island-row",
    className: "min-w-[10rem] font-medium text-white",
    textClassName: "font-medium text-white",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: true,
  }),
  cellCol(
    "Count",
    (row) => <span className="font-semibold text-red-400">{row.count}</span>,
    {
      className: "min-w-[4rem]",
      headerAlign: "center",
      align: "center",
      sortable: true,
      filter: { type: "number", placeholder: "Count" },
    },
  ),
  mutedCol("Worst episode", (row) => row.worstEpisode, {
    className: "min-w-[10rem]",
    maxWidthClass: "max-w-[14rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: true,
  }),
);

const COUNTER_FILTER_CONFIGS = buildFilterConfigsFromColumns(COUNTER_COLUMNS);
const BREACH_FILTER_CONFIGS = buildFilterConfigsFromColumns(BREACH_COLUMNS);

export function HallPerformancePanel() {
  const [terminalId, setTerminalId] = useState<TerminalId>("t1");
  const hall = HALL_BY_TERMINAL[terminalId];
  const terminalLabel =
    TERMINAL_FILTER_OPTIONS.find((o) => o.value === terminalId)?.label ?? "Terminal 1";

  const countersTable = useDataTableControls({
    rows: hall.counters,
    sorting: true,
    filtering: true,
    filterConfigs: COUNTER_FILTER_CONFIGS,
    mode: "client",
    getSortValue: (row, columnId) => {
      switch (columnId) {
        case "island":
          return row.island;
        case "counter":
          return row.id;
        case "queue":
          return row.queue;
        case "est-join-wait":
          return row.waitMin;
        case "over-5m":
          return row.waiting5m;
        case "over-10m":
          return row.waiting10m;
        case "utilisation":
          return row.utilisation;
        case "status":
          return hallStatusMeta(row.status).label;
        default:
          return "";
      }
    },
  });

  const breachesTable = useDataTableControls({
    rows: hall.breaches,
    sorting: true,
    filtering: true,
    filterConfigs: BREACH_FILTER_CONFIGS,
    mode: "client",
    getSortValue: (row, columnId) => {
      switch (columnId) {
        case "island-row":
          return row.group;
        case "count":
          return row.count;
        case "worst-episode":
          return row.worstEpisode;
        default:
          return "";
      }
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-semibold text-white">Hall Performance</h3>
          <p className="text-[12px] text-white/40">
            {terminalLabel} · Vietjet Air · {CHECK_IN_META.reportingPeriod}
          </p>
        </div>
        <FormSelect
          options={[...TERMINAL_FILTER_OPTIONS]}
          value={terminalId}
          onValueChange={(value) => {
            if (value === "t1" || value === "t2" || value === "t3") {
              setTerminalId(value);
            }
          }}
          searchable={false}
          clearable={false}
          surface="transparent"
          variant="square"
          inputSize="sm"
          containerClassName="w-[10.5rem] shrink-0"
          aria-label="Filter by terminal"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <SummaryMetricCard
          label="Hall SLA (Today)"
          value={`${hall.kpis.slaToday}%`}
          icon={Percent}
          status="Target 90% within 10 min"
          statusTone="ok"
        />
        <SummaryMetricCard
          label="Total Breaches"
          value={String(hall.kpis.breachesToday)}
          icon={AlertTriangle}
          status={`${hall.kpis.breachesToday} breach episodes today`}
          statusTone="warn"
          valueClassName="text-red-400"
        />
        <SummaryMetricCard
          label="Banks Affected"
          value={String(hall.kpis.airlinesAffectedAsGroups)}
          icon={Users}
          status={`${hall.kpis.airlinesAffectedAsGroups} banks need attention`}
          statusTone="warn"
          valueClassName="text-red-400"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2 xl:items-stretch">
        <OpsCard title="Hall SLA — Last 12 Hours" fill className="min-h-[320px]">
          <HallSlaChart series={hall.slaSeries} />
        </OpsCard>

        <OpsCard title="Counter overview" flush fill className="min-h-[320px]">
          <div className="flex min-h-0 flex-1 flex-col">
            <DataTable
              columns={COUNTER_COLUMNS}
              rows={countersTable.displayRows}
              getRowKey={(row) => row.id}
              minWidthClass="min-w-[760px]"
              scrollClassName="friday-slim-scrollbar h-full min-h-0 overflow-y-auto"
              sorting={countersTable.sortingEnabled}
              filtering={countersTable.filteringEnabled}
              sortState={countersTable.sortState}
              filterState={countersTable.filterState}
              onSortCycle={countersTable.cycleSort}
              onFilterApply={countersTable.applyFilter}
              onFilterClear={countersTable.clearFilter}
              emptyMessage="No counters match your filters"
              emptyDescription="Try changing filters or sorting, or clear them to show all counters."
              emptyActionLabel="Clear filters"
              onEmptyAction={countersTable.clearAllControls}
              pageKey={terminalId}
            />
          </div>
        </OpsCard>

        <OpsCard title="Breach Attribution (Today)" flush fill className="min-h-[280px]">
          <div className="flex min-h-0 flex-1 flex-col">
            <DataTable
              columns={BREACH_COLUMNS}
              rows={breachesTable.displayRows}
              getRowKey={(row) => row.group}
              minWidthClass="min-w-[360px]"
              scrollClassName="friday-slim-scrollbar h-full min-h-0 overflow-y-auto"
              sorting={breachesTable.sortingEnabled}
              filtering={breachesTable.filteringEnabled}
              sortState={breachesTable.sortState}
              filterState={breachesTable.filterState}
              onSortCycle={breachesTable.cycleSort}
              onFilterApply={breachesTable.applyFilter}
              onFilterClear={breachesTable.clearFilter}
              emptyMessage="No breaches match your filters"
              emptyDescription="Try changing filters or sorting, or clear them to show all rows."
              emptyActionLabel="Clear filters"
              onEmptyAction={breachesTable.clearAllControls}
              pageKey={terminalId}
            />
          </div>
        </OpsCard>

        <div className="flex h-full min-h-[280px] min-w-0 flex-col">
          <div className="friday-slim-scrollbar grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
            {hall.alertTiles.map((t) => (
              <DashboardSurfaceCard key={`${terminalId}-${t.title}`} className="min-w-0">
                <p className="text-[11px] font-medium tracking-wide text-white/45 uppercase">
                  {t.title}
                </p>
                <p className="mt-1 text-[20px] font-semibold text-white">{t.value}</p>
                <p className="mt-0.5 text-[12px] text-white/50">{t.detail}</p>
              </DashboardSurfaceCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
