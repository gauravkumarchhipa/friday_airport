import type {
  BreachAttribution,
  CounterLive,
  FlightBankRec,
  FlightUrgency,
  HallAlertTile,
  HallCounter,
  HallTerminalSnapshot,
  LeagueRow,
  LiveViewSnapshot,
  PressureCell,
  ReviewKpis,
  ReviewSnapshot,
  RootCause,
  SlaPoint,
  SuggestedAction,
  TerminalId,
  WeeklyEpisodeRow,
} from "./types";

/** Static Vietjet (VJ) pilot seed — no API calls. */
export const CHECK_IN_META = {
  carrier: "Vietjet Air (VJ)",
  terminal: "Terminal 1 · Check-in Hall A",
  slaTargetPct: 90,
  slaWindowMin: 10,
  subTargetMin: 5,
  refreshedAt: "14:32:08",
  alertLatencyMs: 18_400,
  privacyBadge: "Anonymous points · no video · on-prem",
} as const;

export const LIVE_AIRLINE_FILTER_OPTIONS = [
  { value: "all", label: "All Airlines" },
  { value: "VJ", label: "VJ - Vietjet Air" },
  { value: "KQ", label: "KQ - Kenya Airways" },
  { value: "AB", label: "AB" },
  { value: "CD", label: "CD" },
] as const;

export const LIVE_COUNTERS: CounterLive[] = [
  {
    id: "C03",
    airline: "VJ",
    zone: "A",
    row: "Row 1",
    queueLen: 8,
    joinWaitP50: 3.2,
    joinWaitP95: 4.8,
    waiting5m: 1,
    waiting10m: 0,
    serviceRate: 1.8,
    capacityDeficit: 0,
    breachInMin: null,
    recoveryMin: null,
    status: "stable",
    x: 18,
    y: 28,
  },
  {
    id: "C07",
    airline: "VJ",
    zone: "A",
    row: "Row 1",
    queueLen: 14,
    joinWaitP50: 6.1,
    joinWaitP95: 8.4,
    waiting5m: 6,
    waiting10m: 0,
    serviceRate: 1.4,
    capacityDeficit: 0.3,
    breachInMin: 12,
    recoveryMin: 9,
    status: "warning",
    x: 34,
    y: 30,
  },
  {
    id: "C12",
    airline: "VJ",
    zone: "B",
    row: "Row 3",
    queueLen: 28,
    joinWaitP50: 11.4,
    joinWaitP95: 15.8,
    waiting5m: 14,
    waiting10m: 7,
    serviceRate: 1.1,
    capacityDeficit: 1.4,
    breachInMin: 7,
    recoveryMin: 18,
    status: "critical",
    x: 62,
    y: 55,
  },
  {
    id: "C14",
    airline: "VJ",
    zone: "B",
    row: "Row 3",
    queueLen: 22,
    joinWaitP50: 9.2,
    joinWaitP95: 12.1,
    waiting5m: 9,
    waiting10m: 3,
    serviceRate: 1.2,
    capacityDeficit: 0.9,
    breachInMin: 9,
    recoveryMin: 14,
    status: "critical",
    x: 78,
    y: 52,
  },
  {
    id: "C18",
    airline: "VJ",
    zone: "C",
    row: "Row 2",
    queueLen: 5,
    joinWaitP50: 2.4,
    joinWaitP95: 3.6,
    waiting5m: 0,
    waiting10m: 0,
    serviceRate: 1.9,
    capacityDeficit: -0.4,
    breachInMin: null,
    recoveryMin: null,
    status: "underutilized",
    x: 48,
    y: 72,
  },
  {
    id: "C21",
    airline: "VJ",
    zone: "C",
    row: "Row 2",
    queueLen: 11,
    joinWaitP50: 4.8,
    joinWaitP95: 6.2,
    waiting5m: 3,
    waiting10m: 0,
    serviceRate: 1.6,
    capacityDeficit: 0.1,
    breachInMin: 22,
    recoveryMin: 6,
    status: "busy",
    x: 28,
    y: 68,
  },
  {
    id: "C03",
    airline: "KQ",
    zone: "A",
    row: "Row 1",
    queueLen: 10,
    joinWaitP50: 4.1,
    joinWaitP95: 5.9,
    waiting5m: 2,
    waiting10m: 0,
    serviceRate: 1.7,
    capacityDeficit: 0.1,
    breachInMin: null,
    recoveryMin: null,
    status: "stable",
    x: 18,
    y: 28,
  },
  {
    id: "C07",
    airline: "KQ",
    zone: "A",
    row: "Row 1",
    queueLen: 16,
    joinWaitP50: 7.2,
    joinWaitP95: 9.8,
    waiting5m: 8,
    waiting10m: 1,
    serviceRate: 1.3,
    capacityDeficit: 0.5,
    breachInMin: 11,
    recoveryMin: 10,
    status: "warning",
    x: 34,
    y: 30,
  },
  {
    id: "C12",
    airline: "KQ",
    zone: "B",
    row: "Row 3",
    queueLen: 34,
    joinWaitP50: 13.1,
    joinWaitP95: 17.4,
    waiting5m: 18,
    waiting10m: 9,
    serviceRate: 1.0,
    capacityDeficit: 1.8,
    breachInMin: 5,
    recoveryMin: 22,
    status: "critical",
    x: 62,
    y: 55,
  },
  {
    id: "C14",
    airline: "KQ",
    zone: "B",
    row: "Row 3",
    queueLen: 20,
    joinWaitP50: 8.4,
    joinWaitP95: 11.2,
    waiting5m: 7,
    waiting10m: 2,
    serviceRate: 1.3,
    capacityDeficit: 0.7,
    breachInMin: 10,
    recoveryMin: 12,
    status: "warning",
    x: 78,
    y: 52,
  },
  {
    id: "C03",
    airline: "AB",
    zone: "A",
    row: "Row 1",
    queueLen: 6,
    joinWaitP50: 2.8,
    joinWaitP95: 3.9,
    waiting5m: 0,
    waiting10m: 0,
    serviceRate: 1.9,
    capacityDeficit: -0.2,
    breachInMin: null,
    recoveryMin: null,
    status: "underutilized",
    x: 18,
    y: 28,
  },
  {
    id: "C18",
    airline: "AB",
    zone: "C",
    row: "Row 2",
    queueLen: 9,
    joinWaitP50: 4.6,
    joinWaitP95: 6.0,
    waiting5m: 2,
    waiting10m: 0,
    serviceRate: 1.6,
    capacityDeficit: 0.1,
    breachInMin: 24,
    recoveryMin: 5,
    status: "busy",
    x: 48,
    y: 72,
  },
  {
    id: "C07",
    airline: "CD",
    zone: "A",
    row: "Row 1",
    queueLen: 12,
    joinWaitP50: 5.4,
    joinWaitP95: 7.1,
    waiting5m: 4,
    waiting10m: 0,
    serviceRate: 1.5,
    capacityDeficit: 0.2,
    breachInMin: 16,
    recoveryMin: 8,
    status: "busy",
    x: 34,
    y: 30,
  },
  {
    id: "C21",
    airline: "CD",
    zone: "C",
    row: "Row 2",
    queueLen: 15,
    joinWaitP50: 6.9,
    joinWaitP95: 9.1,
    waiting5m: 5,
    waiting10m: 1,
    serviceRate: 1.4,
    capacityDeficit: 0.4,
    breachInMin: 13,
    recoveryMin: 9,
    status: "warning",
    x: 28,
    y: 68,
  },
];

