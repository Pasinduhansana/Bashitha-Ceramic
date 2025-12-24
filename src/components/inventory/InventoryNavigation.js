"use client";

import { LayoutGrid, Activity, Package, CreditCard, Users, FileText, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { icon: LayoutGrid, label: "Overview" },
  { icon: Activity, label: "Activities" },
  { icon: Package, label: "Products" },
  { icon: CreditCard, label: "Billing" },
  { icon: Users, label: "People", permission: "manage_users" },
  { icon: FileText, label: "Report", permission: "access_reports" },
];

export default function InventoryNavigation({ active, onChange, userPermissions = [] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Only show items the user has permission for
  const visibleNavItems = NAV_ITEMS.filter((item) => !item.permission || userPermissions.includes(item.permission));

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
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{active}</span>
          <div className="w-10" /> {/* Spacer for alignment */}
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="mt-3 space-y-1 pb-3 border-t border-gray-200 dark:border-gray-700 pt-3">
            {visibleNavItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
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
