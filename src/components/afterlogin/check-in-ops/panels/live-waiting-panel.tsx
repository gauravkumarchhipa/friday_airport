"use client";

import { AlertTriangle, Plane, Timer, Users } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { SummaryMetricCard } from "@/components/afterlogin/overview/clusters/summary-metric-card";
import { DataTable } from "@/components/common/data-table";
import {
  buildFilterConfigsFromColumns,
  cellCol,
  defineColumns,
  mutedCol,
  textCol,
} from "@/components/common/data-table-columns";
import { FridayButton } from "@/components/common/friday-button";
import {
  CHECK_IN_META,
  getLiveView,
} from "@/data/afterlogin/check-in-ops/static-data";
import type { CounterLive, FlightUrgency } from "@/data/afterlogin/check-in-ops/types";
import { useDataTableControls } from "@/hooks/common/use-data-table-controls";
import { cn } from "@/lib/common/utils";

import { OpsCard, StatusPill, statusLabel } from "../check-in-ops-ui";
import { LiveQueueMap } from "../live-queue-map";

type FlightUrgencyRow = FlightUrgency & {
  waiting5m: number;
  waiting10m: number;
};

function LiveStatusBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-sky-200 uppercase">
      <span className="relative inline-flex h-2 w-2">
        <span className="live-status-ping absolute inset-0 rounded-full bg-sky-400" />
        <span className="relative h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
      </span>
      Live
    </span>
  );
}