export const FLIGHTS_BY_URGENCY: FlightUrgency[] = [
  {
    flight: "VJ123",
    airline: "VJ",
    std: "15:05",
    aveWaitMin: 11.4,
    queue: 28,
    breachInMin: 7,
    recoveryMin: 18,
    status: "critical",
    counterGroup: "Row 3 · C12–C14",
    paxRemaining: 186,
    closureInMin: 19,
  },
  {
    flight: "VJ145",
    airline: "VJ",
    std: "15:25",
    aveWaitMin: 6.8,
    queue: 14,
    breachInMin: 12,
    recoveryMin: 9,
    status: "warning",
    counterGroup: "Row 1 · C07",
    paxRemaining: 94,
    closureInMin: 38,
  },
  {
    flight: "VJ167",
    airline: "VJ",
    std: "15:40",
    aveWaitMin: 4.1,
    queue: 11,
    breachInMin: 22,
    recoveryMin: 6,
    status: "busy",
    counterGroup: "Row 2 · C21",
    paxRemaining: 120,
    closureInMin: 52,
  },
  {
    flight: "VJ189",
    airline: "VJ",
    std: "16:10",
    aveWaitMin: 2.6,
    queue: 5,
    breachInMin: null,
    recoveryMin: null,
    status: "stable",
    counterGroup: "Row 1 · C03",
    paxRemaining: 71,
    closureInMin: 78,
  },
  {
    flight: "KQ123",
    airline: "KQ",
    std: "08:10",
    aveWaitMin: 13.1,
    queue: 34,
    breachInMin: 5,
    recoveryMin: 22,
    status: "critical",
    counterGroup: "Row 3 · C12–C14",
    paxRemaining: 132,
    closureInMin: 39,
  },
  {
    flight: "KQ145",
    airline: "KQ",
    std: "08:40",
    aveWaitMin: 7.2,
    queue: 16,
    breachInMin: 11,
    recoveryMin: 10,
    status: "warning",
    counterGroup: "Row 1 · C07",
    paxRemaining: 88,
    closureInMin: 54,
  },
  {
    flight: "KQ167",
    airline: "KQ",
    std: "09:15",
    aveWaitMin: 4.1,
    queue: 10,
    breachInMin: null,
    recoveryMin: null,
    status: "stable",
    counterGroup: "Row 1 · C03",
    paxRemaining: 64,
    closureInMin: 72,
  },
  {
    flight: "KQ201",
    airline: "KQ",
    std: "09:45",
    aveWaitMin: 3.2,
    queue: 7,
    breachInMin: null,
    recoveryMin: null,
    status: "stable",
    counterGroup: "Row 3 · C14",
    paxRemaining: 51,
    closureInMin: 90,
  },
  {
    flight: "AB110",
    airline: "AB",
    std: "12:20",
    aveWaitMin: 4.6,
    queue: 9,
    breachInMin: 24,
    recoveryMin: 5,
    status: "busy",
    counterGroup: "Row 2 · C18",
    paxRemaining: 58,
    closureInMin: 45,
  },
  {
    flight: "AB122",
    airline: "AB",
    std: "13:05",
    aveWaitMin: 2.8,
    queue: 6,
    breachInMin: null,
    recoveryMin: null,
    status: "underutilized",
    counterGroup: "Row 1 · C03",
    paxRemaining: 41,
    closureInMin: 68,
  },
  {
    flight: "CD240",
    airline: "CD",
    std: "11:30",
    aveWaitMin: 6.9,
    queue: 15,
    breachInMin: 13,
    recoveryMin: 9,
    status: "warning",
    counterGroup: "Row 2 · C21",
    paxRemaining: 77,
    closureInMin: 41,
  },
  {
    flight: "CD255",
    airline: "CD",
    std: "12:00",
    aveWaitMin: 5.4,
    queue: 12,
    breachInMin: 16,
    recoveryMin: 8,
    status: "busy",
    counterGroup: "Row 1 · C07",
    paxRemaining: 63,
    closureInMin: 55,
  },
];

export const SUGGESTED_ACTIONS: SuggestedAction[] = [
  {
    id: "a1",
    airline: "VJ",
    text: "Open +1 counter at Row 3 (C15) for VJ123 — breach in 7 min.",
    severity: "critical",
    counterId: "C15",
  },
  {
    id: "a2",
    airline: "VJ",
    text: "Pull 1 agent from C18 (underutilised) to support C12.",
    severity: "warn",
    counterId: "C12",
  },
  {
    id: "a3",
    airline: "VJ",
    text: "Pre-open C09 at 14:50 for VJ145 morning backlog risk.",
    severity: "info",
    counterId: "C09",
  },
  {
    id: "a4",
    airline: "KQ",
    text: "Open +1 counter at Row 3 (KQ bank) immediately for KQ123.",
    severity: "critical",
    counterId: "C12",
  },
  {
    id: "a5",
    airline: "KQ",
    text: "Pull 1 staff from KQ145 (stable lane) to KQ123.",
    severity: "warn",
    counterId: "C07",
  },
  {
    id: "a6",
    airline: "KQ",
    text: "Announce bag-drop only for prepared passengers on KQ123.",
    severity: "info",
  },
  {
    id: "a7",
    airline: "AB",
    text: "Monitor AB110 at C18 — wait climbing toward SLA edge.",
    severity: "warn",
    counterId: "C18",
  },
  {
    id: "a8",
    airline: "AB",
    text: "Keep C03 underutilised bank ready as AB surge buffer.",
    severity: "info",
    counterId: "C03",
  },
  {
    id: "a9",
    airline: "CD",
    text: "Add flex agent to C21 for CD240 — warning wait 6.9 min.",
    severity: "warn",
    counterId: "C21",
  },
  {
    id: "a10",
    airline: "CD",
    text: "Stagger CD255 bag acceptance to protect C07 throughput.",
    severity: "info",
    counterId: "C07",
  },
];

