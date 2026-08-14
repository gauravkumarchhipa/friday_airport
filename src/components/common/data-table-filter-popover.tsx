"use client";

import { Filter } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import FormDateFilter from "@/components/common/form-date-filter";
import FormInput from "@/components/common/form-input";
import FormSelect from "@/components/common/form-select";
import { FridayButton } from "@/components/common/friday-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  createEmptyFilterValue,
  filterValuesEqual,
  getAppliedFilterBaseline,
  isFilterActive,
  isFilterValueEmpty,
  validateFilterValue,
  type DataTableColumnFilterConfig,
  type TableColumnFilterValue,
  type TableFilterState,
} from "@/lib/common/table-filter";
import { cn } from "@/lib/common/utils";

type DataTableFilterPopoverProps = {
  columnId: string;
  label: string;
  align?: "left" | "center" | "right";
  config: DataTableColumnFilterConfig;
  filterState: TableFilterState;
  onApply: (columnId: string, value: TableColumnFilterValue) => void;
  onClear: (columnId: string) => void;
  className?: string;
};

function cloneFilterValue(value: TableColumnFilterValue): TableColumnFilterValue {
  if (value.type === "multiselect") {
    return { type: "multiselect", value: [...value.value] };
  }
  if (value.type === "date") {
    return { ...value };
  }
  return { ...value };
}

function FilterField({
  config,
  draft,
  error,
  onDraftChange,
  ariaLabel,
}: {
  config: DataTableColumnFilterConfig;
  draft: TableColumnFilterValue;
  error?: string;
  onDraftChange: (next: TableColumnFilterValue) => void;
  ariaLabel: string;
}) {
  const placeholderBase = config.label ?? config.placeholder ?? ariaLabel;

  if (draft.type === "text") {
    return (
      <FormInput
        aria-label={ariaLabel}
        value={draft.value}
        onValueChange={(value) => onDraftChange({ type: "text", value })}
        placeholder={config.placeholder ?? `Enter ${placeholderBase}`}
        surface="transparent"
        inputSize="md"
        minLength={config.minLength}
        maxLength={config.maxLength}
        error={error}
      />
    );
  }

  if (draft.type === "number") {
    return (
      <FormInput
        aria-label={ariaLabel}
        value={draft.value}
        onValueChange={(value) => onDraftChange({ type: "number", value })}
        placeholder={config.placeholder ?? `Enter ${placeholderBase}`}
        surface="transparent"
        inputSize="md"
        numberType
        error={error}
      />
    );
  }

  if (draft.type === "date") {
    return (
      <FormDateFilter
        config={config}
        draft={draft}
        error={error}
        onDraftChange={onDraftChange}
        hideFieldLabel
      />
    );
  }

  if (draft.type === "select") {
    return (
      <FormSelect
        mode="single"
        options={config.options ?? []}
        value={draft.value}
        onValueChange={(value) => onDraftChange({ type: "select", value })}
        placeholder={config.placeholder ?? `Select ${placeholderBase}`}
        surface="transparent"
        inputSize="md"
        error={error}
      />
    );
  }

  return (
    <FormSelect
      mode="multiple"
      options={config.options ?? []}
      value={draft.value}
      onValueChange={(value) => onDraftChange({ type: "multiselect", value })}
      placeholder={config.placeholder ?? `Select ${placeholderBase}`}
      surface="transparent"
      inputSize="md"
      error={error}
    />
  );
}

export function DataTableFilterPopover({
  columnId,
  label,
  align = "left",
  config,
  filterState,
  onApply,
  onClear,
  className,
}: DataTableFilterPopoverProps) {
  const applied = filterState[columnId];
  const active = isFilterActive(filterState, columnId);

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<TableColumnFilterValue>(() =>
    getAppliedFilterBaseline(applied, config.type, config),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(getAppliedFilterBaseline(applied, config.type, config));
    setError(null);
  }, [applied, config, open]);

  const appliedBaseline = getAppliedFilterBaseline(applied, config.type, config);
  const hasDraftChanged = !filterValuesEqual(draft, appliedBaseline);
  const canApply = hasDraftChanged;

  const handleApply = useCallback(() => {
    const validationError = validateFilterValue(draft, config);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (isFilterValueEmpty(draft)) {
      onClear(columnId);
    } else {
      onApply(columnId, cloneFilterValue(draft));
    }

    setError(null);
    setOpen(false);
  }, [columnId, config, draft, onApply, onClear]);

  const handleClear = useCallback(() => {
    setDraft(createEmptyFilterValue(config.type, config));
    setError(null);
    onClear(columnId);
    setOpen(false);
  }, [columnId, config, onClear]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Filter ${label}`}
          aria-pressed={active}
          className={cn(
            "inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md",
            "transition-colors duration-200 hover:bg-white/[0.06]",
            active ? "text-white" : "text-white/60 hover:text-white/80",
            align === "center" && "mx-auto",
            className,
          )}
        >
          <Filter
            className="h-3.5 w-3.5"
            strokeWidth={active ? 2 : 1.75}
            aria-hidden
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align={align === "right" ? "end" : align === "center" ? "center" : "start"}
        sideOffset={6}
        collisionPadding={8}
        sticky="always"
        avoidCollisions
        className={cn(
          config.type === "date"
            ? "w-[min(calc(100vw-1rem),22rem)]"
            : "w-[min(calc(100vw-1rem),18rem)]",
          "data-table-filter-popover",
          "flex max-w-[calc(100vw-1rem)] flex-col overflow-hidden",
          "rounded-none border border-white/12 p-0",
          "bg-[linear-gradient(160deg,#101f23_0%,#0c1b1e_48%,#081214_100%)]",
          "text-white shadow-[0_16px_40px_rgba(0,0,0,0.45)]",
        )}
        style={{
          maxHeight:
            "min(calc(100dvh - 1rem), var(--radix-popover-content-available-height))",
        }}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="shrink-0 border-b border-white/[0.08] px-4 py-3">
          <p className="text-sm font-semibold text-white">{label}</p>
        </div>

        <div className="friday-slim-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4">
          <FilterField
            config={config}
            draft={draft}
            error={error ?? undefined}
            ariaLabel={label}
            onDraftChange={(next) => {
              setDraft(next);
              if (error) setError(null);
            }}
          />
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-white/[0.08] bg-[#0c1b1e] px-3 py-3 sm:px-4">
          <FridayButton
            type="button"
            variant="dashboard"
            size="sm"
            onClick={handleClear}
            className="flex-1"
          >
            Clear
          </FridayButton>
          <FridayButton
            type="button"
            variant="gradient"
            size="sm"
            onClick={handleApply}
            disabled={!canApply}
            className="flex-1"
          >
            Apply
          </FridayButton>
        </div>
      </PopoverContent>
    </Popover>
  );
}
