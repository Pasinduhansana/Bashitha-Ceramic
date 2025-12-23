"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit, Trash2, CheckCircle, Clock, XCircle, AlertCircle, RefreshCcw, Package, FileText } from "lucide-react";

export default function ReturnsTab() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

  useEffect(() => {
    fetchReturns();
  }, [statusFilter, searchTerm]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/returns?${params}`);
      const data = await response.json();

      if (response.ok) {
        setReturns(data.returns || []);
      }
    } catch (error) {
      console.error("Error fetching returns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (returnId) => {
    try {
      const response = await fetch(`/api/returns/${returnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (response.ok) fetchReturns();
    } catch (error) {
      console.error("Error approving return:", error);
    }
  };

  const handleReject = async (returnId) => {
    try {
      const response = await fetch(`/api/returns/${returnId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      if (response.ok) fetchReturns();
    } catch (error) {
      console.error("Error rejecting return:", error);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      approved: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      processing: "bg-blue-50 text-blue-700 border-blue-200",
    };
    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: XCircle,
      processing: RefreshCcw,
    };
    const Icon = icons[status] || Clock;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    if (type === "invoice") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
          <FileText className="h-3 w-3" />
          Invoice Return
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <Package className="h-3 w-3" />
        Purchase Return
      </span>
    );
  };

  const filteredReturns = returns;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product, invoice, or purchase order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1fb8a2] focus:border-transparent"
            />
          </div>

          {/* Filters and Actions */}
          <div className="flex gap-3 items-center w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1fb8a2] bg-white text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="processing">Processing</option>
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1fb8a2] to-[#189d8b] text-white rounded-lg hover:shadow-lg transition-shadow font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              New Return
            </button>
          </div>
        </div>
      </div>

      {/* Returns Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1fb8a2] border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading returns...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReturns.map((returnItem, index) => (
                  <tr key={returnItem.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">RET-{returnItem.id.toString().padStart(4, "0")}</span>
                    </td>
                    <td className="px-6 py-4">{getTypeBadge(returnItem.type)}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900">{returnItem.invoice_no || returnItem.purchase_no}</span>
                      <p className="text-xs text-gray-500 mt-1">{returnItem.customer_name || returnItem.supplier_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-sm">
                          <Package className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm text-gray-900">{returnItem.product_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{returnItem.qty}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 line-clamp-2">{returnItem.reason}</span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(returnItem.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{returnItem.created_at}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedReturn(returnItem)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {returnItem.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(returnItem.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(returnItem.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredReturns.length === 0 && (
              <div className="p-12 text-center">
                <RefreshCcw className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No returns found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Return Details Modal */}
      {selectedReturn && <ReturnDetailsModal returnData={selectedReturn} onClose={() => setSelectedReturn(null)} />}

      {/* Create Return Modal */}
      {showCreateModal && <CreateReturnModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}

// Return Details Modal
function ReturnDetailsModal({ returnData, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Return Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Return Header */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Return ID</p>
              <p className="text-lg font-bold text-gray-900">RET-{returnData.id.toString().padStart(4, "0")}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Date</p>
              <p className="font-medium text-gray-900">{returnData.created_at}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Reference</p>
              <p className="font-medium text-gray-900">{returnData.invoice_no || returnData.purchase_no}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <div>
                {returnData.status === "pending" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                    <Clock className="h-3 w-3" />
                    Pending
                  </span>
                )}
                {returnData.status === "approved" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    <CheckCircle className="h-3 w-3" />
                    Approved
                  </span>
                )}
                {returnData.status === "rejected" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                    <XCircle className="h-3 w-3" />
                    Rejected
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Product Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Product:</span>
                <span className="font-medium text-gray-900">{returnData.product_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium text-gray-900">{returnData.qty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Reason:</span>
                <span className="font-medium text-gray-900 text-right max-w-xs">{returnData.reason}</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Created By:</span>
                <span className="font-medium text-gray-900">{returnData.user_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{returnData.type === "invoice" ? "Customer" : "Supplier"}:</span>
                <span className="font-medium text-gray-900">{returnData.customer_name || returnData.supplier_name}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
            Close
          </button>
          {returnData.status === "pending" && (
            <>
              <button className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors">Approve Return</button>
              <button className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors">Reject Return</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Create Return Modal
function CreateReturnModal({ onClose }) {
  const [formData, setFormData] = useState({
    returnType: "invoice",
    referenceId: "",
    productId: "",
    quantity: "",
    reason: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log("Creating return:", formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Create Return Request</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Return Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Return Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="returnType"
                  value="invoice"
                  checked={formData.returnType === "invoice"}
                  onChange={(e) => setFormData({ ...formData, returnType: e.target.value })}
                  className="text-[#1fb8a2] focus:ring-[#1fb8a2]"
                />
                <span className="text-sm">Invoice Return</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="returnType"
                  value="purchase"
                  checked={formData.returnType === "purchase"}
                  onChange={(e) => setFormData({ ...formData, returnType: e.target.value })}
                  className="text-[#1fb8a2] focus:ring-[#1fb8a2]"
                />
                <span className="text-sm">Purchase Return</span>
              </label>
            </div>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.returnType === "invoice" ? "Invoice Number" : "Purchase Order"}
            </label>
            <select
              value={formData.referenceId}
              onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1fb8a2]"
              required
            >
              <option value="">Select...</option>
              {formData.returnType === "invoice" ? (
                <>
                  <option value="1">INV-2024-001</option>
                  <option value="2">INV-2024-002</option>
                </>
              ) : (
                <>
                  <option value="1">PO-0001</option>
                  <option value="2">PO-0002</option>
                </>
              )}
            </select>
          </div>

          {/* Product */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1fb8a2]"
              required
            >
              <option value="">Select product...</option>
              <option value="1">Floor Tile 600x600</option>
              <option value="2">Wall Tile 300x300</option>
              <option value="3">Ceramic Bowl Set</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1fb8a2]"
              placeholder="Enter quantity"
              required
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Return</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1fb8a2]"
              placeholder="Describe the reason for this return..."
              required
            />
          </div>

          {/* Alert Box */}
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Important Note</p>
              <p>Once submitted, this return request will be pending approval. The stock will be automatically updated upon approval.</p>
            </div>
          </div>
        </form>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#1fb8a2] to-[#189d8b] text-white hover:shadow-lg transition-shadow"
          >
            Submit Return Request
          </button>
        </div>
      </div>
    </div>
  );
}