const STATUS_RANK: Record<FlightUrgency["status"], number> = {
  critical: 0,
  warning: 1,
  busy: 2,
  stable: 3,
  underutilized: 4,
};

function sortFlightsByUrgency(rows: FlightUrgency[]) {
  return [...rows].sort((a, b) => {
    const statusDiff = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (statusDiff !== 0) return statusDiff;
    return b.aveWaitMin - a.aveWaitMin;
  });
}

/** Live Waiting Time snapshot — airline filter drives every section. */
export function getLiveView(airline: string): LiveViewSnapshot {
  const flights =
    airline === "all"
      ? sortFlightsByUrgency(FLIGHTS_BY_URGENCY)
      : sortFlightsByUrgency(FLIGHTS_BY_URGENCY.filter((f) => f.airline === airline));

  const counters =
    airline === "all"
      ? // Prefer first airline occupancy per desk when showing all
        LIVE_COUNTERS.filter((c, i, arr) => arr.findIndex((x) => x.id === c.id) === i)
      : LIVE_COUNTERS.filter((c) => c.airline === airline);

  const focusFlight = flights[0] ?? null;
  const focusCounterIds = focusFlight
    ? counters
        .filter((c) => focusFlight.counterGroup.includes(c.id))
        .map((c) => c.id)
    : [];
  const focusCounters =
    focusCounterIds.length > 0
      ? counters.filter((c) => focusCounterIds.includes(c.id))
      : counters.slice(0, 1);

  const joinWaitMin = focusCounters.length
    ? Math.round(
        focusCounters.reduce((s, c) => s + c.joinWaitP50, 0) / focusCounters.length,
      )
    : 0;
  const breachInMin =
    focusFlight?.breachInMin ??
    focusCounters.find((c) => c.breachInMin != null)?.breachInMin ??
    0;
  const queueStabilityIndex = Math.max(
    40,
    Math.min(98, Math.round(100 - joinWaitMin * 1.4)),
  );
  const zone =
    focusCounters[0] != null
      ? `Zone ${focusCounters[0].zone} · ${focusCounters[0].id}`
      : "No active zone";

  const actions =
    airline === "all"
      ? SUGGESTED_ACTIONS.filter((a) =>
          flights.some((f) => f.airline === a.airline),
        ).slice(0, 3)
      : SUGGESTED_ACTIONS.filter((a) => a.airline === airline);

  return {
    airline,
    kpis: {
      activeFlights: flights.length,
      criticalFlights: flights.filter((f) => f.status === "critical").length,
      nextClosureMin: focusFlight?.closureInMin ?? 0,
      waiting5m: counters.reduce((s, c) => s + c.waiting5m, 0),
      waiting10m: counters.reduce((s, c) => s + c.waiting10m, 0),
    },
    flights,
    counters,
    focusFlight,
    risk:
      focusFlight == null
        ? null
        : {
            joinWaitMin,
            breachInMin: breachInMin ?? 0,
            queueStabilityIndex,
            zone,
          },
    actions,
  };
}

/** @deprecated Prefer getLiveView(airline).kpis */
export const LIVE_KPIS = getLiveView("VJ").kpis;
/** @deprecated Prefer getLiveView(airline).focusFlight */
export const FOCUS_FLIGHT = FLIGHTS_BY_URGENCY[0]!;
/** @deprecated Prefer getLiveView(airline).risk */
export const LIVE_RISK = {
  joinWaitMin: 17,
  breachInMin: 7,
  queueStabilityIndex: 78,
  zone: "Zone B · C12",
} as const;

export const HALL_KPIS = {
  slaToday: 91.4,
  breachesToday: 5,
  airlinesAffectedAsGroups: 3,
} as const;

/** Hourly SLA 10:00–21:00 (reference shape, Vietjet hall). */
export const HALL_SLA_SERIES: SlaPoint[] = [
  { time: "10:00", sla: 96, target: 90 },
  { time: "11:00", sla: 95, target: 90 },
  { time: "12:00", sla: 93, target: 90 },
  { time: "13:00", sla: 91, target: 90 },
  { time: "14:00", sla: 88, target: 90 },
  { time: "15:00", sla: 87, target: 90 },
  { time: "16:00", sla: 89, target: 90 },
  { time: "17:00", sla: 91, target: 90 },
  { time: "18:00", sla: 93, target: 90 },
  { time: "19:00", sla: 94, target: 90 },
  { time: "20:00", sla: 95, target: 90 },
  { time: "21:00", sla: 96, target: 90 },
];

/** Counter overview — exact FootfallCam reference rows (Airline / metrics / status). */
export const HALL_COUNTERS: HallCounter[] = [
  {
    id: "C12",
    bank: "KQ",
    island: "Island B",
    row: "Row 3",
    queue: 41,
    waitMin: 19,
    utilisation: 94,
    status: "breaching",
    waiting5m: 22,
    waiting10m: 11,
  },
  {
    id: "C13",
    bank: "KQ",
    island: "Island B",
    row: "Row 3",
    queue: 35,
    waitMin: 16,
    utilisation: 89,
    status: "at_risk",
    waiting5m: 18,
    waiting10m: 7,
  },
  {
    id: "B05",
    bank: "CD",
    island: "Island A",
    row: "Row 2",
    queue: 24,
    waitMin: 11,
    utilisation: 78,
    status: "busy",
    waiting5m: 9,
    waiting10m: 2,
  },
  {
    id: "B06",
    bank: "CD",
    island: "Island A",
    row: "Row 2",
    queue: 9,
    waitMin: 5,
    utilisation: 52,
    status: "stable",
    waiting5m: 1,
    waiting10m: 0,
  },
  {
    id: "C21",
    bank: "UX",
    island: "Island C",
    row: "Row 1",
    queue: 17,
    waitMin: 9,
    utilisation: 73,
    status: "busy",
    waiting5m: 6,
    waiting10m: 1,
  },
  {
    id: "A01",
    bank: "AB",
    island: "Island C",
    row: "Row 1",
    queue: 6,
    waitMin: 3,
    utilisation: 38,
    status: "underused",
    waiting5m: 0,
    waiting10m: 0,
  },
];

export const BREACH_ATTRIBUTION: BreachAttribution[] = [
  { group: "KQ", count: 1, worstEpisode: "22 mins" },
  { group: "CD", count: 1, worstEpisode: "14 mins" },
  { group: "UX", count: 2, worstEpisode: "9 mins" },
];

export const HALL_ALERT_TILES: HallAlertTile[] = [
  {
    tone: "critical",
    title: "Overloaded Row",
    value: "Row 3",
    detail: "Load 92% · 2 counters breaching",
  },
  {
    tone: "ok",
    title: "Underutilized Capacity",
    value: "Row 1",
    detail: "Load 38% · Can offer support",
  },
  {
    tone: "warn",
    title: "Peak Window Forecast",
    value: "Next 18 min",
    detail: "Expected surge for VJ123 & VJ145",
  },
];

