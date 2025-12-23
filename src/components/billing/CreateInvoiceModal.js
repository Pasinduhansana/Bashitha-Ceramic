"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, ShoppingCart, User, Calendar, CreditCard, Percent, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function CreateInvoiceModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Customer, 2: Products, 3: Payment
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState("");

  const [formData, setFormData] = useState({
    customer_id: "",
    invoice_no: `INV-${Date.now()}`,
    items: [],
    discount: 0,
    payment_method: "cash",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchProducts();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (error) {
      console.error("Error fetching customers:", error);
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
            selling_price: product.selling_price,
            available_qty: product.qty,
          },
        ],
      });
    }
    toast.success(`Added ${product.name}`);
  };

  const updateItemQty = (productId, qty) => {
    const item = formData.items.find((i) => i.product_id === productId);
    if (qty > item.available_qty) {
      toast.error(`Only ${item.available_qty} available in stock`);
      return;
    }
    if (qty < 1) {
      removeItem(productId);
      return;
    }
    setFormData({
      ...formData,
      items: formData.items.map((item) => (item.product_id === productId ? { ...item, qty } : item)),
    });
  };

  const removeItem = (productId) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.product_id !== productId),
    });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.qty * item.selling_price, 0);
    const discount = parseFloat(formData.discount) || 0;
    const total = subtotal - discount;
    return { subtotal, discount, total };
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      if (!formData.customer_id) {
        toast.error("Please select a customer");
        return;
      }
      if (formData.items.length === 0) {
        toast.error("Please add at least one product");
        return;
      }

      const { subtotal, total } = calculateTotals();

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          total_amount: subtotal,
          net_amount: total,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Invoice created successfully!");
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          customer_id: "",
          invoice_no: `INV-${Date.now()}`,
          items: [],
          discount: 0,
          payment_method: "cash",
        });
        setStep(1);
      } else {
        toast.error(data.error || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(searchProduct.toLowerCase()) || p.code?.toLowerCase().includes(searchProduct.toLowerCase())
  );

  const { subtotal, discount, total } = calculateTotals();

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
                <ShoppingCart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create New Invoice</h2>
                <p className="text-sm text-white/80">Invoice #{formData.invoice_no}</p>
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
                { num: 1, label: "Customer", icon: User },
                { num: 2, label: "Products", icon: ShoppingCart },
                { num: 3, label: "Payment", icon: CreditCard },
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
            {/* Step 1: Customer Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Customer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => setFormData({ ...formData, customer_id: customer.id })}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.customer_id === customer.id ? "border-[#1fb8a2] bg-[#1fb8a2]/5" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1fb8a2] to-[#189d8b] flex items-center justify-center text-white font-semibold">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.contact}</p>
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
                      disabled={product.qty === 0}
                      className="p-3 rounded-lg border border-gray-200 hover:border-[#1fb8a2] hover:bg-[#1fb8a2]/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <p className="font-medium text-gray-900 text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Stock: {product.qty}</p>
                      <p className="text-sm font-bold text-[#1fb8a2] mt-2">${product.selling_price}</p>
                    </button>
                  ))}
                </div>

                {/* Selected Items */}
                {formData.items.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Selected Items</h4>
                    <div className="space-y-2">
                      {formData.items.map((item) => (
                        <div key={item.product_id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{item.product_name}</p>
                            <p className="text-xs text-gray-500">${item.selling_price} each</p>
                          </div>
                          <div className="flex items-center gap-2">
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
                          <p className="font-bold text-gray-900 w-20 text-right">${(item.qty * item.selling_price).toFixed(2)}</p>
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

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1fb8a2]"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount ($)</label>
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1fb8a2]"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 space-y-3">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Discount:</span>
                    <span className="font-semibold text-red-600">-${discount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3 flex justify-between text-lg font-bold">
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
                  disabled={(step === 1 && !formData.customer_id) || (step === 2 && formData.items.length === 0)}
                  className="px-6 py-2.5 rounded-lg bg-[#1fb8a2] text-white hover:bg-[#189d8b] disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-2.5 rounded-lg bg-[#1fb8a2] text-white hover:bg-[#189d8b] disabled:opacity-50 font-medium"
                >
                  {loading ? "Creating..." : "Create Invoice"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
