import type { TabBarItem } from "@/components/common/tab-bar";
import {
  Activity,
  BarChart3,
  ClipboardList,
  Timer,
} from "lucide-react";

export const CHECK_IN_OPS_TABS: readonly TabBarItem[] = [
  { id: "live", label: "Live Waiting Time", icon: Timer },
  { id: "hall", label: "Hall Performance", icon: Activity },
  { id: "review", label: "Management Review", icon: BarChart3 },
  { id: "weekly", label: "Weekly Performance", icon: ClipboardList },
] as const;

export type CheckInOpsTabId = (typeof CHECK_IN_OPS_TABS)[number]["id"];
