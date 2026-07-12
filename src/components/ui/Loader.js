"use client";

const SIZES = {
  sm: "h-5 w-5 border-2",
  md: "h-8 w-8 border-2",
  lg: "h-12 w-12 border-[3px]",
};

export default function Loader({ size = "md", label, className = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-20 ${className}`}>
      <div className="relative">
        <div className={`rounded-full border-neutral-200 dark:border-gray-700 ${SIZES[size]}`} />
        <div className={`absolute inset-0 rounded-full border-transparent border-t-brand-700 dark:border-t-brand-400 animate-spin ${SIZES[size]}`} />
      </div>
      {label && <p className="text-[14px] text-neutral-400">{label}</p>}
    </div>
  );
}