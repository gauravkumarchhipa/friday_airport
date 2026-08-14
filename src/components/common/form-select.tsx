"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";

import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { isProtectedAppPath } from "@/lib/auth/protected-routes";
import { cn } from "@/lib/common/utils";

export type FormSelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type FormSelectBaseProps = {
  options: FormSelectOption[];
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Enable search / autocomplete filtering. Default true. */
  searchable?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** Show clear (X) when there is a selection. Default true. */
  clearable?: boolean;
  /**
   * Trigger size — heights match `FridayButton`:
   * - `xs` — compact (`h-8`)
   * - `sm` — `h-9`
   * - `md` — `h-10`
   * - `lg` (default) — `h-11`
   * - `xl` — `h-12`
   */
  inputSize?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Trigger chrome:
   * - `underline` (default) — bottom border only
   * - `square` — full square border, no radius
   */
  variant?: "underline" | "square";
  className?: string;
  containerClassName?: string;
  /** Maximum height / scroll styles for the options list. */
  optionsClassName?: string;
  /** Extra classes for the dropdown popover panel. */
  contentClassName?: string;
  /** Preferred popover side for options panel. Default "bottom". */
  dropdownSide?: "top" | "right" | "bottom" | "left";
  /** Whether popover should auto-flip to avoid collisions. Default true. */
  avoidCollisions?: boolean;
  /** Show leading check / checkbox indicator in options. Default true. */
  showOptionIndicator?: boolean;
  /** Accessible name when no visible `label` is provided (Lighthouse / screen readers). */
  "aria-label"?: string;
  id?: string;
  /** auto = transparent on /dashboard, filled elsewhere */
  surface?: "auto" | "filled" | "transparent";
};

/** Heights aligned with `fridayBtn` size scale in `@/lib/common/styles`. */
const TRIGGER_SIZE_STYLES = {
  xs: {
    trigger: "h-8 text-xs",
    squarePad: "px-2",
    clear: "h-5 w-5",
    clearIcon: "h-3 w-3",
    chevron: "h-3 w-3",
  },
  sm: {
    trigger: "h-9 text-sm",
    squarePad: "px-2.5",
    clear: "h-5 w-5",
    clearIcon: "h-3.5 w-3.5",
    chevron: "h-3.5 w-3.5",
  },
  md: {
    trigger: "h-10 text-sm",
    squarePad: "px-3",
    clear: "h-6 w-6",
    clearIcon: "h-3.5 w-3.5",
    chevron: "h-4 w-4",
  },
  lg: {
    trigger: "h-11 text-sm",
    squarePad: "px-3",
    clear: "h-6 w-6",
    clearIcon: "h-3.5 w-3.5",
    chevron: "h-4 w-4",
  },
  xl: {
    trigger: "h-12 text-sm",
    squarePad: "px-3",
    clear: "h-6 w-6",
    clearIcon: "h-3.5 w-3.5",
    chevron: "h-4 w-4",
  },
} as const;

const TRIGGER_VARIANT_STYLES = {
  underline: cn(
    "rounded-none border-0 border-b border-white/20 px-0",
    "transition-[border-color] duration-200",
    "hover:border-b-white/35 focus-visible:border-b-[#179b8c] focus-visible:outline-none",
  ),
  square: cn(
    "rounded-none border border-white/20",
    "transition-[border-color] duration-200",
    "hover:border-white/35 focus-visible:border-[#179b8c] focus-visible:outline-none",
  ),
} as const;

const TRIGGER_VARIANT_ERROR_STYLES = {
  underline: "border-b-red-500 focus-visible:border-b-red-500",
  square: "border-red-500 focus-visible:border-red-500",
} as const;

export type FormSelectSingleProps = FormSelectBaseProps & {
  mode?: "single";
  value?: string | null;
  onValueChange?: (value: string | null) => void;
  /** Not used in single mode. */
  selectAll?: never;
};

export type FormSelectMultipleProps = FormSelectBaseProps & {
  mode: "multiple";
  value?: string[];
  onValueChange?: (value: string[]) => void;
  /** Show Select all / Unselect all actions. Default true in multiple mode. */
  selectAll?: boolean;
};

export type FormSelectProps = FormSelectSingleProps | FormSelectMultipleProps;

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

