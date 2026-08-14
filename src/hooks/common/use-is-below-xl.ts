"use client";

import { useEffect, useState } from "react";

/** Tailwind `xl` starts at 1280px — true when viewport is smaller than xl. */
const BELOW_XL_QUERY = "(max-width: 1279px)";

export function getIsBelowXl() {
  if (typeof window === "undefined") return false;
  return window.matchMedia(BELOW_XL_QUERY).matches;
}

export function useIsBelowXl() {
  const [isBelowXl, setIsBelowXl] = useState(getIsBelowXl);

  useEffect(() => {
    const mql = window.matchMedia(BELOW_XL_QUERY);
    const onChange = () => setIsBelowXl(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isBelowXl;
}
