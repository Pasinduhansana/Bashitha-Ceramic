"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Eye, Printer, Download, Edit, Trash2, CheckCircle, Clock, XCircle, Filter, Calendar } from "lucide-react";
import CreateInvoiceModal from "./CreateInvoiceModal";

export default function InvoicesTab() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Fetch invoices from API
  useEffect(() => {
    fetchInvoices();
  }, [statusFilter, searchTerm]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/invoices?${params}`);
      const data = await response.json();

      if (response.ok) {
        setInvoices(data.invoices || []);
      } else {
        console.error("Failed to fetch invoices:", data.error);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (invoiceId) => {
    if (!confirm("Are you sure you want to delete this invoice? This will restore the stock.")) return;

    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, { method: "DELETE" });
      if (response.ok) {
        fetchInvoices();
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: "bg-green-50 text-green-700 border-green-200",
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      cancelled: "bg-red-50 text-red-700 border-red-200",
    };
    const icons = {
      paid: CheckCircle,
      pending: Clock,
      cancelled: XCircle,
    };
    const Icon = icons[status] || Clock;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredInvoices = invoices;

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
              placeholder="Search by invoice number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#1fb8a2] focus:ring-2 focus:ring-[#1fb8a2]/20 transition-all text-xs"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex gap-3 items-center w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#1fb8a2] focus:ring-2 focus:ring-[#1fb8a2]/20 outline-none transition-all text-xs font-medium"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1fb8a2] to-[#189d8b] text-white rounded-lg hover:shadow-lg transition-shadow font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              Create Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1fb8a2] border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading invoices...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Discount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Net Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInvoices.map((invoice, index) => (
                  <tr key={invoice.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{invoice.invoice_no}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{invoice.customer_name}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">${invoice.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-gray-700">${invoice.discount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-[#1fb8a2] font-bold">${invoice.net_amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{invoice.payment_method}</span>
                    </td>
                    <td className="px-6 py-4">
                      {invoice.status ? getStatusBadge(invoice.status) : <span className="text-xs text-gray-500">-</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{new Date(invoice.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedInvoice(invoice)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Print">
                          <Printer className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredInvoices.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-gray-500">No invoices found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && <InvoiceDetailsModal invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />}

      {/* Create Invoice Modal */}
      {showCreateModal && <CreateInvoiceModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={fetchInvoices} />}
    </div>
  );
}

// Invoice Details Modal Component
function InvoiceDetailsModal({ invoice, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Invoice Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Invoice Header */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Invoice Number</p>
              <p className="text-lg font-bold text-gray-900">{invoice.invoice_no}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Date</p>
              <p className="font-medium text-gray-900">{invoice.created_at}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Customer</p>
              <p className="font-medium text-gray-900">{invoice.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Payment Method</p>
              <p className="font-medium text-gray-900">{invoice.payment_method}</p>
            </div>
          </div>

          {/* Items would go here - placeholder for now */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Invoice Items</h4>
            <p className="text-sm text-gray-500">Items details would be displayed here...</p>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium text-gray-900">${invoice.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Discount:</span>
              <span className="font-medium text-gray-900">-${invoice.discount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
              <span>Net Amount:</span>
              <span className="text-[#1fb8a2]">${invoice.net_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
            Close
          </button>
          <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#1fb8a2] to-[#189d8b] text-white hover:shadow-lg transition-shadow">
            <Printer className="inline h-4 w-4 mr-2" />
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
