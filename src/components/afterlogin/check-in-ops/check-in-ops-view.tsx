"use client";

import { memo, useCallback, useMemo, useState } from "react";

import { DashboardShell } from "@/components/afterlogin/layout/dashboard-shell";
import { CHECK_IN_OPS_TABS, type CheckInOpsTabId } from "@/data/afterlogin/check-in-ops/tabs";

import { HallPerformancePanel } from "./panels/hall-performance-panel";
import { LiveWaitingPanel } from "./panels/live-waiting-panel";
import { ManagementReviewPanel } from "./panels/management-review-panel";
import { WeeklyPerformancePanel } from "./panels/weekly-performance-panel";

function CheckInOpsViewComponent() {
  const [tab, setTab] = useState<CheckInOpsTabId>("live");
  const [focusHint, setFocusHint] = useState<string | null>(null);

  const handleTabChange = useCallback((next: string) => {
    setTab(next as CheckInOpsTabId);
  }, []);

  const goLiveWithCounter = useCallback((counterId: string) => {
    setFocusHint(counterId);
    setTab("live");
  }, []);

  const title = useMemo(
    () => CHECK_IN_OPS_TABS.find((item) => item.id === tab)?.label ?? "Check-In Ops",
    [tab],
  );

  return (
    <DashboardShell
      title={title}
      navItems={CHECK_IN_OPS_TABS}
      active={tab}
      onSelect={handleTabChange}
    >
      <div className="min-w-0">
        {tab === "live" ? (
          <LiveWaitingPanel
            onOpenCounterAction={goLiveWithCounter}
            focusCounterId={focusHint}
          />
        ) : null}
        {tab === "hall" ? <HallPerformancePanel /> : null}
        {tab === "review" ? <ManagementReviewPanel /> : null}
        {tab === "weekly" ? <WeeklyPerformancePanel /> : null}
      </div>
    </DashboardShell>
  );
}

export const CheckInOpsView = memo(CheckInOpsViewComponent);
