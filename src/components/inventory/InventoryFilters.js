"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { List, Grid3X3 } from "lucide-react";
import { splitBilingualText } from "@/lib/languageUtils";

const PRODUCT_TABS = ["All Products", "Out of Stock", "Low Stock", "Excess Stock"];
const STATUS_OPTIONS = ["All", "Balanced", "Out of Stock", "On Track"];

export default function InventoryFilters({
  activeTab,
  onTabChange,
  activeFilter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  categoryFilter,
  onCategoryFilterChange,
  categories,
  searchTerm,
  onSearchTermChange,
}) {
  const [categoryOpen, setCategoryOpen] = useState(false);

  return (
    <>
      {/* Product Tabs */}
      <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 flex flex-wrap justify-between sm:justify-start gap-3 sm:gap-4 border-b border-gray-200 dark:border-gray-800 pb-2">
        {PRODUCT_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`flex-shrink-0 whitespace-nowrap border-b-2 pb-2 text-xs sm:text-sm font-semibold transition-colors ${
              activeTab === tab
                ? "border-[#1fb8a2] text-[#1fb8a2]"
                : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="mb-6 flex flex-col gap-4">
        {/* Mobile: Status filters LEFT + View toggle RIGHT on same line */}
        <div className="flex items-center justify-between gap-3 lg:hidden">
          {/* Status Radio Buttons */}
          <div className="flex items-center gap-1 border-2 border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            {STATUS_OPTIONS.map((filter) => (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={`px-2 py-1.5 text-xs font-semibold transition-colors ${
                  activeFilter === filter
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="flex rounded-md border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2 transition-colors ${
                viewMode === "list"
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onViewModeChange("grid")}
              className={`border-l-2 border-gray-200 dark:border-gray-700 p-2 transition-colors ${
                viewMode === "grid"
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              <Grid3X3 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Desktop: Original layout */}
        <div className="hidden lg:flex lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            {/* Status Radio Buttons */}
            <div className="flex items-center gap-1 border-2 border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              {STATUS_OPTIONS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => onFilterChange(filter)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeFilter === filter
                      ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Category Dropdown */}
            <div className="relative flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Category :</span>
              <button
                onClick={() => setCategoryOpen((s) => !s)}
                className="flex items-center gap-2 rounded-md border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {categoryFilter ? splitBilingualText(categoryFilter) : "All Categories"}
                <ChevronDown className="h-3 w-3" />
              </button>
              {categoryOpen && (
                <div className="absolute z-20 mt-2 w-48 rounded-md border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-1 max-h-60 overflow-y-auto top-full">
                  <button
                    className={`flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium ${
                      !categoryFilter
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => {
                      onCategoryFilterChange("");
                      setCategoryOpen(false);
                    }}
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      className={`flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium ${
                        categoryFilter === category.name
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => {
                        onCategoryFilterChange(category.name);
                        setCategoryOpen(false);
                      }}
                    >
                      {splitBilingualText(category.name)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Search Product */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search product..."
                value={searchTerm}
                onChange={(e) => onSearchTermChange(e.target.value)}
                className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-8 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#1fb8a2] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchTermChange("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Clear search"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex rounded-md border-2 border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
              <button
                onClick={() => onViewModeChange("list")}
                className={`p-2 transition-colors ${
                  viewMode === "list"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onViewModeChange("grid")}
                className={`border-l-2 border-gray-200 dark:border-gray-700 p-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                <Grid3X3 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile: Category + Search (stacked below) */}
        <div className="flex flex-col gap-3 lg:hidden">
          {/* Category Dropdown */}
          <div className="relative flex flex-col gap-2">
            <button
              onClick={() => setCategoryOpen((s) => !s)}
              className="flex items-center gap-2 rounded-md border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {categoryFilter ? splitBilingualText(categoryFilter) : "All Categories"}
              <ChevronDown className="h-3 w-3 ml-auto" />
            </button>
            {categoryOpen && (
              <div className="absolute z-20 mt-2 w-full rounded-md border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-1 max-h-60 overflow-y-auto top-full">
                <button
                  className={`flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium ${
                    !categoryFilter
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    onCategoryFilterChange("");
                    setCategoryOpen(false);
                  }}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium ${
                      categoryFilter === category.name
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => {
                      onCategoryFilterChange(category.name);
                      setCategoryOpen(false);
                    }}
                  >
                    {splitBilingualText(category.name)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search Product */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search product..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-8 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#1fb8a2] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => onSearchTermChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Clear search"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
