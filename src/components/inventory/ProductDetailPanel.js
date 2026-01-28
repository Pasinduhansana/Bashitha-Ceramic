"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Camera, Loader2, CheckCircle2, AlertTriangle, Package, Tag, Layers, Ruler, DollarSign, CircleDashed, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { uploadImage, getOptimizedImageUrl } from "@/lib/imageUtils";

const defaultForm = {
  name: "",
  description: "",
  category_id: "",
  product_type: "",
  brand: "",
  code: "",
  new_code: "",
  shade: "",
  new_shade: "",
  size: "",
  unit: "",
  cost_price: "",
  selling_price: "",
  reorder_level: "",
  photo_url: "",
};

function StatBadge({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-gray-200 bg-white/80 px-3 py-3 shadow-sm">
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gradient-to-br from-gray-100 to-white text-gray-700">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate">{value || "—"}</p>
      </div>
    </div>
  );
}

function StockPill({ qty, reorderLevel }) {
  if (qty === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
        <AlertTriangle className="h-3.5 w-3.5" /> Out of Stock
      </span>
    );
  }
  if (qty <= reorderLevel) {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
        <AlertTriangle className="h-3.5 w-3.5" /> Low Stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
      <ShieldCheck className="h-3.5 w-3.5" /> In Stock
    </span>
  );
}

