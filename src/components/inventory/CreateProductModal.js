"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";

export default function CreateProductModal({ isOpen, categories = [], onClose, onProductCreated }) {
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category_id: "",
    product_type: "",
    brand: "",
    code: "",
    shade: "",
    size: "",
    unit: "",
    cost_price: "",
    selling_price: "",
    reorder_level: "",
    qty: "0",
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.selling_price) {
      toast.error("Please fill in required fields (Name, Selling Price)", {
        position: "top-center",
        duration: 4000,
      });
      return;
    }

    setSaving(true);
    try {
      let photoUrl = null;

      // Upload image if provided
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          photoUrl = uploadData.url;
        }
      }

      const payload = {
        ...form,
        photo_url: photoUrl,
        category_id: form.category_id ? Number(form.category_id) : null,
        cost_price: null,
        selling_price: Number(form.selling_price),
        reorder_level: form.reorder_level === "" ? 0 : Number(form.reorder_level),
        qty: form.qty === "" ? 0 : Number(form.qty),
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to create product", {
          position: "top-center",
          duration: 4000,
        });
        return;
      }

      toast.success("Product created successfully!", {
        position: "top-center",
        duration: 4000,
      });
      setForm({
        name: "",
        description: "",
        category_id: "",
        product_type: "",
        brand: "",
        code: "",
        shade: "",
        size: "",
        unit: "",
        cost_price: "",
        selling_price: "",
        reorder_level: "",
        qty: "0",
      });
      setImageFile(null);
      setImagePreview(null);
      onProductCreated?.();
      onClose();
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product", {
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setSaving(false);
    }
  };

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
            className="fixed right-0 top-0 z-50 h-full w-full max-w-2xl bg-white shadow-2xl"
          >
            <div className="flex h-full flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-linear-to-r from-[#1fb8a2] to-[#189d8b] px-6 py-4 text-white">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/80">New Product</p>
                  <h2 className="text-lg font-semibold leading-tight">Create Product</h2>
                </div>
                <button onClick={onClose} className="rounded-lg p-2 text-white/80 hover:bg-white/15" aria-label="Close modal">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto bg-gray-50/70 px-6 py-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name and Category */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Product Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Enter product name"
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Category</label>
                    <select
                      value={form.category_id}
                      onChange={(e) => handleChange("category_id", e.target.value)}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 text-gray-900 [&_option:first-child]:text-gray-400"
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

                  {/* Description */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Description</label>
                    <textarea
                      value={form.description || ""}
                      onChange={(e) => handleChange("description", e.target.value)}
                      placeholder="Enter product description"
                      rows={3}
                      className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 placeholder:text-gray-400"
                    />
                  </div>

                  {/* Product Image */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Product Image</label>
                    <div className="mt-1 flex items-center gap-4">
                      {imagePreview && (
                        <div className="relative h-20 w-20 rounded-lg border  border-gray-200 overflow-hidden">
                          <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#1fb8a2] file:text-white hover:file:bg-[#189d8b] cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Product Type and Unit */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Product Type</label>
                      <input
                        type="text"
                        value={form.product_type || ""}
                        onChange={(e) => handleChange("product_type", e.target.value)}
                        placeholder="e.g., Ceramic"
                        className="mt-1 w-full rounded-lg border outline-none border-gray-200 px-3 py-2 text-sm focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Unit</label>
                      <input
                        type="text"
                        value={form.unit || ""}
                        onChange={(e) => handleChange("unit", e.target.value)}
                        placeholder="e.g., Pcs, Kg"
                        className="mt-1 w-full rounded-lg border outline-none border-gray-200 px-3 py-2 text-sm focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Brand and Shade */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Brand</label>
                      <input
                        type="text"
                        value={form.brand || ""}
                        onChange={(e) => handleChange("brand", e.target.value)}
                        placeholder="Brand name"
                        className="mt-1 w-full rounded-lg border outline-none border-gray-200 px-3 py-2 text-sm focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Shade</label>
                      <input
                        type="text"
                        value={form.shade || ""}
                        onChange={(e) => handleChange("shade", e.target.value)}
                        placeholder="Color/Shade"
                        className="mt-1 w-full rounded-lg border outline-none border-gray-200 px-3 py-2 text-sm focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Code and Size */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Code</label>
                      <input
                        type="text"
                        value={form.code || ""}
                        onChange={(e) => handleChange("code", e.target.value)}
                        placeholder="Product code"
                        className="mt-1 w-full rounded-lg border outline-none border-gray-200 px-3 py-2 text-sm focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Size</label>
                      <input
                        type="text"
                        value={form.size || ""}
                        onChange={(e) => handleChange("size", e.target.value)}
                        placeholder="Size"
                        className="mt-1 w-full rounded-lg border outline-none border-gray-200 px-3 py-2 text-sm focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Prices and Stock */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Selling Price *</label>
                      <input
                        type="number"
                        value={form.selling_price || ""}
                        onChange={(e) => handleChange("selling_price", e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        required
                        className="mt-1 w-full rounded-lg border outline-none border-gray-200 px-3 py-2 text-sm focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-600">Reorder Level</label>
                      <input
                        type="number"
                        value={form.reorder_level || ""}
                        onChange={(e) => handleChange("reorder_level", e.target.value)}
                        placeholder="0"
                        className="mt-1 w-full rounded-lg border outline-none border-gray-200 px-3 py-2 text-sm focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 placeholder:text-gray-400"
                      />
                    </div>
                  </div>

                  {/* Initial Quantity */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Initial Stock Quantity</label>
                    <input
                      type="number"
                      value={form.qty || "0"}
                      onChange={(e) => handleChange("qty", e.target.value)}
                      placeholder="0"
                      className="mt-1 w-full rounded-lg border outline-none border-gray-200 px-3 py-2 text-sm focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]/20 placeholder:text-gray-400"
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-200 pt-4 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#1fb8a2] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#189d8b] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Create Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
