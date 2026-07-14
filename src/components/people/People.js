"use client";

import { useState, useEffect, useRef } from "react";
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
  Shield,
  List,
  Grid3x3,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/button";
import Loader from "@/components/ui/Loader";

const inputClass =
  "w-full h-9 rounded-lg border border-neutral-200 bg-white px-3 text-[13px] outline-none focus:border-brand-600 text-neutral-900 placeholder-neutral-400 transition-colors";

function StatusBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 text-success-700 px-2 py-0.5 text-[10.5px] font-semibold">
      <span className="h-1.5 w-1.5 rounded-full bg-success-500" /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 text-neutral-500 px-2 py-0.5 text-[10.5px] font-semibold">
      <span className="h-1.5 w-1.5 rounded-full bg-neutral-400" /> Inactive
    </span>
  );
}

function RoleBadge({ roleName }) {
  const isAdmin = roleName?.toLowerCase().includes("admin");
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-semibold capitalize ${
        isAdmin ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"
      }`}
    >
      {roleName || "user"}
    </span>
  );
}

/* Plain <img> with initials fallback — sidesteps the next/image
   "hostname not configured" error entirely for external avatar URLs
   (e.g. Cloudinary) without touching next.config.js. */
function Avatar({ user, size = "h-9 w-9", text = "text-xs" }) {
  const [failed, setFailed] = useState(false);
  if (user.img_url && !failed) {
    return <img src={user.img_url} alt={user.name} className={`${size} shrink-0 rounded-full object-cover`} onError={() => setFailed(true)} />;
  }
  return (
    <div className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-brand-800 text-white font-semibold ${text}`}>
      {user.name?.charAt(0).toUpperCase() || "U"}
    </div>
  );
}

