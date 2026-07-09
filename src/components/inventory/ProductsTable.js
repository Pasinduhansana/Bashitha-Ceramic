"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Package, Edit, PackagePlus, Trash2, MoreVertical, ImageOff } from "lucide-react";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import Button from "@/ui/Button";

/* ————————————————————————————————————————————————
   Helpers
—————————————————————————————————————————————————— */

function truncateText(text, maxLength = 60) {
  if (!text) return "No description provided";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

function stockState(qty, reorderLevel) {
  if (qty === 0) return "out";
  if (qty <= reorderLevel) return "low";
  return "in";
}

const STATUS_STYLES = {
  in: { label: "In Stock", dot: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", ring: "ring-emerald-600/20", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
  low: { label: "Low Stock", dot: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", ring: "ring-amber-600/20", bg: "bg-amber-50 dark:bg-amber-500/10" },
  out: { label: "Out of Stock", dot: "bg-rose-500", text: "text-rose-700 dark:text-rose-400", ring: "ring-rose-600/20", bg: "bg-rose-50 dark:bg-rose-500/10" },
};

/* Status — a quiet dot-and-label chip rather than a loud filled pill */
function StatusBadge({ qty, reorderLevel }) {
  const state = stockState(qty, reorderLevel);
  const s = STATUS_STYLES[state];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${s.bg} ${s.text} ring-1 ${s.ring} px-2.5 py-1 text-[11px] font-semibold tracking-wide`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

/* Stock Meter — the signature element: a capsule fill gauge with a tick
   marking the reorder threshold, so stock health reads at a glance. */
function StockMeter({ qty = 0, reorderLevel = 0, unit = "Pcs" }) {
  const state = stockState(qty, reorderLevel);
  const s = STATUS_STYLES[state];
  const ceiling = Math.max(reorderLevel * 2, qty, 1);
  const fillPct = Math.min((qty / ceiling) * 100, 100);
  const tickPct = Math.min((reorderLevel / ceiling) * 100, 100);

  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[132px]">
      <div className="flex items-baseline gap-1 tabular-nums">
        <span className="text-[13px] font-bold text-neutral-900 dark:text-white">{qty}</span>
        <span className="text-[10px] font-medium text-neutral-400">{unit}</span>
      </div>
      <div className="relative h-1.5 w-full rounded-full bg-neutral-100 dark:bg-gray-700">
        <div
          className={`h-full rounded-full ${s.dot} transition-all duration-500`}
          style={{ width: `${fillPct}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-2.5 w-[2px] rounded-full bg-neutral-400/70 dark:bg-gray-500"
          style={{ left: `${tickPct}%` }}
          title={`Reorder at ${reorderLevel}`}
        />
      </div>
    </div>
  );
}

/* Product thumbnail with graceful fallback */
function Thumb({ product, size = "h-12 w-12" }) {
  const [failed, setFailed] = useState(false);
  if (!product.photo_url || failed) {
    return (
      <div className={`relative ${size} shrink-0 rounded-lg border border-neutral-200 dark:border-gray-700 bg-neutral-50 dark:bg-gray-700/40 flex items-center justify-center`}>
        <Package className="h-4 w-4 text-neutral-300 dark:text-gray-500" />
      </div>
    );
  }
  return (
    <div className={`relative ${size} shrink-0 rounded-lg border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-700 overflow-hidden`}>
      <img
        src={getOptimizedImageUrl(product.photo_url, { width: 100, height: 100 })}
        alt={product.name}
        className="h-full w-full object-contain p-1.5"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/* Row action menu — used in both table and grid views */
function RowMenu({ product, open, onToggle, onAction }) {
  return (
    <div className="relative">
      <Button variant="subtle" size="icon" onClick={(e) => { e.stopPropagation(); onToggle(); }} title="More actions">
        <MoreVertical className="h-4 w-4" />
      </Button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => onToggle(false)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-2 z-20 w-44 rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg shadow-neutral-900/10 p-1"
            >
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(false); onAction?.("edit", product); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-neutral-700 dark:text-gray-300 hover:bg-teal-50 hover:text-teal-800 dark:hover:bg-teal-400/10 dark:hover:text-teal-400 transition-colors"
              >
                <Edit className="h-3.5 w-3.5" /> Edit product
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onToggle(false); onAction?.("delete", product); }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-neutral-700 dark:text-gray-300 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete product
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ————————————————————————————————————————————————
   Main component
—————————————————————————————————————————————————— */

export default function ProductsTable({ products, onAction, viewMode = "list" }) {
  const [openMenuId, setOpenMenuId] = useState(null);

  const empty = !products || products.length === 0;

  if (empty) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 py-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-50 dark:bg-gray-700">
          <Package className="h-6 w-6 text-neutral-300 dark:text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">No products match this view</p>
          <p className="text-xs text-neutral-500 dark:text-gray-400 mt-1">Adjust your filters or add a new product to get started.</p>
        </div>
      </div>
    );
  }

  /* ---------- GRID VIEW ---------- */
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="group flex flex-col rounded-2xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-0.5 hover:border-neutral-300 dark:hover:border-gray-600 transition-all duration-300 overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-44 w-full bg-neutral-50 dark:bg-gray-900/40 flex items-center justify-center overflow-hidden">
                {product.photo_url ? (
                  <img
                    src={getOptimizedImageUrl(product.photo_url, { width: 400, height: 300 })}
                    alt={product.name}
                    className="h-full w-full object-contain p-6 group-hover:scale-[1.04] transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.querySelector(".fallback-icon")?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <div className={`fallback-icon flex-col items-center justify-center gap-1.5 text-neutral-300 dark:text-gray-600 ${product.photo_url ? "hidden" : "flex"}`}>
                  <ImageOff className="h-8 w-8" strokeWidth={1.5} />
                  <span className="text-[10px] font-medium tracking-wide">No image</span>
                </div>
                <div className="absolute top-3 left-3">
                  <StatusBadge qty={product.qty} reorderLevel={product.reorder_level || 100} />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5 gap-4">
                <div className="space-y-1">
                  <h4 className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-snug line-clamp-1" title={product.name}>
                    {product.name}
                  </h4>
                  <p className="text-xs text-neutral-500 dark:text-gray-400 line-clamp-2 leading-relaxed" title={product.description}>
                    {truncateText(product.description, 90)}
                  </p>
                </div>

                <div className="flex items-end justify-between pt-3 border-t border-neutral-100 dark:border-gray-700">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400 mb-0.5">Price</p>
                    <p
                      className="text-2xl text-neutral-900 dark:text-white italic"
                      style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
                    >
                      ${product.selling_price || 0}
                    </p>
                  </div>
                  <StockMeter qty={product.qty} reorderLevel={product.reorder_level || 0} unit={product.unit || "Pcs"} />
                </div>

                <p className="text-[10px] text-neutral-400">Updated {new Date(product.updated_at).toLocaleDateString()}</p>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto pt-1">
                  <Button
                    variant="primary"
                    size="md"
                    icon={PackagePlus}
                    fullWidth
                    onClick={() => onAction?.("view", product)}
                  >
                    Stock Change
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    icon={Edit}
                    title="Edit product"
                    onClick={(e) => { e.stopPropagation(); onAction?.("edit", product); }}
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    icon={Trash2}
                    title="Delete product"
                    className="text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                    onClick={(e) => { e.stopPropagation(); onAction?.("delete", product); }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  /* ---------- LIST / TABLE VIEW ---------- */
  return (
    <div className="space-y-4">
      {/* Desktop table */}
      <div className="hidden lg:block rounded-2xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="grid grid-cols-[2.4fr_0.8fr_1.1fr_1.3fr_1fr_auto] gap-6 border-b border-neutral-200 dark:border-gray-700 bg-neutral-50/70 dark:bg-gray-800 px-7 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-gray-500">
          <span>Product</span>
          <span>Price</span>
          <span>Status</span>
          <span>Stock level</span>
          <span>Updated</span>
          <span className="text-right pr-1">Actions</span>
        </div>

        <div className="divide-y divide-neutral-100 dark:divide-gray-700">
          <AnimatePresence>
            {products.map((product, index) => (
              <motion.div
                layout
                key={product.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18, delay: index * 0.02 }}
                className="group grid grid-cols-[2.4fr_0.8fr_1.1fr_1.3fr_1fr_auto] gap-6 items-center px-7 py-4 hover:bg-neutral-50/70 dark:hover:bg-gray-700/20 transition-colors duration-150"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <Thumb product={product} />
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-neutral-900 dark:text-white truncate">{product.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-gray-400 truncate mt-0.5">{truncateText(product.description, 56)}</p>
                  </div>
                </div>

                <span className="text-[13.5px] font-bold text-neutral-900 dark:text-white tabular-nums">
                  ${product.selling_price || 0}
                </span>

                <div>
                  <StatusBadge qty={product.qty} reorderLevel={product.reorder_level || 100} />
                </div>

                <StockMeter qty={product.qty} reorderLevel={product.reorder_level || 0} unit={product.unit || "Pcs"} />

                <span className="text-[13px] text-neutral-500 dark:text-gray-400 tabular-nums">
                  {new Date(product.updated_at).toLocaleDateString()}
                </span>

                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={PackagePlus}
                    onClick={() => onAction?.("view", product)}
                  >
                    Stock
                  </Button>
                  <RowMenu
                    product={product}
                    open={openMenuId === product.id}
                    onToggle={(v) => setOpenMenuId(v === false ? null : (openMenuId === product.id ? null : product.id))}
                    onAction={onAction}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile / tablet cards */}
      <div className="lg:hidden space-y-3">
        <AnimatePresence>
          {products.map((product) => (
            <motion.div
              layout
              key={product.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.15 }}
              className="rounded-2xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden"
            >
              <div className="flex gap-3.5 p-4">
                <Thumb product={product} size="h-20 w-20" />

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="text-[13.5px] font-semibold text-neutral-900 dark:text-white leading-snug line-clamp-2">{product.name}</h3>
                      <span
                        className="text-lg text-neutral-900 dark:text-white shrink-0 italic"
                        style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}
                      >
                        ${product.selling_price || 0}
                      </span>
                    </div>
                    <StatusBadge qty={product.qty} reorderLevel={product.reorder_level || 100} />
                  </div>

                  <div className="flex items-center justify-between mt-2.5">
                    <StockMeter qty={product.qty} reorderLevel={product.reorder_level || 0} unit={product.unit || "Pcs"} />
                    <p className="text-[10px] text-neutral-400">Upd. {new Date(product.updated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 px-4 pb-4 pt-1">
                <Button variant="primary" size="md" icon={PackagePlus} fullWidth onClick={() => onAction?.("view", product)}>
                  Change Stock
                </Button>
                <Button variant="secondary" size="icon" icon={Edit} title="Edit" onClick={() => onAction?.("edit", product)} />
                <Button
                  variant="secondary"
                  size="icon"
                  icon={Trash2}
                  title="Delete"
                  className="text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                  onClick={() => onAction?.("delete", product)}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}