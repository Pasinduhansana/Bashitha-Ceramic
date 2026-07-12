"use client";

import { useState, Fragment } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, ChevronDown, MoreVertical, Edit, Trash2, Plus, Minus, Save, ImageOff, Tag, Ruler, Layers } from "lucide-react";
import toast from "react-hot-toast";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
import Button from "@/components/ui/button";
import Image from "next/image";
/* ————————————————————————————————————————————————
   Helpers
—————————————————————————————————————————————————— */

function stockState(qty, reorderLevel) {
  if (qty === 0) return "out";
  if (qty <= reorderLevel) return "low";
  return "in";
}

const STATUS_STYLES = {
  in: { label: "In stock", text: "text-success-700 dark:text-success-500", bg: "bg-success-50 dark:bg-success-500/10", bar: "bg-success-500" },
  low: { label: "Low stock", text: "text-warning-700 dark:text-warning-500", bg: "bg-warning-50 dark:bg-warning-500/10", bar: "bg-warning-500" },
  out: { label: "Out of stock", text: "text-danger-700 dark:text-danger-500", bg: "bg-danger-50 dark:bg-danger-500/10", bar: "bg-danger-500" },
};

function StatusBadge({ qty, reorderLevel }) {
  const s = STATUS_STYLES[stockState(qty, reorderLevel)];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${s.bg} ${s.text} px-2 py-0.5 text-[10.5px] font-semibold whitespace-nowrap`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.bar}`} />
      {s.label}
    </span>
  );
}

/* Signature stock indicator — 5-segment tier bar, battery-style */
function StockTier({ qty = 0, reorderLevel = 0, unit = "Pcs" }) {
  const state = stockState(qty, reorderLevel);
  const s = STATUS_STYLES[state];
  const ceiling = Math.max(reorderLevel * 2, qty, 5);
  const ratio = Math.min(qty / ceiling, 1);
  const filledSegments = state === "out" ? 0 : Math.max(1, Math.round(ratio * 5));

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-[3px]">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`h-3 w-1 rounded-full ${i < filledSegments ? s.bar : "bg-neutral-200 dark:bg-gray-700"}`} />
        ))}
      </div>
      <span className="text-xs font-semibold text-neutral-900 dark:text-white tabular-nums whitespace-nowrap">
        {qty} <span className="text-neutral-400 font-normal">{unit}</span>
      </span>
    </div>
  );
}

function IdentityBadge({ product }) {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-gray-700 text-neutral-500 dark:text-gray-400 text-[11px] font-bold">
      {product.name ? product.name.charAt(0).toUpperCase() : <Package className="h-3.5 w-3.5" />}
    </div>
  );
}

