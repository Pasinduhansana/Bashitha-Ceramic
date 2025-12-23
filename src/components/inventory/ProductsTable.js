"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Package, Check, X, Edit, Eye, Trash2, TrendingUp, Camera } from "lucide-react";
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
  if (viewMode === "grid") {
    // TILE/GRID VIEW - Fully responsive professional design
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative rounded-xl sm:rounded-2xl bg-white dark:bg-gray-800 overflow-hidden shadow-md hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Product Image */}
              <div className="relative h-40 sm:h-48 md:h-52 lg:h-56 w-full overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                {product.photo_url ? (
                  <img
                    src={getOptimizedImageUrl(product.photo_url, { width: 400, height: 300 })}
                    alt={product.name}
                    className="h-full w-full object-contain p-2 sm:p-3 md:p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300 dark:text-gray-600">
                    <Camera className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12" />
                  </div>
                )}

                {/* Action Buttons Overlay - Hidden on mobile, visible on hover for desktop */}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex items-center gap-1 sm:gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.("view", product);
                    }}
                    className="rounded-full p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-green-50 hover:text-green-600 shadow-md sm:shadow-lg transition-all"
                    title="View Details"
                  >
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.("edit", product);
                    }}
                    className="rounded-full p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 shadow-md sm:shadow-lg transition-all"
                    title="Edit Product"
                  >
                    <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.("delete", product);
                    }}
                    className="rounded-full p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-red-50 hover:text-red-600 shadow-md sm:shadow-lg transition-all"
                    title="Delete Product"
                  >
                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </button>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-3 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3 md:space-y-4">
                {/* Product Header */}
                <div className="space-y-1 sm:space-y-1.5 md:space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4
                      className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1"
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
                <div className="flex items-center justify-between pt-1.5 sm:pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Price</span>
                  <span className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white">${product.selling_price || 0}</span>
                </div>

                {/* Stock Information Grid */}
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5 md:gap-3 pt-1 sm:pt-1.5 md:pt-2">
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md sm:rounded-lg p-2 sm:p-2.5 md:p-3">
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Current Stock</p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      {product.qty || 0} {product.unit || "Pcs"}
                    </p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md sm:rounded-lg p-2 sm:p-2.5 md:p-3">
                    <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mb-0.5 sm:mb-1">Reorder At</p>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-white">
                      {product.reorder_level || 0} {product.unit || "Pcs"}
                    </p>
                  </div>
                </div>

                {/* Stock Progress Bar */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">Stock Level</span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {Math.round((product.qty / (product.reorder_level || 100)) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 sm:h-2.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        product.qty === 0
                          ? "bg-gradient-to-r from-red-500 to-red-600"
                          : product.qty <= product.reorder_level
                          ? "bg-gradient-to-r from-orange-500 to-orange-600"
                          : "bg-gradient-to-r from-green-500 to-green-600"
                      }`}
                      style={{ width: `${Math.min((product.qty / (product.reorder_level || 100)) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Last Updated */}
                <div className="pt-1.5 sm:pt-2 border-t border-gray-100 dark:border-gray-700">
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                    Updated {new Date(product.updated_at).toLocaleDateString()}
                  </p>
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
      <div className="hidden lg:block rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
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
                  <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm">
                    {product.photo_url ? (
                      <img
                        src={getOptimizedImageUrl(product.photo_url, { width: 100, height: 100 })}
                        alt={product.name}
                        className="h-full w-full object-contain p-1.5"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-5 w-5 text-gray-400 dark:text-gray-500" />
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
                <div className="flex items-center justify-center gap-1.5">
                  <button
                    onClick={() => onAction?.("view", product)}
                    className="rounded-md p-2 border border-transparent text-gray-400 hover:border-green-200 hover:bg-green-50 hover:text-green-600 dark:hover:border-green-800 dark:hover:bg-green-900/20 dark:hover:text-green-400 transition-all"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onAction?.("edit", product)}
                    className="rounded-md p-2 border border-transparent text-gray-400 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:hover:border-blue-800 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-all"
                    title="Edit Product"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onAction?.("delete", product)}
                    className="rounded-md p-2 border border-transparent text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:border-red-800 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-all"
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
              className="rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all p-4"
            >
              {/* Product Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-gray-100 to-gray-50 border border-gray-200">
                    <Package className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm text-gray-900 truncate">{product.name}</h3>
                    <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 text-lg font-bold text-gray-900 dark:text-white">${product.selling_price || 0}</div>
              </div>

              {/* Status & Stock Info */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Status:</span>
                  <StatusLabel qty={product.qty} reorderLevel={product.reorder_level || 100} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Stock:</span>
                  <span className="font-medium text-gray-900">
                    {product.qty || 0} / {product.reorder_level || 0} {product.unit || "Pcs"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Updated:</span>
                  <span className="text-gray-600">{new Date(product.updated_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Stock Progress Bar */}
              <div className="mb-3">
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      product.qty === 0 ? "bg-red-500" : product.qty <= product.reorder_level ? "bg-orange-500" : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min((product.qty / (product.reorder_level || 100)) * 100, 100)}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => onAction?.("view", product)}
                  className="flex-1 rounded-lg px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#1fb8a2] to-[#17a694] hover:from-[#1aa693] hover:to-[#158f82] transition-all"
                >
                  View
                </button>
                <button
                  onClick={() => onAction?.("edit", product)}
                  className="flex-1 rounded-lg px-3 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all"
                >
                  Edit
                </button>
                <button
                  onClick={() => onAction?.("delete", product)}
                  className="rounded-lg px-3 py-2 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-all"
                  title="Delete"
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
