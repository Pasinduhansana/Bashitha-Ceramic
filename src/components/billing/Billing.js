"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ShoppingCart, RefreshCcw, Users, History } from "lucide-react";
import InvoicesTab from "./InvoicesTab";
import PurchasesTab from "./PurchasesTab";
import ReturnsTab from "./ReturnsTab";
import CustomersTab from "./CustomersTab";
import AuditLogTab from "./AuditLogTab";

export default function Billing() {
  const [activeTab, setActiveTab] = useState("invoices");

  const tabs = [
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "purchases", label: "Purchases", icon: ShoppingCart },
    { id: "returns", label: "Returns", icon: RefreshCcw },
    { id: "customers", label: "Customers", icon: Users },
    { id: "audit", label: "Audit Logs", icon: History },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors px-4 sm:px-6 py-4 sm:py-6">
      <h2 className="mb-6 text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Billing & Invoicing</h2>

      {/* Tab Navigation - Matching Product Page Style */}
      <div className="mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-4 sm:gap-6 overflow-x-auto border-b border-gray-200 pb-2 sm:pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 border-b-2 pb-2 sm:pb-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id ? "border-[#1fb8a2] text-[#1fb8a2]" : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "invoices" && <InvoicesTab />}
          {activeTab === "purchases" && <PurchasesTab />}
          {activeTab === "returns" && <ReturnsTab />}
          {activeTab === "customers" && <CustomersTab />}
          {activeTab === "audit" && <AuditLogTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