export const TERMINAL_FILTER_OPTIONS = [
  { value: "t1", label: "Terminal 1" },
  { value: "t2", label: "Terminal 2" },
  { value: "t3", label: "Terminal 3" },
] as const;

const HALL_T2_SLA: SlaPoint[] = [
  { time: "10:00", sla: 94, target: 90 },
  { time: "11:00", sla: 93, target: 90 },
  { time: "12:00", sla: 91, target: 90 },
  { time: "13:00", sla: 89, target: 90 },
  { time: "14:00", sla: 86, target: 90 },
  { time: "15:00", sla: 84, target: 90 },
  { time: "16:00", sla: 87, target: 90 },
  { time: "17:00", sla: 90, target: 90 },
  { time: "18:00", sla: 92, target: 90 },
  { time: "19:00", sla: 93, target: 90 },
  { time: "20:00", sla: 94, target: 90 },
  { time: "21:00", sla: 95, target: 90 },
];

const HALL_T3_SLA: SlaPoint[] = [
  { time: "10:00", sla: 98, target: 90 },
  { time: "11:00", sla: 97, target: 90 },
  { time: "12:00", sla: 96, target: 90 },
  { time: "13:00", sla: 95, target: 90 },
  { time: "14:00", sla: 93, target: 90 },
  { time: "15:00", sla: 92, target: 90 },
  { time: "16:00", sla: 94, target: 90 },
  { time: "17:00", sla: 95, target: 90 },
  { time: "18:00", sla: 96, target: 90 },
  { time: "19:00", sla: 97, target: 90 },
  { time: "20:00", sla: 97, target: 90 },
  { time: "21:00", sla: 98, target: 90 },
];

/** Static Hall Performance snapshots per terminal (demo filter). */
export const HALL_BY_TERMINAL: Record<TerminalId, HallTerminalSnapshot> = {
  t1: {
    kpis: { ...HALL_KPIS },
    slaSeries: HALL_SLA_SERIES,
    counters: HALL_COUNTERS,
    breaches: BREACH_ATTRIBUTION,
    alertTiles: HALL_ALERT_TILES,
  },
  t2: {
    kpis: {
      slaToday: 88.2,
      breachesToday: 8,
      airlinesAffectedAsGroups: 4,
    },
    slaSeries: HALL_T2_SLA,
    counters: [
      {
        id: "D08",
        bank: "VJ",
        island: "Island D",
        row: "Row 4",
        queue: 48,
        waitMin: 22,
        utilisation: 96,
        status: "breaching",
        waiting5m: 28,
        waiting10m: 14,
      },
      {
        id: "D09",
        bank: "VJ",
        island: "Island D",
        row: "Row 4",
        queue: 39,
        waitMin: 18,
        utilisation: 91,
        status: "at_risk",
        waiting5m: 20,
        waiting10m: 9,
      },
      {
        id: "E02",
        bank: "QH",
        island: "Island E",
        row: "Row 2",
        queue: 28,
        waitMin: 13,
        utilisation: 81,
        status: "busy",
        waiting5m: 11,
        waiting10m: 3,
      },
      {
        id: "E03",
        bank: "QH",
        island: "Island E",
        row: "Row 2",
        queue: 12,
        waitMin: 6,
        utilisation: 55,
        status: "stable",
        waiting5m: 2,
        waiting10m: 0,
      },
      {
        id: "F11",
        bank: "BL",
        island: "Island F",
        row: "Row 1",
        queue: 21,
        waitMin: 10,
        utilisation: 74,
        status: "busy",
        waiting5m: 7,
        waiting10m: 2,
      },
      {
        id: "F12",
        bank: "BL",
        island: "Island F",
        row: "Row 1",
        queue: 4,
        waitMin: 2,
        utilisation: 31,
        status: "underused",
        waiting5m: 0,
        waiting10m: 0,
      },
    ],
    breaches: [
      { group: "VJ", count: 3, worstEpisode: "26 mins" },
      { group: "QH", count: 2, worstEpisode: "16 mins" },
      { group: "BL", count: 1, worstEpisode: "11 mins" },
    ],
    alertTiles: [
      {
        tone: "critical",
        title: "Overloaded Row",
        value: "Row 4",
        detail: "Load 96% · 2 counters breaching",
      },
      {
        tone: "ok",
        title: "Underutilized Capacity",
        value: "Row 1",
        detail: "Load 31% · Can offer support",
      },
      {
        tone: "warn",
        title: "Peak Window Forecast",
        value: "Next 12 min",
        detail: "Expected surge for VJ201 & QH88",
      },
    ],
  },
  t3: {
    kpis: {
      slaToday: 95.6,
      breachesToday: 2,
      airlinesAffectedAsGroups: 1,
    },
    slaSeries: HALL_T3_SLA,
    counters: [
      {
        id: "G01",
        bank: "VN",
        island: "Island G",
        row: "Row 2",
        queue: 18,
        waitMin: 8,
        utilisation: 68,
        status: "busy",
        waiting5m: 4,
        waiting10m: 0,
      },
      {
        id: "G02",
        bank: "VN",
        island: "Island G",
        row: "Row 2",
        queue: 11,
        waitMin: 5,
        utilisation: 49,
        status: "stable",
        waiting5m: 1,
        waiting10m: 0,
      },
      {
        id: "H04",
        bank: "AK",
        island: "Island H",
        row: "Row 3",
        queue: 32,
        waitMin: 15,
        utilisation: 88,
        status: "at_risk",
        waiting5m: 14,
        waiting10m: 6,
      },
      {
        id: "H05",
        bank: "AK",
        island: "Island H",
        row: "Row 3",
        queue: 27,
        waitMin: 12,
        utilisation: 82,
        status: "busy",
        waiting5m: 8,
        waiting10m: 3,
      },
      {
        id: "J07",
        bank: "SQ",
        island: "Island J",
        row: "Row 1",
        queue: 7,
        waitMin: 3,
        utilisation: 36,
        status: "underused",
        waiting5m: 0,
        waiting10m: 0,
      },
      {
        id: "J08",
        bank: "SQ",
        island: "Island J",
        row: "Row 1",
        queue: 5,
        waitMin: 2,
        utilisation: 28,
        status: "underused",
        waiting5m: 0,
        waiting10m: 0,
      },
    ],
    breaches: [
      { group: "AK", count: 2, worstEpisode: "15 mins" },
    ],
    alertTiles: [
      {
        tone: "warn",
        title: "At-Risk Row",
        value: "Row 3",
        detail: "Load 85% · Watch AK counters",
      },
      {
        tone: "ok",
        title: "Underutilized Capacity",
        value: "Row 1",
        detail: "Load 32% · Can offer support",
      },
      {
        tone: "ok",
        title: "Peak Window Forecast",
        value: "Quiet next 25 min",
        detail: "No surge expected for T3 banks",
      },
    ],
  },
};

