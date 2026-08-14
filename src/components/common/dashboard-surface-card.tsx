"use client";

import type { ComponentProps } from "react";

import { cn } from "@/lib/common/utils";

/** Exact surface used by dashboard Workers / GPUs / CPUs metric cards. */
export const DASHBOARD_CARD_SURFACE =
  "bg-[linear-gradient(160deg,#101f23_0%,#0c1b1e_48%,#081214_100%)]";

type DashboardSurfaceCardProps = ComponentProps<"div"> & {
  /** Disable the top-right radial highlight. */
  noHighlight?: boolean;
  /** Classes on the inner content wrapper (e.g. flex fill layouts). */
  contentClassName?: string;
};

/**
 * Reusable dashboard card shell — same border + background as
 * Workers / GPUs / CPUs metric cards.
 */
export function DashboardSurfaceCard({
  className,
  children,
  noHighlight = false,
  contentClassName,
  ...props
}: DashboardSurfaceCardProps) {
  return (
    <div
      className={cn(
        "relative min-w-0 overflow-hidden rounded-none border border-transparent p-4 sm:p-5",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors duration-200 hover:border-white/35",
        DASHBOARD_CARD_SURFACE,
        className,
      )}
      {...props}
    >
      {!noHighlight ? (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.05),transparent_42%)]" />
      ) : null}
      <div className={cn("relative z-[1] min-w-0", contentClassName)}>{children}</div>
    </div>
  );
}
