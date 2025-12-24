"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit, Trash2, Users, MapPin, Phone, MessageSquare } from "lucide-react";

export default function CustomersTab() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, [searchTerm]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/customers?${params}`);
      const data = await response.json();

      if (response.ok) {
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (customerId) => {
    if (!confirm("Delete this customer?")) return;
    try {
      const response = await fetch(`/api/customers/${customerId}`, { method: "DELETE" });
      if (response.ok) {
        fetchCustomers();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const filteredCustomers = customers;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#1fb8a2] focus:ring-2 focus:ring-[#1fb8a2]/20 transition-all text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 items-center w-full md:w-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1fb8a2] to-[#189d8b] text-white rounded-lg hover:shadow-lg transition-shadow font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              Add Customer
            </button>
          </div>
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1fb8a2] border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full p-12 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No customers found</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              {/* Customer Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#1fb8a2] to-[#189d8b] shadow-sm">
                    <span className="text-lg font-bold text-white">{customer.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-gray-900">{customer.name}</h4>
                    <p className="text-xs text-gray-500">Customer #{customer.id.toString().padStart(4, "0")}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setSelectedCustomer(customer)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Edit">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(customer.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{customer.contact}</span>
                </div>
                {customer.remark && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{customer.remark}</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Total Purchases</p>
                  <p className="text-lg font-bold text-[#1fb8a2]">${customer.total_purchases.toFixed(0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Invoices</p>
                  <p className="text-lg font-bold text-gray-900">{customer.invoice_count}</p>
                </div>
              </div>

              {/* Member Since */}
              <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                <p className="text-xs text-gray-500">Member since {customer.created_at}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && <CustomerDetailsModal customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />}

      {/* Create Customer Modal */}
      {showCreateModal && <CreateCustomerModal onClose={() => setShowCreateModal(false)} onSuccess={fetchCustomers} />}
    </div>
  );
}

// Customer Details Modal
function CustomerDetailsModal({ customer, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Customer Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Header */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#1fb8a2] to-[#189d8b] shadow-sm">
              <span className="text-2xl font-bold text-white">{customer.name.charAt(0)}</span>
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">{customer.name}</h4>
              <p className="text-sm text-gray-500">Customer #{customer.id.toString().padStart(4, "0")}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Contact Number</p>
              <p className="font-medium text-gray-900">{customer.contact}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Member Since</p>
              <p className="font-medium text-gray-900">{customer.created_at}</p>
            </div>
          </div>

          {/* Remark */}
          {customer.remark && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Remarks</p>
              <p className="text-gray-900">{customer.remark}</p>
            </div>
          )}

          {/* Purchase Stats */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Purchase History</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 p-4 border border-green-200">
                <p className="text-sm text-gray-600 mb-1">Total Purchases</p>
                <p className="text-2xl font-bold text-green-700">${customer.total_purchases.toFixed(2)}</p>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4 border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-700">{customer.invoice_count}</p>
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Recent Invoices</h4>
            <p className="text-sm text-gray-500">Invoice history would be displayed here...</p>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
            Close
          </button>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#1fb8a2] to-[#189d8b] text-white hover:shadow-lg transition-shadow">
            Edit Customer
          </button>
        </div>
      </div>
    </div>
  );
}

// Create Customer Modal
function CreateCustomerModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    remark: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        alert(data.error || "Failed to create customer");
      }
    } catch (error) {
      console.error("Error creating customer:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h3 className="text-xl font-bold text-gray-900">Add New Customer</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1fb8a2]"
              placeholder="Enter customer name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
            <input
              type="text"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1fb8a2]"
              placeholder="+94 77 123 4567"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Remarks (Optional)</label>
            <textarea
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1fb8a2]"
              placeholder="Any additional notes about this customer..."
            />
          </div>
        </form>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end rounded-b-xl">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#1fb8a2] to-[#189d8b] text-white hover:shadow-lg transition-shadow disabled:opacity-50"
          >
            {loading ? "Creating..." : "Add Customer"}
          </button>
        </div>
      </div>
    </div>
  );
}
