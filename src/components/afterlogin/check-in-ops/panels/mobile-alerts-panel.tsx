"use client";

import { AlertTriangle, BellRing, Clock3, Settings2, UserCheck } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { OpsCard } from "@/components/afterlogin/check-in-ops/check-in-ops-ui";
import { SummaryMetricCard } from "@/components/afterlogin/overview/clusters/summary-metric-card";
import { FridayButton } from "@/components/common/friday-button";
import {
  CHECK_IN_META,
  SUPERVISOR_ALERT_TYPES,
  SUPERVISOR_ALERT_ZONES,
  getSupervisorAlerts,
} from "@/data/afterlogin/check-in-ops/static-data";
import type {
  AlertAuditAction,
  AlertAuditEntry,
  AlertStatus,
  AlertType,
  SupervisorAlert,
} from "@/data/afterlogin/check-in-ops/types";
import { cn } from "@/lib/common/utils";

const ACTOR = "Ops Admin";
const LIVE_HREF = "/live-waiting-time";

function zoneLabel(zone: string) {
  return zone.startsWith("Zone") ? zone : `Zone ${zone}`;
}

function alertTitle(alert: SupervisorAlert) {
  return `Counter ${alert.counter}`;
}

function alertBody(alert: SupervisorAlert, etaLabel: string | null) {
  if (alert.type === "predicted") {
    const eta = etaLabel ?? (alert.etaMin != null ? `${alert.etaMin} min` : null);
    return eta
      ? `breach predicted in ${eta} · ${alert.recommendation.toLowerCase()}`
      : alert.recommendation;
  }
  if (alert.type === "10m") {
    return `>10 min waiting: ${alert.waiting10m ?? 0} pax`;
  }
  return `>5 min waiting: ${alert.waiting5m ?? 0} pax`;
}

function formatAge(createdAt: string, now: number) {
  const sec = Math.max(0, Math.floor((now - Date.parse(createdAt)) / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}

function formatCountdown(deadline: number, now: number) {
  const sec = Math.max(0, Math.floor((deadline - now) / 1000));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function severityDot(severity: SupervisorAlert["severity"]) {
  if (severity === "critical") {
    return "bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.55)]";
  }
  if (severity === "warning") {
    return "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.45)]";
  }
  return "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]";
}

function statusLabel(status: AlertStatus) {
  if (status === "acknowledged") return "Acknowledged";
  if (status === "assigned") return "Assigned to you";
  if (status === "resolved") return "Resolved";
  return "Active";
}

function actionLabel(action: AlertAuditAction) {
  if (action === "ack") return "Acknowledged";
  if (action === "assign") return "Assigned";
  return "Resolved";
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-10 cursor-pointer rounded-none border px-3 text-[13px] font-medium transition-colors",
        active
          ? "border-white/40 bg-white/10 text-white"
          : "border-white/15 bg-transparent text-white/50 hover:border-white/25 hover:text-white/75",
      )}
    >
      {children}
    </button>
  );
}

