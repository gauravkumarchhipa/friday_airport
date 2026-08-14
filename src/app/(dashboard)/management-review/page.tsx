import type { Metadata } from "next";

import { ManagementReviewPanel } from "@/components/afterlogin/check-in-ops/panels/management-review-panel";

export const metadata: Metadata = {
  title: "Management Review",
};

export default function ManagementReviewPage() {
  return <ManagementReviewPanel />;
}
