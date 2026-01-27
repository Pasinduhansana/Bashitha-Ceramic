/**
 * Inventory Management Slide-in Panel
 * Beautiful right-side panel for managing product inventory
 * Allows adding/removing stock with automatic logging
 */

"use client";

import { useState, useEffect } from "react";
import { X, Package, Plus, Minus, Save, Clock, User, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function InventoryPanel({ product, isOpen, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [stockHistory, setStockHistory] = useState([]);
  const [adjustmentType, setAdjustmentType] = useState("add"); // 'add' or 'remove'
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  // Fetch stock history when panel opens
  useEffect(() => {
    if (isOpen && product) {
      fetchStockHistory();
    }
  }, [isOpen, product]);

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
        toast.success(`Inventory ${adjustmentType === "add" ? "added" : "removed"} successfully!`);
        setQuantity("");
        setReason("");
        fetchStockHistory();
        onUpdate?.(); // Refresh product list
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
    if (product.qty === 0) return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-50" };
    if (product.qty <= product.reorder_level) return { text: "Low Stock", color: "text-orange-600", bg: "bg-orange-50" };
    return { text: "In Stock", color: "text-green-600", bg: "bg-green-50" };
  };

  const formatAction = (action) => {
    const actionMap = {
      MANUAL_ADD: "Manual Addition",
      MANUAL_REMOVE: "Manual Removal",
      SALE: "Sale",
      PURCHASE: "Purchase",
      RETURN: "Return",
      RETURN_INVOICE: "Invoice Return",
      RETURN_PURCHASE: "Purchase Return",
      INVOICE_DELETE: "Invoice Deletion",
      PURCHASE_DELETE: "Purchase Deletion",
      INITIAL_STOCK: "Initial Stock",
      ADJUSTMENT: "Adjustment",
    };
    return actionMap[action] || action;
  };

  const getActionIcon = (action) => {
    if (action.includes("ADD") || action.includes("PURCHASE") || action.includes("INITIAL")) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    }
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const status = product ? getStockStatus() : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-[#1fb8a2] to-[#189d8b] px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Inventory Management</h2>
                    <p className="text-sm text-white/80">Adjust stock levels</p>
                  </div>
                </div>
                <button onClick={onClose} className="rounded-lg p-2 text-white/80 hover:bg-white/20 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Product Info */}
              <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-5">
                <div className="flex flex-col items-start gap-4">
                  <div className="flex flex-row items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-[#1fb8a2] to-[#189d8b] text-white shrink-0">
                      <Box className="h-7 w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{product.description || "No description"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex w-28 items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium ${status.bg} ${status.color}`}>
                      {product.qty === 0 ? <AlertCircle className="h-3.5 w-3.5" /> : <CheckCircle className="h-3.5 w-3.5" />}
                      {status.text}
                    </span>
                    {product.category_name && <span className="text-xs text-gray-500">{product.category_name}</span>}
                  </div>
                </div>

                {/* Stock Stats */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="rounded-lg bg-white border border-gray-200 p-3">
                    <p className="text-xs text-gray-500 mb-1">Current Stock</p>
                    <p className="text-xl font-bold text-gray-900">{product.qty}</p>
                    <p className="text-xs text-gray-500">{product.unit || "Pcs"}</p>
                  </div>
                  <div className="rounded-lg bg-white border border-gray-200 p-3">
                    <p className="text-xs text-gray-500 mb-1">Reorder Level</p>
                    <p className="text-xl font-bold text-gray-900">{product.reorder_level || 0}</p>
                    <p className="text-xs text-gray-500">{product.unit || "Pcs"}</p>
                  </div>
                  <div className="rounded-lg bg-white border border-gray-200 p-3">
                    <p className="text-xs text-gray-500 mb-1">Selling Price</p>
                    <p className="text-xl font-bold text-[#1fb8a2]">${product.selling_price || 0}</p>
                  </div>
                </div>
              </div>

              {/* Adjustment Form */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Adjust Inventory</h4>

                {/* Action Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setAdjustmentType("add")}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-4  text-sm font-medium transition-all ${
                        adjustmentType === "add"
                          ? "border-[#1fb8a2] bg-[#1fb8a2]/10 text-[#1fb8a2]"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Plus className="h-4 w-4" />
                      Add Stock
                    </button>
                    <button
                      onClick={() => setAdjustmentType("remove")}
                      className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                        adjustmentType === "remove"
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Minus className="h-4 w-4" />
                      Remove Stock
                    </button>
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity ({product.unit || "Pcs"})</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    placeholder="Enter quantity"
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 placeholder:text-gray-400"
                  />
                </div>

                {/* Reason */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reason (Optional)</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 text-gray-900 [&_option:first-child]:text-gray-400"
                  >
                    <option value="" className="text-gray-400">
                      Select reason...
                    </option>
                    {adjustmentType === "add" ? (
                      <>
                        <option value="MANUAL_ADD">Manual Addition</option>
                        <option value="ADJUSTMENT">Stock Adjustment</option>
                        <option value="FOUND">Stock Found</option>
                      </>
                    ) : (
                      <>
                        <option value="MANUAL_REMOVE">Manual Removal</option>
                        <option value="ADJUSTMENT">Stock Adjustment</option>
                        <option value="DAMAGED">Damaged</option>
                        <option value="LOST">Lost/Missing</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleAdjustInventory}
                  disabled={loading}
                  className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-all ${
                    adjustmentType === "add"
                      ? "bg-gradient-to-r from-[#1fb8a2] to-[#189d8b] hover:shadow-lg"
                      : "bg-gradient-to-r from-red-600 to-red-700 hover:shadow-lg"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <Save className="h-4 w-4" />
                  {loading ? "Updating..." : `${adjustmentType === "add" ? "Add" : "Remove"} Stock`}
                </button>
              </div>

              {/* Stock History */}
              <div className="rounded-xl border border-gray-200 bg-white p-5">
                <h4 className="text-sm font-semibold text-gray-900 mb-4">Stock History</h4>

                {loadingHistory ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1fb8a2]"></div>
                  </div>
                ) : stockHistory.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">No history available</p>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {stockHistory.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${log.qty > 0 ? "bg-green-100" : "bg-red-100"}`}
                        >
                          {getActionIcon(log.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900">{formatAction(log.action)}</p>
                            <span className={`text-sm font-semibold ${log.qty > 0 ? "text-green-600" : "text-red-600"}`}>
                              {log.qty > 0 ? "+" : ""}
                              {log.qty}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {log.user_name && (
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {log.user_name}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(log.created_at).toLocaleString()}
                            </span>
                          </div>
                          {log.invoice_no && <p className="text-xs text-gray-600 mt-1">Invoice: {log.invoice_no}</p>}
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
