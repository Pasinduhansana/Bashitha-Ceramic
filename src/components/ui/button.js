"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

/**
 * Button — premium action component for the Bashitha Ceramics workspace.
 *
 * Variants:
 *  - primary    deep teal gradient, glass-edge ring, colored shadow — the one
 *               emphasized action in a view (Add Product, Save, Submit)
 *  - dark       graphite/ink gradient — alternate high-emphasis action when
 *               teal is already used elsewhere on the same screen
 *  - secondary  crisp white, hairline border — standard secondary action
 *  - outline    teal-outlined, transparent fill
 *  - ghost      no border/fill — lowest emphasis, inline with text
 *  - danger     deep rose gradient — destructive actions
 *  - subtle     icon-only, muted — row-level utility icons
 */

const VARIANTS = {
  primary:
    "text-white bg-gradient-to-b from-teal-600 to-teal-800 hover:from-teal-600 hover:to-teal-900 " +
    "shadow-[0_1px_0_0_rgba(255,255,255,0.16)_inset,0_8px_20px_-6px_rgba(11,79,72,0.55)] " +
    "ring-1 ring-inset ring-white/10 active:from-teal-800 active:to-teal-950 " +
    "disabled:from-teal-700/50 disabled:to-teal-800/50",
  dark:
    "text-white bg-gradient-to-b from-neutral-800 to-neutral-950 hover:from-neutral-800 hover:to-black " +
    "shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset,0_8px_20px_-6px_rgba(0,0,0,0.55)] " +
    "ring-1 ring-inset ring-white/10 active:from-neutral-950 active:to-black " +
    "disabled:opacity-50",
  secondary:
    "text-neutral-700 bg-white border border-neutral-200 shadow-sm hover:bg-neutral-50 hover:border-neutral-300 " +
    "active:bg-neutral-100 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700/60",
  outline:
    "text-teal-800 bg-transparent border border-teal-700/40 hover:bg-teal-50 hover:border-teal-700 " +
    "active:bg-teal-100 dark:text-teal-400 dark:border-teal-400/30 dark:hover:bg-teal-400/10",
  ghost:
    "text-neutral-600 bg-transparent hover:bg-neutral-100 hover:text-neutral-900 active:bg-neutral-200 " +
    "dark:text-gray-400 dark:hover:bg-gray-700/60 dark:hover:text-white",
  danger:
    "text-white bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-600 hover:to-rose-800 " +
    "shadow-[0_1px_0_0_rgba(255,255,255,0.16)_inset,0_8px_20px_-6px_rgba(159,18,57,0.5)] " +
    "ring-1 ring-inset ring-white/10 active:from-rose-800 active:to-rose-900 disabled:opacity-50",
  subtle:
    "text-neutral-400 bg-transparent hover:bg-neutral-100 hover:text-neutral-700 active:bg-neutral-200 " +
    "dark:text-gray-500 dark:hover:bg-gray-700/60 dark:hover:text-gray-200",
};

const SIZES = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
  md: "h-10 px-4 text-[13px] gap-2 rounded-xl",
  lg: "h-11 px-5 text-sm gap-2 rounded-xl",
  icon: "h-9 w-9 rounded-xl",
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
        "transition-all duration-150 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
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