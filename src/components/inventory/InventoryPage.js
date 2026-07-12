"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import InventoryPanel from "./InventoryPanel";
import ProductDetailPanel from "./ProductDetailPanel";
import CreateProductModal from "./CreateProductModal";
import { Settings } from "lucide-react";
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
  const [userPermissions, setUserPermissions] = useState([]);

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

  const didFetchCategories = useRef(false);

  const fetchProducts = async () => {
    return fetchProductsOnce();
  };

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

  // Prevent duplicate concurrent fetches that can cause double API calls.
  const fetchProductsOnce = (() => {
    let inFlight = null;
    return async () => {
      if (inFlight) return inFlight;
      inFlight = (async () => {
        setLoading(true);
        try {
          const response = await fetch("/api/products?page=1&limit=50");
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
          inFlight = null;
        }
      })();
      return inFlight;
    };
  })();

  const filteredProducts = useMemo(() => {
    let list = products;

    // Filter by tab (stock status)
    if (activeTab === "Out of Stock") {
      list = list.filter((p) => p.qty === 0);
    } else if (activeTab === "Low Stock") {
      list = list.filter((p) => p.qty > 0 && p.qty <= p.reorder_level);
    } else if (activeTab === "Excess Stock") {
      list = list.filter((p) => p.qty > p.reorder_level * 2);
    }

    // Filter by category
    if (categoryFilter) {
      list = list.filter((p) => p.category === categoryFilter);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(search) ||
          p.code?.toLowerCase().includes(search) ||
          p.brand?.toLowerCase().includes(search) ||
          p.shade?.toLowerCase().includes(search) ||
          p.description?.toLowerCase().includes(search),
      );
    }

    return list;
  }, [products, activeTab, categoryFilter, searchTerm]);

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
      { duration: 5000, position: "top-center" },
    );
  };

  // Fetch categories on mount (avoid double fetch in dev/StrictMode)
  useEffect(() => {
    if (didFetchCategories.current) return;
    didFetchCategories.current = true;
    fetchCategories();
  }, []);

  // Fetch products from API
  useEffect(() => {
    if (activeNav === "Products") {
      fetchProducts();
    }
  }, [activeNav]);

  // Fetch user permissions
  useEffect(() => {
    async function fetchPermissions() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        // Assume API returns { user: { permissions: [...] } }
        setUserPermissions(data.user?.permissions || []);
      } catch (err) {
        setUserPermissions([]);
      }
    }
    fetchPermissions();
  }, []);

  // Fetch products once when Products tab is active
  useEffect(() => {
    if (activeNav === "Products") {
      fetchProducts();
    }
  }, [activeNav]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors" suppressHydrationWarning>
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

    </div>
  );
}
