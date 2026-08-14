import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { DASHBOARD_CARD_SURFACE } from "@/components/common/dashboard-surface-card";
import { cn } from "@/lib/common/utils";

export function SummaryMetricCard({
  label,
  value,
  icon: Icon,
  status,
  statusTone = "ok",
  footer,
  valueClassName,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  status?: ReactNode;
  statusTone?: "ok" | "idle" | "warn";
  footer?: ReactNode;
  /** Optional class for the large metric value (e.g. critical red). */
  valueClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative min-w-0 overflow-hidden rounded-none border border-transparent p-4 sm:p-5",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] transition-colors duration-200 hover:border-white/35",
        DASHBOARD_CARD_SURFACE,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(255,255,255,0.05),transparent_42%)]" />

      <div className="relative z-[1] flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-white/70">{label}</div>
          <div
            className={cn(
              "mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl",
              valueClassName,
            )}
          >
            {value}
          </div>

          {footer ? (
            <div className="mt-3 sm:mt-4">{footer}</div>
          ) : status ? (
            <div className="mt-3 flex items-start gap-2 text-sm text-white/65 sm:mt-4">
              <span
                className={cn(
                  "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                  statusTone === "ok" && "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]",
                  statusTone === "warn" && "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.45)]",
                  statusTone === "idle" && "border border-white/40 bg-transparent",
                )}
                aria-hidden
              />
              <span className="min-w-0 break-words">{status}</span>
            </div>
          ) : null}
        </div>

        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/15 bg-white/[0.04] text-white/75">
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
      </div>
    </div>
  );
}
