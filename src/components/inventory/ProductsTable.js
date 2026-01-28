"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Package, Check, X, Edit, PackagePlus, Trash2, TrendingUp, Camera, MoreVertical } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/imageUtils";

// Utility function to truncate text
function truncateText(text, maxLength = 60) {
  if (!text) return "No description";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

function StatusLabel({ qty, reorderLevel }) {
  if (qty === 0)
    return (
      <span className="inline-flex items-center gap-1.5 rounded bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
        <X className="h-3.5 w-3.5" /> Out Of Stock
      </span>
    );
  if (qty <= reorderLevel)
    return (
      <span className="inline-flex items-center gap-1.5 rounded bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-600">
        <TrendingUp className="h-3.5 w-3.5" /> Low Stock
      </span>
    );
  // In stock
  return (
    <span className="inline-flex items-center gap-1.5 rounded bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">
      <Check className="h-3.5 w-3.5" /> In Stock
    </span>
  );
}

export default function ProductsTable({ products, onAction, viewMode = "list" }) {
  const [openMenuId, setOpenMenuId] = useState(null);

  if (viewMode === "grid") {
    // TILE/GRID VIEW - Fully responsive professional design
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 lg:gap-5">
        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative rounded-md sm:rounded-md bg-white dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 group flex flex-col"
            >
              {/* Product Image */}
              <div className="relative h-32 sm:h-48 md:h-52 lg:h-56 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                {product.photo_url ? (
                  <img
                    src={getOptimizedImageUrl(product.photo_url, { width: 400, height: 300 })}
                    alt={product.name}
                    className="h-full w-full object-contain p-1 sm:p-3 md:p-4 group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="flex h-full w-full flex-col items-center justify-center text-gray-300 dark:text-gray-600 gap-1"><svg class="h-6 w-6 sm:h-10 sm:w-10 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg><span class="text-[8px] sm:text-[10px] font-medium">No Image</span></div>';
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-gray-300 dark:text-gray-600 gap-1">
                    <Package className="h-6 w-6 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                    <span className="text-[8px] sm:text-[10px] font-medium">No Image</span>
                  </div>
                )}
              </div>

              {/* Card Content - Using flex-col with flex-1 to push buttons to bottom */}
              <div className="p-2 sm:p-4 md:p-5 flex flex-col flex-1">
                {/* Product Info - Takes available space */}
                <div className="flex-1 space-y-1.5 sm:space-y-3 md:space-y-4">
                  {/* Product Header */}
                  <div className="space-y-0.5 sm:space-y-1.5 md:space-y-2">
                    <div className="flex items-start justify-between gap-1">
                      <h4
                        className="text-xs sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1"
                        title={product.name}
                      >
                        {product.name}
                      </h4>
                      <div className="flex-shrink-0">
                        <StatusLabel qty={product.qty} reorderLevel={product.reorder_level || 100} />
                      </div>
                    </div>
                    <p
                      className="hidden sm:block text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed"
                      title={product.description}
                    >
                      {truncateText(product.description, 100)}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-1 sm:pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] sm:text-sm font-medium text-gray-500 dark:text-gray-400">Price</span>
                    <span className="text-sm sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">${product.selling_price || 0}</span>
                  </div>

                  {/* Stock Information Grid */}
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5 md:gap-3 pt-0.5 sm:pt-1.5 md:pt-2">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md sm:rounded-md p-1.5 sm:p-2.5 md:p-3">
                      <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Stock</p>
                      <p className="text-[10px] sm:text-sm font-semibold text-gray-900 dark:text-white">{product.qty || 0}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md sm:rounded-md p-1.5 sm:p-2.5 md:p-3">
                      <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5">Reorder</p>
                      <p className="text-[10px] sm:text-sm font-semibold text-gray-900 dark:text-white">{product.reorder_level || 0}</p>
                    </div>
                  </div>

                  {/* Last Updated */}
                  <div className="pt-1 sm:pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-[9px] sm:text-xs text-gray-500 dark:text-gray-400">
                      Updated {new Date(product.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Action Buttons - Always at bottom */}
                <div className="flex gap-1.5 pt-2 mt-auto">
                  <button
                    onClick={() => onAction?.("view", product)}
                    className="flex-1 flex items-center justify-center gap-1 rounded-md bg-gradient-to-r from-[#1fb8a2] to-[#17a694] hover:from-[#1aa693] hover:to-[#158f82] px-2 py-1.5 sm:py-2 text-[10px] sm:text-xs font-semibold text-white shadow-sm transition-all"
                  >
                    <PackagePlus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    <span>Stock Change</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.("edit", product);
                    }}
                    className="flex items-center justify-center rounded-md p-1.5 sm:p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all shadow-sm"
                    title="Edit Product"
                  >
                    <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.("delete", product);
                    }}
                    className="flex items-center justify-center rounded-md p-1.5 sm:p-2 bg-red-50 text-red-600 hover:bg-red-100 transition-all shadow-sm"
                    title="Delete Product"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // LIST VIEW (Responsive) - Modern Professional Design
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Desktop Table - Hidden on Mobile */}
      <div className="hidden lg:block rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[2.5fr_1fr_1.2fr_1fr_1.2fr_1.2fr_auto] gap-6 border-b-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-7 py-4 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
          <span>Product</span>
          <span>Price</span>
          <span>Status</span>
          <span>Reorder</span>
          <span>Stock</span>
          <span>Updated</span>
          <span className="text-center">Actions</span>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <AnimatePresence>
            {products.map((product, index) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
                className="group grid grid-cols-[2.5fr_1fr_1.2fr_1fr_1.2fr_1.2fr_auto] gap-6 px-7 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-200"
              >
                {/* Product Info with Image */}
                <div className="flex items-center gap-3.5">
                  <div className="relative h-12 w-12 shrink-0 rounded-md overflow-hidden border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm">
                    {product.photo_url ? (
                      <img
                        src={getOptimizedImageUrl(product.photo_url, { width: 100, height: 100 })}
                        alt={product.name}
                        className="h-full w-full object-contain p-1.5"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="flex h-full w-full flex-col items-center justify-center gap-0.5"><svg class="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg><span class="text-[8px] font-medium text-gray-400 dark:text-gray-500">No Image</span></div>';
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center gap-0.5">
                        <Package className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                        <span className="text-[8px] font-medium text-gray-400 dark:text-gray-500">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{truncateText(product.description, 60)}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">${product.selling_price || 0}</span>
                </div>

                {/* Status */}
                <div className="flex items-center">
                  <StatusLabel qty={product.qty} reorderLevel={product.reorder_level || 100} />
                </div>

                {/* Reorder Level */}
                <div className="flex items-center">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{product.reorder_level || 0}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{product.unit || "Pcs"}</span>
                  </div>
                </div>

                {/* Current Stock with Progress */}
                <div className="flex items-center">
                  <div className="flex flex-col gap-1.5 w-full">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{product.qty || 0}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{product.unit || "Pcs"}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600">
                      <div
                        className={`h-full transition-all duration-500 ${
                          product.qty === 0 ? "bg-red-500" : product.qty <= product.reorder_level ? "bg-orange-500" : "bg-green-500"
                        }`}
                        style={{ width: `${Math.min((product.qty / (product.reorder_level || 100)) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="flex items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{new Date(product.updated_at).toLocaleDateString()}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => onAction?.("view", product)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-[#1fb8a2] to-[#17a694] hover:from-[#1aa693] hover:to-[#158f82] text-white px-3 py-2 text-xs font-semibold transition-all shadow-sm"
                    title="Stock Change"
                  >
                    <PackagePlus className="h-4 w-4" />
                    <span>Stock Change</span>
                  </button>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === product.id ? null : product.id);
                      }}
                      className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300 transition-all"
                      title="More actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    {openMenuId === product.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 top-full mt-1 z-20 w-48 rounded-md border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                              onAction?.("edit", product);
                            }}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-[#1fb8a2]/10 hover:text-[#1fb8a2] dark:hover:bg-[#1fb8a2]/20 dark:hover:text-[#1fb8a2] transition-all"
                          >
                            <Edit className="h-4 w-4" />
                            <span>Edit Product</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(null);
                              onAction?.("delete", product);
                            }}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete Product</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Card View - Visible only on Mobile */}
      <div className="lg:hidden space-y-3">
        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.15 }}
              className="rounded-md border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
            >
              {/* Product Layout - Image and Content Side by Side */}
              <div className="flex gap-3 p-3">
                {/* Product Image - Full Height */}
                <div className="relative w-28 shrink-0 rounded-md overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                  {product.photo_url ? (
                    <img
                      src={getOptimizedImageUrl(product.photo_url, { width: 200, height: 200 })}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="Arial" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <img
                      src='data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-family="Arial" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E'
                      alt="No image available"
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  {/* Header with Name, Description & Price */}
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-0.5">{product.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-1">{truncateText(product.description, 40)}</p>
                      </div>
                      <span className="text-lg font-bold text-[#1fb8a2] shrink-0">${product.selling_price || 0}</span>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-2">
                      <StatusLabel qty={product.qty} reorderLevel={product.reorder_level || 100} />
                    </div>
                  </div>

                  {/* Stock Info Compact */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 text-xs">
                      <div className="flex items-baseline gap-1">
                        <span className="text-gray-500">Stock:</span>
                        <span className="font-semibold text-gray-900">{product.qty || 0}</span>
                        <span className="text-gray-400">{product.unit || "Pcs"}</span>
                      </div>
                      <div className="h-3 w-px bg-gray-200" />
                      <div className="flex items-baseline gap-1">
                        <span className="text-gray-500">Reorder:</span>
                        <span className="font-semibold text-gray-900">{product.reorder_level || 0}</span>
                      </div>
                    </div>

                    {/* Updated Date */}
                    <p className="text-[10px] text-gray-400">Updated {new Date(product.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Full Width at Bottom */}
              <div className="flex gap-2 px-3 pb-3 pt-1 border-t border-gray-100">
                <button
                  onClick={() => onAction?.("view", product)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-[#1fb8a2] to-[#17a694] hover:from-[#1aa693] hover:to-[#158f82] transition-all shadow-sm"
                >
                  <PackagePlus className="h-3.5 w-3.5" />
                  <span>Change Stock</span>
                </button>
                <button
                  onClick={() => onAction?.("edit", product)}
                  className="flex items-center justify-center rounded-md px-3 py-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all shadow-sm"
                  title="Edit Product"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onAction?.("delete", product)}
                  className="flex items-center justify-center rounded-md px-3 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 transition-all shadow-sm"
                  title="Delete Product"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
