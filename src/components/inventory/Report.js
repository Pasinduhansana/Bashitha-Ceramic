"use client";

import { useState, useEffect } from "react";
import {
  Download,
  FileText,
  Calendar,
  Filter,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Archive,
  FileSpreadsheet,
  FileBarChart,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

const REPORT_TYPES = [
  {
    id: "products",
    title: "Products Report",
    description: "Export all product inventory data including stock levels, pricing, and categories",
    icon: Package,
    color: "bg-[#1fb8a2]/10 text-[#1fb8a2] border-[#1fb8a2]/20",
    endpoint: "/api/products",
  },
  {
    id: "invoices",
    title: "Invoices Report",
    description: "Download complete invoice records with customer details and payment status",
    icon: FileText,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    endpoint: "/api/invoices",
  },
  {
    id: "purchases",
    title: "Purchases Report",
    description: "Export purchase orders and supplier transaction history",
    icon: ShoppingCart,
    color: "bg-cyan-50 text-cyan-600 border-cyan-200",
    endpoint: "/api/purchases",
  },
  {
    id: "customers",
    title: "Customers Report",
    description: "Download customer database with contact information and purchase history",
    icon: Users,
    color: "bg-teal-50 text-teal-600 border-teal-200",
    endpoint: "/api/customers",
  },
  {
    id: "returns",
    title: "Returns Report",
    description: "Export product return records and refund transactions",
    icon: Archive,
    color: "bg-slate-50 text-slate-600 border-slate-200",
    endpoint: "/api/returns",
  },
  {
    id: "audit-logs",
    title: "Audit Logs Report",
    description: "Download complete system activity and user action logs",
    icon: FileBarChart,
    color: "bg-gray-50 text-gray-600 border-gray-200",
    endpoint: "/api/audit-logs",
  },
];

export default function Report() {
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState({});
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [stats, setStats] = useState({
    totalReports: 6,
    downloadedToday: 0,
    lastDownload: null,
  });

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const downloadCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error("No data available to export");
      return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
      headers.join(","), // Header row
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            // Handle null/undefined
            if (value === null || value === undefined) return "";
            // Escape commas and quotes
            const stringValue = String(value).replace(/"/g, '""');
            return stringValue.includes(",") ? `"${stringValue}"` : stringValue;
          })
          .join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadJSON = (data, filename) => {
    if (!data || data.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownload = async (report) => {
    setLoading((prev) => ({ ...prev, [report.id]: true }));

    try {
      // Build query params
      const params = new URLSearchParams();
      if (dateRange.from) params.append("from", dateRange.from);
      if (dateRange.to) params.append("to", dateRange.to);

      const response = await fetch(`${report.endpoint}?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch data");
      }

      // Extract the data array from response
      let dataToExport = [];
      if (report.id === "products") dataToExport = data.products || [];
      else if (report.id === "invoices") dataToExport = data.invoices || [];
      else if (report.id === "purchases") dataToExport = data.purchases || [];
      else if (report.id === "customers") dataToExport = data.customers || [];
      else if (report.id === "returns") dataToExport = data.returns || [];
      else if (report.id === "audit-logs") dataToExport = data.logs || [];

      if (dataToExport.length === 0) {
        toast.error("No data available for the selected date range");
        return;
      }

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `${report.id}_${timestamp}.${selectedFormat}`;

      // Download based on format
      if (selectedFormat === "csv") {
        downloadCSV(dataToExport, filename);
      } else {
        downloadJSON(dataToExport, filename);
      }

      toast.success(`${report.title} downloaded successfully!`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error.message || "Failed to download report");
    } finally {
      setLoading((prev) => ({ ...prev, [report.id]: false }));
    }
  };

  const handleDownloadAll = async () => {
    toast.loading("Preparing all reports...", { id: "download-all" });

    for (const report of REPORT_TYPES) {
      await handleDownload(report);
      // Small delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    toast.success("All reports downloaded!", { id: "download-all" });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors px-4 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Reports & Analytics</h2>
            <p className="mt-1 text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Generate and download comprehensive reports from your business data
            </p>
          </div>
          <button
            onClick={handleDownloadAll}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1fb8a2] to-[#17a694] hover:from-[#1aa693] hover:to-[#158f82] text-white rounded-md font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Download className="h-5 w-5" />
            Download All Reports
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-md shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Available Reports</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalReports}</p>
              </div>
              <div className="bg-[#1fb8a2]/10 p-3 rounded-md">
                <FileSpreadsheet className="h-8 w-8 text-[#1fb8a2]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Downloaded Today</p>
                <p className="text-3xl font-bold text-gray-900">{stats.downloadedToday}</p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-md">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-md shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Export Formats</p>
                <p className="text-3xl font-bold text-gray-900">2</p>
              </div>
              <div className="bg-cyan-50 p-3 rounded-md">
                <FileBarChart className="h-8 w-8 text-cyan-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-800 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-[#1fb8a2]/10 p-2 rounded-md">
            <Filter className="h-5 w-5 text-[#1fb8a2]" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Filter & Export Options</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Date Range */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Calendar className="h-4 w-4 text-[#1fb8a2]" />
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:ring-2 focus:ring-[#1fb8a2] focus:border-[#1fb8a2] transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Calendar className="h-4 w-4 text-[#1fb8a2]" />
              End Date
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:ring-2 focus:ring-[#1fb8a2] focus:border-[#1fb8a2] transition-all"
            />
          </div>

          {/* Format Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <FileSpreadsheet className="h-4 w-4 text-[#1fb8a2]" />
              Export Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md focus:ring-2 focus:ring-[#1fb8a2] focus:border-[#1fb8a2] transition-all bg-white font-medium"
            >
              <option value="csv">📊 CSV (Excel Compatible)</option>
              <option value="json">📄 JSON (Developer Format)</option>
            </select>
          </div>
        </div>

        {dateRange.from && dateRange.to && (
          <div className="mt-6 p-4 bg-[#1fb8a2]/10 dark:bg-[#1fb8a2]/5 border-2 border-[#1fb8a2]/20 rounded-md">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#1fb8a2]" />
              <p className="text-sm font-medium text-gray-800">
                Filtering data from <span className="font-bold text-[#1fb8a2]">{dateRange.from}</span> to{" "}
                <span className="font-bold text-[#1fb8a2]">{dateRange.to}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Report Cards Grid */}
      <div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Available Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {REPORT_TYPES.map((report) => {
            const Icon = report.icon;
            const isLoading = loading[report.id];

            return (
              <div
                key={report.id}
                className="group bg-white rounded-md shadow-lg border-2 border-gray-100 p-6 hover:shadow-xl hover:border-[#1fb8a2]/30 transition-all duration-300"
              >
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-md border-2 ${report.color} mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="h-7 w-7" />
                </div>

                {/* Content */}
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-[#1fb8a2] transition-colors">
                  {report.title}
                </h3>
                <p className="text-sm text-gray-600 mb-6 min-h-10 leading-relaxed">{report.description}</p>

                {/* Download Button */}
                <button
                  onClick={() => handleDownload(report)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#1fb8a2] to-[#17a694] hover:from-[#1aa693] hover:to-[#158f82] text-white rounded-md font-semibold shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Download {selectedFormat.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-white dark:bg-gray-900 rounded-md border-2 border-[#1fb8a2]/30 p-6 sm:p-8 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="bg-[#1fb8a2] p-3 rounded-md shadow-md">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">📚 Export Guidelines & Best Practices</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#1fb8a2] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">CSV Format:</strong> Excel & Google Sheets compatible
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#1fb8a2] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">JSON Format:</strong> Perfect for API integration & automation
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#1fb8a2] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Date Filters:</strong> Export specific time period data
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#1fb8a2] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Bulk Download:</strong> Use "Download All" for complete backup
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#1fb8a2] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">Complete Data:</strong> All database fields included in exports
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#1fb8a2] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    <strong className="text-gray-900">File Names:</strong> Auto-timestamped for easy organization
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
