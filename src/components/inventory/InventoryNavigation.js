"use client";

import { LayoutGrid, Activity, Package, CreditCard, Users, FileText, Menu, X, Search } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { icon: LayoutGrid, label: "Overview" },
  { icon: Activity, label: "Activities" },
  { icon: Package, label: "Products" },
  { icon: CreditCard, label: "Billing" },
  { icon: Users, label: "People", permission: "manage_users" },
  { icon: FileText, label: "Report", permission: "access_reports" },
];

export default function InventoryNavigation({ active, onChange, userPermissions = [], products = [], onProductSelect }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");

  // Only show items the user has permission for
  const visibleNavItems = NAV_ITEMS.filter((item) => !item.permission || userPermissions.includes(item.permission));

  // Filter products based on mobile search term (local filtering)
  const filteredProducts = mobileSearchTerm?.trim()
    ? products
        .filter(
          (product) =>
            product.name?.toLowerCase().includes(mobileSearchTerm.toLowerCase()) ||
            product.code?.toLowerCase().includes(mobileSearchTerm.toLowerCase()) ||
            product.brand?.toLowerCase().includes(mobileSearchTerm.toLowerCase()),
        )
        .slice(0, 5) // Show max 5 suggestions
    : [];

  const handleNavClick = (item) => {
    onChange?.(item.label);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 sm:px-6 transition-colors overflow-x-auto">
        <div className="flex items-center gap-4 sm:gap-6">
          {visibleNavItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={`relative flex items-center gap-2 px-1 py-3 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                active === item.label ? "text-[#1fb8a2]" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">{item.label}</span>
              {active === item.label && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1fb8a2]" />}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 py-3 transition-colors">
        {/* Search Bar with Hamburger - Single Line */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors flex-shrink-0"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search products..."
              value={mobileSearchTerm}
              onChange={(e) => {
                setMobileSearchTerm(e.target.value);
                setSearchOpen(true);
                if (active !== "Products") {
                  onChange?.("Products");
                }
              }}
              onFocus={() => {
                setSearchOpen(true);
                if (active !== "Products") {
                  onChange?.("Products");
                }
              }}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-xs outline-none focus:border-[#1fb8a2] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
            />

            {/* Autocomplete Dropdown */}
            {searchOpen && filteredProducts.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-md border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl z-50 max-h-64 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      onProductSelect?.(product);
                      setSearchOpen(false);
                      setMobileSearchTerm("");
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-md bg-gradient-to-br from-[#1fb8a2]/10 to-[#1fb8a2]/5 flex items-center justify-center">
                      <span className="text-[#1fb8a2] font-bold text-[10px]">{product.code || product.name?.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{product.name}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{product.brand || product.shade || "No details"}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[10px] font-semibold text-[#1fb8a2]">${product.selling_price || 0}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{product.qty || 0}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="mt-3 space-y-1 pb-3 border-t border-gray-200 dark:border-gray-700 pt-3">
            {visibleNavItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  active === item.label
                    ? "bg-[#1fb8a2]/10 text-[#1fb8a2]"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
