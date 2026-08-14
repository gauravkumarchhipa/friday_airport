"use client";

import { useCallback, type RefObject } from "react";

/** Live check: element's CSS text is truncated with ellipsis. */
export function isElementTextTruncated(el: HTMLElement | null): boolean {
  if (!el) return false;
  return Math.ceil(el.scrollWidth) - Math.floor(el.clientWidth) > 1;
}

/** Stable callback for tooltip gates that remeasure on each hover. */
export function useTruncationGate(
  ref: RefObject<HTMLElement | null>,
  /** When true, always allow tooltip (collapsed sidebar). */
  alwaysShow: boolean,
): () => boolean {
  return useCallback(() => {
    if (alwaysShow) return true;
    return isElementTextTruncated(ref.current);
  }, [alwaysShow, ref]);
}
