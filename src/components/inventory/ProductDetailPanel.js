"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Camera, CheckCircle2, Package, Tag, Layers, Ruler, DollarSign, CircleDashed, Edit } from "lucide-react";
import toast from "react-hot-toast";
import { uploadImage, getOptimizedImageUrl } from "@/lib/imageUtils";
import Button from "@/components/ui/button";

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

const inputClass =
  "mt-1.5 w-full rounded-lg border border-neutral-200 px-3.5 h-9 text-sm outline-none focus:border-brand-600 disabled:bg-neutral-50 disabled:text-neutral-500 transition-colors";

const STATUS_STYLES = {
  out: { label: "Out of Stock", text: "text-danger-700", bg: "bg-danger-50", dot: "bg-danger-500" },
  low: { label: "Low Stock", text: "text-warning-700", bg: "bg-warning-50", dot: "bg-warning-500" },
  in: { label: "In Stock", text: "text-success-700", bg: "bg-success-50", dot: "bg-success-500" },
};

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white px-3.5 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-50 text-neutral-500">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-neutral-400">{label}</p>
        <p className="text-sm font-semibold text-neutral-900 truncate mt-0.5">{value || "—"}</p>
      </div>
    </div>
  );
}

function StockPill({ qty, reorderLevel }) {
  const state = qty === 0 ? "out" : qty <= reorderLevel ? "low" : "in";
  const s = STATUS_STYLES[state];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${s.bg} ${s.text} px-2.5 py-1 text-sm font-semibold`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
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
    if (!product) return null;
    const state = product.qty === 0 ? "out" : product.qty <= (product.reorder_level || 0) ? "low" : "in";
    return STATUS_STYLES[state];
  }, [product]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const handleImagePick = () => fileInputRef.current?.click();

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
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="fixed right-0 top-0 z-50 h-full w-full max-w-5xl bg-white"
          >
            <div className="flex h-full flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-200 bg-brand-900 px-5 py-4 shrink-0">
                <div className="flex items-center gap-3.5">
                  {form.photo_url ? (
                    <img
                      src={getOptimizedImageUrl(form.photo_url, { width: 80, height: 80 })}
                      alt={product.name}
                      className="h-11 w-11 rounded-lg object-cover border border-white/20"
                    />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10">
                      <Camera className="h-4.5 w-4.5 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-brand-100/60">Product detail</p>
                    <h2 className="text-[15px] font-semibold text-white leading-tight">{product.name}</h2>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!editing && (
                    <Button variant="secondary" size="sm" icon={Edit} onClick={() => setEditing(true)}>
                      Edit
                    </Button>
                  )}
                  <button onClick={onClose} className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition-colors">
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto bg-neutral-50/60 px-4 sm:px-6 py-5 sm:py-6">
                <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
                  {/* Left: overview */}
                  <div className="space-y-4">
                    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
                      <div className="relative h-52 sm:h-64 w-full bg-neutral-50 flex items-center justify-center">
                        {form.photo_url ? (
                          <img
                            src={getOptimizedImageUrl(form.photo_url, { width: 1200, height: 800 })}
                            alt={product.name}
                            className="h-full w-full object-contain p-6"
                          />
                        ) : (
                          <Camera className="h-8 w-8 text-neutral-300" />
                        )}
                        {editing && (
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={Camera}
                            loading={uploading}
                            onClick={handleImagePick}
                            className="absolute bottom-4 right-4"
                          >
                            {uploading ? "Uploading…" : "Upload image"}
                          </Button>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </div>

                      <div className="space-y-3 px-5 pb-5 pt-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-neutral-400">Name</p>
                            <p className="text-lg font-semibold text-neutral-900 mt-0.5">{product.name}</p>
                          </div>
                          {stockStatus && <StockPill qty={product.qty} reorderLevel={product.reorder_level || 0} />}
                        </div>
                        <p className="text-sm text-neutral-500 leading-relaxed">{product.description || "No description provided"}</p>
                        <div className="flex flex-wrap gap-2">
                          {product.category_name && (
                            <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-semibold text-neutral-600">
                              {product.category_name}
                            </span>
                          )}
                          {product.unit && (
                            <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-semibold text-neutral-600">Unit: {product.unit}</span>
                          )}
                          {product.product_type && (
                            <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-semibold text-neutral-600">
                              {product.product_type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <StatCard icon={Tag} label="Code" value={product.code || product.new_code} />
                      <StatCard icon={Layers} label="Brand / Shade" value={product.brand || product.shade || product.new_shade} />
                      <StatCard icon={Ruler} label="Size" value={product.size} />
                      <StatCard icon={CircleDashed} label="Reorder level" value={product.reorder_level ?? "—"} />
                      <StatCard icon={DollarSign} label="Selling price" value={product.selling_price ? `$${product.selling_price}` : "—"} />
                      <StatCard icon={Package} label="Current stock" value={`${product.qty ?? 0} ${product.unit || "Pcs"}`} />
                    </div>
                  </div>

                  {/* Right: editable data */}
                  <motion.div layout className="rounded-xl border border-neutral-200 bg-white p-5 h-fit">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-neutral-400">Product data</p>
                        {stockStatus && <p className={`text-sm font-semibold mt-0.5 ${stockStatus.text}`}>{stockStatus.label}</p>}
                      </div>
                      {onManageStock && (
                        <Button variant="outline" size="sm" onClick={onManageStock}>
                          Manage stock
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Name</label>
                        <input value={form.name} onChange={(e) => handleChange("name", e.target.value)} disabled={!editing} className={inputClass} />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-neutral-600">Category</label>
                        <select
                          value={form.category_id || ""}
                          onChange={(e) => handleChange("category_id", e.target.value)}
                          disabled={!editing}
                          className={inputClass}
                        >
                          <option value="">Select category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-neutral-600">Description</label>
                        <textarea
                          value={form.description || ""}
                          onChange={(e) => handleChange("description", e.target.value)}
                          disabled={!editing}
                          rows={3}
                          className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-600 disabled:bg-neutral-50 disabled:text-neutral-500 resize-none transition-colors"
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-neutral-600">Product type</label>
                          <input
                            value={form.product_type || ""}
                            onChange={(e) => handleChange("product_type", e.target.value)}
                            disabled={!editing}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-neutral-600">Unit</label>
                          <input
                            value={form.unit || ""}
                            onChange={(e) => handleChange("unit", e.target.value)}
                            disabled={!editing}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-neutral-600">Brand</label>
                          <input
                            value={form.brand || ""}
                            onChange={(e) => handleChange("brand", e.target.value)}
                            disabled={!editing}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-neutral-600">Shade</label>
                          <input
                            value={form.shade || form.new_shade || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setForm((prev) => ({ ...prev, shade: value, new_shade: value }));
                            }}
                            disabled={!editing}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-neutral-600">Code</label>
                          <input
                            value={form.code || form.new_code || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              setForm((prev) => ({ ...prev, code: value, new_code: value }));
                            }}
                            disabled={!editing}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-neutral-600">Size</label>
                          <input
                            value={form.size || ""}
                            onChange={(e) => handleChange("size", e.target.value)}
                            disabled={!editing}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-neutral-600">Selling price</label>
                          <input
                            type="number"
                            value={form.selling_price ?? ""}
                            onChange={(e) => handleChange("selling_price", e.target.value)}
                            disabled={!editing}
                            className={inputClass}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-neutral-600">Reorder level</label>
                          <input
                            type="number"
                            value={form.reorder_level ?? ""}
                            onChange={(e) => handleChange("reorder_level", e.target.value)}
                            disabled={!editing}
                            className={inputClass}
                          />
                        </div>
                      </div>

                      {editing && (
                        <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-neutral-100 mt-2">
                          <Button variant="secondary" size="sm" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                          <Button variant="primary" size="sm" icon={CheckCircle2} loading={saving} onClick={handleSave}>
                            {saving ? "Saving…" : "Save changes"}
                          </Button>
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
