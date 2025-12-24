"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, ShoppingBag, Building2, Calendar, CreditCard, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function CreatePurchaseModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Supplier, 2: Products, 3: Review
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState("");

  const [formData, setFormData] = useState({
    supplier_id: "",
    items: [],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
      fetchProducts();
    }
  }, [isOpen]);

  const fetchSuppliers = async () => {
    try {
      // Note: You'll need to create suppliers API endpoint
      const res = await fetch("/api/suppliers");
      const data = await res.json();
      setSuppliers(data.suppliers || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      // Mock data if API doesn't exist
      setSuppliers([
        { id: 1, name: "Supplier A", contact: "+94 71 111 1111" },
        { id: 2, name: "Supplier B", contact: "+94 71 222 2222" },
      ]);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const addItem = (product) => {
    const existing = formData.items.find((item) => item.product_id === product.id);
    if (existing) {
      setFormData({
        ...formData,
        items: formData.items.map((item) => (item.product_id === product.id ? { ...item, qty: item.qty + 1 } : item)),
      });
    } else {
      setFormData({
        ...formData,
        items: [
          ...formData.items,
          {
            product_id: product.id,
            product_name: product.name,
            qty: 1,
            cost_price: product.cost_price || product.selling_price * 0.7,
          },
        ],
      });
    }
    toast.success(`Added ${product.name}`);
  };

  const updateItemQty = (productId, qty) => {
    if (qty < 1) {
      removeItem(productId);
      return;
    }
    setFormData({
      ...formData,
      items: formData.items.map((item) => (item.product_id === productId ? { ...item, qty } : item)),
    });
  };

  const updateItemPrice = (productId, cost_price) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) => (item.product_id === productId ? { ...item, cost_price } : item)),
    });
  };

  const removeItem = (productId) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.product_id !== productId),
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.qty * item.cost_price, 0);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!formData.supplier_id) {
        toast.error("Please select a supplier");
        return;
      }
      if (formData.items.length === 0) {
        toast.error("Please add at least one product");
        return;
      }

      const total = calculateTotal();

      const response = await fetch("/api/purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          total_amount: total,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Purchase order created successfully!");
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          supplier_id: "",
          items: [],
        });
        setStep(1);
      } else {
        toast.error(data.error || "Failed to create purchase");
      }
    } catch (error) {
      console.error("Error creating purchase:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(searchProduct.toLowerCase()) || p.code?.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const total = calculateTotal();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1fb8a2] to-[#189d8b] px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create Purchase Order</h2>
                <p className="text-sm text-white/80">Add new stock purchase</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[
                { num: 1, label: "Supplier", icon: Building2 },
                { num: 2, label: "Products", icon: ShoppingBag },
                { num: 3, label: "Review", icon: CreditCard },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        step >= s.num ? "bg-[#1fb8a2] text-white" : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className={`text-xs mt-2 font-medium ${step >= s.num ? "text-[#1fb8a2]" : "text-gray-500"}`}>{s.label}</span>
                  </div>
                  {i < 2 && <div className={`h-0.5 flex-1 mx-4 ${step > s.num ? "bg-[#1fb8a2]" : "bg-gray-200"}`}></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Step 1: Supplier Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Supplier</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suppliers.map((supplier) => (
                    <button
                      key={supplier.id}
                      onClick={() => setFormData({ ...formData, supplier_id: supplier.id })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.supplier_id === supplier.id ? "border-[#1fb8a2] bg-[#1fb8a2]/5" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1fb8a2] to-[#189d8b] flex items-center justify-center text-white font-semibold">
                          {supplier.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{supplier.name}</p>
                          <p className="text-sm text-gray-500">{supplier.contact}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Product Selection */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Add Products</h3>
                  <span className="text-sm text-gray-500">{formData.items.length} items added</span>
                </div>

                {/* Search Products */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1fb8a2]"
                  />
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addItem(product)}
                      className="p-3 rounded-lg border border-gray-200 hover:border-[#1fb8a2] hover:bg-[#1fb8a2]/5 transition-all text-left"
                    >
                      <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Current Stock: {product.qty}</p>
                      <p className="text-sm font-bold text-[#1fb8a2] mt-2">${product.cost_price || (product.selling_price * 0.7).toFixed(2)}</p>
                    </button>
                  ))}
                </div>

                {/* Selected Items */}
                {formData.items.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Purchase Items</h4>
                    <div className="space-y-2">
                      {formData.items.map((item) => (
                        <div key={item.product_id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{item.product_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500">Qty:</label>
                            <button
                              onClick={() => updateItemQty(item.product_id, item.qty - 1)}
                              className="h-8 w-8 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-12 text-center font-medium">{item.qty}</span>
                            <button
                              onClick={() => updateItemQty(item.product_id, item.qty + 1)}
                              className="h-8 w-8 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-xs text-gray-500">Price:</label>
                            <input
                              type="number"
                              value={item.cost_price}
                              onChange={(e) => updateItemPrice(item.product_id, parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 rounded border border-gray-300 text-sm"
                              step="0.01"
                            />
                          </div>
                          <p className="font-bold text-gray-900 w-20 text-right">${(item.qty * item.cost_price).toFixed(2)}</p>
                          <button onClick={() => removeItem(item.product_id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Review Purchase Order</h3>

                {/* Items Summary */}
                <div className="space-y-2">
                  {formData.items.map((item) => (
                    <div key={item.product_id} className="flex justify-between p-3 rounded-lg bg-gray-50">
                      <span className="text-gray-900">
                        {item.product_name} × {item.qty}
                      </span>
                      <span className="font-semibold">${(item.qty * item.cost_price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount:</span>
                    <span className="text-[#1fb8a2]">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Back
            </button>

            <div className="flex gap-3">
              <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium">
                Cancel
              </button>
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={(step === 1 && !formData.supplier_id) || (step === 2 && formData.items.length === 0)}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#1fb8a2] to-[#189d8b] text-white hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#1fb8a2] to-[#189d8b] text-white hover:shadow-lg transition-all disabled:opacity-50 font-medium"
                >
                  {loading ? "Creating..." : "Create Purchase"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
