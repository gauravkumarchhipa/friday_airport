export type QueueStatus = "critical" | "warning" | "stable" | "busy" | "underutilized";

export type CounterLive = {
  id: string;
  airline: string;
  zone: string;
  row: string;
  queueLen: number;
  joinWaitP50: number;
  joinWaitP95: number;
  waiting5m: number;
  waiting10m: number;
  serviceRate: number;
  capacityDeficit: number;
  breachInMin: number | null;
  recoveryMin: number | null;
  status: QueueStatus;
  /** Map position 0–100 */
  x: number;
  y: number;
};

export type FlightUrgency = {
  flight: string;
  airline: string;
  std: string;
  aveWaitMin: number;
  queue: number;
  breachInMin: number | null;
  recoveryMin: number | null;
  status: QueueStatus;
  counterGroup: string;
  paxRemaining: number;
  closureInMin: number;
};

export type SuggestedAction = {
  id: string;
  airline: string;
  text: string;
  severity: "critical" | "warn" | "info";
  counterId?: string;
};

export type LiveKpis = {
  activeFlights: number;
  criticalFlights: number;
  nextClosureMin: number;
  waiting5m: number;
  waiting10m: number;
};

export type LiveRisk = {
  joinWaitMin: number;
  breachInMin: number;
  queueStabilityIndex: number;
  zone: string;
};

export type LiveViewSnapshot = {
  airline: string;
  kpis: LiveKpis;
  flights: FlightUrgency[];
  counters: CounterLive[];
  focusFlight: FlightUrgency | null;
  risk: LiveRisk | null;
  actions: SuggestedAction[];
};

export type HallStatus =
  | "breaching"
  | "at_risk"
  | "busy"
  | "stable"
  | "underused";

export type TerminalId = "t1" | "t2" | "t3";

export type HallKpis = {
  slaToday: number;
  breachesToday: number;
  airlinesAffectedAsGroups: number;
};

export type HallCounter = {
  id: string;
  /** Shown like Airline column in reference (bank / island code). */
  bank: string;
  island: string;
  row: string;
  queue: number;
  waitMin: number;
  utilisation: number;
  status: HallStatus;
  waiting5m: number;
  waiting10m: number;
};

export type SlaPoint = { time: string; sla: number; target: number };

export type BreachAttribution = {
  /** Reference “Airline” column — bank / carrier group. */
  group: string;
  count: number;
  worstEpisode: string;
};

export type HallAlertTile = {
  tone: "critical" | "ok" | "warn";
  title: string;
  /** Large primary value (e.g. Row 3). */
  value: string;
  detail: string;
};

export type HallTerminalSnapshot = {
  kpis: HallKpis;
  slaSeries: SlaPoint[];
  counters: HallCounter[];
  breaches: BreachAttribution[];
  alertTiles: HallAlertTile[];
};

export type ReviewKpis = {
  slaCompliance: number;
  flightsAnalysed: number;
  airlinesCount: number;
  paxCheckedIn: number;
  breachEpisodes: number;
  structuralBreaches: number;
  adHocBreaches: number;
  paxImpacted: number;
  paxImpactedPct: number;
  prevSlaCompliance: number;
  dateRangeLabel: string;
};

export type PressureCell = "low" | "medium" | "high";

export type LeagueRow = {
  group: string;
  slaPct: number;
  flights: number;
  breaches: number;
  medianJoinWait: string;
  /** Highlight underperforming rows (reference: LD / YZ). */
  highlight?: boolean;
};

export type ReviewSnapshot = {
  kpis: ReviewKpis;
  summary: string;
  pressure: PressureCell[][];
  pattern: number[][];
  league: LeagueRow[];
  rootCauses: RootCause[];
};

export type RootCause = {
  title: string;
  detail: string;
  category: "structural" | "ad-hoc";
};

export type FlightBankRec = {
  id: string;
  airline: string;
  title: string;
  window: string;
  /** Peak join wait pair shown as "22.4 / 17.8 min". */
  observedPeakMin: number;
  observedPeakSecondary: number;
  affectedPax: number;
  /** Breach impact bars (pax-min) matching FootfallCam cards. */
  observedPaxMin: number;
  scenarioAPaxMin: number;
  scenarioBPaxMin: number;
  recommendation: string;
  adopted: boolean;
};

export type WeeklyEpisodeRow = {
  id: string;
  airline: string;
  window: string;
  event: string;
  /** e.g. "19.8 / 13.2 min" */
  peakWait: string;
  paxAffected: number;
  impact: string;
};
