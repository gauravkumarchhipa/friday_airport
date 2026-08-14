"use client";

import { useMemo } from "react";

import {
  buildLiveMapPoints,
  QUEUE_ZONES,
  zoneFillForWait,
  zoneStrokeForWait,
} from "@/data/afterlogin/check-in-ops/live-map-data";
import { LIVE_COUNTERS } from "@/data/afterlogin/check-in-ops/static-data";
import type { CounterLive } from "@/data/afterlogin/check-in-ops/types";
import { cn } from "@/lib/common/utils";

const VIEW_W = 900;
const VIEW_H = 440;

const WALL = "rgba(255,255,255,0.28)";
const WALL_DIM = "rgba(255,255,255,0.14)";
const FURNITURE = "rgba(255,255,255,0.07)";
const FURNITURE_STROKE = "rgba(255,255,255,0.22)";

/** Architectural check-in desk island (top of a queue lane). */
function DeskIsland({
  x,
  y,
  w,
  label,
}: {
  x: number;
  y: number;
  w: number;
  label: string;
}) {
  const bays = 3;
  const bayW = w / bays;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={28}
        rx={2}
        fill={FURNITURE}
        stroke={FURNITURE_STROKE}
        strokeWidth={1.2}
      />
      {Array.from({ length: bays - 1 }, (_, i) => (
        <line
          key={i}
          x1={x + bayW * (i + 1)}
          y1={y + 3}
          x2={x + bayW * (i + 1)}
          y2={y + 25}
          stroke={WALL_DIM}
          strokeWidth={1}
        />
      ))}
      <rect
        x={x + 4}
        y={y + 28}
        width={w - 8}
        height={6}
        fill="rgba(255,255,255,0.04)"
        stroke={WALL_DIM}
        strokeWidth={0.8}
      />
      <text
        x={x + w / 2}
        y={y + 18}
        textAnchor="middle"
        fill="rgba(255,255,255,0.5)"
        fontSize={9}
        fontFamily="ui-sans-serif, system-ui"
      >
        {label}
      </text>
    </g>
  );
}

