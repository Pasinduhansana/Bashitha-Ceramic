"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

/**
 * Button — premium action component for the Bashitha Ceramics workspace.
 * All colors/shadows below reference tailwind.config.js tokens
 * (brand / ink / danger / shadow-glass-*) — no raw hex or arbitrary values.
 *
 * Variants:
 *  - primary    brand gradient, glass-edge ring, colored shadow
 *  - dark       ink gradient — alternate high-emphasis action
 *  - secondary  white, hairline border
 *  - outline    brand-outlined, transparent fill
 *  - ghost      no border/fill
 *  - danger     danger gradient — destructive actions
 *  - subtle     icon-only, muted
 */

const VARIANTS = {
  primary:
    "text-white bg-gradient-to-b from-brand-600 to-brand-800 hover:from-brand-600 hover:to-brand-900 " +
    "ring-1 ring-inset ring-white/10 " +
    "active:from-brand-800 active:to-brand-950 disabled:from-brand-700/50 disabled:to-brand-800/50",
  dark:
    "text-white bg-gradient-to-b from-ink-800 to-ink-950 hover:from-ink-800 hover:to-black " +
    "ring-1 ring-inset ring-white/10 " +
    "active:from-ink-950 active:to-black disabled:opacity-50",
  secondary:
    "text-neutral-700 bg-white border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 " +
    "active:bg-neutral-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700/60",
  outline:
    "text-brand-800 bg-transparent border border-brand-700/40 hover:bg-brand-50 hover:border-brand-700 " +
    "active:bg-brand-100 dark:text-brand-400 dark:border-brand-400/30 dark:hover:bg-brand-400/10",
  ghost:
    "text-neutral-600 bg-transparent hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 " +
    "dark:text-gray-400 dark:hover:bg-gray-700/60 dark:hover:text-white",
  danger:
    "text-white bg-gradient-to-b from-danger-600 to-danger-700 hover:from-danger-600 hover:to-danger-700 " +
    " ring-1 ring-inset ring-white/10 active:from-danger-700 active:to-danger-700 disabled:opacity-50",
  subtle:
    "text-neutral-400 bg-transparent hover:bg-neutral-100 hover:text-neutral-700 active:bg-neutral-200 " +
    "dark:text-gray-500 dark:hover:bg-gray-700/60 dark:hover:text-gray-200",
};

const SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-9 px-4 text-[13px] gap-2 rounded-xl",
  lg: "h-10 px-5 text-sm gap-2 rounded-xl",
  icon: "h-8 w-8 rounded-lg",
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
        "relative inline-flex items-center justify-center font-semibold tracking-wide",
        "transition-colors duration-150 select-none",
        "focus-visible:outline-none focus-visible:border-brand-600",
        "disabled:cursor-not-allowed",
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
          {Icon && iconPosition === "left" && <Icon className={isIconOnly ? "h-4 w-4" : "h-3.5 w-3.5 shrink-0"} />}
          {!isIconOnly && children && <span>{children}</span>}
          {Icon && iconPosition === "right" && <Icon className={isIconOnly ? "h-4 w-4" : "h-3.5 w-3.5 shrink-0"} />}
          {isIconOnly && Icon === undefined && children}
        </>
      )}
    </button>
  );
});

export default Button;

/* ————————————————————————————————————————————————
   Usage

   import Button from "@/components/ui/Button";
   import { Plus, Trash2, Settings } from "lucide-react";

   <Button variant="primary" icon={Plus}>Add Product</Button>
   <Button variant="dark" icon={Settings}>Manage</Button>
   <Button variant="secondary" size="sm">Cancel</Button>
   <Button variant="danger" size="icon" icon={Trash2} title="Delete" />
—————————————————————————————————————————————————— */