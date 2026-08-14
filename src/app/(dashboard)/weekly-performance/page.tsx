import type { Metadata } from "next";

import { WeeklyPerformancePanel } from "@/components/afterlogin/check-in-ops/panels/weekly-performance-panel";

export const metadata: Metadata = {
  title: "Weekly Performance",
};

export default function WeeklyPerformancePage() {
  return <WeeklyPerformancePanel />;
}
