"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Download,
  FileText,
  Calendar,
  Package,
  ShoppingCart,
  Users,
  Archive,
  FileSpreadsheet,
  FileBarChart,
  CheckCircle2,
  Clock,
  RefreshCw,
  FilterIcon
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import Button from "@/components/ui/button";
import Loader from "@/components/ui/Loader";
import { FcClearFilters } from "react-icons/fc";

/* npm install recharts xlsx  — both required for the charts and the
   Excel export option below. */

const REPORT_TYPES = [
  { id: "products", title: "Products", description: "Stock levels, pricing, and categories", icon: Package, tint: "bg-brand-50 text-brand-800", chartColor: "#0f766e", endpoint: "/api/products", dataKey: "products" },
  { id: "invoices", title: "Invoices", description: "Invoice records, customers, payment status", icon: FileText, tint: "bg-success-50 text-success-700", chartColor: "#10b981", endpoint: "/api/invoices", dataKey: "invoices" },
  { id: "purchases", title: "Purchases", description: "Purchase orders and supplier history", icon: ShoppingCart, tint: "bg-blue-50 text-blue-700", chartColor: "#3b82f6", endpoint: "/api/purchases", dataKey: "purchases" },
  { id: "customers", title: "Customers", description: "Customer database and purchase history", icon: Users, tint: "bg-violet-50 text-violet-700", chartColor: "#8b5cf6", endpoint: "/api/customers", dataKey: "customers" },
  { id: "returns", title: "Returns", description: "Product returns and refund transactions", icon: Archive, tint: "bg-warning-50 text-warning-700", chartColor: "#f59e0b", endpoint: "/api/returns", dataKey: "returns" },
  { id: "audit-logs", title: "Audit logs", description: "System activity and user action history", icon: FileBarChart, tint: "bg-danger-50 text-danger-700", chartColor: "#f43f5e", endpoint: "/api/audit-logs", dataKey: "logs" },
];

const FORMATS = [
  { value: "csv", label: "CSV — Excel & Sheets compatible" },
  { value: "xlsx", label: "Excel (.xlsx) — formatted workbook" },
  { value: "json", label: "JSON — for API & automation" },
];

const inputClass =
  "w-full h-9 rounded-lg border border-neutral-200 bg-white px-3 text-[14px] outline-none focus:border-brand-600 text-neutral-900 transition-colors";

