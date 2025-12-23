"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Eye, Edit, Trash2, CheckCircle, Clock, Package, TrendingUp, Filter } from "lucide-react";
import CreatePurchaseModal from "./CreatePurchaseModal";

export default function PurchasesTab() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  useEffect(() => {
    fetchPurchases();
  }, [searchTerm]);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/purchases?${params}`);
      const data = await response.json();

      if (response.ok) {
        setPurchases(data.purchases || []);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (purchaseId) => {
    if (!confirm("Delete this purchase? Stock will be adjusted.")) return;
    try {
      const response = await fetch(`/api/purchases/${purchaseId}`, { method: "DELETE" });
      if (response.ok) fetchPurchases();
    } catch (error) {
      console.error("Error deleting purchase:", error);
    }
  };

  const filteredPurchases = purchases;

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
              placeholder="Search by supplier or user name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1fb8a2] focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 items-center w-full md:w-auto">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1fb8a2] to-[#189d8b] text-white rounded-lg hover:shadow-lg transition-shadow font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              New Purchase
            </button>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1fb8a2] border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading purchases...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Purchase ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created By</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPurchases.map((purchase, index) => (
                  <tr key={purchase.id} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">PO-{purchase.id.toString().padStart(4, "0")}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">{purchase.supplier_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#1fb8a2] font-bold text-lg">${purchase.total_amount.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        <Package className="h-3 w-3" />
                        {purchase.items_count} items
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{purchase.purchase_date}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{purchase.user_name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPurchase(purchase)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Edit">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(purchase.id)}
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

            {filteredPurchases.length === 0 && (
              <div className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No purchases found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Purchase Details Modal */}
      {selectedPurchase && <PurchaseDetailsModal purchase={selectedPurchase} onClose={() => setSelectedPurchase(null)} />}

      {/* Create Purchase Modal */}
      {showCreateModal && <CreatePurchaseModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
}

// Purchase Details Modal
function PurchaseDetailsModal({ purchase, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Purchase Order Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Purchase Order #</p>
              <p className="text-lg font-bold text-gray-900">PO-{purchase.id.toString().padStart(4, "0")}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Date</p>
              <p className="font-medium text-gray-900">{purchase.purchase_date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Supplier</p>
              <p className="font-medium text-gray-900">{purchase.supplier_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Created By</p>
              <p className="font-medium text-gray-900">{purchase.user_name}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-semibold text-gray-900 mb-3">Purchase Items</h4>
            <p className="text-sm text-gray-500">Item details would be displayed here...</p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-[#1fb8a2]">${purchase.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
