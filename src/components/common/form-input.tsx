"use client";

import * as React from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { usePathname } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isProtectedAppPath } from "@/lib/auth/protected-routes";
import { cn } from "@/lib/common/utils";

export interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  trimType?: "trim" | "trimStart";
  emailType?: boolean;
  numberType?: boolean;
  noSpecialChars?: boolean;
  isPassword?: boolean;
  onValueChange?: (val: string) => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  alphanumeric?: boolean;
  alphanumericCharacter?: boolean;
  /** Capitalize only the first letter of the value. Default `false`. */
  capitalize?: boolean;
  /** Capitalize the first letter of every word. Default `false`. */
  capital?: boolean;
  /**
   * Input height — matches `FridayButton` / `FormSelect`:
   * - `xs` — `h-8`
   * - `sm` — `h-9`
   * - `md` — `h-10`
   * - `lg` (default) — `h-11`
   * - `xl` — `h-12`
   */
  inputSize?: "xs" | "sm" | "md" | "lg" | "xl";
  /**
   * Input chrome:
   * - `underline` (default) — bottom border only
   * - `square` — full square border, no radius
   */
  variant?: "underline" | "square";
  floatingLabel?: boolean;
  showSuccess?: boolean;
  /** auto = transparent on /dashboard, filled elsewhere */
  surface?: "auto" | "filled" | "transparent";
}

/** Heights aligned with `fridayBtn` size scale in `@/lib/common/styles`. */
const INPUT_SIZE_STYLES = {
  xs: {
    input: "h-8 text-xs",
    action: "h-8 w-8",
    actionIcon: "h-3.5 w-3.5",
    squarePad: "px-2",
    leftPad: "pl-8",
    rightPad: "pr-10",
  },
  sm: {
    input: "h-9 text-sm",
    action: "h-9 w-9",
    actionIcon: "h-4 w-4",
    squarePad: "px-2.5",
    leftPad: "pl-9",
    rightPad: "pr-11",
  },
  md: {
    input: "h-10 text-sm",
    action: "h-10 w-10",
    actionIcon: "h-4 w-4",
    squarePad: "px-3",
    leftPad: "pl-10",
    rightPad: "pr-12",
  },
  lg: {
    input: "h-11 text-sm",
    action: "h-11 w-11",
    actionIcon: "h-5 w-5",
    squarePad: "px-3",
    leftPad: "pl-10",
    rightPad: "pr-12",
  },
  xl: {
    input: "h-12 text-sm",
    action: "h-12 w-12",
    actionIcon: "h-5 w-5",
    squarePad: "px-3",
    leftPad: "pl-10",
    rightPad: "pr-12",
  },
} as const;

const INPUT_VARIANT_STYLES = {
  underline: cn(
    "rounded-none border-0 border-b border-white/20 px-0",
    "hover:border-b-white/35 focus-visible:border-b-[#179b8c] focus-visible:ring-0 focus-visible:outline-none",
  ),
  square: cn(
    "rounded-none border border-white/20",
    "hover:border-white/35 focus-visible:border-[#179b8c] focus-visible:ring-0 focus-visible:outline-none",
  ),
} as const;

const INPUT_VARIANT_ERROR_STYLES = {
  underline: "border-b-red-500 focus-visible:border-b-red-500",
  square: "border-red-500 focus-visible:border-red-500",
} as const;

const INPUT_VARIANT_SUCCESS_STYLES = {
  underline: "border-b-emerald-500/60",
  square: "border-emerald-500/60",
} as const;

