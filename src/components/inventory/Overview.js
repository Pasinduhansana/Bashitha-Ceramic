"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Calendar,
  ArrowRight,
  Lock,
  Search,
  Filter,
  MoreVertical,
  Plus,
  Mic,
  HelpCircle,
  DollarSign,
  CalendarDays,
  Share2,
  X,
} from "lucide-react";

// Helper function to format time difference
function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function Overview() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalIncome: 0,
    totalPaid: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch products
      const productsRes = await fetch("/api/products");
      const productsData = await productsRes.json();
      const products = productsData.products || [];

      // Fetch invoices
      const invoicesRes = await fetch("/api/invoices");
      const invoicesData = await invoicesRes.json();
      const invoices = invoicesData.invoices || [];

      // Fetch customers
      const customersRes = await fetch("/api/customers");
      const customersData = await customersRes.json();
      const customers = customersData.customers || [];

      // Fetch audit logs for recent activities
      const logsRes = await fetch("/api/audit-logs?limit=50");
      const logsData = await logsRes.json();
      const logs = logsData.logs || [];

      // Calculate stats
      const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.net_amount || 0), 0);
      const totalPaid = invoices.filter((inv) => inv.payment_status === "paid").reduce((sum, inv) => sum + parseFloat(inv.net_amount || 0), 0);

      setStats({
        totalRevenue,
        totalIncome: totalRevenue,
        totalPaid,
        totalProducts: products.length,
        totalCustomers: customers.length,
      });

      // Build notification list with low stock and recent activities
      const notifications = [];

      // Add low stock alerts
      const lowStockProducts = products.filter((p) => p.qty <= (p.reorder_level || 0));
      lowStockProducts.slice(0, 3).forEach((product) => {
        notifications.push({
          task: `Low Stock: ${product.name}`,
          status: product.qty === 0 ? "critical" : "pending",
          amount: `${product.qty} ${product.unit || "Pcs"}`,
          time: "Now",
          type: "stock",
        });
      });

      // Add recent activities (latest 3-4)
      logs.slice(0, Math.max(0, 4 - notifications.length)).forEach((log) => {
        const timeAgo = getTimeAgo(new Date(log.timestamp));
        notifications.push({
          task: log.details || `${log.action} activity`,
          status: log.action === "create" ? "active" : log.action === "update" ? "pending" : "info",
          amount: log.user_name || "System",
          time: timeAgo,
          type: "activity",
        });
      });

      setActivities(notifications);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDate = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const now = new Date();
    return {
      day: now.getDate(),
      dayName: days[now.getDay()],
      monthName: months[now.getMonth()],
    };
  };

  const currentDate = getCurrentDate();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1fb8a2]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Date and Task Button */}
          <div className="flex items-center gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 p-5 flex items-center gap-5 transition-colors w-full">
              <div className="text-center sm:text-left">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{currentDate.day}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{currentDate.dayName},</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">{currentDate.monthName}</div>
              </div>
              <button className="hidden sm:flex bg-gradient-to-r from-[#1fb8a2] to-[#17a694] hover:from-[#1aa693] hover:to-[#158f82] text-white px-5 py-2.5 rounded-full items-center gap-2 text-xs font-bold transition-all shadow-md hover:shadow-lg flex-1 justify-center">
                Show my Tasks
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button className="p-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors">
                <CalendarDays className="h-4 w-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 p-6 text-center transition-colors">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Hey, Need help?👋</h2>
            <p className="text-sm text-gray-400 dark:text-gray-500">Just ask me anything!</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <Mic className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Payment Card Section */}
          <div className="lg:col-span-4 space-y-6">
            {/* Credit Card */}
            <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 p-5 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-900 dark:text-white">VISA</span>
                </div>
              </div>
              <div className="mb-3">
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">Linked to main account</p>
                <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">•••• 2719</p>
              </div>
              <div className="flex gap-2 mb-3">
                <button className="flex-1 bg-black dark:bg-gray-900 text-white py-2.5 rounded-md text-xs font-bold hover:bg-gray-800 dark:hover:bg-gray-950 transition-colors">
                  Receive
                </button>
                <button className="flex-1 border-2 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white py-2.5 rounded-md text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Send
                </button>
              </div>
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Monthly regular fee</p>
                    <p className="text-base font-bold text-gray-900 dark:text-white">$25.00</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] px-3 py-1 rounded-full font-semibold">
                    Edit Setup
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Debits Section */}
          <div className="lg:col-span-4 space-y-6">
            {/* Total Income */}
            <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 p-5 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Direct Debits</span>
                <MoreVertical className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="mb-1">
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Total income</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-4">${stats.totalIncome.toFixed(2)}</div>
            </div>

            {/* Total Paid */}
            <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 p-5 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Weekly</span>
                <MoreVertical className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="mb-1">
                <span className="text-[10px] text-gray-500 dark:text-gray-400">Total paid</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">${stats.totalPaid.toFixed(2)}</div>
                <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[10px] px-3 py-1 rounded-full font-semibold">
                  View Mode
                </div>
              </div>
            </div>
          </div>

          {/* System Lock & Calendar */}
          <div className="lg:col-span-4 space-y-6">
            {/* System Lock Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 p-5 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <Lock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <MoreVertical className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              <div className="text-center mb-4">
                <span className="text-xs text-gray-600 dark:text-gray-400 font-semibold">System Lock</span>
              </div>
              {/* Progress Circle */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="#f3f4f6" className="dark:stroke-gray-700" strokeWidth="10" fill="none" />
                    <circle
                      cx="56"
                      cy="56"
                      r="48"
                      stroke="url(#gradient)"
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray="301.59"
                      strokeDashoffset="181"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1fb8a2" />
                        <stop offset="100%" stopColor="#17a694" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">38%</span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Device lock rate</p>
              </div>
            </div>

            {/* Calendar & Revenue */}
            <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 p-5 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">13 Days</span>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">101 hours, 23 minutes</p>
                </div>
                <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              </div>
              {/* Mini Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-3">
                {[...Array(28)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full ${i < 13 ? "bg-gradient-to-r from-[#1fb8a2] to-[#17a694]" : "bg-gray-200 dark:bg-gray-700"}`}
                  />
                ))}
              </div>
              {/* Revenue Chart */}
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-end justify-between h-16 gap-1">
                  {[40, 65, 45, 80, 55, 70, 50, 85, 60].map((height, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-[#1fb8a2] to-[#17a694] rounded-t-lg" style={{ height: `${height}%` }} />
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <TrendingUp className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  <span className="text-xl font-bold text-gray-900 dark:text-white">${(stats.totalRevenue / 1000).toFixed(1)}K</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Annual Profits */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 p-5 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Annual profits</h3>
              <button className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-semibold">2023 ▾</button>
            </div>
            <div className="flex items-center justify-center py-6">
              {/* Concentric Circles */}
              <div className="relative w-56 h-56">
                {[
                  { size: "w-56 h-56", color: "from-teal-100 to-teal-50 dark:from-teal-900/30 dark:to-teal-800/20", label: "$14K" },
                  { size: "w-42 h-42", color: "from-teal-200 to-teal-100 dark:from-teal-800/50 dark:to-teal-700/30", label: "$9.3K" },
                  { size: "w-28 h-28", color: "from-teal-300 to-teal-200 dark:from-teal-700/70 dark:to-teal-600/50", label: "$6.8K" },
                  { size: "w-16 h-16", color: "from-[#1fb8a2] to-[#17a694]", label: "$4K" },
                ].map((circle, i) => (
                  <div
                    key={i}
                    className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${circle.size} rounded-full bg-gradient-to-br ${circle.color} flex items-center justify-center`}
                  >
                    {i === 3 && <span className="text-white font-bold text-sm">{circle.label}</span>}
                  </div>
                ))}
                {/* Labels */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-xs font-bold text-teal-400 dark:text-teal-500">$14K</div>
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-teal-500">$9.3K</div>
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-teal-600">$6.8K</div>
              </div>
            </div>
          </div>

          {/* Activity Manager */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white">Activity Manager</h3>
              <button className="text-[10px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">View All</button>
            </div>
            <div className="p-4">
              {stats.recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentActivities.map((activity, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === "success"
                            ? "bg-green-100 dark:bg-green-900/20"
                            : activity.type === "warning"
                              ? "bg-orange-100 dark:bg-orange-900/20"
                              : "bg-red-100 dark:bg-red-900/20"
                        }`}
                      >
                        {activity.type === "success" ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : activity.type === "warning" ? (
                          <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{activity.title}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-gray-500 dark:text-gray-400">No recent activities</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Stocks & Wallet */}
          <div className="lg:col-span-4 space-y-6">
            {/* Main Stocks */}
            <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 p-5 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 dark:text-white">Main Stocks</h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Extended Limited</p>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-bold text-green-600 dark:text-green-400">+9.3%</span>
                </div>
              </div>
              {/* Stock Chart */}
              <div className="h-20 flex items-end justify-between gap-1">
                <svg className="w-full h-full" viewBox="0 0 200 80">
                  <polyline
                    fill="none"
                    stroke="url(#stockGradient)"
                    strokeWidth="2"
                    points="0,60 20,55 40,45 60,50 80,35 100,40 120,25 140,30 160,20 180,25 200,15"
                  />
                  <defs>
                    <linearGradient id="stockGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1fb8a2" />
                      <stop offset="100%" stopColor="#17a694" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>

            {/* Main Stocks */}
            <div className="bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 p-5 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white">Main Stocks</h3>
                <button className="text-[10px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">View All</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-3">
                  <Package className="h-4 w-4 text-[#1fb8a2] mb-2" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalProducts}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Products</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-md p-3">
                  <Users className="h-4 w-4 text-[#1fb8a2] mb-2" />
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.totalCustomers}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Customers</p>
                </div>
              </div>
            </div>

            {/* Wallet */}
            <div className="bg-gradient-to-br from-[#1fb8a2] to-[#17a694] rounded-md shadow-lg p-5 text-white">
              <div className="flex items-center justify-between mb-4">
                <Wallet className="h-6 w-6" />
                <button className="text-[10px] opacity-80 hover:opacity-100">Manage</button>
              </div>
              <p className="text-[10px] opacity-80 mb-1">Total Balance</p>
              <p className="text-2xl font-bold mb-4">${stats.totalRevenue.toFixed(2)}</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 py-2 rounded-md text-xs font-bold transition-colors">
                  Withdraw
                </button>
                <button className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 py-2 rounded-md text-xs font-bold transition-colors">
                  Top Up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
