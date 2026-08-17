"use client";

import { useEffect, useRef, useState } from "react";

import {
  WORLD,
  circulation,
  columns,
  leftCounters,
  shell,
  topDesks,
  zonePath,
  zones,
  type Pt,
  type ZoneDef,
} from "@/data/afterlogin/check-in-ops/floorplan";
import { LIVE_COUNTERS } from "@/data/afterlogin/check-in-ops/static-data";
import type { CounterLive } from "@/data/afterlogin/check-in-ops/types";
import { cn } from "@/lib/common/utils";

type Poly = { pts: Pt[]; cum: number[]; len: number };

function poly(pts: Pt[]): Poly {
  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i]!.x - pts[i - 1]!.x;
    const dy = pts[i]!.y - pts[i - 1]!.y;
    cum.push(cum[i - 1]! + Math.hypot(dx, dy));
  }
  return { pts, cum, len: cum[cum.length - 1]! };
}

function at(p: Poly, s: number): Pt {
  const d = Math.min(Math.max(s, 0), p.len);
  let i = 1;
  while (i < p.cum.length - 1 && p.cum[i]! < d) i++;
  const t = (d - p.cum[i - 1]!) / Math.max(p.cum[i]! - p.cum[i - 1]!, 0.0001);
  return {
    x: p.pts[i - 1]!.x + (p.pts[i]!.x - p.pts[i - 1]!.x) * t,
    y: p.pts[i - 1]!.y + (p.pts[i]!.y - p.pts[i - 1]!.y) * t,
  };
}

type Pax = { s: number; target: number; jx: number; jy: number; ph: number };
type Queue = { z: ZoneDef; path: Poly; pax: Pax[]; spacing: number; timer: number; join: number };
type Walker = { p: Poly; s: number; v: number; jx: number; jy: number };
type Staff = { p: Poly; s: number; v: number; dir: number };
type ZoneTint = ZoneDef["tint"];
type LegendKind = "pax" | "passer" | "tail" | "head";