export const DEMAND_VS_CAPACITY = [
  { label: "Now", demand: 72, capacity: 64 },
  { label: "+15m", demand: 88, capacity: 64 },
  { label: "+30m", demand: 61, capacity: 72 },
  { label: "+45m", demand: 44, capacity: 72 },
] as const;

export const REVIEW_KPIS: ReviewKpis = {
  slaCompliance: 91.4,
  flightsAnalysed: 286,
  airlinesCount: 37,
  paxCheckedIn: 9420,
  breachEpisodes: 14,
  structuralBreaches: 6,
  adHocBreaches: 8,
  paxImpacted: 1984,
  paxImpactedPct: 21.2,
  prevSlaCompliance: 89.1,
  dateRangeLabel: "01 March 2025 – 07 March 2025",
};

export const REVIEW_SUMMARY =
  "Overall SLA compliance finished at 91.4% for the week, above the 90% target. Pressure concentrated on Monday and Friday mornings (06–12). Ad-hoc breaches were driven by baggage-system slowdowns and rail disruption feeding late arrivals into check-in. Structural under-open on Island B remains the largest controllable gap.";

export const REVIEW_AIRLINE_FILTER_OPTIONS = [
  { value: "all", label: "All Airlines" },
  { value: "AB", label: "AB" },
  { value: "CD", label: "CD" },
  { value: "EF", label: "EF" },
  { value: "GH", label: "GH" },
  { value: "KQ", label: "KQ" },
  { value: "LD", label: "LD" },
  { value: "YZ", label: "YZ" },
] as const;

export const REVIEW_SCOPE_FILTER_OPTIONS = [
  { value: "all-outbound", label: "All outbound check-in counters" },
  { value: "hall-performance", label: "Hall performance" },
  { value: "t1", label: "Terminal 1" },
  { value: "t2", label: "Terminal 2" },
  { value: "t3", label: "Terminal 3" },
] as const;

/** Weekly pressure profile — rows = time bands, cols = Mon–Sun (FootfallCam reference). */
export const PRESSURE_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const PRESSURE_BANDS = ["06–09", "09–12", "12–15", "15–18"] as const;

export const PRESSURE_PROFILE: PressureCell[][] = [
  // 06–09
  ["medium", "medium", "high", "medium", "high", "medium", "medium"],
  // 09–12
  ["high", "medium", "high", "high", "high", "medium", "medium"],
  // 12–15
  ["low", "low", "medium", "low", "medium", "low", "low"],
  // 15–18
  ["low", "low", "low", "low", "medium", "low", "low"],
];

/** Pattern view — median join wait (mins) by day × hour slot. */
export const PATTERN_HOURS = [
  "06–07",
  "07–08",
  "08–09",
  "09–10",
  "10–11",
  "11–12",
  "12–13",
  "13–14",
  "14–15",
  "15–16",
  "16–17",
  "17–18",
] as const;

/** 7 days × 12 hours — shaped like the FootfallCam pattern heatmap. */
export const PATTERN_WAIT_MATRIX: number[][] = [
  // Mon
  [8.2, 11.6, 10.4, 9.1, 7.4, 5.8, 4.3, 4.0, 3.8, 4.1, 4.6, 5.2],
  // Tue
  [7.1, 9.4, 8.8, 7.6, 6.2, 5.1, 4.2, 3.9, 3.7, 3.9, 4.3, 4.8],
  // Wed
  [7.8, 10.2, 9.6, 8.4, 6.8, 5.5, 4.5, 4.1, 3.9, 4.0, 4.5, 5.0],
  // Thu
  [7.4, 9.8, 9.0, 8.0, 6.5, 5.3, 4.4, 4.0, 3.8, 4.0, 4.4, 4.9],
  // Fri
  [8.6, 12.1, 11.2, 9.8, 7.9, 6.1, 4.8, 4.3, 4.0, 4.2, 4.9, 5.6],
  // Sat
  [6.4, 8.2, 7.5, 6.8, 5.6, 4.8, 4.1, 3.8, 3.6, 3.7, 4.0, 4.4],
  // Sun
  [5.9, 7.4, 6.9, 6.2, 5.2, 4.5, 3.9, 3.6, 3.5, 3.6, 3.9, 4.2],
];

export const LEAGUE_TABLE: LeagueRow[] = [
  { group: "AB", slaPct: 97.3, flights: 24, breaches: 0, medianJoinWait: "4m12s" },
  { group: "CD", slaPct: 95.1, flights: 19, breaches: 1, medianJoinWait: "4m48s" },
  { group: "EF", slaPct: 93.8, flights: 21, breaches: 1, medianJoinWait: "5m12s" },
  { group: "GH", slaPct: 91.2, flights: 22, breaches: 2, medianJoinWait: "5m44s" },
  { group: "KQ", slaPct: 88.7, flights: 28, breaches: 4, medianJoinWait: "7m36s" },
  {
    group: "LD",
    slaPct: 82.4,
    flights: 18,
    breaches: 3,
    medianJoinWait: "9m12s",
    highlight: true,
  },
  {
    group: "YZ",
    slaPct: 79.1,
    flights: 15,
    breaches: 4,
    medianJoinWait: "10m28s",
    highlight: true,
  },
];

export const ROOT_CAUSES: RootCause[] = [
  {
    title: "Structural under-open on Island B Friday AM",
    detail: "Roster opens 2 counters late vs demand curve — majority of structural breaches.",
    category: "structural",
  },
  {
    title: "Ad-hoc surge after baggage / rail disruption",
    detail: "System slowdowns and late rail arrivals pushed simultaneous banks into breach.",
    category: "ad-hoc",
  },
  {
    title: "Shared-bag drop friction at C12–C14",
    detail: "Service rate drop correlated with bag-drop congestion spikes on peak mornings.",
    category: "structural",
  },
];

type ReviewScopeId =
  | "all-outbound"
  | "hall-performance"
  | "t1"
  | "t2"
  | "t3";

function clonePressure(src: PressureCell[][]): PressureCell[][] {
  return src.map((row) => [...row]);
}

function scalePattern(src: number[][], factor: number): number[][] {
  return src.map((row) =>
    row.map((v) => Number(Math.max(2.5, Math.min(14, v * factor)).toFixed(1))),
  );
}

function bumpPressure(src: PressureCell[][], toward: "worse" | "better"): PressureCell[][] {
  const rank: PressureCell[] = ["low", "medium", "high"];
  return src.map((row) =>
    row.map((cell) => {
      const i = rank.indexOf(cell);
      if (toward === "worse") return rank[Math.min(2, i + 1)]!;
      return rank[Math.max(0, i - 1)]!;
    }),
  );
}

