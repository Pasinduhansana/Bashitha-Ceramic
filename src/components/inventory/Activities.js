"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, ChevronDown, Package, Check, X, User } from "lucide-react";
import toast from "react-hot-toast";

// Map category filter to API action prefixes
function mapCategoryToAction(category) {
  switch (category) {
    case "Entries":
      return "create";
    case "Updates":
      return "update";
    case "Deletions":
      return "delete";
    default:
      return "all";
  }
}

// Group logs by date section (Today, Yesterday, or formatted date)
function groupLogsBySection(logs) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

  const sections = {};

  for (const log of logs) {
    const ts = new Date(log.timestamp);
    let label =
      ts >= startOfToday
        ? "TODAY"
        : ts >= startOfYesterday
        ? "YESTERDAY"
        : ts.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

    if (!sections[label]) sections[label] = [];
    sections[label].push(log);
  }

  // Convert to sorted array (most recent section first)
  return Object.entries(sections)
    .map(([section, items]) => ({ section, items }))
    .sort((a, b) => {
      const order = { TODAY: 2, YESTERDAY: 1 };
      const aScore = order[a.section] ?? 0;
      const bScore = order[b.section] ?? 0;
      if (aScore !== bScore) return bScore - aScore;
      // For date sections, sort by most recent date
      const aDate = new Date(a.section);
      const bDate = new Date(b.section);
      return bDate - aDate;
    });
}

function StatusLabel({ status }) {
  if (status === "Balanced")
    return (
      <span className="inline-flex items-center gap-1.5 rounded bg-green-50 dark:bg-green-900/20 px-2.5 py-1 text-[10px] font-bold text-green-600 dark:text-green-400">
        <Check className="h-3 w-3" /> Balanced
      </span>
    );
  if (status === "Out Of Stock" || status === "Out of stock")
    return (
      <span className="inline-flex items-center gap-1.5 rounded bg-red-50 dark:bg-red-900/20 px-2.5 py-1 text-[10px] font-bold text-red-600 dark:text-red-400">
        <X className="h-3 w-3" /> Out Of Stock
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
      <Check className="h-3 w-3" /> On Track
    </span>
  );
}