export function MobileAlertsPanel() {
  const [now, setNow] = useState(() => Date.now());
  const [alerts, setAlerts] = useState<SupervisorAlert[]>(() => getSupervisorAlerts());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [audit, setAudit] = useState<AlertAuditEntry[]>([]);
  const [watchedZones, setWatchedZones] = useState<string[]>([...SUPERVISOR_ALERT_ZONES]);
  const [enabledTypes, setEnabledTypes] = useState<AlertType[]>(
    SUPERVISOR_ALERT_TYPES.map((item) => item.id),
  );
  const [quietHours, setQuietHours] = useState<"off" | "night" | "overnight">("off");

  const [deadlines] = useState<Record<string, number>>(() => {
    const t = Date.now();
    return Object.fromEntries(
      getSupervisorAlerts()
        .filter((alert) => alert.etaMin != null)
        .map((alert) => [alert.id, t + (alert.etaMin ?? 0) * 60_000]),
    );
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const inbox = useMemo(
    () =>
      alerts.filter(
        (alert) =>
          alert.status !== "resolved" &&
          watchedZones.includes(alert.zone) &&
          enabledTypes.includes(alert.type),
      ),
    [alerts, enabledTypes, watchedZones],
  );

  const featured =
    inbox.find((alert) => alert.id === selectedId) ??
    inbox.find((alert) => alert.severity === "critical") ??
    inbox[0] ??
    null;

  const latencySec = Math.round(CHECK_IN_META.alertLatencyMs / 1000);
  const quietHoursOn = quietHours !== "off";

  function writeAudit(alertId: string, action: AlertAuditAction) {
    setAudit((prev) => [
      {
        id: `aud-${alertId}-${action}-${Date.now()}`,
        alertId,
        action,
        at: new Date().toISOString(),
        actor: ACTOR,
      },
      ...prev,
    ]);
  }

  function patchAlert(id: string, status: AlertStatus, assignedTo?: string) {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, status, assignedTo: assignedTo ?? alert.assignedTo } : alert,
      ),
    );
  }

  function acknowledge() {
    if (!featured || featured.status === "resolved") return;
    patchAlert(featured.id, "acknowledged");
    writeAudit(featured.id, "ack");
  }

  function assignToMe() {
    if (!featured || featured.status === "resolved") return;
    patchAlert(featured.id, "assigned", ACTOR);
    writeAudit(featured.id, "assign");
  }

  function resolve() {
    if (!featured) return;
    patchAlert(featured.id, "resolved");
    writeAudit(featured.id, "resolve");
    setSelectedId(null);
  }

  function toggleZone(zone: string) {
    setWatchedZones((prev) =>
      prev.includes(zone) ? prev.filter((item) => item !== zone) : [...prev, zone],
    );
  }

  function toggleType(type: AlertType) {
    setEnabledTypes((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type],
    );
  }

  function etaFor(alert: SupervisorAlert | null) {
    if (!alert) return null;
    if (deadlines[alert.id] != null) return formatCountdown(deadlines[alert.id], now);
    if (alert.etaMin != null) return `${alert.etaMin} min`;
    return null;
  }

  const featuredEta = etaFor(featured);
  const criticalCount = inbox.filter((alert) => alert.severity === "critical").length;
  const assignedCount = inbox.filter((alert) => alert.status === "assigned").length;

  return (
    <div className="w-full min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-semibold text-white">Supervisor Mobile Alerts</h3>
          <p className="text-[12px] text-white/40">Warn staff before a breach · under 30s</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-sky-200 uppercase">
            <span className="relative inline-flex h-2 w-2">
              <span className="live-status-ping absolute inset-0 rounded-full bg-sky-400" />
              <span className="relative h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
            </span>
            {latencySec}s latency
          </span>
          <span className="inline-flex items-center rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-1 text-[10px] font-medium tracking-wide text-white/55 uppercase">
            PWA push · SMS / Teams fallback
          </span>
        </div>
      </div>

      {quietHoursOn ? (
        <p className="border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] text-white/60">
          Quiet hours on · inbox still visible, push muted
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryMetricCard
          label="Active alerts"
          value={String(inbox.length)}
          icon={BellRing}
          status="Live inbox"
          statusTone={inbox.length > 0 ? "warn" : "ok"}
        />
        <SummaryMetricCard
          label="Critical"
          value={String(criticalCount)}
          icon={AlertTriangle}
          status={criticalCount > 0 ? "Needs intervention" : "Clear"}
          statusTone={criticalCount > 0 ? "warn" : "ok"}
          valueClassName={criticalCount > 0 ? "text-red-400" : undefined}
        />
        <SummaryMetricCard
          label="Assigned to me"
          value={String(assignedCount)}
          icon={UserCheck}
          status={assignedCount > 0 ? "On your queue" : "None assigned"}
          statusTone={assignedCount > 0 ? "warn" : "idle"}
        />
        <SummaryMetricCard
          label="Alert latency"
          value={`${latencySec}s`}
          icon={Clock3}
          status="Target under 30s"
          statusTone="ok"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)] xl:items-stretch">
        <OpsCard
          fill
          className={cn(
            "min-h-0",
            featured &&
              featured.severity === "critical" &&
              "border-red-400/35 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.22)]",
          )}
        >
          {featured ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium tracking-wide text-white/45 uppercase">
                    friday · {featured.type === "predicted" ? "Predicted breach" : "Wait threshold"}
                  </p>
                  <p className="mt-1 text-[20px] font-semibold tracking-tight text-white sm:text-[22px]">
                    {alertTitle(featured)}
                  </p>
                </div>
                <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-red-300" strokeWidth={1.75} />
              </div>
              <p className="mt-2 text-[14px] text-white/80 sm:text-[15px]">
                {featured.type === "predicted"
                  ? `${alertTitle(featured)} — ${alertBody(featured, featuredEta)}`
                  : alertBody(featured, featuredEta)}
              </p>
              <p className="mt-3 border border-red-400/30 bg-red-500/10 px-3 py-2.5 text-[13px] font-medium text-red-100">
                Recommended: {featured.recommendation.toLowerCase()}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-white/45">
                <span>{statusLabel(featured.status)}</span>
                <span>·</span>
                <span>{formatAge(featured.createdAt, now)}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <FridayButton
                  variant="dashboard"
                  size="lg"
                  className="h-11 sm:h-12"
                  disabled={featured.status === "resolved"}
                  onClick={acknowledge}
                >
                  Acknowledge
                </FridayButton>
                <FridayButton
                  variant="primary"
                  size="lg"
                  className="h-11 border-transparent bg-[#c45c3e] hover:bg-[#d46a4a] sm:h-12"
                  disabled={featured.status === "resolved"}
                  onClick={assignToMe}
                >
                  Assign to me
                </FridayButton>
                <FridayButton
                  variant="actionOutline"
                  size="lg"
                  className="h-11 sm:h-12"
                  onClick={resolve}
                >
                  Resolve
                </FridayButton>
                <FridayButton
                  variant="gradient"
                  size="lg"
                  className="h-11 sm:h-12"
                  href={`${LIVE_HREF}?counter=${featured.counter}`}
                >
                  Open live map
                </FridayButton>
              </div>
            </>
          ) : (
            <p className="text-[13px] text-white/45">No active alerts for this watch list.</p>
          )}
        </OpsCard>

        <OpsCard title="Active alerts" fill className="min-h-0">
          {inbox.length > 0 ? (
            <ul className="friday-slim-scrollbar max-h-[360px] min-h-0 divide-y divide-white/[0.06] overflow-y-auto">
              {inbox.map((alert) => {
                const active = featured?.id === alert.id;
                const eta = etaFor(alert);
                return (
                  <li key={alert.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(alert.id)}
                      className={cn(
                        "-mx-1 flex w-[calc(100%+0.5rem)] cursor-pointer items-start gap-3 px-1 py-3 text-left transition-colors sm:items-center",
                        active ? "bg-white/[0.04]" : "hover:bg-white/[0.03]",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full sm:mt-0",
                          severityDot(alert.severity),
                        )}
                        aria-hidden
                      />
                      <span className="grid min-w-0 flex-1 gap-1 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_auto] sm:items-center sm:gap-4">
                        <span className="truncate text-[13px] font-medium text-white">
                          {alert.severity === "recovering"
                            ? `Counter ${alert.counter} — recovering`
                            : `Counter ${alert.counter} — ${zoneLabel(alert.zone)}`}
                        </span>
                        <span className="truncate text-[12px] text-white/55">
                          {alertBody(alert, eta)}
                        </span>
                        <span className="text-[11px] text-white/35 sm:text-right">
                          {statusLabel(alert.status)} · {formatAge(alert.createdAt, now)}
                          {eta && alert.type === "predicted" ? ` · ETA ${eta}` : ""}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-[13px] text-white/45">Inbox is clear for the selected zones.</p>
          )}
        </OpsCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <OpsCard
          title="Watch config"
          fill
          className="h-full min-h-[360px]"
          action={<Settings2 className="h-4 w-4 text-white/40" strokeWidth={1.75} aria-hidden />}
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-[12px] text-white/45">Zones</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SUPERVISOR_ALERT_ZONES.map((zone) => (
                  <Chip
                    key={zone}
                    active={watchedZones.includes(zone)}
                    onClick={() => toggleZone(zone)}
                  >
                    {zoneLabel(zone)}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[12px] text-white/45">Thresholds</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {SUPERVISOR_ALERT_TYPES.map((item) => (
                  <Chip
                    key={item.id}
                    active={enabledTypes.includes(item.id)}
                    onClick={() => toggleType(item.id)}
                  >
                    {item.label}
                  </Chip>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[12px] text-white/45">Quiet hours</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Chip active={quietHours === "off"} onClick={() => setQuietHours("off")}>
                  Off
                </Chip>
                <Chip active={quietHours === "night"} onClick={() => setQuietHours("night")}>
                  22:00–06:00
                </Chip>
                <Chip active={quietHours === "overnight"} onClick={() => setQuietHours("overnight")}>
                  00:00–05:00
                </Chip>
              </div>
            </div>
          </div>
        </OpsCard>

        <div className="min-h-[360px] max-h-[420px] lg:h-0 lg:max-h-none lg:min-h-full">
          <OpsCard
            title="Audit log"
            fill
            className="h-full min-h-0"
            action={<Clock3 className="h-4 w-4 text-white/40" strokeWidth={1.75} aria-hidden />}
          >
            {audit.length > 0 ? (
              <ul className="friday-slim-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
                {audit.map((entry) => {
                  const alert = alerts.find((item) => item.id === entry.alertId);
                  return (
                    <li
                      key={entry.id}
                      className="border border-white/10 bg-white/[0.03] px-3 py-2 text-[12px] text-white/70"
                    >
                      <span className="font-medium text-white">{actionLabel(entry.action)}</span>
                      {alert ? ` · ${alert.counter} · ${zoneLabel(alert.zone)}` : ""}
                      <span className="mt-0.5 block text-[11px] text-white/40">
                        {entry.actor} · {formatAge(entry.at, now)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-[13px] text-white/45">
                Acknowledge, assign, or resolve an alert to write the audit log.
              </p>
            )}
          </OpsCard>
        </div>
      </div>
    </div>
  );
}