function QueueBarriers({
  x,
  y,
  w,
  h,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  const mid1 = x + w * 0.33;
  const mid2 = x + w * 0.66;
  return (
    <g stroke={WALL_DIM} strokeWidth={1} fill="none" strokeDasharray="3 3">
      <line x1={mid1} y1={y + 10} x2={mid1} y2={y + h - 8} />
      <line x1={mid2} y1={y + 10} x2={mid2} y2={y + h - 8} />
      {[mid1, mid2].map((px) => (
        <g key={px}>
          <circle cx={px} cy={y + 10} r={1.6} fill="rgba(255,255,255,0.35)" stroke="none" />
          <circle cx={px} cy={y + h - 8} r={1.6} fill="rgba(255,255,255,0.35)" stroke="none" />
        </g>
      ))}
    </g>
  );
}

export function LiveQueueMap({
  onSelectCounter,
  focusCounterId,
  counters = LIVE_COUNTERS,
  className,
}: {
  onSelectCounter?: (counterId: string) => void;
  focusCounterId?: string | null;
  /** Filtered counters for the active airline (drives zone tint + pax density). */
  counters?: CounterLive[];
  className?: string;
}) {
  const points = useMemo(() => buildLiveMapPoints(counters), [counters]);
  const counterMap = useMemo(
    () => new Map(counters.map((c) => [c.id, c])),
    [counters],
  );
  const activeZones = useMemo(
    () => QUEUE_ZONES.filter((zone) => counterMap.has(zone.counterId)),
    [counterMap],
  );

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="w-full overflow-hidden bg-transparent">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="block h-auto w-full bg-transparent"
          style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
          role="img"
          aria-label="Live check-in hall floor plan with anonymised passenger points"
        >
          <rect
            x="27"
            y="36"
            width="846"
            height="360"
            fill="none"
            stroke={WALL}
            strokeWidth="2"
            rx="2"
          />

          <text x="188" y="410" textAnchor="middle" fill="rgba(255,255,255,0.28)" fontSize="8">
            Entrance A
          </text>
          <text x="480" y="410" textAnchor="middle" fill="rgba(255,255,255,0.28)" fontSize="8">
            Entrance B
          </text>
          <text x="742" y="410" textAnchor="middle" fill="rgba(255,255,255,0.28)" fontSize="8">
            Entrance C
          </text>

          <g fill="rgba(255,255,255,0.08)" stroke={WALL_DIM} strokeWidth="1">
            <rect x="54" y="52" width="21" height="14" rx="1" />
            <rect x="54" y="200" width="21" height="14" rx="1" />
            <rect x="54" y="340" width="21" height="14" rx="1" />
            <rect x="825" y="52" width="21" height="14" rx="1" />
            <rect x="825" y="200" width="21" height="14" rx="1" />
            <rect x="825" y="340" width="21" height="14" rx="1" />
            <rect x="375" y="52" width="18" height="12" rx="1" />
            <rect x="375" y="340" width="18" height="12" rx="1" />
          </g>

          <g stroke="rgba(255,255,255,0.1)" strokeWidth="1.25" strokeDasharray="7 5" fill="none">
            <path d="M 375 70 L 375 360" />
            <path d="M 60 236 L 840 236" />
          </g>

          <rect
            x="84"
            y="44"
            width="732"
            height="10"
            fill="rgba(255,255,255,0.04)"
            stroke={WALL_DIM}
            strokeWidth="1"
          />
          <text x="450" y="52" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="8">
            Bag drop / rear wall
          </text>

          <DeskIsland x={84} y={52} w={117} label="Desk · C03" />
          <DeskIsland x={222} y={52} w={117} label="Desk · C07" />
          <DeskIsland x={453} y={46} w={144} label="Desk · C12" />
          <DeskIsland x={621} y={46} w={144} label="Desk · C14" />
          <DeskIsland x={198} y={220} w={129} label="Desk · C21" />
          <DeskIsland x={477} y={220} w={129} label="Desk · C18" />

          <g stroke={WALL} strokeWidth="1.5" fill="none">
            <path d="M 360 70 L 360 210" />
            <path d="M 435 70 L 435 210" />
            <path d="M 360 250 L 360 360" />
            <path d="M 435 250 L 435 360" />
          </g>

          {activeZones.map((zone) => {
            const counter = counterMap.get(zone.counterId);
            const wait = counter?.joinWaitP50 ?? 0;
            const focused = focusCounterId === zone.counterId;
            return (
              <g key={zone.id}>
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.w}
                  height={zone.h}
                  rx="3"
                  fill={zoneFillForWait(wait)}
                  stroke={zoneStrokeForWait(wait)}
                  strokeWidth={focused ? 2.5 : 1.4}
                  className="cursor-pointer"
                  onClick={() => onSelectCounter?.(zone.counterId)}
                />
                <QueueBarriers x={zone.x} y={zone.y} w={zone.w} h={zone.h} />
                <text
                  x={zone.x + 8}
                  y={zone.y + 16}
                  fill="rgba(255,255,255,0.75)"
                  fontSize="11"
                  fontWeight="700"
                  className="pointer-events-none"
                >
                  {zone.label}
                </text>
                <rect
                  x={zone.head.x - 5}
                  y={zone.head.y - 5}
                  width="10"
                  height="10"
                  rx="1.5"
                  fill="#34d399"
                  stroke="rgba(0,0,0,0.4)"
                  strokeWidth="0.6"
                />
                <rect
                  x={zone.tail.x - 5}
                  y={zone.tail.y - 5}
                  width="10"
                  height="10"
                  rx="1.5"
                  fill="#fcd34d"
                  stroke="rgba(0,0,0,0.4)"
                  strokeWidth="0.6"
                />
              </g>
            );
          })}

          {points.map((p, index) => (
            <g key={p.id} transform={`translate(${p.x} ${p.y})`}>
              <circle
                cx={0}
                cy={0}
                r={p.kind === "queue" ? 3.4 : 2.5}
                fill={p.kind === "queue" ? "#38bdf8" : "rgba(200,210,220,0.45)"}
                opacity={p.kind === "queue" ? 0.95 : 0.75}
                className={p.kind === "queue" ? "live-queue-pax" : "live-passerby"}
                style={{
                  animationDelay: `${(index % 14) * 0.16}s`,
                  animationDuration:
                    p.kind === "queue"
                      ? `${2.4 + (index % 5) * 0.28}s`
                      : `${5.8 + (index % 6) * 0.45}s`,
                }}
              />
            </g>
          ))}

          <g transform="translate(681, 12)">
            <rect
              x="0"
              y="0"
              width="192"
              height="22"
              rx="3"
              fill="transparent"
              stroke="rgba(255,255,255,0.12)"
            />
            <circle cx="12" cy="11" r="3.2" fill="#38bdf8" />
            <text x="20" y="14" fill="rgba(255,255,255,0.55)" fontSize="8">
              Queuing pax
            </text>
            <circle cx="78" cy="11" r="2.6" fill="rgba(200,210,220,0.55)" />
            <text x="85" y="14" fill="rgba(255,255,255,0.55)" fontSize="8">
              Passer-by
            </text>
            <rect x="128" y="7" width="8" height="8" rx="1" fill="#fcd34d" />
            <text x="139" y="14" fill="rgba(255,255,255,0.55)" fontSize="8">
              Tail
            </text>
            <rect x="160" y="7" width="8" height="8" rx="1" fill="#34d399" />
            <text x="171" y="14" fill="rgba(255,255,255,0.55)" fontSize="8">
              Head
            </text>
          </g>

          <text x="42" y="28" fill="rgba(255,255,255,0.4)" fontSize="10" fontWeight="600">
            Hall A · floor plan
          </text>
          <text x="42" y="432" fill="rgba(255,255,255,0.28)" fontSize="8">
            Anonymised points · no video · zone tint = dwell &lt;5 / 5–10 / &gt;10 min
          </text>
        </svg>
      </div>
    </div>
  );
}