const INPUT_VARIANT_READONLY_STYLES = {
  underline: "cursor-not-allowed border-b-white/10 bg-transparent opacity-80 focus-visible:ring-0",
  square: "cursor-not-allowed border-white/10 bg-transparent opacity-80 focus-visible:ring-0",
} as const;

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      containerClassName,
      className,
      trimType,
      emailType = false,
      numberType = false,
      noSpecialChars = false,
      minLength,
      maxLength,
      isPassword = false,
      onValueChange,
      leftIcon,
      rightIcon,
      type = "text",
      readOnly,
      required = false,
      clearable = false,
      alphanumeric = false,
      alphanumericCharacter = false,
      capitalize = false,
      capital = false,
      inputSize = "lg",
      variant = "underline",
      floatingLabel = false,
      showSuccess = false,
      surface = "auto",
      id,
      value,
      onChange,
      onFocus,
      onBlur,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const pathname = usePathname();
    const isTransparentSurface =
      surface === "transparent" ||
      (surface === "auto" && isProtectedAppPath(pathname ?? ""));
    const [localValue, setLocalValue] = React.useState(String(value ?? ""));
    const [showPassword, setShowPassword] = React.useState(false);
    const [focused, setFocused] = React.useState(false);
    const [autofilled, setAutofilled] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement | null>(null);

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    React.useEffect(() => {
      setLocalValue(String(value ?? ""));
    }, [value]);

    const syncAutofillStyles = React.useCallback((el: HTMLInputElement | null) => {
      if (!el) return;
      let isAuto = false;
      try {
        isAuto = el.matches(":-webkit-autofill") || el.matches(":autofill");
      } catch {
        isAuto = false;
      }
      setAutofilled(isAuto);

      // Always force white value text on dark underline inputs (autofill or not)
      el.style.setProperty("-webkit-text-fill-color", "#ffffff", "important");
      el.style.setProperty("color", "#ffffff", "important");
      el.style.setProperty("caret-color", "#ffffff", "important");

      if (isAuto) {
        el.style.setProperty(
          "box-shadow",
          isTransparentSurface
            ? "0 0 0 1000px transparent inset"
            : "0 0 0 1000px #0c1b1e inset",
          "important",
        );
        el.classList.add("is-autofilled");
      } else {
        el.style.removeProperty("box-shadow");
        el.classList.remove("is-autofilled");
      }
    }, [isTransparentSurface]);

    React.useEffect(() => {
      syncAutofillStyles(inputRef.current);
    }, [localValue, syncAutofillStyles]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;

      if (emailType || isPassword || type === "email" || type === "password") {
        if (emailType || type === "email") {
          val = val.replace(/\s+/g, "").toLowerCase();
        } else {
          val = val.replace(/\s+/g, "");
        }
      } else {
        const mode = trimType || "trimStart";
        if (mode === "trim") {
          val = val.replace(/\s+/g, "").trim();
        } else {
          val = val.replace(/^\s+/, "").replace(/\s{2,}/g, " ");
        }
      }

      if (noSpecialChars) {
        val = val.replace(/[^a-zA-Z0-9-_ ]/g, "");
      }

      if (alphanumeric) {
        val = val
          .replace(/[^a-zA-Z0-9 ]/g, "")
          .replace(/^\s+/, "")
          .replace(/\s{2,}/g, " ");
      }

      if (alphanumericCharacter) {
        val = val
          .replace(/[^a-zA-Z ]/g, "")
          .replace(/^\s+/, "")
          .replace(/\s{2,}/g, " ");
      }

      if (numberType) {
        val = val.replace(/\D/g, "");
      }

      if (!(emailType || isPassword || type === "email" || type === "password")) {
        if (capital) {
          val = val.replace(/(^|\s)\S/g, (match) => match.toUpperCase());
        } else if (capitalize) {
          val = val.length > 0 ? val.charAt(0).toUpperCase() + val.slice(1) : val;
        }
      }

      if (maxLength && val.length > maxLength) {
        val = val.slice(0, maxLength);
      }

      setLocalValue(val);
      onValueChange?.(val);
      window.requestAnimationFrame(() => syncAutofillStyles(e.currentTarget));

      if (onChange) {
        const nextEvent = {
          ...e,
          target: { ...e.target, value: val },
          currentTarget: { ...e.currentTarget, value: val },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(nextEvent);
      }
    };

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isInvalidEmail = emailType && localValue && !emailPattern.test(localValue);
    const isValidEmail = emailType && localValue && emailPattern.test(localValue);
    const successVisible = showSuccess && isValidEmail && !error && !isInvalidEmail;
    const floatActive = focused || Boolean(localValue);

    const inputType =
      isPassword || type === "password" ? (showPassword ? "text" : "password") : type;

    const hasLeftIcon = Boolean(leftIcon);
    const hasRightAction = Boolean(
      isPassword || type === "password" || rightIcon || clearable || successVisible,
    );
    const sizeStyles = INPUT_SIZE_STYLES[inputSize];

    return (
      <div className={cn("flex w-full flex-col gap-2.5", containerClassName)}>
        {label && !floatingLabel ? (
          <Label htmlFor={inputId} className="block text-sm font-medium leading-normal text-white/80">
            {label}
            {required ? <span className="ml-0.5 text-red-400">*</span> : null}
          </Label>
        ) : null}

        <div className="relative">
          {floatingLabel && label ? (
            <Label
              htmlFor={inputId}
              className={cn(
                "pointer-events-none absolute z-10 origin-left px-1 transition-all duration-200",
                hasLeftIcon ? "left-9" : "left-3",
                floatActive
                  ? "top-0 -translate-y-1/2 bg-[#0a0f16] text-[11px] font-medium text-[#6ec8ff]"
                  : "top-1/2 -translate-y-1/2 text-sm text-white/45",
              )}
            >
              {label}
              {required ? <span className="ml-0.5 text-red-400">*</span> : null}
            </Label>
          ) : null}

          {hasLeftIcon ? (
            <div
              className={cn(
                "pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 transition-colors",
                focused ? "text-[#179b8c]" : "text-white/45",
              )}
            >
              {leftIcon}
            </div>
          ) : null}

          <Input
            {...props}
            id={inputId}
            ref={inputRef}
            value={localValue}
            onChange={handleChange}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              // Chrome finalizes autofill styles after blur
              const el = e.currentTarget;
              requestAnimationFrame(() => syncAutofillStyles(el));
              window.setTimeout(() => syncAutofillStyles(el), 0);
              window.setTimeout(() => syncAutofillStyles(el), 80);
              onBlur?.(e);
            }}
            onAnimationStart={(e) => {
              if (String(e.animationName).includes("friday-autofill")) {
                syncAutofillStyles(e.currentTarget);
              }
            }}
            type={inputType}
            readOnly={readOnly}
            required={required}
            minLength={minLength}
            maxLength={maxLength}
            placeholder={floatingLabel ? (floatActive ? placeholder : " ") : placeholder}
            className={cn(
              "browser-border-none w-full text-white placeholder:text-white/30",
              sizeStyles.input,
              INPUT_VARIANT_STYLES[variant],
              variant === "square" && sizeStyles.squarePad,
              isTransparentSurface ? "form-input-surface-transparent bg-transparent" : "bg-[#0c1b1e]",
              "transition-[border-color] duration-200",
              "selection:bg-[#179b8c] selection:text-white",
              autofilled && "is-autofilled",
              hasLeftIcon && sizeStyles.leftPad,
              hasRightAction && sizeStyles.rightPad,
              error && INPUT_VARIANT_ERROR_STYLES[variant],
              successVisible && INPUT_VARIANT_SUCCESS_STYLES[variant],
              readOnly && INPUT_VARIANT_READONLY_STYLES[variant],
              className,
            )}
          />

          {successVisible ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400">
              <Check className={sizeStyles.actionIcon} />
            </div>
          ) : null}

          {isPassword || type === "password" ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className={cn(
                "absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-md cursor-pointer text-white/45 transition-colors hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#179b8c]/80",
                sizeStyles.action,
              )}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className={sizeStyles.actionIcon} />
              ) : (
                <Eye className={sizeStyles.actionIcon} />
              )}
            </button>
          ) : null}

          {clearable && localValue && !isPassword && type !== "password" && !successVisible ? (
            <button
              type="button"
              onClick={() => {
                setLocalValue("");
                onValueChange?.("");
                onChange?.({
                  target: { value: "" },
                  currentTarget: { value: "" },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              className={cn(
                "absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-md cursor-pointer text-white/45 transition-colors hover:text-white/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#179b8c]/80",
                sizeStyles.action,
              )}
              aria-label="Clear input"
            >
              <X className={sizeStyles.actionIcon} />
            </button>
          ) : null}

          {rightIcon && !isPassword && type !== "password" && !successVisible ? (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/45">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="mt-1 text-xs text-red-400">{error}</p>
        ) : isInvalidEmail ? (
          <p className="mt-1 text-xs text-red-400">Enter a valid email address</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-white/45">{helperText}</p>
        ) : null}
      </div>
    );
  },
);

FormInput.displayName = "FormInput";

export default FormInput;
