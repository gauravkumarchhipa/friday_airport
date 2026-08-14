"use client";

import type { LucideIcon } from "lucide-react";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";

import { cn } from "@/lib/common/utils";

export type TabBarItem = {
  id: string;
  label: string;
  /** Optional Lucide icon shown before the label. */
  icon?: LucideIcon;
};

type TabBarProps = {
  /** String labels, or items with `id` / `label` / optional `icon`. */
  tabs: readonly string[] | readonly TabBarItem[];
  active: string;
  onChange: (tab: string) => void;
  className?: string;
  /** Extra class on the inner tabs row. */
  listClassName?: string;
  /** When false, labels keep their written casing (no CSS uppercase). Default true. */
  uppercase?: boolean;
};

function normalizeTabs(
  tabs: readonly string[] | readonly TabBarItem[],
): TabBarItem[] {
  return tabs.map((tab) =>
    typeof tab === "string" ? { id: tab, label: tab } : tab,
  );
}

type TabButtonProps = {
  item: TabBarItem;
  active: boolean;
  onChange: (tab: string) => void;
  uppercase: boolean;
  buttonRef?: (node: HTMLButtonElement | null) => void;
};

const TabButton = memo(function TabButton({
  item,
  active,
  onChange,
  uppercase,
  buttonRef,
}: TabButtonProps) {
  const handleClick = useCallback(() => onChange(item.id), [onChange, item.id]);
  const Icon = item.icon;

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-selected={active}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer items-center gap-1.5 px-3 py-3 text-xs font-semibold whitespace-nowrap transition-colors",
        uppercase ? "tracking-[0.12em] uppercase" : "tracking-normal normal-case",
        active ? "text-white" : "text-white/45 hover:text-white/70",
      )}
    >
      {Icon ? (
        <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
      ) : null}
      <span>{item.label}</span>
      {active ? (
        <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-white" />
      ) : null}
    </button>
  );
});

function TabBarComponent({
  tabs,
  active,
  onChange,
  className,
  listClassName,
  uppercase = true,
}: TabBarProps) {
  const items = useMemo(() => normalizeTabs(tabs), [tabs]);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const button = activeButtonRef.current;
    const scroller = scrollerRef.current;
    if (!button || !scroller) return;
    button.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "nearest",
    });
  }, [active]);

  return (
    <div
      ref={scrollerRef}
      className={cn(
        "friday-slim-scrollbar relative -mx-1 flex items-center overflow-x-auto border-b border-white/[0.08] px-1",
        "[scrollbar-width:thin]",
        className,
      )}
      role="tablist"
    >
      <div className={cn("flex w-max min-w-full items-center gap-1", listClassName)}>
        {items.map((item) => (
          <TabButton
            key={item.id}
            item={item}
            active={active === item.id}
            onChange={onChange}
            uppercase={uppercase}
            buttonRef={
              active === item.id
                ? (node) => {
                    activeButtonRef.current = node;
                  }
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

export const TabBar = memo(TabBarComponent);