function FilterDropdown({ label, value, open, setOpen, children }) {
  return (
    <div className="relative w-full sm:w-auto">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full sm:w-auto items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-[13px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors min-w-[130px]"
      >
        <span className="text-neutral-400">{label}:</span> {value}
        <ChevronDown className="h-3.5 w-3.5 ml-auto text-neutral-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full z-20 mt-1.5 w-full sm:w-40 rounded-lg border border-neutral-200 bg-white p-1">{children}</div>
        </>
      )}
    </div>
  );
}

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
  const [viewMode, setViewMode] = useState("list");

  const didInitFetchRef = useRef(false);

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/roles");
      const data = await res.json();
      if (data.success) setRoles(data.roles || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/users/stats");
      const data = await res.json();
      if (data.success) setStats(data.stats);
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
      if (data.success) setUsers(data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!didInitFetchRef.current) {
      didInitFetchRef.current = true;
      fetchStats();
      fetchUsers();
      fetchRoles();
      return;
    }
    fetchStats();
    fetchUsers();
    fetchRoles();
  }, [statusFilter, roleFilter, searchTerm]);

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
        if (selectedUser?.id === editForm.id) setSelectedUser({ ...selectedUser, ...editForm });
      } else {
        toast.error(data.message || "Failed to update user");
      }
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleDeactivate = (user) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-semibold text-neutral-900">
            {user.is_active ? "Deactivate" : "Activate"} {user.name}?
          </p>
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              fullWidth
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
                    if (selectedUser?.id === user.id) setSelectedUser({ ...selectedUser, is_active: !user.is_active });
                  } else {
                    toast.error(data.message);
                  }
                } catch (error) {
                  toast.error("Failed to update user status");
                }
              }}
            >
              Yes, {user.is_active ? "deactivate" : "activate"}
            </Button>
            <Button variant="secondary" size="sm" fullWidth onClick={() => toast.dismiss(t.id)}>
              Cancel
            </Button>
          </div>
        </div>
      ),
      { duration: 5000, position: "top-center" },
    );
  };

  const handleDelete = (user) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-semibold text-neutral-900">Delete {user.name}?</p>
          <p className="text-xs text-neutral-500">This action cannot be undone.</p>
          <div className="flex gap-2">
            <Button
              variant="danger"
              size="sm"
              fullWidth
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
                  const data = await res.json();
                  if (data.success) {
                    toast.success("User deleted successfully");
                    fetchUsers();
                    fetchStats();
                    if (selectedUser?.id === user.id) setSelectedUser(null);
                  } else {
                    toast.error(data.message);
                  }
                } catch (error) {
                  toast.error("Failed to delete user");
                }
              }}
            >
              Yes, delete
            </Button>
            <Button variant="secondary" size="sm" fullWidth onClick={() => toast.dismiss(t.id)}>
              Cancel
            </Button>
          </div>
        </div>
      ),
      { duration: 5000, position: "top-center" },
    );
  };

  const exportUsers = () => {
    const csv = [
      ["Name", "Username", "Email", "Role", "Status", "Last Active"],
      ...users.map((u) => [u.name, u.username, u.email, u.role_name || "Unknown", u.is_active ? "Active" : "Inactive", u.updated_at ? new Date(u.updated_at).toLocaleDateString() : "N/A"]),
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

  const KPI_CARDS = stats
    ? [
        { icon: Users, label: "Total users", value: stats.totalUsers, note: `+${stats.growth}% from last month`, tint: "bg-blue-50 text-blue-700" },
        { icon: UserCheck, label: "Active users", value: stats.activeUsers, note: `${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total`, tint: "bg-success-50 text-success-700" },
        { icon: UserX, label: "Inactive users", value: stats.inactiveUsers, note: `${stats.totalUsers > 0 ? Math.round((stats.inactiveUsers / stats.totalUsers) * 100) : 0}% of total`, tint: "bg-neutral-100 text-neutral-600" },
        { icon: Calendar, label: "New today", value: stats.newToday, note: `${stats.totalUsers > 0 ? Math.round((stats.newToday / stats.totalUsers) * 100) : 0}% joined today`, tint: "bg-violet-50 text-violet-700" },
      ]
    : [];

  return (
    <div className="min-h-screen bg-white px-4 sm:px-6 py-4 sm:py-5">
      <div className="mb-5">
        <h2 className="text-xl sm:text-2xl font-semibold text-neutral-900" style={{ fontFamily: "'Fraunces', serif" }}>
          User Management
        </h2>
        <p className="text-[13px] text-neutral-500 mt-0.5">Manage your organization's users, roles, and permissions.</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
          {KPI_CARDS.map((card) => (
            <div key={card.label} className="rounded-xl border border-neutral-200 bg-white p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-500">{card.label}</span>
                <div className={`flex h-7 w-7 items-center justify-center rounded-md ${card.tint}`}>
                  <card.icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="text-xl font-bold text-neutral-900 tabular-nums">{card.value}</div>
              <p className="text-[11px] text-neutral-400 mt-0.5">{card.note}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters + actions */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search users…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} sm:w-56 pl-9`}
            />
          </div>

          <FilterDropdown label="Status" value={statusFilter === "all" ? "All" : statusFilter === "active" ? "Active" : "Inactive"} open={statusOpen} setOpen={setStatusOpen}>
            {["All", "Active", "Inactive"].map((opt) => (
              <button
                key={opt}
                className={`flex w-full items-center rounded-md h-8 px-2.5 text-xs font-medium transition-colors ${
                  statusFilter === opt.toLowerCase() ? "bg-brand-50 text-brand-800" : "text-neutral-600 hover:bg-neutral-50"
                }`}
                onClick={() => { setStatusFilter(opt.toLowerCase()); setStatusOpen(false); }}
              >
                {opt}
              </button>
            ))}
          </FilterDropdown>

          <FilterDropdown label="Role" value={roleFilter === "all" ? "All" : roleFilter === "1" ? "Admin" : "User"} open={roleOpen} setOpen={setRoleOpen}>
            {[{ label: "All", value: "all" }, { label: "Admin", value: "1" }, { label: "User", value: "2" }].map((opt) => (
              <button
                key={opt.value}
                className={`flex w-full items-center rounded-md h-8 px-2.5 text-xs font-medium transition-colors ${
                  roleFilter === opt.value ? "bg-brand-50 text-brand-800" : "text-neutral-600 hover:bg-neutral-50"
                }`}
                onClick={() => { setRoleFilter(opt.value); setRoleOpen(false); }}
              >
                {opt.label}
              </button>
            ))}
          </FilterDropdown>

          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={() => { fetchUsers(); fetchStats(); }} className="w-full sm:w-auto">
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <div className="flex h-9 rounded-lg border border-neutral-200 bg-white w-full sm:w-auto overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 text-[13px] font-medium transition-colors ${
                viewMode === "list" ? "bg-brand-800 text-white" : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <List className="h-3.5 w-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode("tile")}
              className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 text-[13px] font-medium border-l border-neutral-200 transition-colors ${
                viewMode === "tile" ? "bg-brand-800 text-white" : "text-neutral-600 hover:bg-neutral-50"
              }`}
            >
              <Grid3x3 className="h-3.5 w-3.5" /> Tile
            </button>
          </div>

          <Button variant="secondary" size="sm" icon={Download} onClick={exportUsers} className="w-full sm:w-auto">
            Export
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="rounded-xl border border-neutral-200 bg-white">
              <Loader label="Loading users…" />
            </div>
          ) : users.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-200 bg-white p-14 flex flex-col items-center justify-center text-center">
              <Users className="h-8 w-8 text-neutral-300 mb-2" />
              <p className="text-[13px] text-neutral-400">No users found</p>
            </div>
          ) : viewMode === "list" ? (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              <div className="border-b border-neutral-100 bg-neutral-50/70 px-5 py-2.5">
                <h3 className="text-[13px] font-semibold text-neutral-900">User list</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-neutral-100 text-[10.5px] font-semibold uppercase tracking-wide text-neutral-400">
                    <tr>
                      <th className="px-5 py-2.5 text-left">User</th>
                      <th className="px-3 py-2.5 text-left">Role</th>
                      <th className="px-3 py-2.5 text-left">Status</th>
                      <th className="px-3 py-2.5 text-left">Last active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        className={`cursor-pointer transition-colors hover:bg-neutral-50 ${selectedUser?.id === user.id ? "bg-brand-50/50" : ""}`}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar user={user} />
                            <div>
                              <p className="text-[13px] font-semibold text-neutral-900">{user.name}</p>
                              <p className="text-[11px] text-neutral-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3"><RoleBadge roleName={user.role_name} /></td>
                        <td className="px-3 py-3"><StatusBadge active={user.is_active} /></td>
                        <td className="px-3 py-3">
                          <span className="text-[12.5px] text-neutral-500">{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : "—"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="border-t border-neutral-100 px-5 py-2.5 flex items-center justify-between">
                  <span className="text-[11.5px] text-neutral-400">Showing 1–{users.length} of {users.length} users</span>
                  <div className="flex gap-1">
                    <button className="h-7 w-7 rounded-md border border-neutral-200 text-xs text-neutral-500 hover:bg-neutral-50">‹</button>
                    <button className="h-7 w-7 rounded-md bg-brand-800 text-xs text-white">1</button>
                    <button className="h-7 w-7 rounded-md border border-neutral-200 text-xs text-neutral-500 hover:bg-neutral-50">›</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`relative rounded-xl border bg-white p-4 cursor-pointer transition-colors ${
                      selectedUser?.id === user.id ? "border-brand-600/50" : "border-neutral-200 hover:border-neutral-300"
                    }`}
                  >
                    <div className="flex items-start gap-2.5 mb-3">
                      <Avatar user={user} size="h-10 w-10" text="text-sm" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-semibold text-neutral-900 truncate">{user.name}</h4>
                        <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mb-3">
                      <RoleBadge roleName={user.role_name} />
                      <StatusBadge active={user.is_active} />
                    </div>

                    <div className="space-y-1.5 text-[11.5px] text-neutral-500 border-t border-neutral-100 pt-2.5">
                      {user.contact && (
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3 shrink-0 text-neutral-300" /> <span className="truncate">{user.contact}</span>
                        </div>
                      )}
                      {user.address && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 shrink-0 text-neutral-300" /> <span className="truncate">{user.address}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 shrink-0 text-neutral-300" /> <span>{user.updated_at ? new Date(user.updated_at).toLocaleDateString() : "N/A"}</span>
                      </div>
                    </div>

                    {selectedUser?.id === user.id && <div className="absolute top-3 right-3 h-2 w-2 rounded-full bg-brand-700 ring-2 ring-white" />}
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 flex items-center justify-between">
                <span className="text-[11.5px] text-neutral-400">Showing 1–{users.length} of {users.length} users</span>
                <div className="flex gap-1">
                  <button className="h-7 w-7 rounded-md border border-neutral-200 text-xs text-neutral-500 hover:bg-neutral-50">‹</button>
                  <button className="h-7 w-7 rounded-md bg-brand-800 text-xs text-white">1</button>
                  <button className="h-7 w-7 rounded-md border border-neutral-200 text-xs text-neutral-500 hover:bg-neutral-50">›</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detail panel */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <div className="border-b border-neutral-100 px-4 py-2.5 flex items-center justify-between">
              <h3 className="text-[13px] font-semibold text-neutral-900">User details</h3>
              {selectedUser && (
                <button onClick={() => setSelectedUser(null)} className="text-neutral-400 hover:text-neutral-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {selectedUser ? (
              <div className="p-4">
                <div className="flex flex-col items-center mb-4">
                  <Avatar user={selectedUser} size="h-16 w-16" text="text-xl" />
                  <h4 className="text-[14px] font-semibold text-neutral-900 mt-2.5">{selectedUser.name}</h4>
                  <p className="text-xs text-neutral-400">{selectedUser.email}</p>
                  <div className="flex gap-1.5 mt-2">
                    <RoleBadge roleName={selectedUser.role_name} />
                    <StatusBadge active={selectedUser.is_active} />
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedUser.contact && (
                    <div className="flex items-start gap-2.5">
                      <Phone className="h-3.5 w-3.5 text-neutral-300 mt-0.5" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-neutral-400">Contact</p>
                        <p className="text-[12.5px] text-neutral-900">{selectedUser.contact}</p>
                      </div>
                    </div>
                  )}
                  {selectedUser.address && (
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-3.5 w-3.5 text-neutral-300 mt-0.5" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-neutral-400">Address</p>
                        <p className="text-[12.5px] text-neutral-900">{selectedUser.address}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-2.5">
                    <Calendar className="h-3.5 w-3.5 text-neutral-300 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-neutral-400">Last active</p>
                      <p className="text-[12.5px] text-neutral-900">{selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleDateString() : "—"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Shield className="h-3.5 w-3.5 text-neutral-300 mt-0.5" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-neutral-400">System role</p>
                      <p className="text-[12.5px] text-neutral-900 capitalize">{selectedUser.role_name || (selectedUser.role_id === 1 ? "Administrator" : "Standard user")}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <Button variant="secondary" size="sm" fullWidth icon={Edit2} onClick={() => handleEdit(selectedUser)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" fullWidth icon={UserMinus} onClick={() => handleDeactivate(selectedUser)}>
                    {selectedUser.is_active ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="danger" size="sm" fullWidth icon={Trash2} onClick={() => handleDelete(selectedUser)}>
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-50 mb-2.5">
                  <Users className="h-6 w-6 text-neutral-300" />
                </div>
                <h4 className="text-[13px] font-semibold text-neutral-900 mb-1">No user selected</h4>
                <p className="text-xs text-neutral-400">Select a user to view their details.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {showEditModal && (
        <>
          <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm z-40" onClick={() => setShowEditModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white">
              <div className="border-b border-neutral-100 px-5 py-3.5 flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-neutral-900">Edit user</h3>
                <button onClick={() => setShowEditModal(false)} className="text-neutral-400 hover:text-neutral-600">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5 space-y-3 max-h-[65vh] overflow-y-auto">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">Name</label>
                  <input type="text" value={editForm.name || ""} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">Username</label>
                  <input type="text" value={editForm.username || ""} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">Email</label>
                  <input type="email" value={editForm.email || ""} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">Role</label>
                  <select value={editForm.role_id || 2} onChange={(e) => setEditForm({ ...editForm, role_id: parseInt(e.target.value) })} className={inputClass}>
                    {(roles.length ? roles : [{ id: 1, role_name: "Admin" }, { id: 2, role_name: "User" }]).map((role) => (
                      <option key={role.id} value={role.id}>{role.role_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">Contact</label>
                  <input type="text" value={editForm.contact || ""} onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1.5">Address</label>
                  <textarea value={editForm.address || ""} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} rows={3} className={`${inputClass} h-auto py-2 resize-none`} />
                </div>
              </div>
              <div className="border-t border-neutral-100 px-5 py-3.5 flex gap-2.5">
                <Button variant="primary" size="sm" fullWidth onClick={handleSaveEdit}>Save changes</Button>
                <Button variant="secondary" size="sm" fullWidth onClick={() => setShowEditModal(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}