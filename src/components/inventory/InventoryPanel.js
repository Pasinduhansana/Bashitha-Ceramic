/**
 * Inventory Management Slide-in Panel
 */

"use client";

import { useState, useEffect } from "react";
import { X, Package, Plus, Minus, Save, Clock, User, TrendingUp, TrendingDown } from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import Button from "@/components/ui/button";

const STATUS_STYLES = {
  out: { label: "Out of Stock", text: "text-rose-700", bg: "bg-rose-50", dot: "bg-rose-500" },
  low: { label: "Low Stock", text: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
  in: { label: "In Stock", text: "text-emerald-700", bg: "bg-emerald-50", dot: "bg-emerald-500" },
};

const ACTION_LABELS = {
  MANUAL_ADD: "Manual addition",
  MANUAL_REMOVE: "Manual removal",
  SALE: "Sale",
  PURCHASE: "Purchase",
  RETURN: "Return",
  RETURN_INVOICE: "Invoice return",
  RETURN_PURCHASE: "Purchase return",
  INVOICE_DELETE: "Invoice deletion",
  PURCHASE_DELETE: "Purchase deletion",
  INITIAL_STOCK: "Initial stock",
  ADJUSTMENT: "Adjustment",
};

export default function InventoryPanel({ product, isOpen, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [stockHistory, setStockHistory] = useState([]);
  const [adjustmentType, setAdjustmentType] = useState("add");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const fetchStockHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/products/${product.id}`);
      const data = await response.json();
      setStockHistory(data.stockHistory || []);
    } catch (error) {
      console.error("Error fetching stock history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleAdjustInventory = async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: adjustmentType,
          qty: parseInt(quantity),
          reason: reason || (adjustmentType === "add" ? "MANUAL_ADD" : "MANUAL_REMOVE"),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Stock ${adjustmentType === "add" ? "added" : "removed"} successfully`);
        setQuantity("");
        setReason("");
        fetchStockHistory();
        onUpdate?.();
      } else {
        toast.error(data.error || "Failed to update inventory");
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
      toast.error("Failed to update inventory");
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = () => {
    if (product.qty === 0) return STATUS_STYLES.out;
    if (product.qty <= product.reorder_level) return STATUS_STYLES.low;
    return STATUS_STYLES.in;
  };

  const getActionIcon = (action) =>
    action.includes("ADD") || action.includes("PURCHASE") || action.includes("INITIAL") ? (
      <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
    ) : (
      <TrendingDown className="h-3.5 w-3.5 text-rose-600" />
    );

  const status = product ? getStockStatus() : null;

  useEffect(() => {
    if (isOpen && product) fetchStockHistory();
  }, [isOpen, product]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 h-full w-full md:w-[480px] bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="border-b border-neutral-200 bg-teal-900 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-semibold text-white">Inventory management</h2>
                    <p className="text-xs text-teal-100/70 mt-0.5">Adjust stock levels and track history</p>
                  </div>
                </div>
                <button onClick={onClose} className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Product summary */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold text-neutral-900 leading-snug">{product.name}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">{product.description || "No description provided"}</p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full ${status.bg} ${status.text} px-2.5 py-1 text-[11px] font-semibold`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                      {product.category_name && <span className="text-[11px] text-neutral-400">{product.category_name}</span>}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2.5">
                  <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-neutral-400 mb-1">Stock</p>
                    <p className="text-lg font-bold text-neutral-900 tabular-nums">{product.qty}</p>
                    <p className="text-[10px] text-neutral-400">{product.unit || "Pcs"}</p>
                  </div>
                  <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-neutral-400 mb-1">Reorder at</p>
                    <p className="text-lg font-bold text-neutral-900 tabular-nums">{product.reorder_level || 0}</p>
                    <p className="text-[10px] text-neutral-400">{product.unit || "Pcs"}</p>
                  </div>
                  <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                    <p className="text-[10px] uppercase tracking-wide text-neutral-400 mb-1">Price</p>
                    <p className="text-lg text-teal-800 italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
                      ${product.selling_price || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Adjustment form */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h4 className="text-[13px] font-semibold text-neutral-900 mb-4">Adjust inventory</h4>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-neutral-600 mb-2">Action type</label>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-neutral-100">
                    <button
                      onClick={() => setAdjustmentType("add")}
                      className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13px] font-semibold transition-all ${
                        adjustmentType === "add" ? "bg-white text-teal-800 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                      }`}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add stock
                    </button>
                    <button
                      onClick={() => setAdjustmentType("remove")}
                      className={`flex items-center justify-center gap-1.5 rounded-lg py-2.5 text-[13px] font-semibold transition-all ${
                        adjustmentType === "remove" ? "bg-white text-rose-700 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                      }`}
                    >
                      <Minus className="h-3.5 w-3.5" /> Remove stock
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-medium text-neutral-600 mb-2">Quantity ({product.unit || "Pcs"})</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    placeholder="Enter quantity"
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-600/50 focus:ring-4 focus:ring-teal-600/10 placeholder:text-neutral-400 transition-all"
                  />
                </div>

                <div className="mb-5">
                  <label className="block text-xs font-medium text-neutral-600 mb-2">Reason (optional)</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-teal-600/50 focus:ring-4 focus:ring-teal-600/10 text-neutral-900 transition-all"
                  >
                    <option value="">Select reason…</option>
                    {adjustmentType === "add" ? (
                      <>
                        <option value="MANUAL_ADD">Manual addition</option>
                        <option value="ADJUSTMENT">Stock adjustment</option>
                        <option value="FOUND">Stock found</option>
                      </>
                    ) : (
                      <>
                        <option value="MANUAL_REMOVE">Manual removal</option>
                        <option value="ADJUSTMENT">Stock adjustment</option>
                        <option value="DAMAGED">Damaged</option>
                        <option value="LOST">Lost / missing</option>
                      </>
                    )}
                  </select>
                </div>

                <Button
                  variant={adjustmentType === "add" ? "primary" : "danger"}
                  size="lg"
                  fullWidth
                  icon={Save}
                  loading={loading}
                  onClick={handleAdjustInventory}
                >
                  {loading ? "Updating…" : `${adjustmentType === "add" ? "Add" : "Remove"} stock`}
                </Button>
              </div>

              {/* History */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h4 className="text-[13px] font-semibold text-neutral-900 mb-4">Stock history</h4>

                {loadingHistory ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-teal-700 border-r-transparent" />
                  </div>
                ) : stockHistory.length === 0 ? (
                  <p className="text-xs text-neutral-400 text-center py-10">No history available yet</p>
                ) : (
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {stockHistory.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 rounded-xl border border-neutral-100 bg-neutral-50/60 p-3 hover:bg-neutral-50 transition-colors"
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${log.qty > 0 ? "bg-emerald-50" : "bg-rose-50"}`}
                        >
                          {getActionIcon(log.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[13px] font-medium text-neutral-900">{ACTION_LABELS[log.action] || log.action}</p>
                            <span className={`text-[13px] font-semibold tabular-nums ${log.qty > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              {log.qty > 0 ? "+" : ""}
                              {log.qty}
                            </span>
                          </div>
                          <div className="flex items-center gap-2.5 text-[11px] text-neutral-400 mt-1">
                            {log.user_name && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" /> {log.user_name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>
                          {log.invoice_no && <p className="text-[11px] text-neutral-500 mt-1">Invoice: {log.invoice_no}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