function ProductCard({ item }) {
  return (
    <div className="relative grid grid-cols-[2fr_0.8fr_1fr_1.2fr_1fr_1.3fr] gap-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-5 py-3 hover:bg-linear-to-r hover:from-gray-50/50 hover:to-transparent dark:hover:from-gray-700/30 transition-all duration-200">
      {/* Product Info */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-sm">
          <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-900 dark:text-white">{item.name}</p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{item.description}</p>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-center">
        <span className="text-xs font-bold text-gray-900 dark:text-white">{item.price}</span>
      </div>

      {/* Status */}
      <div className="flex items-center">
        <StatusLabel status={item.status} />
      </div>

      {/* Min Threshold */}
      <div className="flex items-center">
        <span className="text-xs text-gray-700 dark:text-gray-300">{item.minThreshold}</span>
      </div>

      {/* Current Stock */}
      <div className="flex items-center">
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{item.currentStock}</span>
      </div>

      {/* Last Updated */}
      <div className="flex items-center">
        <span className="text-[10px] text-gray-600 dark:text-gray-400">{item.lastUpdated}</span>
      </div>
    </div>
  );
}

export default function Activities() {
  const [dateFilter, setDateFilter] = useState("Today");
  const [userFilter, setUserFilter] = useState("All Users");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Fetch users on mount
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/api/users?limit=999");
        const data = await res.json();
        if (res.ok) {
          setUsers([{ id: "all", name: "All Users", img_url: null }, ...(Array.isArray(data.users) ? data.users : [])]);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setUsersLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // Fetch audit logs from API when filters/search change
  useEffect(() => {
    const controller = new AbortController();
    async function fetchLogs() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        const action = mapCategoryToAction(categoryFilter);
        if (action && action !== "all") params.append("action", action);
        if (searchTerm) params.append("search", searchTerm);
        params.append("limit", "200");

        const res = await fetch(`/api/audit-logs?${params.toString()}`, { signal: controller.signal });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch audit logs");
        setLogs(Array.isArray(data.logs) ? data.logs : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          toast.error(err.message, { position: "top-center", duration: 4000 });
        }
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
    return () => controller.abort();
  }, [categoryFilter, searchTerm]);

  // Apply date filter client-side
  const filteredLogs = useMemo(() => {
    const now = new Date();
    const tsRange = {
      Today: { from: new Date(now.getFullYear(), now.getMonth(), now.getDate()), to: now },
      Yesterday: {
        from: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
        to: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      },
      "Last 7 days": { from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), to: now },
      "Last 30 days": { from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), to: now },
    };

    const range = tsRange[dateFilter];
    if (!range) return logs;
    return logs.filter((l) => {
      const t = new Date(l.timestamp);
      return t >= range.from && t <= range.to;
    });
  }, [logs, dateFilter]);

  // Group into sections
  const groupedSections = useMemo(() => groupLogsBySection(filteredLogs), [filteredLogs]);

  return (
    <div className="px-4 sm:px-6 py-6 min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1">Activity History</h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Your activity history is listed as individual items, starting with the most recent.
        </p>
      </div>

      {/* Filters - Mobile Responsive */}
      <div className="mb-6 space-y-3 sm:space-y-0">
        {/* Mobile: Filters Stack Vertically */}
        <div className="sm:hidden space-y-2">
          {/* Date Filter */}
          <div className="relative">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Date:</label>
            <button
              onClick={() => setDateOpen(!dateOpen)}
              className="flex w-full items-center gap-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {dateFilter}
              <ChevronDown className="h-3 w-3 ml-auto" />
            </button>
            {dateOpen && (
              <div className="absolute top-full z-20 mt-1 w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-1">
                {["Today", "Yesterday", "Last 7 days", "Last 30 days"].map((opt) => (
                  <button
                    key={opt}
                    className={`flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium ${
                      dateFilter === opt
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => {
                      setDateFilter(opt);
                      setDateOpen(false);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Filter */}
          <div className="relative">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">User:</label>
            <button
              onClick={() => setUserOpen(!userOpen)}
              className="flex w-full items-center gap-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {userFilter}
              <ChevronDown className="h-3 w-3 ml-auto" />
            </button>
            {userOpen && (
              <div className="absolute top-full z-20 mt-1 w-full max-h-48 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-1 overflow-y-auto">
                {usersLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1fb8a2]"></div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-500">No users found</div>
                ) : (
                  users.map((user) => (
                    <button
                      key={user.id}
                      className={`flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium ${
                        userFilter === user.name
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => {
                        setUserFilter(user.name);
                        setUserOpen(false);
                      }}
                    >
                      {user.img_url ? (
                        <img
                          src={user.img_url}
                          alt={user.name}
                          className="h-5 w-5 rounded-full object-cover flex-shrink-0 border border-gray-300 dark:border-gray-600"
                        />
                      ) : (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0">
                          <User className="h-2.5 w-2.5 text-gray-600 dark:text-gray-300" />
                        </div>
                      )}
                      <span>{user.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className="relative">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Category:</label>
            <button
              onClick={() => setCategoryOpen(!categoryOpen)}
              className="flex w-full items-center gap-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {categoryFilter}
              <ChevronDown className="h-3 w-3 ml-auto" />
            </button>
            {categoryOpen && (
              <div className="absolute top-full z-20 mt-1 w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-1">
                {["All", "Entries", "Updates", "Deletions"].map((opt) => (
                  <button
                    key={opt}
                    className={`flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium ${
                      categoryFilter === opt
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                    onClick={() => {
                      setCategoryFilter(opt);
                      setCategoryOpen(false);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop: Filters Horizontal */}
        <div className="hidden sm:flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Date Filter */}
            <div className="relative flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Date :</span>
              <button
                onClick={() => setDateOpen(!dateOpen)}
                className="flex items-center gap-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 min-w-25 transition-colors"
              >
                {dateFilter}
                <ChevronDown className="h-3 w-3 ml-auto" />
              </button>
              {dateOpen && (
                <div className="absolute top-full z-20 mt-2 w-40 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-1">
                  {["Today", "Yesterday", "Last 7 days", "Last 30 days"].map((opt) => (
                    <button
                      key={opt}
                      className={`flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium ${
                        dateFilter === opt
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => {
                        setDateFilter(opt);
                        setDateOpen(false);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Filter */}
            <div className="relative flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">User :</span>
              <button
                onClick={() => setUserOpen(!userOpen)}
                className="flex items-center gap-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 min-w-25 transition-colors"
              >
                {userFilter}
                <ChevronDown className="h-3 w-3 ml-auto" />
              </button>
              {userOpen && (
                <div className="absolute top-full z-20 mt-2 w-56 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-1 max-h-64 overflow-y-auto">
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#1fb8a2]"></div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-gray-500">No users found</div>
                  ) : (
                    users.map((user) => (
                      <button
                        key={user.id}
                        className={`flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium ${
                          userFilter === user.name
                            ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => {
                          setUserFilter(user.name);
                          setUserOpen(false);
                        }}
                      >
                        {user.img_url ? (
                          <img
                            src={user.img_url}
                            alt={user.name}
                            className="h-6 w-6 rounded-full object-cover flex-shrink-0 border border-gray-300 dark:border-gray-600"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0">
                            <User className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                          </div>
                        )}
                        <span>{user.name}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">Category :</span>
              <button
                onClick={() => setCategoryOpen(!categoryOpen)}
                className="flex items-center gap-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 min-w-25 transition-colors"
              >
                {categoryFilter}
                <ChevronDown className="h-3 w-3 ml-auto" />
              </button>
              {categoryOpen && (
                <div className="absolute top-full z-20 mt-2 w-40 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-1">
                  {["All", "Entries", "Updates", "Deletions"].map((opt) => (
                    <button
                      key={opt}
                      className={`flex w-full items-center gap-2 rounded px-3 py-2 text-xs font-medium ${
                        categoryFilter === opt
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => {
                        setCategoryFilter(opt);
                        setCategoryOpen(false);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search - Desktop Only */}
          <div className="relative min-w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search Activity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#1fb8a2] focus:ring-2 focus:ring-[#1fb8a2]/20 transition-all"
            />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search Activity..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#1fb8a2] focus:ring-2 focus:ring-[#1fb8a2]/20 transition-all"
          />
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="space-y-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1fb8a2]"></div>
          </div>
        )}
        {!loading && groupedSections.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-gray-500">No activities found for selected filters.</p>
          </div>
        )}
        {!loading &&
          groupedSections.map((section) => (
            <div key={section.section}>
              {/* Section Header */}
              <button className="mb-4 flex items-center gap-2 rounded-full bg-linear-to-r from-[#1fb8a2] to-[#17a694] px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg transition-all">
                {section.section}
                <ChevronDown className="h-3 w-3" />
              </button>

              {/* Activities */}
              <div className="space-y-4 sm:space-y-6">
                {section.items.map((log, activityIndex) => (
                  <div key={log.id} className="relative pl-14 sm:pl-16">
                    {/* Vertical Line */}
                    {activityIndex !== section.items.length - 1 && (
                      <div
                        className="absolute left-5 sm:left-6 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700"
                        style={{ height: "calc(100% + 1.5rem)" }}
                      />
                    )}

                    {/* Avatar - Responsive Size */}
                    <div className="absolute left-0 top-0 z-10">
                      {log.user_img_url ? (
                        <img
                          src={log.user_img_url}
                          alt={log.user_name || "User"}
                          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border-4 border-white dark:border-gray-900 shadow-lg"
                        />
                      ) : (
                        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-linear-to-br from-[#1fb8a2] to-[#17a694] text-white font-bold text-xs border-4 border-white dark:border-gray-900 shadow-lg">
                          {(log.user_name || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="pr-2 sm:pr-0">
                      <div className="mb-2">
                        <h3 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white line-clamp-2">{log.details}</h3>
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(log.timestamp).toLocaleString()} by {log.user_name || "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
