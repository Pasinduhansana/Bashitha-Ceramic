"use client";

import { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import InventoryHeader from "./InventoryHeader";
import InventoryNavigation from "./InventoryNavigation";
import InventoryFilters from "./InventoryFilters";
import ProductsTable from "./ProductsTable";
import Overview from "./Overview";
import Activities from "./Activities";
import Settings from "./Settings";
import People from "./People";
import Billing from "../billing/Billing";
import Report from "./Report";
import InventoryPanel from "./InventoryPanel";
import ProductDetailPanel from "./ProductDetailPanel";
import UserProfilePanel from "./UserProfilePanel";
import CreateProductModal from "./CreateProductModal";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

// Configure toast defaults
toast.custom = (component) => toast(component, { position: "top-center", duration: 4000 });

export default function InventoryPage() {
  const [activeNav, setActiveNav] = useState("Products");
  const [activeTab, setActiveTab] = useState("All Products");
  const [activeFilter, setActiveFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Real data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showInventoryPanel, setShowInventoryPanel] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [productDetailMode, setProductDetailMode] = useState("view");
  const [showCreateProduct, setShowCreateProduct] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products from API
  useEffect(() => {
    if (activeNav === "Products") {
      fetchProducts();
    }
  }, [activeNav]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (response.ok) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (categoryFilter) params.append("category", categoryFilter);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
      } else {
        toast.error(data.error || "Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeNav === "Products") {
        fetchProducts();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter]);

  const filteredProducts = useMemo(() => {
    let list = products;

    if (activeTab === "Out of Stock") {
      list = list.filter((p) => p.qty === 0);
    } else if (activeTab === "Low Stock") {
      list = list.filter((p) => p.qty > 0 && p.qty <= p.reorder_level);
    } else if (activeTab === "Excess Stock") {
      list = list.filter((p) => p.qty > p.reorder_level * 2);
    }

    return list;
  }, [products, activeTab]);

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleProductAction = (action, product) => {
    switch (action) {
      case "view":
        setSelectedProduct(product);
        setShowInventoryPanel(true);
        break;
      case "edit":
        setSelectedProduct(product);
        setProductDetailMode("edit");
        setShowProductDetail(true);
        break;
      case "delete":
        handleDeleteProduct(product);
        break;
      default:
        break;
    }
  };

  const handleDeleteProduct = (product) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-gray-900">Delete product {product.name}?</p>
          <p className="text-sm text-gray-600">This action cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const response = await fetch(`/api/products/${product.id}`, {
                    method: "DELETE",
                  });

                  const data = await response.json();

                  if (response.ok) {
                    toast.success("Product deleted successfully!", { position: "top-center", duration: 4000 });
                    fetchProducts(); // Refresh list
                  } else {
                    toast.error(data.error || "Failed to delete product", { position: "top-center", duration: 4000 });
                  }
                } catch (error) {
                  console.error("Error deleting product:", error);
                  toast.error("Failed to delete product", { position: "top-center", duration: 4000 });
                }
              }}
              className="flex-1 rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 rounded bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 5000, position: "top-center" }
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <InventoryHeader onSettingsClick={() => setShowSettings(true)} onProfileClick={() => setShowProfile(true)} />
      <InventoryNavigation active={activeNav} onChange={setActiveNav} />

      <AnimatePresence mode="wait">
        {activeNav === "Products" ? (
          <motion.main
            key="products"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="px-4 sm:px-6 py-4 sm:py-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Products</h2>
              <button
                onClick={() => setShowCreateProduct(true)}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#1fb8a2] px-4 py-2.5 sm:py-2 text-sm font-semibold text-white shadow hover:bg-[#189d8b]"
              >
                <Plus className="h-4 w-4" />
                Add Product
              </button>
            </div>

            <InventoryFilters
              activeTab={activeTab}
              onTabChange={setActiveTab}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              categoryFilter={categoryFilter}
              onCategoryFilterChange={setCategoryFilter}
              categories={categories}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1fb8a2]"></div>
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <>
                <ProductsTable products={paginatedProducts} viewMode={viewMode} onAction={handleProductAction} />

                {/* Pagination */}
                <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm px-4 sm:px-6 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-gray-600 text-center sm:text-left">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                  </span>
                  <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      &lt;
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`rounded px-3 py-1 text-sm font-medium ${
                          currentPage === page ? "border-[#1fb8a2] bg-[#1fb8a2] text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.main>
        ) : (
          <motion.div
            key="other"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            {activeNav === "Overview" ? (
              <Overview />
            ) : activeNav === "Activities" ? (
              <Activities />
            ) : activeNav === "People" ? (
              <People />
            ) : activeNav === "Billing" ? (
              <Billing />
            ) : activeNav === "Report" ? (
              <Report />
            ) : (
              <div className="px-4 sm:px-6 py-4 sm:py-6">
                <h2 className="mb-4 text-xl sm:text-2xl font-semibold text-gray-900">{activeNav}</h2>
                <div className="rounded-lg border border-gray-200 bg-white p-6 text-gray-600">{activeNav} content goes here.</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inventory Management Panel */}
      <InventoryPanel
        product={selectedProduct}
        isOpen={showInventoryPanel}
        onClose={() => {
          setShowInventoryPanel(false);
          setSelectedProduct(null);
        }}
        onUpdate={fetchProducts}
      />

      <ProductDetailPanel
        product={selectedProduct}
        isOpen={showProductDetail}
        mode={productDetailMode}
        categories={categories}
        onSaved={() => {
          fetchProducts();
          setSelectedProduct(null);
          setShowProductDetail(false);
        }}
        onManageStock={() => {
          setShowProductDetail(false);
          setShowInventoryPanel(true);
        }}
        onClose={() => {
          setShowProductDetail(false);
          setSelectedProduct(null);
        }}
      />

      {/* Create Product Modal */}
      <AnimatePresence>
        {showCreateProduct && (
          <CreateProductModal
            isOpen={showCreateProduct}
            onClose={() => setShowCreateProduct(false)}
            onProductCreated={() => {
              setShowCreateProduct(false);
              setCurrentPage(1);
              fetchProducts();
            }}
            categories={categories}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      {showSettings && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 backdrop-blur-sm" onClick={() => setShowSettings(false)} />
          {/* Modal */}
          <div className="fixed inset-y-0 right-0 w-full max-w-4xl bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Settings />
          </div>
        </>
      )}

      {/* User Profile Panel */}
      <UserProfilePanel isOpen={showProfile} onClose={() => setShowProfile(false)} />
    </div>
  );
}
