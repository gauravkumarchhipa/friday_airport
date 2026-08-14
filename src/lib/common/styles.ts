import { cva } from "class-variance-authority";

/**
 * Font roles — single source of truth for the Friday design system.
 *
 * | Element          | Font              |
 * |------------------|-------------------|
 * | Logo             | Cormorant Garamond (image asset) |
 * | Hero / sections  | Cormorant Garamond |
 * | Descriptions     | Inter             |
 * | Navbar           | Inter             |
 * | Buttons          | Inter             |
 * | Cards            | Inter             |
 * | Statistics       | Inter SemiBold    |
 */
export const font = {
  heading: "font-heading",
  body: "font-sans",
  stat: "font-sans font-semibold",
} as const;

export const section = cva("bg-black", {
  variants: {
    relative: { true: "relative", false: "" },
    overflow: { hidden: "overflow-hidden", visible: "" },
  },
  defaultVariants: { relative: false, overflow: "visible" },
});

export const panel = cva(
  `${font.body} rounded-none border border-transparent bg-[linear-gradient(160deg,#101f23_0%,#0c1b1e_48%,#081214_100%)] transition-colors duration-200 hover:border-white/35`,
  {
    variants: {
      padding: { none: "", sm: "p-5", md: "p-6", lg: "p-8", xl: "p-10" },
      hover: { true: "hover:border-white/40", false: "" },
      rounded: { none: "rounded-none", xl: "rounded-xl", "2xl": "rounded-2xl" },
    },
    defaultVariants: { padding: "md", hover: false, rounded: "none" },
  },
);

/** Cormorant Garamond — hero & section headings */
export const heading = cva(`${font.heading} font-bold text-white`, {
  variants: {
    size: {
      hero: "text-[2.25rem] sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight",
      section: "text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1]",
      page: "text-[1.65rem] sm:text-3xl md:text-4xl lg:text-6xl leading-[1.1] tracking-tight",
    },
    align: { left: "text-left", center: "text-center" },
    preline: { true: "whitespace-pre-line leading-[1.05] tracking-tight", false: "" },
  },
  defaultVariants: { size: "section", align: "left", preline: false },
});

/** Inter SemiBold — statistics & metrics */
export const statValue = cva(`${font.stat} text-white`, {
  variants: {
    size: {
      hero: "text-6xl md:text-8xl leading-none",
      lg: "text-3xl",
    },
    align: { left: "text-left", center: "text-center" },
  },
  defaultVariants: { size: "hero", align: "left" },
});

/** Inter — dashboard & utility page titles */
export const pageTitle = cva(`${font.body} font-bold text-white`, {
  variants: {
    size: {
      lg: "text-3xl md:text-4xl",
      md: "text-lg font-semibold",
    },
  },
  defaultVariants: { size: "lg" },
});

/** Inter — card titles & compact headings inside cards */
export const cardTitle = cva(`${font.body} font-bold text-white`, {
  variants: {
    size: {
      lg: "text-2xl leading-tight",
      md: "text-xl leading-tight",
      sm: "font-semibold",
    },
    preline: { true: "whitespace-pre-line", false: "" },
  },
  defaultVariants: { size: "lg", preline: false },
});

/** Inter — body copy & descriptions */
export const description = cva(`${font.body} leading-relaxed text-white/70`, {
  variants: {
    size: { md: "text-base", sm: "text-sm" },
  },
  defaultVariants: { size: "md" },
});

/** Inter — navbar links & actions */
export const navText = cva(`${font.body} font-medium transition-colors`, {
  variants: {
    size: { link: "text-[15px]", action: "text-sm" },
  },
  defaultVariants: { size: "link" },
});

export const tabBtn = cva(`${font.body} pb-3 text-sm transition-colors`, {
  variants: {
    active: {
      true: "text-white border-b-2 border-white -mb-px",
      false: "text-white/50 hover:text-white/80",
    },
  },
});

/** Cormorant Garamond — large section tab labels (Speed / Scale / Sovereignty) */
export const selectorBtn = cva(`${font.heading} transition-colors font-semibold`, {
  variants: {
    active: { true: "text-white", false: "text-white/30 hover:text-white/60" },
    size: { lg: "text-3xl md:text-4xl", md: "text-sm" },
  },
  defaultVariants: { size: "lg" },
});