const LEGEND_ITEMS: { id: LegendKind; label: string; swatch: string }[] = [
  { id: "pax", label: "Queueing pax", swatch: "rounded-full bg-[var(--pax-queue)]" },
  { id: "passer", label: "Passer-by", swatch: "rounded-full bg-[var(--pax-passer)]" },
  { id: "tail", label: "Tail", swatch: "bg-[var(--pax-tail)]" },
  { id: "head", label: "Head", swatch: "bg-[var(--pax-head)]" },
];

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function css(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function tintFromWait(waitMin: number | undefined, fallback: ZoneTint): ZoneTint {
  if (waitMin == null) return fallback;
  if (waitMin > 10) return "hot";
  if (waitMin >= 5) return "warm";
  return "calm";
}

function hitZone(x: number, y: number): ZoneDef | undefined {
  return zones.find((z) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h);
}

export function LiveQueueMap({
  onSelectCounter,
  focusCounterId,
  counters = LIVE_COUNTERS,
  className,
}: {
  onSelectCounter?: (counterId: string) => void;
  focusCounterId?: string | null;
  counters?: CounterLive[];
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const countersRef = useRef(counters);
  const focusRef = useRef(focusCounterId);
  const onSelectRef = useRef(onSelectCounter);
  const [counts, setCounts] = useState<
    { id: string; desk: string; n: number; wait: number; tint: ZoneTint }[]
  >([]);
  const [legendFocus, setLegendFocus] = useState<LegendKind | null>(null);
  const legendFocusRef = useRef<LegendKind | null>(null);
  const [graphFrame, setGraphFrame] = useState({ left: 8, top: 8, width: 0, height: 0 });

  countersRef.current = counters;
  focusRef.current = focusCounterId;
  onSelectRef.current = onSelectCounter;
  legendFocusRef.current = legendFocus;

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const palette = {
      line: css("--plan-line", "oklch(0.62 0.02 240)"),
      lineSoft: css("--plan-line-soft", "oklch(0.42 0.02 240)"),
      grid: css("--plan-grid", "oklch(0.28 0.02 240)"),
      pax: css("--pax-queue", "oklch(0.72 0.16 232)"),
      passer: css("--pax-passer", "oklch(0.62 0.01 240)"),
      tail: css("--pax-tail", "oklch(0.82 0.16 82)"),
      head: css("--pax-head", "oklch(0.78 0.16 158)"),
      calm: css("--zone-calm", "oklch(0.72 0.13 158)"),
      warm: css("--zone-warm", "oklch(0.78 0.14 88)"),
      hot: css("--zone-hot", "oklch(0.66 0.18 22)"),
    };
    const tintOf = (t: ZoneTint) =>
      t === "calm" ? palette.calm : t === "warm" ? palette.warm : palette.hot;

    const markerAlpha = (kind: LegendKind) => {
      const focus = legendFocusRef.current;
      if (!focus) return 1;
      return focus === kind ? 1 : 0.12;
    };
    const markerScale = (kind: LegendKind) => {
      const focus = legendFocusRef.current;
      if (!focus) return 1;
      return focus === kind ? 1.7 : 0.82;
    };
    const markerGlow = (kind: LegendKind, base = 0) => {
      const focus = legendFocusRef.current;
      if (focus === kind) return 18;
      if (focus) return 0;
      return base;
    };

    const shellP = shell.map(poly);
    const countersP = leftCounters.map(poly);
    const desksP = topDesks.map(poly);
    const circP = circulation.map(poly);

    const queues: Queue[] = zones.map((z) => {
      const path = poly(zonePath(z));
      const live = countersRef.current.find((c) => c.id === z.counterId);
      const spacing = path.len / (z.capacity + 6);
      const seeded = live
        ? Math.max(4, Math.min(z.capacity, Math.round(live.queueLen * 1.45)))
        : Math.round(z.capacity * rand(0.6, 0.95));
      const n = seeded;
      const pax: Pax[] = Array.from({ length: n }, (_, i) => ({
        s: path.len - i * spacing,
        target: path.len - i * spacing,
        jx: rand(-1.6, 1.6),
        jy: rand(-1.6, 1.6),
        ph: rand(0, 6.283),
      }));
      return { z, path, pax, spacing, timer: rand(0, z.serveMs), join: 0 };
    });

    const walkers: Walker[] = Array.from({ length: 46 }, () => {
      const p = circP[Math.floor(Math.random() * circP.length)]!;
      return { p, s: Math.random() * p.len, v: rand(9, 26), jx: rand(-2, 2), jy: rand(-2, 2) };
    });

    const staff: Staff[] = Array.from({ length: 16 }, (_, i) => {
      const x = 214 + (i % 8) * 96 + rand(-6, 6);
      const y0 = i < 8 ? 158 : 166;
      const p = poly([
        { x: x - 22, y: y0 },
        { x: x + 30, y: y0 + rand(-4, 4) },
      ]);
      return { p, s: Math.random() * p.len, v: rand(4, 11), dir: Math.random() > 0.5 ? 1 : -1 };
    });
    const kerbStaff: Staff[] = Array.from({ length: 9 }, (_, i) => {
      const y = 232 + i * 56;
      const p = poly([
        { x: 146, y },
        { x: 150, y: y + rand(14, 34) },
      ]);
      return { p, s: Math.random() * p.len, v: rand(3, 8), dir: 1 };
    });

    let dpr = 1;
    let scale = 1;
    let ox = 0;
    let oy = 0;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = wrap.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(r.width * dpr));
      canvas.height = Math.max(1, Math.floor(r.height * dpr));
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      scale = Math.min(r.width / WORLD.w, r.height / WORLD.h);
      ox = (r.width - WORLD.w * scale) / 2;
      oy = (r.height - WORLD.h * scale) / 2;
      setGraphFrame({
        left: ox,
        top: oy,
        width: WORLD.w * scale,
        height: WORLD.h * scale,
      });
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const worldFromEvent = (event: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - r.left - ox) / scale,
        y: (event.clientY - r.top - oy) / scale,
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      const { x, y } = worldFromEvent(event);
      canvas.style.cursor = hitZone(x, y) ? "pointer" : "default";
    };

    const onPointerDown = (event: PointerEvent) => {
      const { x, y } = worldFromEvent(event);
      const zone = hitZone(x, y);
      if (zone) onSelectRef.current?.(zone.counterId);
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);

    const strokePoly = (p: Poly) => {
      ctx.beginPath();
      p.pts.forEach((pt, i) => (i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)));
      ctx.stroke();
    };

    const dot = (x: number, y: number, r: number, color: string, glow = 0) => {
      if (glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = glow;
      }
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    let raf = 0;
    let last = performance.now();
    let statTimer = 0;

    const frame = (now: number) => {
      const dt = Math.min(now - last, 60);
      last = now;
      const t = now / 1000;
      const liveById = new Map(countersRef.current.map((c) => [c.id, c]));

      queues.forEach((q) => {
        q.timer += dt;
        if (q.timer >= q.z.serveMs) {
          q.timer = 0;
          if (q.pax.length) q.pax.shift();
        }
        q.join += dt;
        const joinRate = q.z.serveMs * rand(0.85, 1.15);
        if (q.join > joinRate && q.pax.length < q.z.capacity) {
          q.join = 0;
          const back = q.pax.length ? q.pax[q.pax.length - 1]!.target - q.spacing : q.path.len;
          q.pax.push({
            s: Math.max(back - q.spacing * 2, 0),
            target: back,
            jx: rand(-1.6, 1.6),
            jy: rand(-1.6, 1.6),
            ph: rand(0, 6.283),
          });
        }
        q.pax.forEach((p, i) => {
          p.target = q.path.len - i * q.spacing;
          p.s += (p.target - p.s) * Math.min(dt / 260, 1);
        });
      });

      walkers.forEach((w) => {
        w.s = (w.s + (w.v * dt) / 1000) % w.p.len;
      });
      [...staff, ...kerbStaff].forEach((s) => {
        s.s += (s.dir * s.v * dt) / 1000;
        if (s.s > s.p.len) {
          s.s = s.p.len;
          s.dir = -1;
        }
        if (s.s < 0) {
          s.s = 0;
          s.dir = 1;
        }
      });

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr * scale, 0, 0, dpr * scale, ox * dpr, oy * dpr);
      const lw = 1 / scale;

      ctx.strokeStyle = palette.grid;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = lw;
      for (let x = 0; x <= WORLD.w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, WORLD.h);
        ctx.stroke();
      }
      for (let y = 0; y <= WORLD.h; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WORLD.w, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      ctx.lineWidth = lw * 1.4;
      ctx.strokeStyle = palette.line;
      ctx.globalAlpha = 0.85;
      shellP.forEach(strokePoly);
      ctx.lineWidth = lw;
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = palette.lineSoft;
      countersP.forEach(strokePoly);
      desksP.forEach(strokePoly);
      ctx.globalAlpha = 0.75;
      columns.forEach((c) => {
        ctx.strokeRect(c.x - 5, c.y - 5, 10, 10);
      });
      ctx.globalAlpha = 1;

      queues.forEach((q) => {
        const live = liveById.get(q.z.counterId);
        const tint = tintFromWait(live?.joinWaitP50, q.z.tint);
        const color = tintOf(tint);
        const load = q.pax.length / q.z.capacity;
        const focused = focusRef.current === q.z.counterId;
        ctx.save();
        ctx.globalAlpha = 0.1 + load * 0.12;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(q.z.x, q.z.y, q.z.w, q.z.h, 6);
        ctx.fill();
        ctx.globalAlpha = 0.45 + 0.25 * Math.sin(t * 2 + q.z.x);
        ctx.strokeStyle = color;
        ctx.lineWidth = lw * (focused ? 3.2 : 1.6);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.setLineDash([4 * lw, 6 * lw]);
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.28;
        ctx.lineWidth = lw;
        strokePoly(q.path);
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.9;
        ctx.fillStyle = color;
        ctx.font = "11px ui-monospace, monospace";
        ctx.fillText(`Desk ${q.z.desk}`, q.z.x + 2, q.z.y - 9);
        ctx.restore();
      });

      walkers.forEach((w) => {
        const p = at(w.p, w.s);
        ctx.globalAlpha = markerAlpha("passer");
        const scaleN = markerScale("passer");
        dot(p.x + w.jx, p.y + w.jy, 2.4 * scaleN, palette.passer, markerGlow("passer"));
        ctx.globalAlpha = 1;
      });

      ctx.globalAlpha = legendFocusRef.current ? 0.1 : 1;
      [...staff, ...kerbStaff].forEach((s) => {
        const p = at(s.p, s.s);
        dot(p.x, p.y, 2.8, palette.head, legendFocusRef.current ? 0 : 8);
      });
      ctx.globalAlpha = 1;

      queues.forEach((q) => {
        q.pax.forEach((p, i) => {
          const pt = at(q.path, p.s);
          const bob = Math.sin(t * 3 + p.ph) * 0.6;
          if (i === 0) {
            const s = markerScale("head");
            const half = 3 * s;
            ctx.globalAlpha = markerAlpha("head");
            ctx.fillStyle = palette.head;
            ctx.shadowColor = palette.head;
            ctx.shadowBlur = markerGlow("head", 10);
            ctx.fillRect(pt.x - half, pt.y - half, half * 2, half * 2);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
          } else if (i === q.pax.length - 1) {
            const s = markerScale("tail");
            const half = 2.6 * s;
            ctx.globalAlpha = markerAlpha("tail");
            ctx.fillStyle = palette.tail;
            ctx.shadowColor = palette.tail;
            ctx.shadowBlur = markerGlow("tail", 10);
            ctx.fillRect(pt.x - half, pt.y - half, half * 2, half * 2);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
          } else {
            ctx.globalAlpha = markerAlpha("pax");
            const scaleN = markerScale("pax");
            dot(
              pt.x + p.jx * 0.4,
              pt.y + p.jy * 0.4 + bob,
              2.6 * scaleN,
              palette.pax,
              markerGlow("pax", 6),
            );
            ctx.globalAlpha = 1;
          }
        });
      });

      statTimer += dt;
      if (statTimer > 700) {
        statTimer = 0;
        setCounts(
          queues.map((q) => {
            const live = liveById.get(q.z.counterId);
            return {
              id: q.z.id,
              desk: q.z.desk,
              n: q.pax.length,
              wait: live ? Math.round(live.joinWaitP50) : Math.round((q.pax.length * q.z.serveMs) / 1000 / 6),
              tint: tintFromWait(live?.joinWaitP50, q.z.tint),
            };
          }),
        );
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  return (
    <div className={cn("relative isolate flex h-full min-h-0 w-full flex-col gap-2", className)}>
      <div
        ref={wrapRef}
        className="relative z-0 min-h-[220px] w-full flex-1 overflow-hidden bg-transparent"
      >
        <canvas ref={canvasRef} className="relative z-0 block size-full" />
        <p
          className="pointer-events-none absolute z-20 text-[11px] leading-none font-medium text-white/55"
          style={{ left: graphFrame.left + 10, top: graphFrame.top + 8 }}
        >
          Hall A · floor plan
        </p>
        <ul className="absolute top-1.5 right-2 z-20 flex flex-wrap items-center justify-end gap-0.5 font-mono text-[10px] leading-none sm:gap-1">
          {LEGEND_ITEMS.map((item) => {
            const active = legendFocus === item.id;
            const muted = legendFocus != null && !active;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setLegendFocus((prev) => (prev === item.id ? null : item.id))}
                  aria-pressed={active}
                  className={cn(
                    "flex cursor-pointer items-center gap-1.5 bg-[#0c1b1e]/80 px-1.5 py-1 text-white/60 transition-colors",
                    "hover:bg-white/[0.08] hover:text-white/90",
                    active && "bg-white/[0.12] text-white",
                    muted && "text-white/30",
                  )}
                >
                  <span className={cn("size-2 shrink-0", item.swatch)} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
        <p
          className="pointer-events-none absolute z-20 max-w-[calc(100%-1.5rem)] truncate bg-[#0c1b1e]/85 px-1.5 py-0.5 font-mono text-[10px] leading-none text-white/55"
          style={{
            left: graphFrame.left + 10,
            top: Math.max(8, graphFrame.top + graphFrame.height - 22),
          }}
        >
          Anonymised points · no video · zone tint = dwell &lt;5 / 5–10 / &gt;10 min
        </p>
      </div>

      <ul className="relative z-20 grid w-full shrink-0 grid-cols-2 gap-2 bg-[#0c1b1e] sm:grid-cols-3 xl:grid-cols-5">
        {counts.map((c) => (
          <li
            key={c.id}
            className="flex min-h-[2.25rem] min-w-0 items-center justify-center border border-white/10 bg-[#101f23] px-2 py-1.5"
          >
            <p className="w-full truncate text-center font-mono text-[11px] leading-none text-white/55">
              <span className="font-medium text-white">{c.desk}</span>
              <span>
                {" "}
                · {c.n} pax · ~{c.wait} min
              </span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
