"use client";

import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { GlassTooltipWrap } from "@/components/common/glass-tooltip";
import { cn } from "@/lib/common/utils";

const LINE_CLAMP: Record<2 | 3, string> = {
  2: "line-clamp-2",
  3: "line-clamp-3",
};

export type TextTruncateProps = {
  /** Text to display. Empty/null/undefined renders `empty` fallback. */
  text?: string | number | null;
  /** Max visible lines before ellipsis. Default 1. */
  lines?: 1 | 2 | 3;
  className?: string;
  tooltipSide?: "top" | "right" | "bottom" | "left";
  /** Shown when text is empty. Default `null`. */
  empty?: ReactNode;
};

/**
 * Reusable truncated text — `…` when clipped, full text in glass tooltip on hover.
 * Use in tables, cards, sidebars, or anywhere long text needs clipping.
 */
export function TextTruncate({
  text,
  lines = 1,
  className,
  tooltipSide = "top",
  empty = null,
}: TextTruncateProps) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  const label = text == null ? "" : String(text).trim();

  const measure = useCallback(() => {
    const el = textRef.current;
    if (!el || !label) {
      setIsTruncated(false);
      return;
    }

    if (lines === 1) {
      setIsTruncated(el.scrollWidth > el.clientWidth + 1);
      return;
    }

    setIsTruncated(el.scrollHeight > el.clientHeight + 1);
  }, [label, lines]);

  useLayoutEffect(() => {
    measure();
    const el = textRef.current;
    if (!el) return;

    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure]);

  if (!label) {
    return empty;
  }

  const singleLine = lines === 1;

  return (
    <GlassTooltipWrap label={label} enabled={isTruncated} side={tooltipSide}>
      <span
        ref={textRef}
        className={cn(
          "block min-w-0 max-w-full",
          singleLine ? "truncate" : cn(LINE_CLAMP[lines], "break-all"),
          isTruncated && "cursor-default",
          className,
        )}
      >
        {label}
      </span>
    </GlassTooltipWrap>
  );
}
