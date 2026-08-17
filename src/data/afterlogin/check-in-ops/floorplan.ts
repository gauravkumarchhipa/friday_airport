/** Procedural CAD-style airport terminal floor plan (world units: 1200 x 780). */

export type Pt = { x: number; y: number };

export const WORLD = { w: 1200, h: 780 };

const rect = (x: number, y: number, w: number, h: number): Pt[] => [
  { x, y },
  { x: x + w, y },
  { x: x + w, y: y + h },
  { x, y: y + h },
  { x, y },
];

/** Thin structural linework: outer shell, corridors, rooms. */
export const shell: Pt[][] = [
  rect(28, 62, 1146, 700),
  rect(20, 54, 1162, 716),
  [
    { x: 28, y: 62 },
    { x: 62, y: 62 },
    { x: 62, y: 762 },
    { x: 28, y: 762 },
  ],
  [
    { x: 74, y: 62 },
    { x: 74, y: 762 },
  ],
  [
    { x: 28, y: 128 },
    { x: 132, y: 62 },
  ],
  [
    { x: 28, y: 152 },
    { x: 150, y: 76 },
  ],
  [
    { x: 96, y: 62 },
    { x: 96, y: 104 },
    { x: 176, y: 104 },
  ],
  [
    { x: 28, y: 196 },
    { x: 96, y: 196 },
    { x: 130, y: 176 },
    { x: 150, y: 140 },
    { x: 150, y: 104 },
  ],
  [
    { x: 176, y: 92 },
    { x: 960, y: 92 },
  ],
  [
    { x: 176, y: 100 },
    { x: 960, y: 100 },
  ],
  rect(1000, 62, 174, 240),
  rect(1000, 560, 174, 202),
  [
    { x: 1000, y: 150 },
    { x: 1174, y: 150 },
  ],
  [
    { x: 1088, y: 150 },
    { x: 1088, y: 302 },
  ],
  [
    { x: 1000, y: 226 },
    { x: 1088, y: 226 },
  ],
  [
    { x: 1000, y: 650 },
    { x: 1174, y: 650 },
  ],
  [
    { x: 1082, y: 650 },
    { x: 1082, y: 762 },
  ],
  [
    { x: 1082, y: 706 },
    { x: 1174, y: 706 },
  ],
  [
    { x: 320, y: 372 },
    { x: 320, y: 762 },
  ],
  [
    { x: 660, y: 330 },
    { x: 660, y: 762 },
  ],
];

/** Left-hand check-in counter modules (kerbside). */
export const leftCounters: Pt[][] = Array.from({ length: 11 }, (_, i) => {
  const y = 214 + i * 50;
  return [
    ...rect(78, y, 62, 34),
    ...[
      { x: 78, y: y + 10 },
      { x: 140, y: y + 10 },
    ],
    ...[
      { x: 96, y: y + 10 },
      { x: 96, y: y + 34 },
    ],
    ...[
      { x: 118, y: y + 10 },
      { x: 118, y: y + 34 },
    ],
  ];
}).flatMap((pts) => [pts.slice(0, 5), pts.slice(5, 7), pts.slice(7, 9), pts.slice(9, 11)]);

/** Top check-in desk banks. */
export const topDesks: Pt[][] = Array.from({ length: 8 }, (_, i) => {
  const x = 206 + i * 96;
  const y = 104;
  return [
    rect(x, y, 66, 46),
    [
      { x: x + 8, y },
      { x: x + 8, y: y + 46 },
    ],
    [
      { x: x + 20, y },
      { x: x + 20, y: y + 46 },
    ],
    [
      { x: x + 33, y },
      { x: x + 33, y: y + 46 },
    ],
    [
      { x: x + 46, y },
      { x: x + 46, y: y + 46 },
    ],
    [
      { x: x + 58, y },
      { x: x + 58, y: y + 46 },
    ],
    [
      { x: x + 14, y: y + 46 },
      { x: x + 14, y: y + 62 },
      { x: x + 52, y: y + 62 },
      { x: x + 52, y: y + 46 },
    ],
  ];
}).flat();

