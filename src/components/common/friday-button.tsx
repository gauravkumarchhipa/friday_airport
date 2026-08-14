import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";

import { fridayBtn } from "@/lib/common/styles";
import { cn } from "@/lib/common/utils";

/**
 * Shared interactive control for the console.
 * Always uses `cursor-pointer` when enabled — prefer this over raw `<button>`.
 */
type FridayButtonBaseProps = {
  variant?:
    | "primary"
    | "outline"
    | "ghost"
    | "dashboard"
    | "gradient"
    | "action"
    | "actionOutline"
    | "danger"
    | "soft"
    | "toolbar";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "icon" | "iconSm" | "iconXs" | "row";
  full?: boolean;
  /** Pressed / selected look (toolbar tabs, toggles). */
  active?: boolean;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
};

type FridayButtonAsButton = FridayButtonBaseProps &
  Omit<ComponentProps<"button">, "disabled"> & {
    href?: undefined;
  };

type FridayButtonAsLink = FridayButtonBaseProps &
  Omit<ComponentProps<typeof Link>, "href"> & {
    href: string;
  };

type FridayButtonProps = FridayButtonAsButton | FridayButtonAsLink;

const LOADER_SIZE: Record<NonNullable<FridayButtonBaseProps["size"]>, string> = {
  xs: "h-3 w-3",
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-4 w-4",
  xl: "h-4 w-4",
  icon: "h-4 w-4",
  iconSm: "h-3.5 w-3.5",
  iconXs: "h-3 w-3",
  row: "h-3.5 w-3.5",
};

export function FridayButton({
  className,
  variant = "primary",
  size = "md",
  full = false,
  active = false,
  disabled = false,
  loading = false,
  ...props
}: FridayButtonProps) {
  const classes = cn(fridayBtn({ variant, size, full, active }), className);
  const isDisabled = disabled || loading;
  const loaderClass = LOADER_SIZE[size];

  if ("href" in props && props.href) {
    const { href, children, ...linkProps } = props;

    if (isDisabled) {
      return (
        <span
          className={cn(classes, "cursor-not-allowed opacity-50 pointer-events-none")}
          aria-disabled="true"
          role="link"
        >
          {loading ? <Loader2 className={cn(loaderClass, "animate-spin")} aria-hidden /> : null}
          {children}
        </span>
      );
    }

    return (
      <Link href={href} className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const { type = "button", children, ...buttonProps } = props as FridayButtonAsButton;

  return (
    <button
      type={type}
      className={classes}
      disabled={isDisabled}
      aria-busy={loading}
      aria-pressed={active || undefined}
      {...buttonProps}
    >
      {loading ? <Loader2 className={cn(loaderClass, "animate-spin")} aria-hidden /> : null}
      {children}
    </button>
  );
}
