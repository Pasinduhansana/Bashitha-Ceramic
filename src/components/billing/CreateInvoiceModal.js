"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, ShoppingCart, User, Calendar, CreditCard, Percent, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function CreateInvoiceModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Customer, 2: Products, 3: Payment
  const [products, setProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState("");
  const [customerSearchResults, setCustomerSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const [customerData, setCustomerData] = useState({
    contact: "",
    name: "",
    remark: "",
    existing_id: null, // Track if using existing customer
  });

  const [formData, setFormData] = useState({
    invoice_no: `INV-${Date.now()}`,
    items: [],
    discount: 0,
    payment_method: "cash",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  // Search customers by mobile number
  const searchCustomers = async (contact) => {
    if (contact.length < 3) {
      setCustomerSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const res = await fetch(`/api/customers?search=${contact}`);
      const data = await res.json();
      if (data.customers) {
        setCustomerSearchResults(data.customers);
        setShowSearchResults(data.customers.length > 0);
      }
    } catch (error) {
      console.error("Error searching customers:", error);
    }
  };

  // Handle contact number input
  const handleContactChange = (value) => {
    setCustomerData({ ...customerData, contact: value, existing_id: null });
    searchCustomers(value);
  };

  // Select existing customer from search results
  const selectCustomer = (customer) => {
    setCustomerData({
      contact: customer.contact,
      name: customer.name,
      remark: customer.remark || "",
      existing_id: customer.id,
    });
    setShowSearchResults(false);
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

      // Validate customer data
      if (!customerData.contact || !customerData.name) {
        toast.error("Please provide customer mobile number and name");
        return;
      }
      if (formData.items.length === 0) {
        toast.error("Please add at least one product");
        return;
      }

      const { subtotal, total } = calculateTotals();

      // Prepare invoice data
      const invoiceData = {
        ...formData,
        customer: customerData, // Include customer data
        total_amount: subtotal,
        net_amount: total,
      };

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Invoice created successfully!");
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          invoice_no: `INV-${Date.now()}`,
          items: [],
          discount: 0,
          payment_method: "cash",
        });
        setCustomerData({
          contact: "",
          name: "",
          remark: "",
          existing_id: null,
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
            {/* Step 1: Customer Details */}
            {step === 1 && (
              <div className="space-y-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>

                {/* Mobile Number - Top Field with Autocomplete */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerData.contact}
                    onChange={(e) => handleContactChange(e.target.value)}
                    onFocus={() => customerData.contact.length >= 3 && setShowSearchResults(customerSearchResults.length > 0)}
                    placeholder="Enter mobile number"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#1fb8a2] focus:ring-2 focus:ring-[#1fb8a2]/20 outline-none transition-all"
                  />

                  {/* Search Results Dropdown */}
                  {showSearchResults && customerSearchResults.length > 0 && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSearchResults(false)} />
                      <div className="absolute z-20 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                        <div className="p-2">
                          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-2">Existing Customers</p>
                          {customerSearchResults.map((customer) => (
                            <button
                              key={customer.id}
                              onClick={() => selectCustomer(customer)}
                              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#1fb8a2] to-[#189d8b] flex items-center justify-center text-white font-semibold shrink-0">
                                {customer.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 dark:text-white truncate">{customer.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{customer.contact}</p>
                                {customer.remark && <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{customer.remark}</p>}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {customerData.existing_id && (
                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                      Existing customer selected
                    </p>
                  )}
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    placeholder="Enter customer name"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#1fb8a2] focus:ring-2 focus:ring-[#1fb8a2]/20 outline-none transition-all"
                  />
                </div>

                {/* Remark */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Remark (Optional)</label>
                  <textarea
                    value={customerData.remark}
                    onChange={(e) => setCustomerData({ ...customerData, remark: e.target.value })}
                    placeholder="Any additional notes about the customer..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#1fb8a2] focus:ring-2 focus:ring-[#1fb8a2]/20 outline-none transition-all resize-none"
                  />
                </div>

                {!customerData.existing_id && customerData.contact && customerData.name && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                      <User className="h-4 w-4 mt-0.5 shrink-0" />
                      <span>This will be saved as a new customer when creating the invoice.</span>
                    </p>
                  </div>
                )}
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
                <h3 className="text-lg font(!customerData.contact || !customerData.name)00">Payment Details</h3>

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
