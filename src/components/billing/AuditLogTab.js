"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Calendar,
  User,
  FileText,
  Edit,
  Trash2,
  Eye,
  Plus,
  ShoppingCart,
  RefreshCcw,
  Settings,
  LogIn,
  LogOut,
  UserPlus,
} from "lucide-react";

export default function AuditLogTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, searchTerm]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (actionFilter && actionFilter !== "all") params.append("action", actionFilter);
      if (searchTerm) params.append("search", searchTerm);
      params.append("limit", "100");

      const response = await fetch(`/api/audit-logs?${params}`);
      const data = await response.json();

      if (response.ok) {
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const iconMap = {
      CREATE_INVOICE: FileText,
      UPDATE_PRODUCT: Edit,
      CREATE_PURCHASE: ShoppingCart,
      APPROVE_RETURN: RefreshCcw,
      DELETE_INVOICE: Trash2,
      CREATE_CUSTOMER: UserPlus,
      LOGIN: LogIn,
      LOGOUT: LogOut,
      UPDATE_USER: Settings,
      CREATE_USER: UserPlus,
      DELETE_USER: Trash2,
    };
    return iconMap[action] || FileText;
  };

  const getActionColor = (action) => {
    if (action.startsWith("CREATE")) return "text-green-600 bg-green-50";
    if (action.startsWith("UPDATE")) return "text-blue-600 bg-blue-50";
    if (action.startsWith("DELETE")) return "text-red-600 bg-red-50";
    if (action.startsWith("APPROVE")) return "text-emerald-600 bg-emerald-50";
    if (action === "LOGIN" || action === "LOGOUT") return "text-purple-600 bg-purple-50";
    return "text-gray-600 bg-gray-50";
  };

  const filteredLogs = logs;

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search logs by user, action, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-[#1fb8a2] focus:ring-2 focus:ring-[#1fb8a2]/20 transition-all text-xs"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-3 items-center w-full md:w-auto">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-[#1fb8a2] focus:ring-2 focus:ring-[#1fb8a2]/20 outline-none transition-all text-xs font-medium"
            >
              <option value="all">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="APPROVE">Approve</option>
              <option value="LOGIN">Login/Logout</option>
            </select>

            <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Audit Logs Timeline */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#1fb8a2] border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading audit logs...</p>
          </div>
        ) : (
          <div className="p-6">
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No audit logs found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log, index) => {
                  const Icon = getActionIcon(log.action);
                  const colorClass = getActionColor(log.action);

                  return (
                    <div key={log.id} className="relative flex gap-4 pb-4 border-b border-gray-100 last:border-b-0 last:pb-0">
                      {/* Timeline Line */}
                      {index !== filteredLogs.length - 1 && <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />}

                      {/* Icon */}
                      <div className={`relative flex-shrink-0 h-12 w-12 rounded-full ${colorClass} flex items-center justify-center shadow-sm`}>
                        <Icon className="h-5 w-5" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{log.action.replace(/_/g, " ")}</h4>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{log.table_name}</span>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">{log.details}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {log.user_name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {log.timestamp}
                              </span>
                              <span className="text-gray-400">Record ID: {log.record_id}</span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
