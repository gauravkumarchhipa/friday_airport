"use client";

import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/common/utils";

/** Dark glass tooltip surface — matches dashboard sidebar theme */
export const glassTooltipContentClass =
  "z-50 overflow-hidden rounded-md border border-white/12 bg-[#0c1b1e]/92 px-2.5 py-1.5 text-xs font-medium tracking-wide text-white shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2";

export const GlassTooltipProvider = TooltipPrimitive.Provider;

export const GlassTooltip = TooltipPrimitive.Root;

export const GlassTooltipTrigger = TooltipPrimitive.Trigger;

export const GlassTooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 8, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(glassTooltipContentClass, className)}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
GlassTooltipContent.displayName = TooltipPrimitive.Content.displayName;

type GlassTooltipWrapProps = {
  label: string;
  children: React.ReactElement;
  side?: React.ComponentProps<typeof GlassTooltipContent>["side"];
  align?: React.ComponentProps<typeof GlassTooltipContent>["align"];
  contentClassName?: string;
  /** When false, renders children only (e.g. no tooltip needed). */
  enabled?: boolean;
  /**
   * Optional gate checked when Radix tries to open the tooltip.
   * Return false to block (e.g. expanded sidebar + label not truncated).
   */
  shouldOpen?: () => boolean;
};

/** Convenience wrapper — label on hover with glass styling */
export function GlassTooltipWrap({
  label,
  children,
  side = "right",
  align = "center",
  contentClassName,
  enabled = true,
  shouldOpen,
}: GlassTooltipWrapProps) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) setOpen(false);
  }, [enabled]);

  if (!enabled || !label.trim()) {
    return children;
  }

  return (
    <GlassTooltip
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setOpen(false);
          return;
        }
        if (shouldOpen && !shouldOpen()) {
          setOpen(false);
          return;
        }
        setOpen(true);
      }}
    >
      <GlassTooltipTrigger asChild>{children}</GlassTooltipTrigger>
      <GlassTooltipContent
        side={side}
        align={align}
        className={cn(
          "max-w-[min(24rem,calc(100vw-2rem))] whitespace-normal break-words",
          contentClassName,
        )}
      >
        {label}
      </GlassTooltipContent>
    </GlassTooltip>
  );
}