function scaleLeague(rows: LeagueRow[], factor: number): LeagueRow[] {
  return rows.map((r) => ({
    ...r,
    slaPct: Number(Math.max(70, Math.min(99.5, r.slaPct * factor)).toFixed(1)),
    flights: Math.max(1, Math.round(r.flights * factor)),
    breaches: Math.max(0, Math.round(r.breaches * (2 - factor))),
    highlight: r.slaPct * factor < 85,
  }));
}

type ReviewScopeBase = {
  kpis: ReviewKpis;
  pressure: PressureCell[][];
  pattern: number[][];
  league: LeagueRow[];
  rootCauses: RootCause[];
  summaryFocus: string;
};

const REVIEW_SCOPE_BASE: Record<ReviewScopeId, ReviewScopeBase> = {
  "all-outbound": {
    kpis: REVIEW_KPIS,
    pressure: PRESSURE_PROFILE,
    pattern: PATTERN_WAIT_MATRIX,
    league: LEAGUE_TABLE,
    rootCauses: ROOT_CAUSES,
    summaryFocus:
      "Pressure concentrated on Monday and Friday mornings (06–12). Ad-hoc breaches were driven by baggage-system slowdowns and rail disruption feeding late arrivals into check-in. Structural under-open on Island B remains the largest controllable gap.",
  },
  "hall-performance": {
    kpis: {
      ...REVIEW_KPIS,
      slaCompliance: 90.1,
      flightsAnalysed: 214,
      airlinesCount: 22,
      paxCheckedIn: 6840,
      breachEpisodes: 11,
      structuralBreaches: 5,
      adHocBreaches: 6,
      paxImpacted: 1420,
      paxImpactedPct: 20.8,
    },
    pressure: bumpPressure(PRESSURE_PROFILE, "worse"),
    pattern: scalePattern(PATTERN_WAIT_MATRIX, 1.08),
    league: scaleLeague(LEAGUE_TABLE, 0.98),
    rootCauses: [
      ROOT_CAUSES[0]!,
      {
        title: "Hall peak mismatch vs roster open",
        detail: "Hall performance window shows counters opening after join-wait already exceeds target.",
        category: "structural",
      },
      ROOT_CAUSES[2]!,
    ],
    summaryFocus:
      "Hall performance scope shows morning peaks driving most of the deficit. Counter-group Island B remains the main SLA drag; bag-drop friction still correlates with service-rate drops.",
  },
  t1: {
    kpis: {
      ...REVIEW_KPIS,
      slaCompliance: 91.4,
      flightsAnalysed: 148,
      airlinesCount: 18,
      paxCheckedIn: 5120,
      breachEpisodes: 7,
      structuralBreaches: 3,
      adHocBreaches: 4,
      paxImpacted: 980,
      paxImpactedPct: 19.1,
    },
    pressure: PRESSURE_PROFILE,
    pattern: PATTERN_WAIT_MATRIX,
    league: LEAGUE_TABLE.filter((r) => ["AB", "CD", "EF", "KQ"].includes(r.group)),
    rootCauses: [ROOT_CAUSES[0]!, ROOT_CAUSES[2]!],
    summaryFocus:
      "Terminal 1 held above target overall, with Friday AM still the hottest band. Island B under-open and C12–C14 bag-drop friction explain most controllable breaches.",
  },
  t2: {
    kpis: {
      ...REVIEW_KPIS,
      slaCompliance: 87.6,
      flightsAnalysed: 96,
      airlinesCount: 12,
      paxCheckedIn: 2980,
      breachEpisodes: 9,
      structuralBreaches: 4,
      adHocBreaches: 5,
      paxImpacted: 1120,
      paxImpactedPct: 37.6,
      prevSlaCompliance: 86.2,
    },
    pressure: bumpPressure(PRESSURE_PROFILE, "worse"),
    pattern: scalePattern(PATTERN_WAIT_MATRIX, 1.18),
    league: scaleLeague(
      LEAGUE_TABLE.filter((r) => ["GH", "KQ", "LD", "YZ"].includes(r.group)),
      0.96,
    ),
    rootCauses: [
      {
        title: "Terminal 2 Row 4 overload on Mon/Fri",
        detail: "Demand curve exceeds rostered opens for 90+ minutes in the AM peak.",
        category: "structural",
      },
      ROOT_CAUSES[1]!,
      {
        title: "Late bank overlap on Island D",
        detail: "Two irregular banks stacked into the same counter group within 20 minutes.",
        category: "ad-hoc",
      },
    ],
    summaryFocus:
      "Terminal 2 finished below the 90% target. Monday and Friday mornings are consistently high-pressure; LD and YZ drive most breach episodes and passenger impact.",
  },
  t3: {
    kpis: {
      ...REVIEW_KPIS,
      slaCompliance: 94.8,
      flightsAnalysed: 72,
      airlinesCount: 9,
      paxCheckedIn: 1840,
      breachEpisodes: 3,
      structuralBreaches: 1,
      adHocBreaches: 2,
      paxImpacted: 240,
      paxImpactedPct: 13.0,
      prevSlaCompliance: 93.5,
    },
    pressure: bumpPressure(PRESSURE_PROFILE, "better"),
    pattern: scalePattern(PATTERN_WAIT_MATRIX, 0.86),
    league: scaleLeague(
      LEAGUE_TABLE.filter((r) => ["AB", "CD", "EF", "GH"].includes(r.group)),
      1.02,
    ),
    rootCauses: [
      {
        title: "Minor ad-hoc spike after inbound delay",
        detail: "One delayed bank briefly pushed join-wait above target on Wednesday AM.",
        category: "ad-hoc",
      },
      {
        title: "Early-open discipline holding",
        detail: "Structural roster alignment kept T3 above target for 6 of 7 days.",
        category: "structural",
      },
    ],
    summaryFocus:
      "Terminal 3 remained comfortably above target with mostly low/medium pressure. Residual breaches are small and mostly ad-hoc from inbound irregularity.",
  },
};

const AIRLINE_WAIT_FACTOR: Record<string, number> = {
  AB: 0.82,
  CD: 0.88,
  EF: 0.92,
  GH: 0.98,
  KQ: 1.12,
  LD: 1.22,
  YZ: 1.3,
};

