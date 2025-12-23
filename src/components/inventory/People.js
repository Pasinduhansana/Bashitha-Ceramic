"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ChevronDown,
  Download,
  Users,
  UserCheck,
  UserX,
  Calendar,
  X,
  Edit2,
  UserMinus,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Shield,
  List,
  Grid3x3,
} from "lucide-react";
import toast from "react-hot-toast";

export default function People() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusOpen, setStatusOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [roles, setRoles] = useState([]);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'tile'

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchRoles();
  }, [statusFilter, roleFilter, searchTerm]);

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      const data = await res.json();
      if (data.success) {
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/users/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (roleFilter !== "all") params.append("role", roleFilter);
      if (searchTerm) params.append("search", searchTerm);

      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditForm({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      contact: user.contact || "",
      address: user.address || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const res = await fetch(`/api/users/${editForm.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("User updated successfully");
        setShowEditModal(false);
        fetchUsers();
        fetchStats();
        if (selectedUser?.id === editForm.id) {
          setSelectedUser({ ...selectedUser, ...editForm });
        }
      } else {
        toast.error(data.message || "Failed to update user");
      }
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleDeactivate = async (user) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-gray-900">
            {user.is_active ? "Deactivate" : "Activate"} user {user.name}?
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const res = await fetch(`/api/users/${user.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ is_active: !user.is_active }),
                  });

                  const data = await res.json();
                  if (data.success) {
                    toast.success(data.message);
                    fetchUsers();
                    fetchStats();
                    if (selectedUser?.id === user.id) {
                      setSelectedUser({ ...selectedUser, is_active: !user.is_active });
                    }
                  } else {
                    toast.error(data.message);
                  }
                } catch (error) {
                  toast.error("Failed to update user status");
                }
              }}
              className="flex-1 rounded bg-[#1fb8a2] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#189d8b]"
            >
              Yes, {user.is_active ? "Deactivate" : "Activate"}
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 rounded bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 5000, position: "top-center" }
    );
  };

  const handleDelete = async (user) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="font-medium text-gray-900">Delete user {user.name}?</p>
          <p className="text-sm text-gray-600">This action cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const res = await fetch(`/api/users/${user.id}`, {
                    method: "DELETE",
                  });

                  const data = await res.json();
                  if (data.success) {
                    toast.success("User deleted successfully");
                    fetchUsers();
                    fetchStats();
                    if (selectedUser?.id === user.id) {
                      setSelectedUser(null);
                    }
                  } else {
                    toast.error(data.message);
                  }
                } catch (error) {
                  toast.error("Failed to delete user");
                }
              }}
              className="flex-1 rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 rounded bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 5000, position: "top-center" }
    );
  };

  const exportUsers = () => {
    const csv = [
      ["Name", "Username", "Email", "Role", "Status", "Last Active"],
      ...users.map((u) => [
        u.name,
        u.username,
        u.email,
        u.role_name || "Unknown",
        u.is_active ? "Active" : "Inactive",
        u.updated_at ? new Date(u.updated_at).toLocaleDateString() : "N/A",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Users exported successfully");
  };

  const getStatusBadge = (is_active) => {
    return is_active ? (
      <span className="inline-flex items-center gap-1.5 rounded bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600">Active</span>
    ) : (
      <span className="inline-flex items-center gap-1.5 rounded bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600">Inactive</span>
    );
  };

  const getRoleBadge = (role_name) => {
    // Determine color based on role name
    const isAdmin = role_name?.toLowerCase().includes("admin");
    const colorClass = isAdmin ? "bg-purple-50 text-purple-600" : "bg-blue-50 text-blue-600";

    return <span className={`inline-flex items-center rounded px-2.5 py-1 text-xs font-medium capitalize ${colorClass}`}>{role_name || "user"}</span>;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors px-4 sm:px-6 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">User Management</h2>
        <p className="text-sm text-gray-500">Manage your organization's users, roles, and permissions</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-6">
          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-white to-blue-50/30 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-600">Total Users</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalUsers}</div>
            <p className="text-xs text-green-600 mt-0.5">+{stats.growth}% from last month</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-white to-green-50/30 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-600">Active Users</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                <UserCheck className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.activeUsers}</div>
            <p className="text-xs text-gray-600 mt-0.5">
              {stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50/50 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-600">Inactive Users</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                <UserX className="h-4 w-4 text-gray-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.inactiveUsers}</div>
            <p className="text-xs text-gray-600 mt-0.5">
              {stats.totalUsers > 0 ? Math.round((stats.inactiveUsers / stats.totalUsers) * 100) : 0}% of total
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-white to-purple-50/30 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-600">New Today</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <Calendar className="h-4 w-4 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.newToday}</div>
            <p className="text-xs text-gray-600 mt-0.5">
              {stats.totalUsers > 0 ? Math.round((stats.newToday / stats.totalUsers) * 100) : 0}% joined today
            </p>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 rounded border border-gray-300 bg-white py-1.5 pl-10 pr-4 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]"
            />
          </div>

          {/* Status Filter */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setStatusOpen(!statusOpen)}
              className="flex w-full sm:w-auto items-center gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 min-w-[120px]"
            >
              <span className="text-gray-500">Status:</span> {statusFilter === "all" ? "All" : statusFilter === "active" ? "Active" : "Inactive"}
              <ChevronDown className="h-3.5 w-3.5 ml-auto" />
            </button>
            {statusOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setStatusOpen(false)} />
                <div className="absolute top-full z-20 mt-2 w-full sm:w-40 rounded-md border border-gray-200 bg-white shadow-lg p-1">
                  {["All", "Active", "Inactive"].map((opt) => (
                    <button
                      key={opt}
                      className={`flex w-full items-center gap-2 rounded px-3 py-2 text-sm ${
                        statusFilter === opt.toLowerCase() ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setStatusFilter(opt.toLowerCase());
                        setStatusOpen(false);
                      }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Role Filter */}
          <div className="relative w-full sm:w-auto">
            <button
              onClick={() => setRoleOpen(!roleOpen)}
              className="flex w-full sm:w-auto items-center gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 min-w-[120px]"
            >
              <span className="text-gray-500">Role:</span> {roleFilter === "all" ? "All" : roleFilter === "1" ? "Admin" : "User"}
              <ChevronDown className="h-3.5 w-3.5 ml-auto" />
            </button>
            {roleOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setRoleOpen(false)} />
                <div className="absolute top-full z-20 mt-2 w-full sm:w-40 rounded-md border border-gray-200 bg-white shadow-lg p-1">
                  {[
                    { label: "All", value: "all" },
                    { label: "Admin", value: "1" },
                    { label: "User", value: "2" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      className={`flex w-full items-center gap-2 rounded px-3 py-2 text-sm ${
                        roleFilter === opt.value ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setRoleFilter(opt.value);
                        setRoleOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              fetchUsers();
              fetchStats();
            }}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {/* View Toggle and Export */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full lg:w-auto">
          {/* View Toggle */}
          <div className="flex rounded border border-gray-300 bg-white w-full sm:w-auto overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "list" ? "bg-[#1fb8a2] text-white" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <List className="h-4 w-4" />
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode("tile")}
              className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors border-l border-gray-300 ${
                viewMode === "tile" ? "bg-[#1fb8a2] text-white" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
              Tile
            </button>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={exportUsers}
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded bg-gray-100 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
        {/* User List/Tile View */}
        <div className="flex-1">
          {loading ? (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12">
              <div className="flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#1fb8a2]"></div>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12">
              <div className="flex flex-col items-center justify-center text-gray-500">
                <Users className="h-12 w-12 mb-2" />
                <p>No users found</p>
              </div>
            </div>
          ) : viewMode === "list" ? (
            // LIST VIEW
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* Table Header */}
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
                <h3 className="font-semibold text-gray-900">User List</h3>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left">USER</th>
                      <th className="px-6 py-3 text-left">ROLE</th>
                      <th className="px-6 py-3 text-left">STATUS</th>
                      <th className="px-6 py-3 text-left">LAST ACTIVE</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`cursor-pointer transition-colors hover:bg-gray-50 ${selectedUser?.id === user.id ? "bg-blue-50" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {user.img_url ? (
                              <img src={user.img_url} alt={user.name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1fb8a2] to-[#189d8b] text-white font-semibold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getRoleBadge(user.role_name)}</td>
                        <td className="px-6 py-4">{getStatusBadge(user.is_active)}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {user.updated_at ? new Date(user.updated_at).toLocaleDateString() : "Invalid Date"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                <div className="border-t border-gray-200 px-6 py-3 flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Showing 1 to {users.length} of {users.length} users
                  </span>
                  <div className="flex gap-2">
                    <button className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">&lt;</button>
                    <button className="rounded border border-[#1fb8a2] bg-[#1fb8a2] px-3 py-1 text-sm text-white">1</button>
                    <button className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">&gt;</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // TILE VIEW
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`relative rounded-xl border bg-white p-5 shadow-sm cursor-pointer transition-all hover:shadow-md ${
                      selectedUser?.id === user.id ? "border-[#1fb8a2] ring-2 ring-[#1fb8a2]/20" : "border-gray-200 hover:border-[#1fb8a2]/50"
                    }`}
                  >
                    {/* Avatar and Name */}
                    <div className="flex items-start gap-3 mb-3">
                      {user.img_url ? (
                        <img src={user.img_url} alt={user.name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1fb8a2] to-[#189d8b] text-white font-bold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">{user.name}</h4>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      {getRoleBadge(user.role_name)}
                      {getStatusBadge(user.is_active)}
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-2 text-xs">
                      {user.contact && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{user.contact}</span>
                        </div>
                      )}
                      {user.address && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{user.address}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span>{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : "N/A"}</span>
                      </div>
                    </div>

                    {/* Selected Indicator */}
                    {selectedUser?.id === user.id && (
                      <div className="absolute top-3 right-3">
                        <div className="h-3 w-3 rounded-full bg-[#1fb8a2] ring-2 ring-white"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination for Tile View */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm px-6 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Showing 1 to {users.length} of {users.length} users
                </span>
                <div className="flex gap-2">
                  <button className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">&lt;</button>
                  <button className="rounded border border-[#1fb8a2] bg-[#1fb8a2] px-3 py-1 text-sm text-white">1</button>
                  <button className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50">&gt;</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Details Panel */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">User Details</h3>
              {selectedUser && (
                <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {selectedUser ? (
              <div className="p-6">
                {/* Avatar and Name */}
                <div className="flex flex-col items-center mb-6">
                  {selectedUser.img_url ? (
                    <img src={selectedUser.img_url} alt={selectedUser.name} className="h-20 w-20 rounded-full object-cover mb-3" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#1fb8a2] to-[#189d8b] text-white font-bold text-2xl mb-3">
                      {selectedUser.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h4 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h4>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    {getRoleBadge(selectedUser.role_name)}
                    {getStatusBadge(selectedUser.is_active)}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  {selectedUser.contact && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Contact</p>
                        <p className="text-sm text-gray-900">{selectedUser.contact}</p>
                      </div>
                    </div>
                  )}

                  {selectedUser.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Address</p>
                        <p className="text-sm text-gray-900">{selectedUser.address}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Last Active</p>
                      <p className="text-sm text-gray-900">
                        {selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleDateString() : "Invalid Date"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">System Role</p>
                      <p className="text-sm text-gray-900 capitalize">
                        {selectedUser.role_name || (selectedUser.role_id === 1 ? "Administrator" : "Standard User")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-2">
                  <button
                    onClick={() => handleEdit(selectedUser)}
                    className="flex w-full items-center justify-center gap-2 rounded bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeactivate(selectedUser)}
                    className="flex w-full items-center justify-center gap-2 rounded bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700 hover:bg-orange-200"
                  >
                    <UserMinus className="h-4 w-4" />
                    {selectedUser.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(selectedUser)}
                    className="flex w-full items-center justify-center gap-2 rounded bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">No User Selected</h4>
                <p className="text-sm text-gray-500">Select a user from the list to view their details and perform actions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setShowEditModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-2xl">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Edit User</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={editForm.username || ""}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email || ""}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={editForm.role_id || 2}
                    onChange={(e) => setEditForm({ ...editForm, role_id: parseInt(e.target.value) })}
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]"
                  >
                    {(roles.length
                      ? roles
                      : [
                          { id: 1, role_name: "Admin" },
                          { id: 2, role_name: "User" },
                        ]
                    ).map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.role_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                  <input
                    type="text"
                    value={editForm.contact || ""}
                    onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <textarea
                    value={editForm.address || ""}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    rows={3}
                    className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]"
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 px-6 py-4 flex gap-3">
                <button onClick={handleSaveEdit} className="flex-1 rounded bg-[#1fb8a2] px-4 py-2 text-sm font-medium text-white hover:bg-[#189d8b]">
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
