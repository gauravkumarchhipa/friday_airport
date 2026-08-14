import type { Metadata } from "next";

import { HallPerformancePanel } from "@/components/afterlogin/check-in-ops/panels/hall-performance-panel";

export const metadata: Metadata = {
  title: "Hall Performance",
};

export default function HallPerformancePage() {
  return <HallPerformancePanel />;
}