function buildReviewSummary(
  kpis: ReviewKpis,
  airline: string,
  scopeLabel: string,
  focus: string,
  league: LeagueRow[],
): string {
  const vsTarget =
    kpis.slaCompliance >= 90
      ? `above the ${CHECK_IN_META.slaTargetPct}% target`
      : `below the ${CHECK_IN_META.slaTargetPct}% target`;

  if (airline !== "all") {
    const row = league[0];
    const wait = row?.medianJoinWait ?? "n/a";
    return `Airline ${airline} finished at ${kpis.slaCompliance}% SLA (${vsTarget}) under ${scopeLabel}. ${kpis.flightsAnalysed} flights analysed · ${kpis.breachEpisodes} breach episodes · median join wait ${wait}. ${kpis.paxImpacted.toLocaleString()} pax impacted (${kpis.paxImpactedPct}%). ${focus}`;
  }

  return `Overall SLA compliance finished at ${kpis.slaCompliance}% for the week, ${vsTarget} (${scopeLabel}). ${kpis.flightsAnalysed} flights across ${kpis.airlinesCount} airlines · ${kpis.paxCheckedIn.toLocaleString()} pax checked in · ${kpis.breachEpisodes} breach episodes (${kpis.structuralBreaches} structural · ${kpis.adHocBreaches} ad-hoc) · ${kpis.paxImpacted.toLocaleString()} pax impacted (${kpis.paxImpactedPct}%). ${focus}`;
}

function kpisFromLeagueRow(base: ReviewKpis, row: LeagueRow): ReviewKpis {
  const structural = Math.round(row.breaches * 0.4);
  const adHoc = Math.max(0, row.breaches - structural);
  const flightShare = row.flights / Math.max(1, base.flightsAnalysed);
  return {
    ...base,
    slaCompliance: row.slaPct,
    flightsAnalysed: row.flights,
    airlinesCount: 1,
    paxCheckedIn: Math.max(40, Math.round(base.paxCheckedIn * flightShare)),
    breachEpisodes: row.breaches,
    structuralBreaches: structural,
    adHocBreaches: adHoc,
    paxImpacted:
      row.breaches === 0
        ? 0
        : Math.max(
            20,
            Math.round(base.paxImpacted * (row.breaches / Math.max(1, base.breachEpisodes))),
          ),
    paxImpactedPct:
      row.breaches === 0
        ? 0
        : Number(
            (
              (base.paxImpactedPct * row.breaches) /
              Math.max(1, base.breachEpisodes)
            ).toFixed(1),
          ),
  };
}

/** Live Management Review snapshot for airline + scope dropdown filters. */
export function getReviewSnapshot(airline: string, scope: string): ReviewSnapshot {
  const scopeId = (Object.prototype.hasOwnProperty.call(REVIEW_SCOPE_BASE, scope)
    ? scope
    : "all-outbound") as ReviewScopeId;
  const base = REVIEW_SCOPE_BASE[scopeId];
  const scopeLabel =
    REVIEW_SCOPE_FILTER_OPTIONS.find((o) => o.value === scopeId)?.label ?? scopeId;

  let league = base.league.map((r) => ({ ...r }));
  if (airline !== "all") {
    league = league.filter((r) => r.group === airline);
  }

  const kpis =
    airline !== "all" && league[0]
      ? kpisFromLeagueRow(base.kpis, league[0])
      : { ...base.kpis };

  const waitFactor = airline === "all" ? 1 : (AIRLINE_WAIT_FACTOR[airline] ?? 1);
  const pattern = scalePattern(base.pattern, waitFactor);
  const pressure =
    airline === "all"
      ? clonePressure(base.pressure)
      : bumpPressure(
          base.pressure,
          (AIRLINE_WAIT_FACTOR[airline] ?? 1) >= 1.1 ? "worse" : "better",
        );

  const rootCauses =
    airline === "all"
      ? base.rootCauses
      : base.rootCauses.filter((r, i) => {
          if (airline === "YZ" || airline === "LD") return true;
          if (airline === "KQ") return i !== 2;
          return i === 0 || r.category === "ad-hoc";
        }).slice(0, Math.max(1, airline === "AB" ? 1 : 2));

  return {
    kpis,
    summary: buildReviewSummary(kpis, airline, scopeLabel, base.summaryFocus, league),
    pressure,
    pattern,
    league,
    rootCauses:
      rootCauses.length > 0
        ? rootCauses
        : [
            {
              title: `${airline} performance note`,
              detail: `No major structural findings for ${airline} in this scope; monitor median join wait ${league[0]?.medianJoinWait ?? "n/a"}.`,
              category: "ad-hoc",
            },
          ],
  };
}

export const WEEKLY_AIRLINE_FILTER_OPTIONS = [
  { value: "all", label: "All Airlines" },
  { value: "KQ", label: "KQ - Kenya Airways" },
  { value: "VJ", label: "VJ - Vietjet Air" },
  { value: "AB", label: "AB" },
  { value: "CD", label: "CD" },
] as const;

/** Top table — extra episode detail (FootfallCam weekly report). */
export const WEEKLY_EPISODES: WeeklyEpisodeRow[] = [
  {
    id: "e1",
    airline: "KQ",
    window: "07:20–08:05",
    event: "KQ123 / KQ127 Morning Wave",
    peakWait: "22.4 / 17.8 min",
    paxAffected: 182,
    impact: "Early under-open vs demand curve; both scenarios cut breach impact 38–49%.",
  },
  {
    id: "e2",
    airline: "KQ",
    window: "12:25–13:00",
    event: "KQ Midday Bank",
    peakWait: "13.4 / 8.9 min",
    paxAffected: 118,
    impact: "Processing variance due to staff rotation during lunch handover.",
  },
  {
    id: "e3",
    airline: "KQ",
    window: "19:10–19:45",
    event: "KQ341 Late Evening",
    peakWait: "18.6 / 14.2 min",
    paxAffected: 146,
    impact: "Staffing variance from late rotation reduced service rate below recovery.",
  },
  {
    id: "e4",
    airline: "KQ",
    window: "16:05–16:50",
    event: "Weekly Friday Surge",
    peakWait: "19.8 / 13.2 min",
    paxAffected: 158,
    impact: "Structural demand spike + insufficient early counters on Fridays.",
  },
  {
    id: "e5",
    airline: "KQ",
    window: "Sat 11:15–11:45 (recurring)",
    event: "Weekend Family Wave",
    peakWait: "17.6 / 12.4 min",
    paxAffected: 149,
    impact: "Flight banks for these carriers overlap weekly into shared islands.",
  },
  {
    id: "e6",
    airline: "VJ",
    window: "07:20–08:05",
    event: "VJ123 / VJ127 Morning Wave",
    peakWait: "15.8 / 11.2 min",
    paxAffected: 420,
    impact: "Either open +1 counter at 06:50 or guarantee early open of C15 by 07:05.",
  },
  {
    id: "e7",
    airline: "VJ",
    window: "16:10–16:55",
    event: "VJ201 Friday Peak",
    peakWait: "16.4 / 12.1 min",
    paxAffected: 502,
    impact: "Align roster open +12 min earlier Fridays; mark as structural fix.",
  },
  {
    id: "e8",
    airline: "AB",
    window: "08:10–08:40",
    event: "AB Early Bank",
    peakWait: "11.2 / 7.8 min",
    paxAffected: 96,
    impact: "Minor peak — monitor only; SLA recovered within window.",
  },
];