function FormSelectComponent(props: FormSelectProps) {
  const {
    options,
    label,
    error,
    helperText,
    placeholder = "Select…",
    searchPlaceholder = "Search…",
    emptyMessage = "No results found.",
    searchable = true,
    disabled = false,
    required = false,
    clearable = true,
    inputSize = "lg",
    variant = "underline",
    className,
    containerClassName,
    optionsClassName,
    contentClassName,
      dropdownSide = "bottom",
      avoidCollisions = true,
    showOptionIndicator = true,
    id,
    surface = "auto",
    "aria-label": ariaLabelProp,
  } = props;

  const pathname = usePathname();
  const isTransparentSurface =
    surface === "transparent" ||
    (surface === "auto" && isProtectedAppPath(pathname ?? ""));

  const isMultiple = props.mode === "multiple";
  const showSelectAll = isMultiple && (props.selectAll ?? true);

  const selectedValues = React.useMemo(() => {
    if (isMultiple) {
      return Array.isArray(props.value) ? props.value : [];
    }
    return props.value ? [props.value] : [];
  }, [isMultiple, props.value]);

  const generatedId = React.useId();
  const triggerId = id ?? generatedId;
  const listboxId = `${triggerId}-listbox`;

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const listboxRef = React.useRef<HTMLDivElement>(null);

  const optionByValue = React.useMemo(() => {
    const map = new Map<string, FormSelectOption>();
    for (const option of options) map.set(option.value, option);
    return map;
  }, [options]);

  const filteredOptions = React.useMemo(() => {
    const q = normalizeQuery(query);
    if (!q) return options;
    return options.filter(
      (option) =>
        normalizeQuery(option.label).includes(q) ||
        normalizeQuery(option.value).includes(q),
    );
  }, [options, query]);

  const enabledFiltered = React.useMemo(
    () => filteredOptions.filter((option) => !option.disabled),
    [filteredOptions],
  );

  const selectedLabels = selectedValues
    .map((value) => optionByValue.get(value)?.label ?? value)
    .filter(Boolean);

  const allFilteredSelected =
    enabledFiltered.length > 0 &&
    enabledFiltered.every((option) => selectedValues.includes(option.value));
  const selectedValueKey = selectedValues.join("\u0000");

  React.useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveIndex(0);
      return;
    }

    const selectedIndex = options.findIndex((option) =>
      selectedValues.includes(option.value),
    );
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);

    const timer = window.setTimeout(() => {
      searchRef.current?.focus();
      listboxRef.current
        ?.querySelector<HTMLElement>('[aria-selected="true"]')
        ?.scrollIntoView({ block: "center" });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [open, options, selectedValueKey, selectedValues]);

  React.useEffect(() => {
    if (activeIndex >= filteredOptions.length) {
      setActiveIndex(Math.max(0, filteredOptions.length - 1));
    }
  }, [activeIndex, filteredOptions.length]);

  const emitSingle = (next: string | null) => {
    if (props.mode === "multiple") return;
    props.onValueChange?.(next);
  };

  const emitMultiple = (next: string[]) => {
    if (props.mode !== "multiple") return;
    props.onValueChange?.(next);
  };

  const toggleValue = (value: string) => {
    const option = optionByValue.get(value);
    if (!option || option.disabled || disabled) return;

    if (!isMultiple) {
      emitSingle(value);
      setOpen(false);
      return;
    }

    const exists = selectedValues.includes(value);
    emitMultiple(
      exists
        ? selectedValues.filter((item) => item !== value)
        : [...selectedValues, value],
    );
  };

  const clearSelection = (event?: React.MouseEvent) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (disabled) return;
    if (isMultiple) emitMultiple([]);
    else emitSingle(null);
  };

  const selectAllFiltered = () => {
    if (!isMultiple || disabled) return;
    const next = new Set(selectedValues);
    for (const option of enabledFiltered) next.add(option.value);
    emitMultiple([...next]);
  };

  const unselectAllFiltered = () => {
    if (!isMultiple || disabled) return;
    const filteredSet = new Set(enabledFiltered.map((option) => option.value));
    emitMultiple(selectedValues.filter((value) => !filteredSet.has(value)));
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };

  const handleListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) =>
        filteredOptions.length === 0 ? 0 : Math.min(prev + 1, filteredOptions.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const option = filteredOptions[activeIndex];
      if (option) toggleValue(option.value);
      return;
    }

    if (event.key === "a" && (event.metaKey || event.ctrlKey) && isMultiple) {
      event.preventDefault();
      if (allFilteredSelected) unselectAllFiltered();
      else selectAllFiltered();
    }
  };

  const triggerText = (() => {
    if (selectedLabels.length === 0) return null;
    if (!isMultiple) return selectedLabels[0];
    if (selectedLabels.length <= 2) return selectedLabels.join(", ");
    return `${selectedLabels.length} selected`;
  })();

  const accessibleName =
    ariaLabelProp?.trim() ||
    label?.trim() ||
    (triggerText ? String(triggerText) : null) ||
    placeholder ||
    "Select option";

  const sizeStyles = TRIGGER_SIZE_STYLES[inputSize];

  return (
    <div className={cn("flex w-full flex-col gap-2.5", containerClassName)}>
      {label ? (
        <Label
          htmlFor={triggerId}
          className="block text-sm font-medium leading-normal text-white/80"
        >
          {label}
          {required ? <span className="ml-0.5 text-red-400">*</span> : null}
        </Label>
      ) : null}

      <Popover open={open} onOpenChange={(next) => !disabled && setOpen(next)}>
        <PopoverTrigger asChild>
          <button
            id={triggerId}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls={listboxId}
            aria-haspopup="listbox"
            aria-label={accessibleName}
            disabled={disabled}
            onKeyDown={handleTriggerKeyDown}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 text-left text-white",
              sizeStyles.trigger,
              TRIGGER_VARIANT_STYLES[variant],
              variant === "square" && sizeStyles.squarePad,
              isTransparentSurface
                ? "form-input-surface-transparent bg-transparent"
                : "bg-[#0c1b1e]",
              error && TRIGGER_VARIANT_ERROR_STYLES[variant],
              disabled && "cursor-not-allowed opacity-60",
              className,
            )}
          >
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                !triggerText && "text-white/30",
              )}
            >
              {triggerText ?? placeholder}
            </span>

            {clearable && selectedValues.length > 0 && !disabled ? (
              <span
                role="button"
                tabIndex={-1}
                aria-label="Clear selection"
                className={cn(
                  "grid shrink-0 place-items-center text-white/45 transition-colors hover:text-white",
                  sizeStyles.clear,
                )}
                onClick={clearSelection}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    clearSelection();
                  }
                }}
              >
                <X className={sizeStyles.clearIcon} strokeWidth={1.75} />
              </span>
            ) : null}

            <ChevronDown
              className={cn(
                "shrink-0 text-white/45 transition-transform",
                sizeStyles.chevron,
                open && "rotate-180",
              )}
              strokeWidth={1.75}
              aria-hidden
            />
          </button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side={dropdownSide}
          sideOffset={6}
          collisionPadding={8}
          sticky="always"
          avoidCollisions={avoidCollisions}
          className={cn(
            "max-h-[calc(100dvh-1rem)] max-w-[min(24rem,calc(100vw-1rem))]",
            "min-w-[var(--radix-popover-trigger-width)] w-max rounded-none border border-white/12 p-0",
            "bg-[#0c1b1e] text-white shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
            contentClassName,
          )}
          onKeyDown={handleListKeyDown}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          {searchable ? (
            <div className="flex items-center gap-2 border-b border-white/10 px-3">
              <Search className="h-3.5 w-3.5 shrink-0 text-white/40" strokeWidth={1.75} />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
                aria-autocomplete="list"
                aria-controls={listboxId}
              />
              {query ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  className="grid h-6 w-6 place-items-center text-white/40 hover:text-white"
                  onClick={() => setQuery("")}
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              ) : null}
            </div>
          ) : null}

          {showSelectAll && enabledFiltered.length > 0 ? (
            <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
              <button
                type="button"
                className="text-xs font-medium text-white/70 transition-colors hover:text-white disabled:opacity-40"
                onClick={selectAllFiltered}
                disabled={allFilteredSelected}
              >
                Select all{query ? " filtered" : ""}
              </button>
              <button
                type="button"
                className="text-xs font-medium text-white/50 transition-colors hover:text-white disabled:opacity-40"
                onClick={unselectAllFiltered}
                disabled={selectedValues.length === 0}
              >
                Unselect all
              </button>
            </div>
          ) : null}

          <div
            ref={listboxRef}
            id={listboxId}
            role="listbox"
            aria-multiselectable={isMultiple}
            className={cn(
              "friday-slim-scrollbar max-h-60 overflow-y-auto py-1",
              optionsClassName,
            )}
          >
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-white/45">{emptyMessage}</p>
            ) : (
              filteredOptions.map((option, index) => {
                const selected = selectedValues.includes(option.value);
                const active = index === activeIndex;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    disabled={option.disabled}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                      selected
                        ? "bg-white/[0.08] text-white"
                        : "text-white/45",
                      active && !selected && "bg-white/[0.04]",
                      option.disabled
                        ? "cursor-not-allowed opacity-40"
                        : "cursor-pointer hover:bg-white/[0.06] hover:text-white",
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => toggleValue(option.value)}
                  >
                    {showOptionIndicator ? (
                      isMultiple ? (
                        <span
                          className={cn(
                            "grid h-4 w-4 shrink-0 place-items-center rounded-[2px] border",
                            selected
                              ? "border-white/70 bg-white text-[#0c1b1e]"
                              : "border-white/25 bg-transparent",
                          )}
                          aria-hidden
                        >
                          {selected ? (
                            <Check className="h-3 w-3" strokeWidth={2.5} />
                          ) : null}
                        </span>
                      ) : (
                        <span className="grid h-4 w-4 shrink-0 place-items-center" aria-hidden>
                          {selected ? (
                            <Check className="h-3.5 w-3.5 text-white" strokeWidth={2} />
                          ) : null}
                        </span>
                      )
                    ) : null}
                    <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  </button>
                );
              })
            )}
          </div>

          {isMultiple && selectedValues.length > 0 ? (
            <div className="border-t border-white/10 px-3 py-2 text-[11px] text-white/40">
              {selectedValues.length} selected
            </div>
          ) : null}
        </PopoverContent>
      </Popover>

      {error ? (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-white/45">{helperText}</p>
      ) : null}
    </div>
  );
}

/**
 * Common searchable select — single or multi, autocomplete search,
 * select all / unselect all, clearable.
 *
 * Variants: `underline` (default, bottom border) | `square` (full border, no radius).
 * Sizes: `xs` | `sm` | `md` | `lg` (default) | `xl` — heights match `FridayButton`.
 */
export const FormSelect = React.memo(FormSelectComponent);
FormSelect.displayName = "FormSelect";

export default FormSelect;
