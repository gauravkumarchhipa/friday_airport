"use client";

import { Clock3, ShieldCheck } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { DashboardSurfaceCard } from "@/components/common/dashboard-surface-card";
import type { QueueStatus } from "@/data/afterlogin/check-in-ops/types";
import { cn } from "@/lib/common/utils";

function formatClock(date: Date) {
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function PrivacyBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium tracking-wide text-emerald-200/90 uppercase",
        className,
      )}
    >
      <ShieldCheck className="h-3 w-3" strokeWidth={1.75} />
      Anonymous points · no video · on-prem
    </span>
  );
}

export function DataFreshnessBadge({ className }: { className?: string }) {
  const [clock, setClock] = useState(() => formatClock(new Date()));

  useEffect(() => {
    const tick = () => setClock(formatClock(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-sky-200 uppercase",
        className,
      )}
    >
      <span className="relative inline-flex h-2 w-2">
        <span className="live-status-ping absolute inset-0 rounded-full bg-sky-400" />
        <span className="relative h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
      </span>
      <Clock3 className="h-3 w-3" strokeWidth={1.75} aria-hidden />
      Data {clock}
    </span>
  );
}

export function PageMetaBadges({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <DataFreshnessBadge />
      <PrivacyBadge />
    </div>
  );
}

export function statusTone(status: QueueStatus): string {
  switch (status) {
    case "critical":
      return "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.55)]";
    case "warning":
      return "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.45)]";
    case "busy":
      return "bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.4)]";
    case "underutilized":
      return "bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.4)]";
    default:
      return "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]";
  }
}

export function statusLabel(status: QueueStatus): string {
  switch (status) {
    case "critical":
      return "Critical";
    case "warning":
      return "Warning";
    case "busy":
      return "Busy";
    case "underutilized":
      return "Underutilised";
    default:
      return "Stable";
  }
}

export function StatusPill({ status }: { status: QueueStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-white/75">
      <span className={cn("h-2 w-2 shrink-0 rounded-full", statusTone(status))} />
      {statusLabel(status)}
    </span>
  );
}

/**
 * Section card for Check-In Ops — same shell + heading as
 * “All active resources” / dashboard surface cards.
 */
export function OpsCard({
  title,
  children,
  className,
  action,
  /** Edge-to-edge body (e.g. shared DataTable). */
  flush = false,
  /** Stretch body to fill equal-height grid rows (scrollable tables). */
  fill = false,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
  flush?: boolean;
  fill?: boolean;
}) {
  return (
    <DashboardSurfaceCard
      className={cn(fill && "h-full", flush && "pb-0 sm:pb-0", className)}
      contentClassName={cn(fill && "flex h-full min-h-0 flex-col")}
    >
      {title ? (
        <div className="flex shrink-0 items-center justify-between gap-3 leading-none">
          <h2 className="text-sm leading-none font-medium text-white/70">{title}</h2>
          {action}
        </div>
      ) : null}
      <div
        className={cn(
          title && "mt-3",
          fill && "flex min-h-0 flex-1 flex-col",
          flush && title && "-mx-4 sm:-mx-5",
          flush && fill && "min-h-0 flex-1",
        )}
      >
        {children}
      </div>
    </DashboardSurfaceCard>
  );
}

export function dwellColor(waitMin: number): string {
  if (waitMin > 10) return "bg-red-400/80 border-red-300/50";
  if (waitMin >= 5) return "bg-amber-400/80 border-amber-300/50";
  return "bg-emerald-400/80 border-emerald-300/50";
}
