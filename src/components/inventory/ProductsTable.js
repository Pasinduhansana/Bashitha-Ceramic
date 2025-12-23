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
    // TILE/GRID VIEW - Responsive for all devices
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="relative rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all group"
            >
              {/* Product Image */}
              <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-gradient-to-br from-gray-100 to-white">
                {product.photo_url ? (
                  <img
                    src={getOptimizedImageUrl(product.photo_url, { width: 400, height: 300 })}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <Camera className="h-8 w-8" />
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="px-3 sm:px-5 pt-3 pb-4 sm:pb-5 space-y-3">
                {/* Product Icon & Actions */}
                <div className="flex items-start justify-between mb-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#1fb8a2] to-[#189d8b] shadow-sm">
                    <Package className="h-6 w-6 text-white" />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction?.("view", product);
                      }}
                      className="rounded-lg p-2 text-gray-400 hover:bg-green-50 hover:text-green-600 transition-all"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction?.("edit", product);
                      }}
                      className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                      title="Edit Product"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction?.("delete", product);
                      }}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all"
                      title="Delete Product"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="mb-0">
                  <h4 className="text-[13px] sm:text-sm font-semibold text-gray-900 mb-1 truncate" title={product.name}>
                    {product.name}
                  </h4>
                  <p className="hidden sm:block text-xs text-gray-500 mb-2 line-clamp-2" title={product.description}>
                    {truncateText(product.description, 80)}
                  </p>
                  <div className="text-lg font-bold text-[#1fb8a2]">${product.selling_price || 0}</div>
                </div>

                {/* Status Badge */}
                <div className="mb-0">
                  <StatusLabel qty={product.qty} reorderLevel={product.reorder_level || 100} />
                </div>

                {/* Stock Info */}
                <div className="hidden sm:block space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reorder Level:</span>
                    <span className="font-medium text-gray-900">
                      {product.reorder_level || 0} {product.unit || "Pcs"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current Stock:</span>
                    <span className="font-medium text-gray-900">
                      {product.qty || 0} {product.unit || "Pcs"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated:</span>
                    <span className="font-medium text-gray-900">{new Date(product.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Stock Progress Bar */}
                <div className="hidden sm:block mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Stock Level</span>
                    <span className="font-medium text-gray-700">{Math.round((product.qty / (product.reorder_level || 100)) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        product.qty === 0 ? "bg-red-500" : product.qty <= product.reorder_level ? "bg-orange-500" : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min((product.qty / (product.reorder_level || 100)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  // LIST VIEW (Responsive)
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Desktop Table - Hidden on Mobile */}
      <div className="hidden lg:block rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[2fr_0.8fr_1fr_1fr_1fr_1.2fr_auto] gap-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-600">
          <span>PRODUCTS</span>
          <span>PRICE</span>
          <span>STATUS</span>
          <span>REORDER LEVEL</span>
          <span>CURRENT STOCK</span>
          <span>LAST UPDATED</span>
          <span className="text-center">ACTIONS</span>
        </div>

        {/* Table Rows */}
        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.15 }}
              className="relative grid grid-cols-[2fr_0.8fr_1fr_1fr_1fr_1.2fr_auto] gap-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4 hover:bg-linear-to-r hover:from-gray-50/50 hover:to-transparent dark:hover:from-gray-700/30 transition-all duration-200 m-4 mt-0"
            >
              {/* Product Info */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-sm">
                  <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{product.name}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{product.description}</p>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center">
                <span className="text-xs font-bold text-gray-900 dark:text-white">${product.selling_price || 0}</span>
              </div>

              {/* Status */}
              <div className="flex items-center">
                <StatusLabel qty={product.qty} reorderLevel={product.reorder_level || 100} />
              </div>

              {/* Reorder Level */}
              <div className="flex items-center">
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  {product.reorder_level || 0} {product.unit || "Pcs"}
                </span>
              </div>

              {/* Current Stock */}
              <div className="flex items-center">
                <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                  {product.qty || 0} {product.unit || "Pcs"}
                </span>
              </div>

              {/* Last Updated */}
              <div className="flex items-center">
                <span className="text-xs text-gray-600 dark:text-gray-400">{new Date(product.updated_at).toLocaleDateString()}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-1">
                <button
                  onClick={() => onAction?.("view", product)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-green-50 hover:text-green-600 transition-all border border-transparent hover:border-green-200"
                  title="View & Manage Inventory"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onAction?.("edit", product)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-200"
                  title="Edit Product"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onAction?.("delete", product)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all border border-transparent hover:border-red-200"
                  title="Delete Product"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
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
                <div className="flex-shrink-0 text-lg font-bold text-[#1fb8a2]">${product.selling_price || 0}</div>
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
