import type { CounterLive } from "./types";
import { LIVE_COUNTERS } from "./static-data";

export type MapPointKind = "queue" | "passerby";

export type MapPoint = {
  id: string;
  x: number;
  y: number;
  kind: MapPointKind;
  counterId?: string;
};

export type QueueZone = {
  id: string;
  counterId: string;
  label: string;
  /** SVG rect for dwell tint overlay */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Head (front / desk side) and Tail (back of queue) */
  head: { x: number; y: number };
  tail: { x: number; y: number };
  /** Optional serpentine lane centers for denser queue drawing */
  lanes?: number[];
};

/** Deterministic pseudo-random in [0,1) from seed string + index. */
function hash01(seed: string, i: number): number {
  let h = 2166136261;
  const s = `${seed}:${i}`;
  for (let k = 0; k < s.length; k += 1) {
    h ^= s.charCodeAt(k);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10_000) / 10_000;
}

/**
 * Hall A check-in islands — coordinates match the architectural SVG in LiveQueueMap.
 * Top row: C03 C07 | C12 C14 · Bottom row: C21 C18
 */
export const QUEUE_ZONES: QueueZone[] = [
  {
    id: "z-c03",
    counterId: "C03",
    label: "C03",
    x: 84,
    y: 78,
    w: 117,
    h: 132,
    head: { x: 142, y: 86 },
    tail: { x: 142, y: 198 },
    lanes: [108, 142, 177],
  },
  {
    id: "z-c07",
    counterId: "C07",
    label: "C07",
    x: 222,
    y: 78,
    w: 117,
    h: 132,
    head: { x: 280, y: 86 },
    tail: { x: 280, y: 198 },
    lanes: [246, 280, 315],
  },
  {
    id: "z-c12",
    counterId: "C12",
    label: "C12",
    x: 453,
    y: 72,
    w: 144,
    h: 158,
    head: { x: 525, y: 80 },
    tail: { x: 525, y: 218 },
    lanes: [483, 525, 567],
  },
  {
    id: "z-c14",
    counterId: "C14",
    label: "C14",
    x: 621,
    y: 72,
    w: 144,
    h: 158,
    head: { x: 693, y: 80 },
    tail: { x: 693, y: 218 },
    lanes: [651, 693, 735],
  },
  {
    id: "z-c21",
    counterId: "C21",
    label: "C21",
    x: 198,
    y: 256,
    w: 129,
    h: 108,
    head: { x: 262, y: 264 },
    tail: { x: 262, y: 352 },
    lanes: [228, 262, 297],
  },
  {
    id: "z-c18",
    counterId: "C18",
    label: "C18",
    x: 477,
    y: 256,
    w: 129,
    h: 108,
    head: { x: 541, y: 264 },
    tail: { x: 541, y: 352 },
    lanes: [507, 541, 576],
  },
];

/** Pack queue points along serpentine lanes (desk → tail), FootfallCam-style density. */
function pointsForZone(zone: QueueZone, counter: CounterLive): MapPoint[] {
  const points: MapPoint[] = [];
  const n = Math.max(6, Math.min(48, Math.round(counter.queueLen * 0.85)));
  const lanes = zone.lanes ?? [zone.head.x];
  const yTop = zone.head.y + 8;
  const yBot = zone.tail.y - 6;
  const span = Math.max(1, yBot - yTop);

  for (let i = 0; i < n; i += 1) {
    const lane = lanes[i % lanes.length]!;
    const row = Math.floor(i / lanes.length);
    const rows = Math.ceil(n / lanes.length);
    const t = rows <= 1 ? 0 : row / (rows - 1);
    // Serpentine: odd lanes reverse along the depth axis
    const laneIndex = i % lanes.length;
    const depth = laneIndex % 2 === 1 ? 1 - t : t;
    const jitterX = (hash01(zone.id, i) - 0.5) * 7;
    const jitterY = (hash01(zone.id, i + 90) - 0.5) * 5;
    const x = lane + jitterX;
    const y = yTop + depth * span + jitterY;
    points.push({
      id: `${zone.id}-q-${i}`,
      x: Math.min(zone.x + zone.w - 5, Math.max(zone.x + 5, x)),
      y: Math.min(zone.y + zone.h - 5, Math.max(zone.y + 5, y)),
      kind: "queue",
      counterId: counter.id,
    });
  }
  return points;
}

/** Corridor / aisle passer-by traffic (anonymous). */
function passerbyPoints(): MapPoint[] {
  const seeds: [number, number][] = [
    [60, 230],
    [78, 250],
    [102, 270],
    [372, 120],
    [387, 150],
    [402, 180],
    [372, 210],
    [405, 260],
    [375, 300],
    [420, 320],
    [795, 100],
    [817, 140],
    [807, 180],
    [825, 230],
    [802, 280],
    [150, 370],
    [240, 378],
    [330, 372],
    [450, 380],
    [570, 374],
    [660, 378],
    [750, 370],
    [135, 220],
    [300, 230],
    [600, 240],
    [720, 250],
    [465, 160],
    [435, 100],
  ];
  return seeds.map(([x, y], i) => ({
    id: `pb-${i}`,
    x: x + (hash01("pb", i) - 0.5) * 14,
    y: y + (hash01("pb", i + 11) - 0.5) * 12,
    kind: "passerby" as const,
  }));
}

export function buildLiveMapPoints(counters: CounterLive[] = LIVE_COUNTERS): MapPoint[] {
  const byId = new Map(counters.map((c) => [c.id, c]));
  const queuePts = QUEUE_ZONES.flatMap((zone) => {
    const counter = byId.get(zone.counterId);
    if (!counter) return [];
    return pointsForZone(zone, counter);
  });
  return [...queuePts, ...passerbyPoints()];
}

export function zoneFillForWait(waitMin: number): string {
  if (waitMin > 10) return "rgba(248,113,113,0.32)";
  if (waitMin >= 5) return "rgba(251,191,36,0.28)";
  return "rgba(52,211,153,0.24)";
}

export function zoneStrokeForWait(waitMin: number): string {
  if (waitMin > 10) return "rgba(248,113,113,0.7)";
  if (waitMin >= 5) return "rgba(251,191,36,0.65)";
  return "rgba(52,211,153,0.6)";
}