/** Actionable recommendation cards — FootfallCam reference (KQ) + VJ/AB variants. */
export const WEEKLY_BANKS: FlightBankRec[] = [
  {
    id: "b1",
    airline: "KQ",
    title: "KQ123 / KQ127 Morning Wave",
    window: "07:20–08:05",
    observedPeakMin: 22.4,
    observedPeakSecondary: 17.8,
    affectedPax: 182,
    observedPaxMin: 1260,
    scenarioAPaxMin: 780,
    scenarioBPaxMin: 640,
    recommendation:
      "Either open one counter at 06:50 or guarantee +1 counter by 07:05. Both scenarios cut breach impact by 38–49%.",
    adopted: false,
  },
  {
    id: "b2",
    airline: "KQ",
    title: "KQ341 Late Evening",
    window: "19:10–19:45",
    observedPeakMin: 18.6,
    observedPeakSecondary: 14.2,
    affectedPax: 146,
    observedPaxMin: 980,
    scenarioAPaxMin: 610,
    scenarioBPaxMin: 520,
    recommendation:
      "Staffing variance from late rotation reduced service rate. Hold one agent through 19:50 or open standby desk earlier.",
    adopted: false,
  },
  {
    id: "b3",
    airline: "KQ",
    title: "Weekly Friday Surge",
    window: "16:05–16:50",
    observedPeakMin: 19.8,
    observedPeakSecondary: 15.1,
    affectedPax: 158,
    observedPaxMin: 1140,
    scenarioAPaxMin: 690,
    scenarioBPaxMin: 580,
    recommendation:
      "Structural demand spike + insufficient early counters. Pre-open +1 desk from 15:50 every Friday.",
    adopted: false,
  },
  {
    id: "b4",
    airline: "KQ",
    title: "Weekend Family Wave",
    window: "Sat 11:15–11:45",
    observedPeakMin: 17.6,
    observedPeakSecondary: 13.4,
    affectedPax: 149,
    observedPaxMin: 890,
    scenarioAPaxMin: 560,
    scenarioBPaxMin: 470,
    recommendation:
      "Flight banks overlap weekly into shared islands. Stagger family-wave desks or add temporary lane 11:00–11:50.",
    adopted: false,
  },
  {
    id: "b5",
    airline: "KQ",
    title: "KQ Midday Bank",
    window: "12:25–13:00",
    observedPeakMin: 13.4,
    observedPeakSecondary: 8.9,
    affectedPax: 118,
    observedPaxMin: 720,
    scenarioAPaxMin: 450,
    scenarioBPaxMin: 390,
    recommendation:
      "Processing variance due to staff rotation. Protect lunch handover with +1 floating agent for 25 min.",
    adopted: true,
  },
  {
    id: "b6",
    airline: "KQ",
    title: "KQ Early Shoulder",
    window: "06:40–07:10",
    observedPeakMin: 14.2,
    observedPeakSecondary: 10.6,
    affectedPax: 104,
    observedPaxMin: 640,
    scenarioAPaxMin: 410,
    scenarioBPaxMin: 360,
    recommendation:
      "Open first desk 15 min earlier on peak days; Scenario B recovers most of the shoulder breach.",
    adopted: false,
  },
  {
    id: "b7",
    airline: "KQ",
    title: "KQ Night Close",
    window: "21:20–21:55",
    observedPeakMin: 15.1,
    observedPeakSecondary: 11.4,
    affectedPax: 88,
    observedPaxMin: 510,
    scenarioAPaxMin: 320,
    scenarioBPaxMin: 280,
    recommendation:
      "Avoid early desk close; under-staffing drove residual breach minutes after last call.",
    adopted: false,
  },
  {
    id: "b8",
    airline: "KQ",
    title: "KQ Transfer Overlap",
    window: "09:05–09:40",
    observedPeakMin: 16.8,
    observedPeakSecondary: 12.9,
    affectedPax: 132,
    observedPaxMin: 840,
    scenarioAPaxMin: 520,
    scenarioBPaxMin: 450,
    recommendation:
      "Inbound irregularity stacked two banks. Keep standby agent available 09:00–09:45 on irregular days.",
    adopted: false,
  },
  {
    id: "b9",
    airline: "VJ",
    title: "VJ123 / VJ127 Morning Wave",
    window: "07:20–08:05",
    observedPeakMin: 15.8,
    observedPeakSecondary: 11.2,
    affectedPax: 420,
    observedPaxMin: 1680,
    scenarioAPaxMin: 980,
    scenarioBPaxMin: 860,
    recommendation:
      "Either open +1 counter at 06:50 or guarantee early open of C15 by 07:05.",
    adopted: false,
  },
  {
    id: "b10",
    airline: "VJ",
    title: "VJ145 Midday Bank",
    window: "12:25–13:00",
    observedPeakMin: 13.2,
    observedPeakSecondary: 9.4,
    affectedPax: 310,
    observedPaxMin: 1120,
    scenarioAPaxMin: 720,
    scenarioBPaxMin: 640,
    recommendation: "Shift one agent from Bag Drop standby to Island A for 25 min.",
    adopted: true,
  },
  {
    id: "b11",
    airline: "VJ",
    title: "VJ201 Friday Peak",
    window: "16:10–16:55",
    observedPeakMin: 16.4,
    observedPeakSecondary: 12.1,
    affectedPax: 502,
    observedPaxMin: 1940,
    scenarioAPaxMin: 1180,
    scenarioBPaxMin: 1020,
    recommendation: "Align roster open +12 min earlier Fridays; mark as structural fix.",
    adopted: false,
  },
  {
    id: "b12",
    airline: "AB",
    title: "AB Early Bank",
    window: "08:10–08:40",
    observedPeakMin: 11.2,
    observedPeakSecondary: 7.8,
    affectedPax: 96,
    observedPaxMin: 380,
    scenarioAPaxMin: 240,
    scenarioBPaxMin: 210,
    recommendation: "Minor peak — monitor only; SLA recovered within window.",
    adopted: true,
  },
];

export function getWeeklyView(airline: string, _dateRange: string) {
  const episodes =
    airline === "all"
      ? WEEKLY_EPISODES
      : WEEKLY_EPISODES.filter((row) => row.airline === airline);
  const banks =
    airline === "all"
      ? WEEKLY_BANKS
      : WEEKLY_BANKS.filter((row) => row.airline === airline);
  return { episodes, banks };
}
