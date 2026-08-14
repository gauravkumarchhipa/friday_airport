import type { SidebarNavItem } from "@/components/afterlogin/layout/dashboard-sidebar";
import {
  Activity,
  BarChart3,
  ClipboardList,
  Timer,
} from "lucide-react";

export const CHECK_IN_OPS_TABS: readonly SidebarNavItem[] = [
  { id: "live", label: "Live Waiting Time", href: "/live-waiting-time", icon: Timer },
  { id: "hall", label: "Hall Performance", href: "/hall-performance", icon: Activity },
  { id: "review", label: "Management Review", href: "/management-review", icon: BarChart3 },
  { id: "weekly", label: "Weekly Performance", href: "/weekly-performance", icon: ClipboardList },
] as const;

export type CheckInOpsTabId = (typeof CHECK_IN_OPS_TABS)[number]["id"];

export const CHECK_IN_OPS_DEFAULT_HREF = CHECK_IN_OPS_TABS[0].href;
