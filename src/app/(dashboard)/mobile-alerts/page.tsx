import type { Metadata } from "next";

import { MobileAlertsPanel } from "@/components/afterlogin/check-in-ops/panels/mobile-alerts-panel";

export const metadata: Metadata = {
  title: "Mobile Alerts",
};

export default function MobileAlertsPage() {
  return <MobileAlertsPanel />;
}