const FLIGHT_COLUMNS = defineColumns<FlightUrgencyRow>(
  textCol("Flight", (row) => row.flight, {
    className: "min-w-[5rem] font-medium text-white",
    textClassName: "font-medium text-white",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: true,
  }),
  mutedCol("STD", (row) => row.std, {
    className: "min-w-[4.5rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: true,
  }),
  mutedCol("Est. join wait", (row) => `${row.aveWaitMin.toFixed(0)} min`, {
    className: "min-w-[7.5rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: { type: "number", placeholder: "Mins" },
  }),
  mutedCol("Queue", (row) => row.queue, {
    className: "min-w-[4rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: { type: "number", placeholder: "Queue" },
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
  mutedCol(
    "Breach-in",
    (row) => (row.breachInMin != null ? `${row.breachInMin} min` : "—"),
    {
      className: "min-w-[5.5rem]",
      headerAlign: "left",
      align: "left",
      sortable: true,
      filter: { type: "number", placeholder: "Mins" },
    },
  ),
  mutedCol(
    "Recovery",
    (row) => (row.recoveryMin != null ? `${row.recoveryMin} min` : "—"),
    {
      className: "min-w-[5rem]",
      headerAlign: "left",
      align: "left",
      sortable: true,
      filter: { type: "number", placeholder: "Mins" },
    },
  ),
  cellCol("Status", (row) => <StatusPill status={row.status} />, {
    className: "min-w-[6.5rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: true,
  }),
);

const FLIGHT_FILTER_CONFIGS = buildFilterConfigsFromColumns(FLIGHT_COLUMNS);

const COUNTER_COLUMNS = defineColumns<CounterLive>(
  textCol("Counter", (row) => row.id, {
    className: "min-w-[5rem] font-medium text-white",
    textClassName: "font-medium text-white",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: true,
  }),
  mutedCol("Zone", (row) => `Zone ${row.zone}`, {
    className: "min-w-[5rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: true,
  }),
  mutedCol("Est. join wait", (row) => `${row.joinWaitP50.toFixed(1)} min`, {
    className: "min-w-[7.5rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: { type: "number", placeholder: "Mins" },
  }),
  mutedCol("Queue", (row) => row.queueLen, {
    className: "min-w-[4.5rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: { type: "number", placeholder: "Queue" },
  }),
  mutedCol(">5m", (row) => (row.waiting5m > 0 ? row.waiting5m : "—"), {
    id: "counter-over-5m",
    className: "min-w-[3.5rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: { type: "number", placeholder: ">5m" },
  }),
  mutedCol(">10m", (row) => (row.waiting10m > 0 ? row.waiting10m : "—"), {
    id: "counter-over-10m",
    className: "min-w-[3.5rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: { type: "number", placeholder: ">10m" },
  }),
  cellCol("Status", (row) => <StatusPill status={row.status} />, {
    className: "min-w-[6.5rem]",
    headerAlign: "left",
    align: "left",
    sortable: true,
    filter: true,
  }),
);

const COUNTER_FILTER_CONFIGS = buildFilterConfigsFromColumns(COUNTER_COLUMNS);

export function LiveWaitingPanel() {
  const searchParams = useSearchParams();
  const counterFromUrl = searchParams.get("counter");
  const [airlineFilter] = useState("VJ");
  const [focusCounterId, setFocusCounterId] = useState<string | null>(counterFromUrl);

  useEffect(() => {
    if (counterFromUrl) setFocusCounterId(counterFromUrl);
  }, [counterFromUrl]);
  const view = useMemo(() => getLiveView(airlineFilter), [airlineFilter]);

  const flightRows = useMemo<FlightUrgencyRow[]>(
    () =>
      view.flights.map((f) => {
        const counters = view.counters.filter((c) => f.counterGroup.includes(c.id));
        return {
          ...f,
          waiting5m: counters.reduce((s, c) => s + c.waiting5m, 0),
          waiting10m: counters.reduce((s, c) => s + c.waiting10m, 0),
        };
      }),
    [view.counters, view.flights],
  );

  const flightsTable = useDataTableControls({
    rows: flightRows,
    sorting: true,
    filtering: true,
    filterConfigs: FLIGHT_FILTER_CONFIGS,
    mode: "client",
    getSortValue: (row, columnId) => {
      switch (columnId) {
        case "flight":
          return row.flight;
        case "std":
          return row.std;
        case "est-join-wait":
          return row.aveWaitMin;
        case "queue":
          return row.queue;
        case "over-5m":
          return row.waiting5m;
        case "over-10m":
          return row.waiting10m;
        case "breach-in":
          return row.breachInMin ?? -1;
        case "recovery":
          return row.recoveryMin ?? -1;
        case "status":
          return statusLabel(row.status);
        default:
          return "";
      }
    },
  });

  const countersTable = useDataTableControls({
    rows: view.counters,
    sorting: true,
    filtering: true,
    filterConfigs: COUNTER_FILTER_CONFIGS,
    mode: "client",
    getSortValue: (row, columnId) => {
      switch (columnId) {
        case "counter":
          return row.id;
        case "zone":
          return row.zone;
        case "est-join-wait":
          return row.joinWaitP50;
        case "queue":
          return row.queueLen;
        case "counter-over-5m":
          return row.waiting5m;
        case "counter-over-10m":
          return row.waiting10m;
        case "status":
          return statusLabel(row.status);
        default:
          return "";
      }
    },
  });

  const focus = view.focusFlight;
  const risk = view.risk;
  const primaryAction = view.actions.find((a) => a.severity === "critical") ?? view.actions[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h3 className="text-[16px] font-semibold text-white">Live Waiting Time</h3>
          <LiveStatusBadge />
        </div>
        <span className="text-[12px] text-white/45">{CHECK_IN_META.carrier}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <SummaryMetricCard
          label="Active flights"
          value={String(view.kpis.activeFlights)}
          icon={Plane}
          status="Live bank"
          statusTone="ok"
        />
        <SummaryMetricCard
          label="Critical flights"
          value={String(view.kpis.criticalFlights)}
          icon={AlertTriangle}
          status={view.kpis.criticalFlights > 0 ? "Needs intervention" : "Clear"}
          statusTone={view.kpis.criticalFlights > 0 ? "warn" : "ok"}
        />
        <SummaryMetricCard
          label="Next closure"
          value={view.kpis.nextClosureMin > 0 ? `${view.kpis.nextClosureMin} min` : "—"}
          icon={Timer}
          status={focus?.flight ?? "No flight"}
          statusTone={focus ? "warn" : "idle"}
        />
        <SummaryMetricCard
          label="Waiting > 5 min"
          value={String(view.kpis.waiting5m)}
          icon={Users}
          status="Pax (mandate KPI)"
          statusTone={view.kpis.waiting5m > 0 ? "warn" : "ok"}
        />
        <SummaryMetricCard
          label="Waiting > 10 min"
          value={String(view.kpis.waiting10m)}
          icon={Users}
          status="Pax (mandate KPI)"
          statusTone={view.kpis.waiting10m > 0 ? "warn" : "ok"}
        />
      </div>

      <div className="grid min-h-0 min-w-0 gap-4 xl:h-[min(36rem,calc(100dvh-13rem))] xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.28fr)] xl:items-stretch">
        <div className="flex h-full min-h-0 min-w-0 flex-col gap-4">
          <OpsCard title="Flights ranked by urgency" flush fill className="min-h-0 flex-1">
            <DataTable
              columns={FLIGHT_COLUMNS}
              rows={flightsTable.displayRows}
              getRowKey={(row) => row.flight}
              minWidthClass="min-w-[640px]"
              scrollClassName="friday-slim-scrollbar min-h-0 overflow-auto"
              sorting={flightsTable.sortingEnabled}
              filtering={flightsTable.filteringEnabled}
              sortState={flightsTable.sortState}
              filterState={flightsTable.filterState}
              onSortCycle={flightsTable.cycleSort}
              onFilterApply={flightsTable.applyFilter}
              onFilterClear={flightsTable.clearFilter}
              rowClassName={(row) =>
                cn(
                  row.status === "critical" && "bg-red-500/15",
                  row.status === "warning" && "bg-amber-500/10",
                )
              }
              emptyMessage="No flights match your filters"
              emptyDescription="Try changing column filters, or clear them to show all Vietjet flights."
              emptyActionLabel="Clear filters"
              onEmptyAction={flightsTable.clearAllControls}
              pageKey={airlineFilter}
            />
          </OpsCard>

          <OpsCard title="Counter dwell — >5 min and >10 min" flush fill className="min-h-0 flex-1">
            <DataTable
              columns={COUNTER_COLUMNS}
              rows={countersTable.displayRows}
              getRowKey={(row) => row.id}
              minWidthClass="min-w-[640px]"
              scrollClassName="friday-slim-scrollbar min-h-0 overflow-auto"
              sorting={countersTable.sortingEnabled}
              filtering={countersTable.filteringEnabled}
              sortState={countersTable.sortState}
              filterState={countersTable.filterState}
              onSortCycle={countersTable.cycleSort}
              onFilterApply={countersTable.applyFilter}
              onFilterClear={countersTable.clearFilter}
              rowClassName={(row) =>
                cn(
                  row.status === "critical" && "bg-red-500/15",
                  row.status === "warning" && "bg-amber-500/10",
                  focusCounterId === row.id && "outline outline-1 outline-white/25",
                )
              }
              emptyMessage="No counters match your filters"
              emptyDescription="Try changing column filters, or clear them to show all counters."
              emptyActionLabel="Clear filters"
              onEmptyAction={countersTable.clearAllControls}
              pageKey={airlineFilter}
            />
          </OpsCard>
        </div>

        <OpsCard
          title="Live queue map"
          fill
          className="min-h-0 p-3 sm:p-3 xl:h-full"
          action={<LiveStatusBadge />}
        >
          <LiveQueueMap
            counters={view.counters}
            onSelectCounter={setFocusCounterId}
            focusCounterId={focusCounterId}
            className="h-full min-h-0"
          />
        </OpsCard>
      </div>

      <div className="grid gap-4 md:grid-cols-3 md:items-stretch">
        <OpsCard title="Current focus flight" fill className="h-full">
          {focus ? (
            <>
              <p className="text-[20px] font-semibold tracking-tight text-white sm:text-[22px]">
                {focus.flight}
                <span className="text-white/45"> · </span>
                {focus.std}
              </p>
              <p className="mt-1 text-[12px] text-white/45">{focus.counterGroup}</p>
              <p className="mt-2 text-[12px] text-white/55">
                STD {focus.std}{" "}
                <span className="text-amber-200/90">
                  (closes in {focus.closureInMin} min)
                </span>
              </p>
              <p className="mt-1 text-[12px] text-white/55">
                <span className="font-semibold text-white">{focus.paxRemaining}</span>{" "}
                pax remaining
              </p>
            </>
          ) : (
            <p className="text-[13px] text-white/45">No Vietjet flights in this window.</p>
          )}
        </OpsCard>

        <OpsCard
          title="Live risk"
          fill
          className={cn(
            "h-full",
            risk &&
              risk.breachInMin > 0 &&
              risk.breachInMin <= 10 &&
              "border-red-400/40 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.28)]",
          )}
        >
          {risk ? (
            <>
              <p className="text-[12px] text-white/45">{risk.zone}</p>
              <p className="mt-2 text-[18px] font-semibold text-white sm:text-[20px]">
                Est. join wait:{" "}
                <span className="text-red-200">{risk.joinWaitMin} min</span>
              </p>
              <p className="mt-1 text-[13px] font-medium text-red-300">
                Breach in: {risk.breachInMin} min
              </p>
              <div className="mt-3 space-y-2 text-[13px]">
                <div className="flex justify-between border border-red-400/25 bg-red-500/10 px-3 py-2">
                  <span className="text-white/70">Est. join wait</span>
                  <span className="font-semibold text-red-200">{risk.joinWaitMin} min</span>
                </div>
                <div className="flex justify-between border border-amber-400/25 bg-amber-500/10 px-3 py-2">
                  <span className="text-white/70">Breach in</span>
                  <span className="font-semibold text-amber-200">{risk.breachInMin} min</span>
                </div>
                <div className="flex justify-between border border-emerald-400/20 bg-emerald-500/10 px-3 py-2">
                  <span className="text-white/70">Queue stability</span>
                  <span className="font-semibold text-emerald-200">
                    {risk.queueStabilityIndex}%
                  </span>
                </div>
              </div>
            </>
          ) : (
            <p className="text-[13px] text-white/45">No active risk for this filter.</p>
          )}
        </OpsCard>

        <OpsCard title="Suggested actions (Next 30 min)" fill className="h-full">
          {view.actions.length > 0 ? (
            <>
              <ul className="space-y-2">
                {view.actions.map((a) => (
                  <li
                    key={a.id}
                    className={cn(
                      "border px-3 py-2 text-[12px] leading-snug text-white/80",
                      a.severity === "critical" && "border-red-400/30 bg-red-500/10",
                      a.severity === "warn" && "border-amber-400/30 bg-amber-500/10",
                      a.severity === "info" && "border-white/10 bg-white/[0.03]",
                    )}
                  >
                    {a.text}
                  </li>
                ))}
              </ul>
              {primaryAction ? (
                <FridayButton
                  variant="gradient"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() =>
                    setFocusCounterId(primaryAction.counterId ?? "C12")
                  }
                >
                  {primaryAction.counterId
                    ? `Open +1 counter (${primaryAction.counterId})`
                    : "Review actions"}
                </FridayButton>
              ) : null}
            </>
          ) : (
            <p className="text-[13px] text-white/45">No suggested actions for this airline.</p>
          )}
        </OpsCard>
      </div>
    </div>
  );
}