/** Inter — all buttons (always cursor-pointer when enabled) */
export const fridayBtn = cva(
  `${font.body} inline-flex items-center justify-center gap-2 rounded-none font-semibold transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none`,
  {
    variants: {
      variant: {
        primary:
          "bg-[#1a8cff] text-white enabled:hover:bg-[#1a8cff]/90",
        outline:
          "border border-white/60 text-white enabled:hover:bg-white/10",
        ghost:
          "border border-white/70 text-white enabled:hover:bg-white/10",
        dashboard:
          "border border-white/15 bg-[#0c1b1e] text-white/80 enabled:hover:border-white/30",
        gradient:
          "bg-gradient-to-r from-[#11564f] to-[#179b8c] text-white enabled:hover:brightness-110 enabled:active:brightness-95",
        action:
          "font-medium text-white/70 enabled:hover:bg-white/5 enabled:hover:text-white",
        actionOutline:
          "border border-white/15 font-medium text-white/70 enabled:hover:bg-white/5 enabled:hover:text-white",
        danger:
          "border border-red-500/35 font-medium text-red-400 enabled:hover:bg-red-500/10",
        /** Quiet text/icon actions (sidebar rows, legend, links-as-buttons). */
        soft:
          "font-medium text-white/65 enabled:hover:bg-white/[0.06] enabled:hover:text-white",
        /** Header / panel chrome (Viewer, Sources, Memory, collapse). */
        toolbar:
          "border border-white/15 font-medium text-white/70 enabled:hover:border-white/30 enabled:hover:text-white",
      },
      size: {
        xs: "h-auto min-h-0 gap-1 px-2 py-1 text-xs",
        sm: "h-9 px-4 text-sm",
        md: "h-10 px-5 text-sm",
        lg: "h-11 px-6 text-sm",
        xl: "h-12 px-6 text-sm",
        /** Square icon control (8×8). */
        icon: "h-8 w-8 gap-0 p-0",
        /** Square icon control (7×7). */
        iconSm: "h-7 w-7 gap-0 p-0",
        /** Square icon control (6×6). */
        iconXs: "h-6 w-6 gap-0 p-0",
        /** Full-width list row (sidebar chats / folders). */
        row: "h-auto min-h-0 w-full justify-start gap-2 px-2.5 py-2 text-left text-[13px] font-normal",
      },
      full: { true: "w-full", false: "" },
      active: {
        true: "border-white/40 bg-white/[0.08] text-white",
        false: "",
      },
    },
    defaultVariants: { variant: "primary", size: "md", full: false, active: false },
  },
);


export const inputField = cva(
  `${font.body} rounded-md border border-white/15 bg-[#0a0a0a] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#1a8cff]`,
  { variants: { size: { md: "h-10 px-3", lg: "h-11 px-3" } }, defaultVariants: { size: "md" } },
);

export const navLink = cva(`${font.body} cursor-pointer rounded text-white/70 transition-colors hover:text-white hover:bg-white/5`, {
  variants: {
    active: { true: "bg-white/5 text-white", false: "" },
    layout: { row: "flex items-center gap-3 px-3 py-2", block: "block px-3 py-1.5" },
  },
  defaultVariants: { active: false, layout: "row" },
});

export const statusBadge = cva(`${font.body} rounded-full border text-xs`, {
  variants: {
    tone: {
      success: "border-emerald-500/20 bg-emerald-500/15 text-emerald-300",
      accent: "border-[#1a8cff]/40 bg-[#1a8cff]/20 text-[#1a8cff]",
    },
    size: { sm: "px-3 py-1.5", xs: "px-2 py-0.5 text-[10px]" },
  },
});

export const text = {
  muted: "text-white/70",
  subtle: "text-white/60",
  faint: "text-white/50",
  accent: "text-[#1a8cff]",
} as const;

/** After-login dashboard surfaces — shared by panels, sidebar, notifications. */
export const dashboard = {
  surface:
    "bg-[linear-gradient(160deg,#101f23_0%,#0c1b1e_48%,#081214_100%)]",
  surfaceSolid: "bg-[#0c1b1e]",
  border: "border-white/[0.08]",
  borderStrong: "border-white/12",
  textMuted: "text-white/45",
  textSubtle: "text-white/70",
  teal: "text-[#9dddd4]",
  tealAccent: "text-[#179b8c]",
  tealBg: "bg-[#179b8c]/15",
  tealBorder: "border-[#179b8c]/35",
} as const;

export const landingNavbar = cva(
  `${font.body} fixed inset-x-0 top-0 z-50 border-b transition-[transform,background-color,backdrop-filter,border-color,padding,box-shadow] duration-300 ease-out`,
  {
    variants: {
      visible: { true: "translate-y-0", false: "-translate-y-full pointer-events-none" },
      atTop: {
        true: "border-transparent bg-transparent py-6 shadow-none",
        false: "border-white/20 bg-black/85 py-4 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-md",
      },
    },
    defaultVariants: { visible: true, atTop: true },
  },
);
