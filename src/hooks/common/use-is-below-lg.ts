"use client";

import { useEffect, useState } from "react";

/** Tailwind `lg` starts at 1024px — true when viewport is smaller than lg. */
const BELOW_LG_QUERY = "(max-width: 1023px)";

export function getIsBelowLg() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(BELOW_LG_QUERY).matches;
}

export function useIsBelowLg() {
  const [isBelowLg, setIsBelowLg] = useState(getIsBelowLg);

  useEffect(() => {
    const mql = window.matchMedia(BELOW_LG_QUERY);
    const onChange = () => setIsBelowLg(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isBelowLg;
}
