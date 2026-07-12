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

export default function NavigationPanel({ active, onChange, userPermissions = [], products = [], onProductSelect }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchTerm, setMobileSearchTerm] = useState("");

  const visibleNavItems = NAV_ITEMS.filter((item) => !item.permission || userPermissions.includes(item.permission));

  const filteredProducts = mobileSearchTerm?.trim()
    ? products
        .filter(
          (product) =>
            product.name?.toLowerCase().includes(mobileSearchTerm.toLowerCase()) ||
            product.code?.toLowerCase().includes(mobileSearchTerm.toLowerCase()) ||
            product.brand?.toLowerCase().includes(mobileSearchTerm.toLowerCase()),
        )
        .slice(0, 5)
    : [];

  const handleNavClick = (item) => {
    onChange?.(item.label);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Tablet / Desktop navigation — pill tabs on a soft track, matching the storefront Navbar link treatment */}
      <nav className="hidden md:block border-b border-neutral-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 lg:px-6 py-2.5 transition-colors">
        <div className="flex items-center gap-1 rounded-lg bg-neutral-100/70 dark:bg-gray-800/60 p-1 w-fit overflow-x-auto">
          {visibleNavItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={`flex items-center gap-1.5 lg:gap-2 h-8 px-3 rounded-md text-[13px] font-semibold whitespace-nowrap transition-colors ${
                active === item.label
                  ? "bg-white dark:bg-gray-900 text-brand-800 dark:text-brand-400"
                  : "text-neutral-500 dark:text-gray-400 hover:text-neutral-800 dark:hover:text-gray-200"
              }`}
            >
              <item.icon className="h-3.5 w-3.5 shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile navigation */}
      <div className="md:hidden border-b border-neutral-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 transition-colors">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-600 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>

          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search products…"
              value={mobileSearchTerm}
              onChange={(e) => {
                setMobileSearchTerm(e.target.value);
                setSearchOpen(true);
                if (active !== "Products") onChange?.("Products");
              }}
              onFocus={() => {
                setSearchOpen(true);
                if (active !== "Products") onChange?.("Products");
              }}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              className="w-full h-8 rounded-lg border border-neutral-200 dark:border-gray-700 bg-neutral-50/70 dark:bg-gray-800 pl-8 pr-3 text-xs outline-none focus:bg-white focus:border-brand-600 text-neutral-900 dark:text-white placeholder-neutral-400 transition-colors"
            />

            {searchOpen && filteredProducts.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 rounded-lg border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-50 max-h-64 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => {
                      onProductSelect?.(product);
                      setSearchOpen(false);
                      setMobileSearchTerm("");
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-gray-700 border-b border-neutral-100 dark:border-gray-700 last:border-b-0 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 h-7 w-7 rounded-md bg-brand-50 dark:bg-brand-400/10 flex items-center justify-center">
                      <span className="text-brand-800 dark:text-brand-400 font-bold text-[10px]">{product.code || product.name?.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">{product.name}</p>
                      <p className="text-[10.5px] text-neutral-400 truncate">{product.brand || product.shade || "No details"}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[10.5px] font-semibold text-neutral-900 dark:text-white">${product.selling_price || 0}</p>
                      <p className="text-[10px] text-neutral-400">{product.qty || 0}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="mt-2.5 space-y-0.5 pb-1 border-t border-neutral-100 dark:border-gray-700 pt-2.5">
            {visibleNavItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={`flex w-full items-center gap-2.5 rounded-lg h-9 px-3 text-[13px] font-medium transition-colors ${
                  active === item.label ? "bg-brand-50 text-brand-800 dark:bg-brand-400/10 dark:text-brand-400" : "text-neutral-600 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-800"
                }`}
              >
                <item.icon className="h-3.5 w-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}