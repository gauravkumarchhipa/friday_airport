"use client";

import { memo, useCallback, useEffect, useState } from "react";

import {
  DashboardSidebar,
  type SidebarNavItem,
} from "@/components/afterlogin/layout/dashboard-sidebar";
import { HeaderUserProfile } from "@/components/common/header-user-profile";
import { getIsBelowXl, useIsBelowXl } from "@/hooks/common/use-is-below-xl";

type DashboardShellProps = {
  title: string;
  navItems: readonly SidebarNavItem[];
  active: string;
  onSelect: (id: string) => void;
  children: React.ReactNode;
};

function DashboardShellComponent({
  title,
  navItems,
  active,
  onSelect,
  children,
}: DashboardShellProps) {
  const isBelowXl = useIsBelowXl();
  const [collapsed, setCollapsed] = useState(() => getIsBelowXl());

  useEffect(() => {
    setCollapsed(isBelowXl);
  }, [isBelowXl]);

  const toggleSidebar = useCallback(() => setCollapsed((prev) => !prev), []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a1218] text-white">
      <div className="h-full shrink-0">
        <DashboardSidebar
          navItems={navItems}
          active={active}
          collapsed={collapsed}
          onSelect={onSelect}
          onToggle={toggleSidebar}
        />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#0a1218]">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/[0.08] px-3 sm:h-16 sm:gap-3 sm:px-6 md:px-8">
          <h1 className="truncate text-base font-semibold tracking-tight text-white capitalize sm:text-lg md:text-xl">
            {title}
          </h1>
          <HeaderUserProfile name="Ops Admin" initials="OA" />
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-[#0a1218] p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export const DashboardShell = memo(DashboardShellComponent);
