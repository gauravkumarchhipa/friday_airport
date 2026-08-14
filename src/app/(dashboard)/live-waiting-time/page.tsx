import type { Metadata } from "next";
import { Suspense } from "react";

import { LiveWaitingPanel } from "@/components/afterlogin/check-in-ops/panels/live-waiting-panel";

export const metadata: Metadata = {
  title: "Live Waiting Time",
};

export default function LiveWaitingTimePage() {
  return (
    <Suspense>
      <LiveWaitingPanel />
    </Suspense>
  );
}
