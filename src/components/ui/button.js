"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

/**
 * Button — shared action component for the Bashitha Ceramics inventory workspace.
 *
 * Variants:
 *  - primary    solid teal, for the one primary action in a row/section
 *  - secondary  white with a hairline border, for standard secondary actions
 *  - outline    teal outline, for actions that need presence without full weight
 *  - ghost      no border/fill, for low-emphasis actions inline with text
 *  - danger     rose, for destructive actions (delete, remove)
 *  - subtle     icon-only, muted — for row-level utility icons (more menu, etc.)
 *
 * Sizes: sm | md | lg | icon
 */

const VARIANTS = {
  primary:
    "bg-teal-800 text-white shadow-sm shadow-teal-900/20 hover:bg-teal-900 active:bg-teal-950 disabled:bg-teal-800/50",
  secondary:
    "bg-white text-neutral-700 border border-neutral-200 shadow-sm hover:bg-neutral-50 hover:border-neutral-300 active:bg-neutral-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700/60",
  outline:
    "bg-transparent text-teal-800 border border-teal-700/40 hover:bg-teal-50 hover:border-teal-700 active:bg-teal-100 dark:text-teal-400 dark:border-teal-400/30 dark:hover:bg-teal-400/10",
  ghost:
    "bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 dark:text-gray-400 dark:hover:bg-gray-700/60 dark:hover:text-white",
  danger:
    "bg-rose-600 text-white shadow-sm shadow-rose-900/20 hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-600/50",
  subtle:
    "bg-transparent text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 active:bg-neutral-200 dark:text-gray-500 dark:hover:bg-gray-700/60 dark:hover:text-gray-200",
};

const SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-10 px-4 text-[13px] gap-2 rounded-lg",
  lg: "h-11 px-5 text-sm gap-2 rounded-lg",
  icon: "h-9 w-9 rounded-lg",
};

const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    icon: Icon,
    iconPosition = "left",
    loading = false,
    fullWidth = false,
    className = "",
    disabled = false,
    ...props
  },
  ref,
) {
  const isIconOnly = size === "icon";

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center font-semibold tracking-wide",
        "transition-all duration-150 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <Loader2 className={isIconOnly ? "h-4 w-4 animate-spin" : "h-3.5 w-3.5 animate-spin"} />
      ) : (
        <>
          {Icon && iconPosition === "left" && (
            <Icon className={isIconOnly ? "h-4 w-4" : "h-3.5 w-3.5 shrink-0"} />
          )}
          {!isIconOnly && children && <span>{children}</span>}
          {Icon && iconPosition === "right" && (
            <Icon className={isIconOnly ? "h-4 w-4" : "h-3.5 w-3.5 shrink-0"} />
          )}
          {isIconOnly && Icon === undefined && children}
        </>
      )}
    </button>
  );
});

export default Button;
