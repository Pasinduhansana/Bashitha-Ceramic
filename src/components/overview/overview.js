"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Package, Users, DollarSign, CheckCircle2, AlertTriangle, XCircle, ArrowRight, CalendarDays } from "lucide-react";
import Button from "@/components/ui/button";
import Loader from "@/components/ui/Loader";

function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

const ACTIVITY_STYLES = {
  critical: { icon: XCircle, text: "text-danger-600", bg: "bg-danger-50" },
  pending: { icon: AlertTriangle, text: "text-warning-600", bg: "bg-warning-50" },
  active: { icon: CheckCircle2, text: "text-success-600", bg: "bg-success-50" },
  info: { icon: CheckCircle2, text: "text-neutral-500", bg: "bg-neutral-100" },
};

export default function Overview() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPaid: 0,
    totalProducts: 0,
    totalCustomers: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [productsRes, invoicesRes, customersRes, logsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/invoices"),
        fetch("/api/customers"),
        fetch("/api/audit-logs?limit=50"),
      ]);

      const products = (await productsRes.json()).products || [];
      const invoices = (await invoicesRes.json()).invoices || [];
      const customers = (await customersRes.json()).customers || [];
      const logs = (await logsRes.json()).logs || [];

      const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.net_amount || 0), 0);
      const totalPaid = invoices.filter((inv) => inv.payment_status === "paid").reduce((sum, inv) => sum + parseFloat(inv.net_amount || 0), 0);
      const lowStockCount = products.filter((p) => p.qty > 0 && p.qty <= (p.reorder_level || 0)).length;
      const outOfStockCount = products.filter((p) => p.qty === 0).length;

      setStats({ totalRevenue, totalPaid, totalProducts: products.length, totalCustomers: customers.length, lowStockCount, outOfStockCount });

      const feed = [];
      products
        .filter((p) => p.qty <= (p.reorder_level || 0))
        .slice(0, 3)
        .forEach((product) => {
          feed.push({
            task: `Low stock — ${product.name}`,
            status: product.qty === 0 ? "critical" : "pending",
            amount: `${product.qty} ${product.unit || "Pcs"}`,
            time: "Now",
          });
        });

      logs.slice(0, Math.max(0, 6 - feed.length)).forEach((log) => {
        feed.push({
          task: log.details || `${log.action} activity`,
          status: log.action === "create" ? "active" : log.action === "update" ? "pending" : "info",
          amount: log.user_name || "System",
          time: getTimeAgo(new Date(log.timestamp)),
        });
      });

      setActivities(feed);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentDate = (() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const now = new Date();
    return { day: now.getDate(), dayName: days[now.getDay()], monthName: months[now.getMonth()] };
  })();

  if (loading) return <Loader label="Loading your overview…" />;

  const KPI_CARDS = [
    {
      icon: DollarSign,
      label: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      tint: "text-brand-800 bg-brand-50",
    },
    {
      icon: CheckCircle2,
      label: "Paid Invoices",
      value: `$${stats.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      tint: "text-success-700 bg-success-50",
    },
    { icon: Package, label: "Products", value: stats.totalProducts, tint: "text-blue-700 bg-blue-50" },
    { icon: Users, label: "Customers", value: stats.totalCustomers, tint: "text-violet-700 bg-violet-50" },
  ];

  return (
    <div className="min-h-screen bg-neutral-50/60 dark:bg-gray-900 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Hero row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-400/10 shrink-0">
              <span className="text-[15px] font-bold text-brand-800 dark:text-brand-400 leading-none">{currentDate.day}</span>
              <span className="text-xs font-medium text-brand-700/70 dark:text-brand-400/60 mt-0.5">{currentDate.dayName}</span>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-neutral-900 dark:text-white leading-tight">Good day</p>
              <p className="text-sm text-neutral-500 dark:text-gray-400 mt-0.5">
                {currentDate.dayName}, {currentDate.monthName} {currentDate.day}
              </p>
            </div>
          </div>
          <div className="hidden sm:block h-10 w-px bg-neutral-200 dark:bg-gray-700 mx-2" />
          <p className="flex-1 text-sm text-neutral-500 dark:text-gray-400">
            {stats.outOfStockCount > 0 || stats.lowStockCount > 0 ? (
              <>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {stats.outOfStockCount + stats.lowStockCount} product{stats.outOfStockCount + stats.lowStockCount !== 1 ? "s" : ""}
                </span>{" "}
                need attention today.
              </>
            ) : (
              "All products are sitting comfortably above their reorder levels."
            )}
          </p>
          <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right" className="shrink-0">
            View Inventory
          </Button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {KPI_CARDS.map((card) => (
            <div key={card.label} className="rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${card.tint} mb-3`}>
                <card.icon className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold text-neutral-900 dark:text-white tabular-nums">{card.value}</p>
              <p className="text-sm text-neutral-500 dark:text-gray-400 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Activity feed */}
          <div className="lg:col-span-7 rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white">Recent activity</h3>
              <button className="text-sm font-medium text-brand-800 dark:text-brand-400 hover:underline">View all</button>
            </div>
            <div className="p-2">
              {activities.length > 0 ? (
                <div className="divide-y divide-neutral-100 dark:divide-gray-700">
                  {activities.map((activity, idx) => {
                    const s = ACTIVITY_STYLES[activity.status] || ACTIVITY_STYLES.info;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 px-3 py-3 hover:bg-neutral-50 dark:hover:bg-gray-700/30 rounded-lg transition-colors"
                      >
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${s.bg}`}>
                          <s.icon className={`h-4 w-4 ${s.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{activity.task}</p>
                          <p className="text-sm text-neutral-400 mt-0.5">{activity.amount}</p>
                        </div>
                        <span className="text-sm text-neutral-400 shrink-0">{activity.time}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-14">
                  <p className="text-sm text-neutral-400">No recent activity to show</p>
                </div>
              )}
            </div>
          </div>

          {/* Stock health */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white">Stock health</h3>
                <TrendingUp className="h-4 w-4 text-neutral-300" />
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-lg bg-success-50 dark:bg-success-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-success-700 dark:text-success-500 tabular-nums">
                    {stats.totalProducts - stats.lowStockCount - stats.outOfStockCount}
                  </p>
                  <p className="text-sm text-success-700/70 dark:text-success-500/70 mt-0.5">Healthy</p>
                </div>
                <div className="rounded-lg bg-warning-50 dark:bg-warning-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-warning-700 dark:text-warning-500 tabular-nums">{stats.lowStockCount}</p>
                  <p className="text-sm text-warning-700/70 dark:text-warning-500/70 mt-0.5">Low</p>
                </div>
                <div className="rounded-lg bg-danger-50 dark:bg-danger-500/10 p-3 text-center">
                  <p className="text-lg font-bold text-danger-700 dark:text-danger-500 tabular-nums">{stats.outOfStockCount}</p>
                  <p className="text-sm text-danger-700/70 dark:text-danger-500/70 mt-0.5">Out</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-brand-900 p-4 text-white">
              <div className="flex items-center justify-between mb-3">
                <CalendarDays className="h-5 w-5 text-brand-100/70" />
                <button className="text-sm text-brand-100/70 hover:text-white transition-colors">Manage</button>
              </div>
              <p className="text-sm text-brand-100/60 mb-1">Outstanding balance</p>
              <p className="text-2xl font-semibold text-white">
                ${Math.max(stats.totalRevenue - stats.totalPaid, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-brand-100/50 mt-1">
                of ${stats.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })} total revenue
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