/** Freestanding columns across the concourse. */
export const columns: Pt[] = [
  ...Array.from({ length: 5 }, (_, i) => ({ x: 300 + i * 170, y: 356 })),
  ...Array.from({ length: 5 }, (_, i) => ({ x: 300 + i * 170, y: 600 })),
  { x: 240, y: 480 },
  { x: 980, y: 480 },
];

export type ZoneDef = {
  id: string;
  desk: string;
  /** Live counter id used for tint, focus, and deep-link selection. */
  counterId: string;
  x: number;
  y: number;
  w: number;
  h: number;
  tint: "calm" | "warm" | "hot";
  lanes: number;
  vertical: boolean;
  capacity: number;
  serveMs: number;
};

export const zones: ZoneDef[] = [
  {
    id: "z1",
    desk: "C03",
    counterId: "C03",
    x: 236,
    y: 176,
    w: 210,
    h: 84,
    tint: "warm",
    lanes: 3,
    vertical: false,
    capacity: 46,
    serveMs: 900,
  },
  {
    id: "z2",
    desk: "C12",
    counterId: "C12",
    x: 470,
    y: 176,
    w: 210,
    h: 84,
    tint: "hot",
    lanes: 3,
    vertical: false,
    capacity: 52,
    serveMs: 1500,
  },
  {
    id: "z3",
    desk: "C21",
    counterId: "C21",
    x: 706,
    y: 176,
    w: 176,
    h: 84,
    tint: "calm",
    lanes: 3,
    vertical: false,
    capacity: 26,
    serveMs: 850,
  },
  {
    id: "z4",
    desk: "K07",
    counterId: "C07",
    x: 158,
    y: 302,
    w: 84,
    h: 214,
    tint: "calm",
    lanes: 3,
    vertical: true,
    capacity: 24,
    serveMs: 1000,
  },
  {
    id: "z5",
    desk: "K14",
    counterId: "C14",
    x: 158,
    y: 556,
    w: 84,
    h: 200,
    tint: "calm",
    lanes: 3,
    vertical: true,
    capacity: 20,
    serveMs: 1100,
  },
];

/** Serpentine walk path inside a zone, head at the desk-facing edge. */
export function zonePath(z: ZoneDef): Pt[] {
  const pad = 14;
  const pts: Pt[] = [];
  if (!z.vertical) {
    const laneGap = (z.h - pad * 2) / Math.max(z.lanes - 1, 1);
    for (let l = 0; l < z.lanes; l++) {
      const y = z.y + pad + l * laneGap;
      const a = { x: z.x + pad, y };
      const b = { x: z.x + z.w - pad, y };
      pts.push(...(l % 2 === 0 ? [b, a] : [a, b]));
    }
  } else {
    const laneGap = (z.w - pad * 2) / Math.max(z.lanes - 1, 1);
    for (let l = 0; l < z.lanes; l++) {
      const x = z.x + pad + l * laneGap;
      const a = { x, y: z.y + pad };
      const b = { x, y: z.y + z.h - pad };
      pts.push(...(l % 2 === 0 ? [a, b] : [b, a]));
    }
  }
  return pts;
}

/** Passer-by circulation loop through the concourse. */
export const circulation: Pt[][] = [
  [
    { x: 200, y: 300 },
    { x: 420, y: 300 },
    { x: 700, y: 296 },
    { x: 940, y: 320 },
    { x: 960, y: 470 },
    { x: 900, y: 620 },
    { x: 620, y: 660 },
    { x: 380, y: 640 },
    { x: 268, y: 520 },
    { x: 262, y: 380 },
    { x: 200, y: 300 },
  ],
  [
    { x: 300, y: 420 },
    { x: 560, y: 400 },
    { x: 820, y: 430 },
    { x: 880, y: 540 },
    { x: 640, y: 560 },
    { x: 400, y: 540 },
    { x: 300, y: 420 },
  ],
  [
    { x: 120, y: 700 },
    { x: 340, y: 720 },
    { x: 700, y: 730 },
    { x: 940, y: 700 },
    { x: 700, y: 690 },
    { x: 340, y: 686 },
    { x: 120, y: 700 },
  ],
];
