/** Routes that require an authenticated session (aligned with proxy.ts dashboard gate). */
const PROTECTED_PATH_PREFIX = "/dashboard";

export function isProtectedAppPath(pathname: string): boolean {
  return (
    pathname === PROTECTED_PATH_PREFIX ||
    pathname.startsWith(`${PROTECTED_PATH_PREFIX}/`)
  );
}

export function isAuthPagePath(pathname: string): boolean {
  return pathname === "/signin" || pathname.startsWith("/signin/");
}