export default function Report() {
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState({});
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [downloadedToday, setDownloadedToday] = useState(0);
  const [recordCounts, setRecordCounts] = useState({});
  const [countsLoading, setCountsLoading] = useState(true);

  useEffect(() => {
    fetchRecordCounts();
  }, []);

  const fetchRecordCounts = async () => {
    setCountsLoading(true);
    try {
      const results = await Promise.all(
        REPORT_TYPES.map(async (report) => {
          try {
            const res = await fetch(report.endpoint);
            const data = await res.json();
            return { id: report.id, count: (data[report.dataKey] || []).length };
          } catch {
            return { id: report.id, count: 0 };
          }
        }),
      );
      const counts = {};
      results.forEach((r) => (counts[r.id] = r.count));
      setRecordCounts(counts);
    } finally {
      setCountsLoading(false);
    }
  };

  const chartData = useMemo(
    () => REPORT_TYPES.map((r) => ({ name: r.title, value: recordCounts[r.id] || 0, color: r.chartColor })),
    [recordCounts],
  );
  const totalRecords = chartData.reduce((sum, d) => sum + d.value, 0);

  const downloadCSV = (data, filename) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (value === null || value === undefined) return "";
            const stringValue = String(value).replace(/"/g, '""');
            return stringValue.includes(",") ? `"${stringValue}"` : stringValue;
          })
          .join(","),
      ),
    ].join("\n");
    triggerDownload(new Blob([csvContent], { type: "text/csv;charset=utf-8;" }), filename);
  };

  const downloadJSON = (data, filename) => {
    triggerDownload(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), filename);
  };

  const downloadExcel = (data, filename, sheetName) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, filename);
  };

  const triggerDownload = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async (report) => {
    setLoading((prev) => ({ ...prev, [report.id]: true }));
    try {
      const params = new URLSearchParams();
      if (dateRange.from) params.append("from", dateRange.from);
      if (dateRange.to) params.append("to", dateRange.to);

      const response = await fetch(`${report.endpoint}?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch data");

      const dataToExport = data[report.dataKey] || [];
      if (dataToExport.length === 0) {
        toast.error("No data available for the selected date range");
        return;
      }

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `${report.id}_${timestamp}.${selectedFormat}`;

      if (selectedFormat === "csv") downloadCSV(dataToExport, filename);
      else if (selectedFormat === "xlsx") downloadExcel(dataToExport, filename, report.title);
      else downloadJSON(dataToExport, filename);

      setDownloadedToday((n) => n + 1);
      toast.success(`${report.title} report downloaded`);
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error.message || "Failed to download report");
    } finally {
      setLoading((prev) => ({ ...prev, [report.id]: false }));
    }
  };

  const handleDownloadAll = async () => {
    toast.loading("Preparing all reports…", { id: "download-all" });
    for (const report of REPORT_TYPES) {
      await handleDownload(report);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    toast.success("All reports downloaded", { id: "download-all" });
  };

  const clearFilters = () => {
    setDateRange({ from: "", to: "" });
  }

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 py-4 sm:py-5 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900" style={{ fontFamily: "'Fraunces', serif" }}>
            Reports & Analytics
          </h2>
          <p className="text-[15px] text-neutral-500 mt-0.5">Generate and download reports from your business data.</p>
        </div>
        <Button variant="primary" size="md" icon={Download} onClick={handleDownloadAll} className="w-full sm:w-auto">
          Download all reports
        </Button>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-3.5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-800"><FileSpreadsheet className="h-4 w-4" /></div>
          <div>
            <p className="text-lg font-bold text-neutral-900 tabular-nums leading-none">{REPORT_TYPES.length}</p>
            <p className="text-[14px] text-neutral-400 mt-1">Available reports</p>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3.5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success-50 text-success-700"><CheckCircle2 className="h-4 w-4" /></div>
          <div>
            <p className="text-lg font-bold text-neutral-900 tabular-nums leading-none">{downloadedToday}</p>
            <p className="text-[14px] text-neutral-400 mt-1">Downloaded this session</p>
          </div>
        </div>
        <div className="rounded-xl border border-neutral-200 bg-white p-3.5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><FileBarChart className="h-4 w-4" /></div>
          <div>
            <p className="text-lg font-bold text-neutral-900 tabular-nums leading-none">3</p>
            <p className="text-[14px] text-neutral-400 mt-1">Export formats</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 rounded-xl border border-neutral-200 bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold text-neutral-900">Records by report type</h3>
            {countsLoading && <RefreshCw className="h-3.5 w-3.5 text-neutral-300 animate-spin" />}
          </div>
          <div className="h-80 pt-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="#f1f1f1" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 13, fill: "#a3a3a3" }} axisLine={{ stroke: "#e5e5e5" }} tickLine={false} />
                <YAxis tick={{ fontSize: 13, fill: "#a3a3a3" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #e5e5e5", fontSize: 14, boxShadow: "none" }}
                  cursor={{ fill: "#fafafa" }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-neutral-200 bg-white p-4">
          <h3 className="text-[15px] font-semibold text-neutral-900 mb-3">Data share</h3>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={2}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #e5e5e5", fontSize: 14, boxShadow: "none" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2">
            {chartData.map((d) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[13px] text-neutral-500">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                <span className="truncate">{d.name}</span>
                <span className="ml-auto font-medium text-neutral-700 tabular-nums">{d.value}</span>
              </div>
            ))}
          </div>
          {totalRecords > 0 && <p className="text-[14px] text-neutral-400 mt-4 text-center">{totalRecords} total records</p>}
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-neutral-900 mb-5">Filter & export options</h3>
                        <Button variant="secondary" size="md" fullWidth icon={FilterIcon} onClick={() => clearFilters()}  className="w-full flex sm:w-auto">Clear Filter
                </Button></div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <label className="flex items-center gap-1.5 text-[14px] font-medium text-neutral-600 mb-1.5">
              <Calendar className="h-3.5 w-3.5" /> Start date
            </label>
            <input type="date" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[14px] font-medium text-neutral-600 mb-1.5">
              <Calendar className="h-3.5 w-3.5" /> End date
            </label>
            <input type="date" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-[14px] font-medium text-neutral-600 mb-1.5">
              <FileSpreadsheet className="h-3.5 w-3.5" /> Export format
            </label>
            <select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)} className={inputClass}>
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>

        {dateRange.from && dateRange.to && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-brand-200 bg-brand-50/50 px-3 py-2">
            <Clock className="h-3.5 w-3.5 text-brand-700 shrink-0" />
            <p className="text-[14px] text-neutral-700">
              Filtering <span className="font-semibold text-brand-800">{dateRange.from}</span> to{" "}
              <span className="font-semibold text-brand-800">{dateRange.to}</span>
            </p>
          </div>
        )}
      </div>

      {/* Report cards */}
      <div>
        <h3 className="text-[15px] font-semibold text-neutral-900 mb-3">Available reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REPORT_TYPES.map((report) => {
            const Icon = report.icon;
            const isLoading = loading[report.id];
            return (
              <div key={report.id} className="rounded-xl border border-neutral-200 bg-white p-4 hover:border-neutral-300 transition-colors">
                <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${report.tint} mb-3`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h4 className="text-[15px] font-semibold text-neutral-900 mb-1">{report.title}</h4>
                <p className="text-[14px] text-neutral-500 mb-4 leading-relaxed min-h-[32px]">{report.description}</p>
                <Button variant="secondary" size="md" fullWidth icon={isLoading ? undefined : Download} loading={isLoading} onClick={() => handleDownload(report)}>
                  {isLoading ? "Downloading…" : `Download ${selectedFormat.toUpperCase()}`}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guidelines */}
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <h3 className="text-[15px] font-semibold text-neutral-900 mb-3">Export guidelines</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            "CSV opens directly in Excel and Google Sheets",
            "Excel (.xlsx) keeps a formatted, named worksheet",
            "JSON suits API integration and automation",
            "Date filters scope the export to a specific period",
            "\"Download all\" pulls every report in one pass",
            "Filenames are auto-timestamped for organization",
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-brand-700 mt-0.5 shrink-0" />
              <p className="text-[14px] text-neutral-600">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}