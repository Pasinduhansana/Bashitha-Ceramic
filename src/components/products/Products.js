"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Plus, Search, ChevronDown, List, LayoutGrid, X, Package, AlertTriangle, XCircle, Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/button";
import ProductsTable from "./ProductsTable";
import InventoryPanel from "./InventoryPanel";
import ProductDetailPanel from "./ProductDetailPanel";
import CreateProductModal from "./CreateProductModal";

const STOCK_TABS = [
  { key: "all", label: "All" },
  { key: "low", label: "Low stock" },
  { key: "out", label: "Out of stock" },
  { key: "excess", label: "Excess" },
];

const ITEMS_PER_PAGE = 20;

function StatChip({ icon: Icon, label, value, tint }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 flex-1 min-w-[140px]">
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${tint}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[15px] font-bold text-neutral-900 dark:text-white tabular-nums leading-none">{value}</p>
        <p className="text-[10.5px] text-neutral-400 mt-1">{label}</p>
      </div>
    </div>
  );
}

function CategoryDropdown({ categories, value, onChange }) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((c) => c.name === value);

  return (
    <div className="relative text-left">
      <button
        onClick={() => setOpen((s) => !s)}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 text-xs font-medium text-neutral-700 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors"
      >
        {selected ? selected.name : "All categories"}
        <ChevronDown className="h-3 w-3 text-neutral-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 sm:left-0 top-full z-20 mt-1.5 w-48 max-h-64 overflow-y-auto rounded-lg border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1">
            <button
              className={`flex w-full items-center text-left rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                !value
                  ? "bg-teal-50 text-teal-800 dark:bg-teal-400/10 dark:text-teal-400"
                  : "text-neutral-600 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              All categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`flex w-full items-center text-left rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  value === cat.name
                    ? "bg-teal-50 text-teal-800 dark:bg-teal-400/10 dark:text-teal-400"
                    : "text-neutral-600 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-700"
                }`}
                onClick={() => {
                  onChange(cat.name);
                  setOpen(false);
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showInventoryPanel, setShowInventoryPanel] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [productDetailMode, setProductDetailMode] = useState("view");
  const [showCreateProduct, setShowCreateProduct] = useState(false);

  const didInit = useRef(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (res.ok) setProducts(data.products || []);
      else toast.error(data.error || "Failed to fetch products");
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (res.ok) setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeTab === "out") list = list.filter((p) => p.qty === 0);
    else if (activeTab === "low") list = list.filter((p) => p.qty > 0 && p.qty <= p.reorder_level);
    else if (activeTab === "excess") list = list.filter((p) => p.qty > (p.reorder_level || 0) * 2);

    if (categoryFilter) list = list.filter((p) => p.category_name === categoryFilter || p.category === categoryFilter);

    if (searchTerm.trim()) {
      const s = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(s) ||
          p.code?.toLowerCase().includes(s) ||
          p.brand?.toLowerCase().includes(s) ||
          p.shade?.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s),
      );
    }
    return list;
  }, [products, activeTab, categoryFilter, searchTerm]);

  const stockStats = useMemo(() => {
    const lowStock = products.filter((p) => p.qty > 0 && p.qty <= (p.reorder_level || 0)).length;
    const outOfStock = products.filter((p) => p.qty === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.qty || 0) * (p.selling_price || 0), 0);
    return { total: products.length, lowStock, outOfStock, totalValue };
  }, [products]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleProductAction = (action, product) => {
    if (action === "view") {
      setSelectedProduct(product);
      setShowInventoryPanel(true);
    } else if (action === "edit") {
      setSelectedProduct(product);
      setProductDetailMode("edit");
      setShowProductDetail(true);
    } else if (action === "delete") {
      handleDeleteProduct(product);
    }
  };

  const handleDeleteProduct = (product) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-semibold text-neutral-900">Delete {product.name}?</p>
          <p className="text-xs text-neutral-500">This action cannot be undone.</p>
          <div className="flex gap-2">
            <Button
              variant="danger"
              size="sm"
              fullWidth
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
                  const data = await response.json();
                  if (response.ok) {
                    toast.success("Product deleted");
                    fetchProducts();
                  } else {
                    toast.error(data.error || "Failed to delete product");
                  }
                } catch (error) {
                  toast.error("Failed to delete product");
                }
              }}
            >
              Yes, delete
            </Button>
            <Button variant="secondary" size="sm" fullWidth onClick={() => toast.dismiss(t.id)}>
              Cancel
            </Button>
          </div>
        </div>
      ),
      { duration: 5000, position: "top-center" },
    );
  };

  const hasActiveFilters = searchTerm || categoryFilter || activeTab !== "all";

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => setCurrentPage(1), [activeTab, categoryFilter, searchTerm]);

  return (
    <div className="px-3 sm:px-5 lg:px-6 py-4 sm:py-5 min-h-screen bg-neutral-50/40 dark:bg-gray-900 transition-colors">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1
            className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Products
          </h1>
          <p className="text-xs text-neutral-500 dark:text-gray-400 mt-0.5">
            {stockStats.total} product{stockStats.total !== 1 ? "s" : ""} in your catalogue
          </p>
        </div>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowCreateProduct(true)} className="w-full sm:w-auto">
          Add Product
        </Button>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 mb-5">
        <StatChip icon={Package} label="Total products" value={stockStats.total} tint="bg-blue-50 text-blue-700" />
        <StatChip icon={AlertTriangle} label="Low stock" value={stockStats.lowStock} tint="bg-amber-50 text-amber-700" />
        <StatChip icon={XCircle} label="Out of stock" value={stockStats.outOfStock} tint="bg-rose-50 text-rose-700" />
        <StatChip
          icon={Wallet}
          label="Inventory value"
          value={`$${stockStats.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          tint="bg-teal-50 text-teal-800"
        />
      </div>

      {/* Toolbar */}
      <div className="rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2.5 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
          {/* Stock tabs */}
          <div className="flex items-center gap-1 rounded-lg bg-neutral-100 dark:bg-gray-900/40 p-0.5 overflow-x-auto">
            {STOCK_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`whitespace-nowrap rounded-md h-7 px-3 text-xs font-semibold transition-colors ${
                  activeTab === tab.key
                    ? "bg-white dark:bg-gray-800 text-teal-800 dark:text-teal-400"
                    : "text-neutral-500 dark:text-gray-400 hover:text-neutral-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative w-full lg:w-64">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products, codes, brands…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 rounded-lg border border-neutral-200 dark:border-gray-700 bg-neutral-50/70 dark:bg-gray-900/40 pl-8 pr-3 text-xs outline-none focus:bg-white focus:border-teal-600 text-neutral-900 dark:text-white placeholder-neutral-400 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between gap-2.5">
            <CategoryDropdown categories={categories} value={categoryFilter} onChange={setCategoryFilter} />

            {/* View toggle */}
            <div className="flex h-8 rounded-lg border border-neutral-200 dark:border-gray-700 overflow-hidden shrink-0">
              <button
                onClick={() => setViewMode("list")}
                className={`w-8 flex items-center justify-center transition-colors ${viewMode === "list" ? "bg-teal-800 text-white" : "bg-white dark:bg-gray-800 text-neutral-500 hover:bg-neutral-50"}`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`w-8 flex items-center justify-center border-l border-neutral-200 dark:border-gray-700 transition-colors ${
                  viewMode === "grid" ? "bg-teal-800 text-white" : "bg-white dark:bg-gray-800 text-neutral-500 hover:bg-neutral-50"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter("");
                setActiveTab("all");
              }}
              className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-neutral-500 hover:bg-neutral-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-700 border-r-transparent" />
        </div>
      ) : (
        <>
          <ProductsTable products={paginatedProducts} viewMode={viewMode} onAction={handleProductAction} />

          {filteredProducts.length > 0 && (
            <div className="mt-4 rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2.5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-[11.5px] text-neutral-500 dark:text-gray-400 text-center sm:text-left">
                Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
              </span>
              <div className="flex items-center gap-1 justify-center sm:justify-end">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-7 w-7 flex items-center justify-center rounded-md border border-neutral-200 dark:border-gray-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((page, idx, arr) => (
                    <div key={page} className="flex items-center gap-1">
                      {idx > 0 && arr[idx - 1] !== page - 1 && <span className="text-neutral-300 text-xs px-0.5">…</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`h-7 w-7 rounded-md text-xs font-semibold transition-colors ${
                          currentPage === page
                            ? "bg-teal-800 text-white"
                            : "border border-neutral-200 dark:border-gray-700 text-neutral-600 hover:bg-neutral-50 dark:hover:bg-gray-700"
                        }`}
                      >
                        {page}
                      </button>
                    </div>
                  ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-7 w-7 flex items-center justify-center rounded-md border border-neutral-200 dark:border-gray-700 text-neutral-500 hover:bg-neutral-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Panels */}
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

      <AnimatePresence>
        {showCreateProduct && (
          <CreateProductModal
            isOpen={showCreateProduct}
            categories={categories}
            onClose={() => setShowCreateProduct(false)}
            onProductCreated={() => {
              setShowCreateProduct(false);
              setCurrentPage(1);
              fetchProducts();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
