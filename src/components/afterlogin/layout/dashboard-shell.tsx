"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import {
  DashboardMobileNav,
  DashboardSidebar,
  type SidebarNavItem,
} from "@/components/afterlogin/layout/dashboard-sidebar";
import { HeaderUserProfile } from "@/components/common/header-user-profile";
import { getIsBelowLg, useIsBelowLg } from "@/hooks/common/use-is-below-lg";
import { getIsBelowXl, useIsBelowXl } from "@/hooks/common/use-is-below-xl";

type DashboardShellProps = {
  navItems: readonly SidebarNavItem[];
  children: React.ReactNode;
};

function DashboardShellComponent({
  navItems,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const activeItem = useMemo(
    () => navItems.find((item) => item.href === pathname) ?? navItems[0],
    [navItems, pathname],
  );
  const isBelowLg = useIsBelowLg();
  const isBelowXl = useIsBelowXl();
  const [collapsed, setCollapsed] = useState(() => getIsBelowXl() && !getIsBelowLg());
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (isBelowLg) return;
    setMobileNavOpen(false);
    setCollapsed(isBelowXl);
  }, [isBelowLg, isBelowXl]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileNavOpen]);

  const toggleSidebar = useCallback(() => setCollapsed((prev) => !prev), []);
  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a1218] text-white">
      <div className="hidden h-full shrink-0 lg:block">
        <DashboardSidebar
          navItems={navItems}
          active={activeItem?.id ?? ""}
          collapsed={collapsed}
          onToggle={toggleSidebar}
        />
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#0a1218]">
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/[0.08] px-3 sm:h-16 sm:gap-3 sm:px-6 md:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openMobileNav}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center text-white/80 transition-colors hover:text-white lg:hidden"
              aria-label="Open menu"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <h1 className="truncate text-base font-semibold tracking-tight text-white capitalize sm:text-lg md:text-xl">
              {activeItem?.label ?? "Check-In Ops"}
            </h1>
          </div>
          <HeaderUserProfile name="Ops Admin" initials="OA" />
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto bg-[#0a1218] p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>

      <DashboardMobileNav
        navItems={navItems}
        active={activeItem?.id ?? ""}
        open={mobileNavOpen}
        onClose={closeMobileNav}
      />
    </div>
  );
}

export const DashboardShell = memo(DashboardShellComponent);
