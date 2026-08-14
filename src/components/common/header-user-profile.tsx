import { cn } from "@/lib/common/utils";

export function HeaderUserProfile({
  name = "Ops Admin",
  initials = "OA",
  className,
}: {
  name?: string;
  initials?: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center gap-2.5", className)}
      aria-label={`Signed in as ${name}`}
    >
      <span className="hidden text-sm text-white/70 sm:inline">{name}</span>
      <span
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          "border border-white/40 bg-[#15202b] text-[11px] font-semibold tracking-wide text-white",
          "shadow-[0_0_0_1px_rgba(255,255,255,0.04)]",
        )}
        title={name}
      >
        {initials}
      </span>
    </div>
  );
}