function ProductImage({ product, className }) {
  const [failed, setFailed] = useState(false);
  if (!product.photo_url || failed) {
    return (
      <div className={`flex items-center justify-center bg-neutral-50 dark:bg-gray-900/40 ${className}`}>
        <ImageOff className="h-5 w-5 text-neutral-300" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <div className={`bg-neutral-50 dark:bg-gray-900/40 ${className}`}>
      <Image
        src={getOptimizedImageUrl(product.photo_url)}
        alt={product.name}
        width={400}
        height={400}
        className="h-full w-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function RowMenu({ product, open, onToggle, onAction }) {
  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <Button variant="subtle" size="icon" onClick={() => onToggle(!open)}>
        <MoreVertical className="h-4 w-4" />
      </Button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => onToggle(false)} />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 top-full mt-1.5 z-20 w-40 rounded-lg border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1"
            >
              <button
                onClick={() => {
                  onToggle(false);
                  onAction?.("edit", product);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Edit className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                onClick={() => {
                  onToggle(false);
                  onAction?.("delete", product);
                }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs font-medium text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Inline Manage Stock form — replaces the old "open a panel" pattern.
   Lives directly inside the expanded row/card. */
function ManageStockForm({ product, onAction }) {
  const [type, setType] = useState("add");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!qty || parseInt(qty) <= 0) {
      toast.error("Enter a valid quantity");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: type, qty: parseInt(qty), reason: reason || (type === "add" ? "MANUAL_ADD" : "MANUAL_REMOVE") }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update stock");
        return;
      }
      toast.success(`Stock ${type === "add" ? "added" : "removed"}`);
      setQty("");
      setReason("");
      onAction?.("stock-updated", product);
    } catch (error) {
      toast.error("Failed to update stock");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3 space-y-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Manage stock</p>

      <div className="grid grid-cols-2 gap-1 rounded-lg bg-neutral-100 dark:bg-gray-900/40 p-0.5">
        <button
          onClick={() => setType("add")}
          className={`flex items-center justify-center gap-1.5 rounded-md h-7 text-xs font-semibold transition-colors ${
            type === "add" ? "bg-white dark:bg-gray-800 text-brand-800 dark:text-brand-400" : "text-neutral-500"
          }`}
        >
          <Plus className="h-3 w-3" /> Add
        </button>
        <button
          onClick={() => setType("remove")}
          className={`flex items-center justify-center gap-1.5 rounded-md h-7 text-xs font-semibold transition-colors ${
            type === "remove" ? "bg-white dark:bg-gray-800 text-danger-700" : "text-neutral-500"
          }`}
        >
          <Minus className="h-3 w-3" /> Remove
        </button>
      </div>

      <input
        type="number"
        min="1"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        placeholder={`Quantity (${product.unit || "Pcs"})`}
        className="w-full h-8 rounded-lg border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 px-3 text-xs outline-none focus:border-brand-600 text-neutral-900 dark:text-white placeholder-neutral-400 transition-colors"
      />

      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full h-8 rounded-lg border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 px-2.5 text-xs outline-none focus:border-brand-600 text-neutral-700 dark:text-gray-300 transition-colors"
      >
        <option value="">Reason (optional)</option>
        {type === "add" ? (
          <>
            <option value="MANUAL_ADD">Manual addition</option>
            <option value="ADJUSTMENT">Adjustment</option>
            <option value="FOUND">Stock found</option>
          </>
        ) : (
          <>
            <option value="MANUAL_REMOVE">Manual removal</option>
            <option value="ADJUSTMENT">Adjustment</option>
            <option value="DAMAGED">Damaged</option>
            <option value="LOST">Lost / missing</option>
          </>
        )}
      </select>

      <Button variant={type === "add" ? "primary" : "danger"} size="sm" fullWidth icon={Save} loading={submitting} onClick={submit}>
        {submitting ? "Updating…" : `${type === "add" ? "Add" : "Remove"} stock`}
      </Button>
    </div>
  );
}

/* Expanded detail block — product meta + inline Manage Stock form */
function ExpandedDetails({ product, onAction }) {
  return (
    <div className="flex flex-col lg:flex-row gap-4 border-t border-neutral-100 dark:border-gray-700 bg-neutral-50/60 dark:bg-gray-900/30 p-4">
      <ProductImage product={product} className="h-32 w-full lg:w-32 shrink-0 rounded-lg" />

      <div className="flex-1 min-w-0 space-y-3">
        <p className="text-xs text-neutral-500 dark:text-gray-400 leading-relaxed">{product.description || "No description provided"}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-gray-400">
            <Tag className="h-3 w-3 shrink-0" /> {product.code || "—"}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-gray-400">
            <Layers className="h-3 w-3 shrink-0" /> {product.brand || product.shade || "—"}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-gray-400">
            <Ruler className="h-3 w-3 shrink-0" /> {product.size || "—"}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-gray-400">
            <Package className="h-3 w-3 shrink-0" /> Reorder at {product.reorder_level ?? 0}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button variant="secondary" size="sm" icon={Edit} onClick={() => onAction?.("edit", product)}>
            Edit
          </Button>
          <Button variant="secondary" size="sm" icon={Trash2} className="text-danger-600" onClick={() => onAction?.("delete", product)}>
            Delete
          </Button>
        </div>
      </div>

      <div className="w-full lg:w-64 shrink-0">
        <ManageStockForm product={product} onAction={onAction} />
      </div>
    </div>
  );
}

/* ————————————————————————————————————————————————
   Main component
—————————————————————————————————————————————————— */

export default function ProductsTable({ products, onAction, viewMode = "list" }) {
  const [expandedId, setExpandedId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const toggleExpanded = (id) => setExpandedId((prev) => (prev === id ? null : id));

  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800/40 py-16 text-center">
        <Package className="h-6 w-6 text-neutral-300" />
        <p className="text-[13px] font-medium text-neutral-900 dark:text-white">No products match this view</p>
        <p className="text-xs text-neutral-400">Adjust your filters or add a new product.</p>
      </div>
    );
  }

  /* ---------- GRID VIEW ---------- */
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {products.map((product) => {
          const isOpen = expandedId === product.id;
          return (
            <div
              key={product.id}
              className={`col-span-1 ${isOpen ? "sm:col-span-2 lg:col-span-3" : ""} rounded-xl border bg-white dark:bg-gray-800 overflow-hidden transition-colors ${
                isOpen ? "border-brand-600/40" : "border-neutral-200 dark:border-gray-700 hover:border-neutral-300"
              }`}
            >
              <button onClick={() => toggleExpanded(product.id)} className="block w-full text-left">
                <div className="relative aspect-square w-full">
                  <ProductImage product={product} className="h-full w-full" />
                  <div className="absolute top-2 left-2">
                    <StatusBadge qty={product.qty} reorderLevel={product.reorder_level || 0} />
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <h4 className="text-[12.5px] font-semibold text-neutral-900 dark:text-white leading-snug line-clamp-1">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-neutral-900 dark:text-white tabular-nums">${product.selling_price || 0}</span>
                    <ChevronDown className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
                  </div>
                  <StockTier qty={product.qty} reorderLevel={product.reorder_level || 0} unit={product.unit || "Pcs"} />
                </div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.16 }}
                    className="overflow-hidden"
                  >
                    <ExpandedDetails product={product} onAction={onAction} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    );
  }

  /* ---------- LIST VIEW — real <table>, 9 columns ---------- */
  const COL_COUNT = 9;

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-x-auto">
      <table className="w-full min-w-[880px] border-collapse">
        <thead>
          <tr className="border-b border-neutral-100 dark:border-gray-700 bg-neutral-50/70 dark:bg-gray-900/30 text-[10.5px] font-semibold uppercase tracking-wide text-neutral-400">
            <th className="text-left px-4 py-2.5 w-[220px]">Product</th>
            <th className="text-left px-3 py-2.5">Code</th>
            <th className="text-left px-3 py-2.5">Category</th>
            <th className="text-left px-3 py-2.5">Brand / Shade</th>
            <th className="text-right px-3 py-2.5">Price</th>
            <th className="text-left px-3 py-2.5">Status</th>
            <th className="text-left px-3 py-2.5">Stock</th>
            <th className="text-left px-3 py-2.5">Updated</th>
            <th className="text-right px-4 py-2.5 w-[80px]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-gray-700">
          {products.map((product) => {
            const isOpen = expandedId === product.id;
            return (
              <Fragment key={product.id}>
                <tr
                  onClick={() => toggleExpanded(product.id)}
                  className={`cursor-pointer transition-colors ${isOpen ? "bg-brand-50/40 dark:bg-brand-400/5" : "hover:bg-neutral-50 dark:hover:bg-gray-700/20"}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IdentityBadge product={product} />
                      <p className="text-[13px] font-semibold text-neutral-900 dark:text-white truncate">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[12.5px] text-neutral-500 dark:text-gray-400 whitespace-nowrap">{product.code || "—"}</td>
                  <td className="px-3 py-3 text-[12.5px] text-neutral-500 dark:text-gray-400 whitespace-nowrap">{product.category_name || "—"}</td>
                  <td className="px-3 py-3 text-[12.5px] text-neutral-500 dark:text-gray-400 whitespace-nowrap">
                    {product.brand || product.shade ? `${product.brand || ""} ${product.shade || ""}`.trim() : "—"}
                  </td>
                  <td className="px-3 py-3 text-right text-[13px] font-bold text-neutral-900 dark:text-white tabular-nums whitespace-nowrap">
                    ${product.selling_price || 0}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge qty={product.qty} reorderLevel={product.reorder_level || 0} />
                  </td>
                  <td className="px-3 py-3">
                    <StockTier qty={product.qty} reorderLevel={product.reorder_level || 0} unit={product.unit || "Pcs"} />
                  </td>
                  <td className="px-3 py-3 text-[12px] text-neutral-400 whitespace-nowrap">
                    {product.updated_at ? new Date(product.updated_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <RowMenu
                        product={product}
                        open={openMenuId === product.id}
                        onToggle={(v) => setOpenMenuId(v === false ? null : openMenuId === product.id ? null : product.id)}
                        onAction={onAction}
                      />
                      <ChevronDown className={`h-4 w-4 text-neutral-400 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
                    </div>
                  </td>
                </tr>

                {isOpen && (
                  <tr>
                    <td colSpan={COL_COUNT} className="p-0">
                      <AnimatePresence>
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.16 }}
                          className="overflow-hidden"
                        >
                          <ExpandedDetails product={product} onAction={onAction} />
                        </motion.div>
                      </AnimatePresence>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
