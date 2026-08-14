"use client";

import { DashboardShell } from "@/components/afterlogin/layout/dashboard-shell";
import { CHECK_IN_OPS_TABS } from "@/data/afterlogin/check-in-ops/tabs";

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <DashboardShell navItems={CHECK_IN_OPS_TABS}>
      <div className="min-w-0">{children}</div>
    </DashboardShell>
  );
}
