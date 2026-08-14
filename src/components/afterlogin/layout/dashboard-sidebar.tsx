"use client";

import {
  ChevronsLeft,
  ChevronsRight,
  LogOut,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { memo, useRef } from "react";

import { FridayLogo } from "@/components/common/friday-logo";
import {
  GlassTooltipProvider,
  GlassTooltipWrap,
} from "@/components/common/glass-tooltip";
import { useTruncationGate } from "@/hooks/common/use-is-text-truncated";
import { navLink } from "@/lib/common/styles";
import { cn } from "@/lib/common/utils";

const ICON_CLASS = "h-5 w-5 shrink-0";

export type SidebarNavItem = {
  id: string;
  label: string;
  href: string;
  icon?: LucideIcon;
};

type SidebarNavLinkProps = {
  item: SidebarNavItem;
  active: boolean;
  collapsed: boolean;
};

const SidebarNavLink = memo(function SidebarNavLink({
  item,
  active,
  collapsed,
}: SidebarNavLinkProps) {
  const labelRef = useRef<HTMLSpanElement>(null);
  // Collapsed → always tooltip; expanded → only when label shows "…"
  const shouldOpen = useTruncationGate(labelRef, collapsed);
  const Icon = item.icon;

  return (
    <GlassTooltipWrap label={item.label} enabled shouldOpen={shouldOpen}>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          navLink({ active, layout: "row" }),
          "w-full min-w-0",
          collapsed && "justify-center px-0",
        )}
      >
        {Icon ? <Icon className={ICON_CLASS} strokeWidth={1.75} aria-hidden /> : null}
        {!collapsed && (
          <span ref={labelRef} className="min-w-0 flex-1 truncate text-left capitalize">
            {item.label}
          </span>
        )}
      </Link>
    </GlassTooltipWrap>
  );
});

type DashboardSidebarProps = {
  navItems: readonly SidebarNavItem[];
  active: string;
  collapsed: boolean;
  onToggle: () => void;
  onSignOut?: () => void;
};

function DashboardSidebarComponent({
  navItems,
  active,
  collapsed,
  onToggle,
  onSignOut,
}: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        "relative flex h-full min-h-0 shrink-0 flex-col bg-[#0c1b1e] transition-[width] duration-200 ease-out",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <GlassTooltipProvider delayDuration={150}>
        <div
          className={cn(
            "flex shrink-0 items-center p-4",
            collapsed ? "justify-center" : "justify-start",
          )}
        >
          <Link
            href="/"
            aria-label="Go to dashboard"
            className="inline-flex min-w-0 cursor-pointer items-center"
          >
            {collapsed ? (
              <FridayLogo size={28} />
            ) : (
              <FridayLogo wordmarkSize="sm" className="min-w-0" />
            )}
          </Link>
        </div>

        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-2 py-2 text-sm">
          {navItems.map((item) => (
            <SidebarNavLink
              key={item.id}
              item={item}
              active={item.id === active}
              collapsed={collapsed}
            />
          ))}
        </nav>

        <div className="mt-auto shrink-0 space-y-0.5 border-t border-white/10 p-2 text-sm">
          <GlassTooltipWrap label="Logout" enabled={collapsed}>
            <button
              type="button"
              onClick={onSignOut}
              className={cn(
                "flex w-full items-center gap-3 rounded px-3 py-2 text-sm transition-colors",
                "cursor-pointer bg-red-500/[0.06] text-red-300",
                "hover:bg-red-500/15 hover:text-red-200",
                collapsed && "justify-center px-0",
              )}
            >
              <LogOut className={ICON_CLASS} strokeWidth={1.75} aria-hidden />
              {!collapsed && <span className="truncate">Logout</span>}
            </button>
          </GlassTooltipWrap>
        </div>

        <GlassTooltipWrap
          label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          side="right"
          enabled={collapsed}
        >
          <button
            type="button"
            onClick={onToggle}
            className="absolute top-1/2 right-0 z-20 flex h-8 w-8 -translate-y-1/2 translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-[#0c1b1e] text-white/50 shadow-sm transition-colors hover:border-white/30 hover:text-white"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <ChevronsRight className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <ChevronsLeft className="h-4 w-4" strokeWidth={1.75} />
            )}
          </button>
        </GlassTooltipWrap>
      </GlassTooltipProvider>
    </aside>
  );
}

export const DashboardSidebar = memo(DashboardSidebarComponent);

type DashboardMobileNavProps = {
  navItems: readonly SidebarNavItem[];
  active: string;
  open: boolean;
  onClose: () => void;
  onSignOut?: () => void;
};

function DashboardMobileNavComponent({
  navItems,
  active,
  open,
  onClose,
  onSignOut,
}: DashboardMobileNavProps) {
  if (!open) return null;

  return (
    <div
      id="mobile-nav"
      className="fixed inset-0 z-50 lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation"
    >
      <div className="flex h-full min-h-0 flex-col bg-[#0c1b1e]">
        <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 sm:h-16 sm:px-6">
          <Link
            href="/"
            aria-label="Go to dashboard"
            className="inline-flex min-w-0 cursor-pointer items-center"
            onClick={onClose}
          >
            <FridayLogo wordmarkSize="sm" className="min-w-0" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded border border-white/15 text-white/70 transition-colors hover:border-white/30 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain px-3 py-4 text-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === active;
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                onClick={onClose}
                className={cn(navLink({ active: isActive, layout: "row" }), "min-h-12 w-full px-4 py-3")}
              >
                {Icon ? <Icon className={ICON_CLASS} strokeWidth={1.75} aria-hidden /> : null}
                <span className="min-w-0 flex-1 truncate capitalize">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            type="button"
            onClick={onSignOut}
            className={cn(
              "flex min-h-12 w-full cursor-pointer items-center gap-3 rounded px-4 py-3 text-sm",
              "bg-red-500/[0.06] text-red-300 hover:bg-red-500/15 hover:text-red-200",
            )}
          >
            <LogOut className={ICON_CLASS} strokeWidth={1.75} aria-hidden />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export const DashboardMobileNav = memo(DashboardMobileNavComponent);