export default function ProductDetailPanel({ product, isOpen, mode = "view", categories = [], onClose, onSaved, onManageStock }) {
  const fileInputRef = useRef(null);
  const [editing, setEditing] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (product && isOpen) {
      setForm({ ...defaultForm, ...product, reorder_level: product.reorder_level ?? "", category_id: product.category_id ?? "" });
      setEditing(mode === "edit");
    }
  }, [product, mode, isOpen]);

  const stockStatus = useMemo(() => {
    if (!product) return { text: "", color: "text-gray-700", bg: "bg-gray-50" };
    if (product.qty === 0) return { text: "Out of Stock", color: "text-red-600", bg: "bg-red-50" };
    if (product.qty <= (product.reorder_level || 0)) return { text: "Low Stock", color: "text-orange-600", bg: "bg-orange-50" };
    return { text: "In Stock", color: "text-green-700", bg: "bg-green-50" };
  }, [product]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImagePick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImage(file, "products");
      const optimized = getOptimizedImageUrl(result.url, { width: 900, height: 900 });
      setForm((prev) => ({ ...prev, photo_url: optimized || result.url }));
      toast.success("Image uploaded");
    } catch (error) {
      console.error("Image upload failed", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        category_id: form.category_id ? Number(form.category_id) : null,
        cost_price: null,
        selling_price: form.selling_price === "" || form.selling_price === null ? null : Number(form.selling_price),
        reorder_level: form.reorder_level === "" || form.reorder_level === null ? null : Number(form.reorder_level),
        code: form.code,
        new_code: form.code || form.new_code,
        shade: form.shade,
        new_shade: form.shade || form.new_shade,
      };
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error || "Failed to update product");
        return;
      }
      toast.success("Product updated");
      setEditing(false);
      onSaved?.();
    } catch (error) {
      console.error("Error saving product", error);
      toast.error("Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (!product) return;
    setForm({ ...defaultForm, ...product, reorder_level: product.reorder_level ?? "", category_id: product.category_id ?? "" });
    setEditing(false);
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%", opacity: 0.3 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 24, stiffness: 240 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-4xl sm:max-w-2xl md:max-w-4xl bg-white shadow-2xl"
          >
            <div className="flex h-full flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-[#1fb8a2] to-[#189d8b] px-6 py-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {form.photo_url ? (
                      <img
                        src={getOptimizedImageUrl(form.photo_url, { width: 80, height: 80 })}
                        alt={product.name}
                        className="h-11 w-11 rounded-md object-cover border-2 border-white/30"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-md bg-white/15">
                        <Camera className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/80">Product Detail</p>
                    <h2 className="text-lg font-semibold leading-tight">{product.name}</h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="rounded-md bg-white/90 px-3 py-2 text-sm font-semibold text-[#137e6e] shadow hover:bg-white"
                    >
                      Edit
                    </button>
                  )}
                  <button onClick={onClose} className="rounded-md p-2 text-white/80 hover:bg-white/15" aria-label="Close product detail">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto bg-gray-50/70 px-3 sm:px-6 py-4 sm:py-6">
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.3fr_1fr]">
                  {/* Left column: detail + image */}
                  <motion.div layout className="space-y-3 sm:space-y-4">
                    <div className="rounded-md sm:rounded-md border border-gray-200 bg-white shadow-sm">
                      <div className="relative h-40 sm:h-64 w-full overflow-hidden rounded-t-lg sm:rounded-t-2xl bg-gradient-to-br from-gray-100 to-white">
                        {form.photo_url ? (
                          <img
                            src={getOptimizedImageUrl(form.photo_url, { width: 1200, height: 800 })}
                            alt={product.name}
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <Camera className="h-8 w-8" />
                          </div>
                        )}
                        {editing && (
                          <button
                            onClick={handleImagePick}
                            className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-md bg-white/90 px-4 py-2 text-sm font-semibold text-gray-800 shadow hover:bg-white"
                          >
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />} Upload Image
                          </button>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </div>

                      <div className="space-y-3 px-5 pb-5 pt-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-500">Name</p>
                            <p className="text-lg font-semibold text-gray-900">{product.name}</p>
                          </div>
                          <div className="flex-shrink-0">
                            <StockPill qty={product.qty} reorderLevel={product.reorder_level || 0} />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{product.description || "No description"}</p>
                        <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                          {product.category_name && <span className="rounded-md bg-gray-100 px-3 py-1 font-semibold">{product.category_name}</span>}
                          {product.unit && <span className="rounded-md bg-gray-100 px-3 py-1 font-semibold">Unit: {product.unit}</span>}
                          {product.product_type && <span className="rounded-md bg-gray-100 px-3 py-1 font-semibold">{product.product_type}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <StatBadge icon={Tag} label="Code" value={product.code || product.new_code} />
                      <StatBadge icon={Layers} label="Brand / Shade" value={product.brand || product.shade || product.new_shade} />
                      <StatBadge icon={Ruler} label="Size" value={product.size} />
                      <StatBadge icon={CircleDashed} label="Reorder Level" value={product.reorder_level ?? "—"} />
                      <StatBadge icon={DollarSign} label="Selling Price" value={product.selling_price ? `$${product.selling_price}` : "—"} />
                    </div>
                  </motion.div>

                  {/* Right column: edit form */}
                  <motion.div layout className="rounded-md border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Product Data</p>
                        <p className={`text-sm font-semibold ${stockStatus.color}`}>{stockStatus.text}</p>
                      </div>
                      {onManageStock && (
                        <button
                          onClick={onManageStock}
                          className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-[#1fb8a2] hover:text-[#1fb8a2]"
                        >
                          Manage Stock
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600">Name</label>
                        <input
                          value={form.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          disabled={!editing}
                          className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 disabled:bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600">Category</label>
                        <select
                          value={form.category_id || ""}
                          onChange={(e) => handleChange("category_id", e.target.value)}
                          disabled={!editing}
                          className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 disabled:bg-gray-50 text-gray-900 [&_option:first-child]:text-gray-400"
                        >
                          <option value="" className="text-gray-400">
                            Select category
                          </option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-600">Description</label>
                        <textarea
                          value={form.description || ""}
                          onChange={(e) => handleChange("description", e.target.value)}
                          disabled={!editing}
                          rows={3}
                          className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 disabled:bg-gray-50"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold text-gray-600">Product Type</label>
                          <input
                            value={form.product_type || ""}
                            onChange={(e) => handleChange("product_type", e.target.value)}
                            disabled={!editing}
                            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 disabled:bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600">Unit</label>
                          <input
                            value={form.unit || ""}
                            onChange={(e) => handleChange("unit", e.target.value)}
                            disabled={!editing}
                            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 disabled:bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold text-gray-600">Brand</label>
                          <input
                            value={form.brand || ""}
                            onChange={(e) => handleChange("brand", e.target.value)}
                            disabled={!editing}
                            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 disabled:bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600">Shade</label>
                          <input
                            value={form.shade || form.new_shade || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setForm((prev) => ({ ...prev, shade: value, new_shade: value }));
                            }}
                            disabled={!editing}
                            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 disabled:bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold text-gray-600">Code</label>
                          <input
                            value={form.code || form.new_code || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setForm((prev) => ({ ...prev, code: value, new_code: value }));
                            }}
                            disabled={!editing}
                            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 disabled:bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600">Size</label>
                          <input
                            value={form.size || ""}
                            onChange={(e) => handleChange("size", e.target.value)}
                            disabled={!editing}
                            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 disabled:bg-gray-50"
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold text-gray-600">Selling Price</label>
                          <input
                            type="number"
                            value={form.selling_price ?? ""}
                            onChange={(e) => handleChange("selling_price", e.target.value)}
                            disabled={!editing}
                            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 disabled:bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-600">Reorder Level</label>
                          <input
                            type="number"
                            value={form.reorder_level ?? ""}
                            onChange={(e) => handleChange("reorder_level", e.target.value)}
                            disabled={!editing}
                            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 disabled:bg-gray-50"
                          />
                        </div>
                      </div>

                      {editing && (
                        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                          <button
                            onClick={handleCancelEdit}
                            className="rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                            type="button"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-md bg-[#1fb8a2] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#189d8b] disabled:cursor-not-allowed disabled:opacity-70"
                          >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save Changes
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
