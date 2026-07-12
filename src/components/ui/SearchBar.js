"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

/**
 * SearchBar — storefront product search.
 * Kept separate from Navbar so the search experience (suggestions,
 * API wiring, styling) can be swapped without touching nav layout.
 *
 * Props:
 *  - onSearch(query)      called on submit (Enter) or suggestion click
 *  - suggestions          optional array of { id, label, meta } to render
 *  - placeholder          input placeholder text
 *  - variant              "inline" (desktop bar) | "overlay" (mobile full-width)
 */
export default function SearchBar({ onSearch, suggestions = [], placeholder = "Search products…", variant = "inline" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
    setOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    onSearch?.("");
  };

  return (
    <div ref={containerRef} className={`relative ${variant === "overlay" ? "w-full" : "w-full max-w-sm"}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full h-9 rounded-full border border-neutral-200 bg-neutral-50/70 pl-10 pr-9 text-[13px] text-neutral-900 placeholder-neutral-400 outline-none transition-colors focus:bg-white focus:border-brand-600"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </form>

      {open && query && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-xl border border-neutral-200 bg-white z-50 max-h-80 overflow-y-auto">
          {suggestions.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setQuery(item.label);
                setOpen(false);
                onSearch?.(item.label, item);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 transition-colors"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-800 text-[11px] font-bold">
                {item.label.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-neutral-900 truncate">{item.label}</p>
                {item.meta && <p className="text-[11px] text-neutral-400 truncate">{item.meta}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}