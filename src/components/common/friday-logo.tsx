import { cn } from "@/lib/common/utils";

type LogoProps = {
  size?: number;
  wordmarkSize?: "default" | "sm";
  className?: string;
};

function LogoWordmark({
  wordmarkSize = "default",
  className,
}: {
  wordmarkSize?: "default" | "sm";
  className?: string;
}) {
  return (
    <span className={cn("inline-flex shrink-0", className)}>
      {/* Native img keeps SVG masks/patterns stable — next/image can break the cat icon */}
      <img
        src="/logo/logodark.svg"
        alt="Friday"
        width={755}
        height={270}
        decoding="async"
        fetchPriority="high"
        className={cn(
          "w-auto shrink-0",
          wordmarkSize === "sm" ? "h-8" : "h-10 sm:h-11 md:h-12",
        )}
      />
    </span>
  );
}

export function FridayLogo({ size, wordmarkSize, className }: LogoProps) {
  if (size !== undefined && size <= 28) {
    return (
      <span className={cn("inline-flex shrink-0 items-center", className)}>
        <img
          src="/logo/mobilelogodark.svg"
          alt="Friday"
          width={size}
          height={size}
          decoding="async"
          fetchPriority="high"
          className="shrink-0"
          style={{ width: size, height: size }}
        />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex shrink-0 items-center", className)}>
      <LogoWordmark wordmarkSize={wordmarkSize} />
    </span>
  );
}
