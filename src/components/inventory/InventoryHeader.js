"use client";

import { useState, useEffect } from "react";
import { Search, Sun, Moon, Bell, Settings, LogOut, ChevronDown, UserCircle2, CheckCircle2 } from "lucide-react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import Button from "@/components/ui/button";

export default function InventoryHeader({
  onSettingsClick,
  onNotificationsClick,
  onProfileClick,
  searchTerm = "",
  onSearchChange,
  onSearchFocus,
  products = [],
  onProductSelect,
}) {
  const [themeOpen, setThemeOpen] = useState(false);
  const [theme, setTheme] = useState(typeof window !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const filteredProducts = searchTerm.trim()
    ? products
        .filter(
          (product) =>
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .slice(0, 5)
    : [];

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const NOTIF_COLORS = {
    CREATE: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    ADD: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    UPDATE: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    EDIT: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    DELETE: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
    REMOVE: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
  };
  const getNotificationColor = (action = "") => {
    const key = Object.keys(NOTIF_COLORS).find((k) => action.includes(k));
    return NOTIF_COLORS[key] || "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400";
  };

  const applyTheme = (mode) => {
    setTheme(mode);
    if (mode === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    setThemeOpen(false);
  };

  const onLogout = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-[13px] font-semibold text-neutral-900">Log out of your account?</p>
          <div className="flex gap-2">
            <Button
              variant="danger"
              size="sm"
              fullWidth
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await fetch("/api/auth/logout", { method: "POST" });
                  await signOut({ redirect: false });
                  window.location.href = "/login";
                } catch (e) {
                  window.location.href = "/login";
                }
              }}
            >
              Log out
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

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-neutral-200 dark:border-gray-800 px-4 sm:px-6 py-3 transition-colors">
      {/* Desktop */}
      <div className="hidden md:flex items-center justify-between gap-6">
        <div className="flex items-center gap-5 shrink-0">
          {/* Brand mark */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg text-teal-800 dark:text-teal-400 italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
              Bashitha
            </span>
            <span className="text-[11px] font-semibold tracking-[0.18em] text-neutral-500 dark:text-gray-400 uppercase">Ceramics</span>
          </div>

          <span className="h-5 w-px bg-neutral-200 dark:bg-gray-700" />

          {/* Theme */}
          <div className="relative">
            <button
              onClick={() => setThemeOpen((s) => !s)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2.5 py-1.5 text-xs font-medium text-neutral-600 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              <ChevronDown className="h-3 w-3 text-neutral-400" />
            </button>
            {themeOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setThemeOpen(false)} />
                <div className="absolute z-20 mt-2 w-36 rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg shadow-neutral-900/10 p-1">
                  {[
                    { mode: "light", icon: Sun, label: "Light" },
                    { mode: "dark", icon: Moon, label: "Dark" },
                  ].map(({ mode, icon: Icon, label }) => (
                    <button
                      key={mode}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
                        theme === mode
                          ? "bg-teal-50 text-teal-800 dark:bg-teal-400/10 dark:text-teal-400"
                          : "text-neutral-600 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-700"
                      }`}
                      onClick={() => applyTheme(mode)}
                    >
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search products, codes, brands…"
            value={searchTerm}
            onChange={(e) => {
              onSearchChange?.(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => {
              onSearchFocus?.();
              setSearchOpen(true);
            }}
            onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
            className="w-full rounded-lg border border-neutral-200 dark:border-gray-700 bg-neutral-50/70 dark:bg-gray-800 py-2.5 pl-10 pr-4 text-[13px] outline-none focus:bg-white focus:border-teal-600/50 focus:ring-4 focus:ring-teal-600/10 text-neutral-900 dark:text-white placeholder-neutral-400 transition-all"
          />

          {searchOpen && filteredProducts.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg shadow-neutral-900/10 z-50 max-h-80 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    onProductSelect?.(product);
                    setSearchOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-gray-700 border-b border-neutral-100 dark:border-gray-700 last:border-b-0 transition-colors text-left first:rounded-t-xl last:rounded-b-xl"
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-teal-50 dark:bg-teal-400/10 flex items-center justify-center">
                    <span className="text-teal-800 dark:text-teal-400 font-bold text-[11px]">{product.code || product.name?.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-neutral-900 dark:text-white truncate">{product.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-gray-400 truncate">
                      {product.brand && product.shade ? `${product.brand} · ${product.shade}` : product.brand || product.shade || "No details"}
                      {product.code && ` · ${product.code}`}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-bold text-neutral-900 dark:text-white">${product.selling_price || 0}</p>
                    <p className="text-[11px] text-neutral-400">
                      {product.qty || 0} {product.unit || "Pcs"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                if (!notificationOpen) fetchNotifications();
              }}
              title="Notifications"
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-gray-900" />
              )}
            </Button>
            {notificationOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotificationOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] max-h-96 rounded-2xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl shadow-neutral-900/10 z-20 overflow-hidden">
                  <div className="border-b border-neutral-100 dark:border-gray-700 px-4 py-3.5">
                    <h3 className="text-[13.5px] font-semibold text-neutral-900 dark:text-white">Notifications</h3>
                    <p className="text-xs text-neutral-500 dark:text-gray-400 mt-0.5">
                      {loadingNotifications
                        ? "Loading…"
                        : notifications.length > 0
                          ? `${notifications.length} new notification${notifications.length !== 1 ? "s" : ""}`
                          : "You're all caught up"}
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="px-4 py-10 text-center">
                        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-teal-700 border-r-transparent" />
                      </div>
                    ) : notifications.length > 0 ? (
                      <div className="divide-y divide-neutral-100 dark:divide-gray-700">
                        {notifications.map((notification) => (
                          <div key={notification.id} className="px-4 py-3 hover:bg-neutral-50 dark:hover:bg-gray-700/40 transition-colors group">
                            <div className="flex gap-3 items-start">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-[11px] ${getNotificationColor(notification.action)}`}
                              >
                                {getInitials(notification.user_name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-neutral-900 dark:text-white leading-snug">{notification.description}</p>
                                <p className="text-[11px] text-neutral-400 mt-0.5">
                                  {formatNotificationTime(notification.timestamp)} · {notification.user_name || "Unknown"}
                                </p>
                              </div>
                              <button
                                onClick={(e) => markAsRead(notification.id, e)}
                                className="flex-shrink-0 p-1 text-neutral-300 hover:text-teal-700 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                title="Mark as read"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-10 text-center">
                        <p className="text-xs text-neutral-400">No notifications to display</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="border-t border-neutral-100 dark:border-gray-700 px-4 py-2.5">
                      <button
                        onClick={() => {
                          setNotificationOpen(false);
                          onNotificationsClick?.();
                        }}
                        className="text-xs font-semibold text-teal-800 dark:text-teal-400 hover:underline w-full text-center"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <Button variant="ghost" size="icon" onClick={() => onSettingsClick?.()} title="Settings">
            <Settings className="h-4 w-4" />
          </Button>

          <span className="h-5 w-px bg-neutral-200 dark:bg-gray-700 mx-1" />

          <button
            onClick={() => onProfileClick?.()}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-neutral-600 dark:text-gray-300 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors"
            title="Profile"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-800 text-white">
              <UserCircle2 className="h-4 w-4" />
            </span>
            <span className="text-[13px] font-medium hidden lg:inline">Profile</span>
          </button>

          <Button variant="danger" size="sm" icon={LogOut} onClick={onLogout} className="ml-1">
            Log out
          </Button>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-base text-teal-800 dark:text-teal-400 italic" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>
            Bashitha
          </span>
          <span className="text-[10px] font-semibold tracking-[0.16em] text-neutral-500 dark:text-gray-400 uppercase">Ceramics</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                if (!notificationOpen) fetchNotifications();
              }}
              title="Notifications"
              className="relative"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-gray-900" />
              )}
            </Button>
            {notificationOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotificationOpen(false)} />
                <div className="fixed left-4 right-4 top-16 max-h-96 rounded-2xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl z-20 overflow-hidden">
                  <div className="border-b border-neutral-100 dark:border-gray-700 px-4 py-3.5">
                    <h3 className="text-[13.5px] font-semibold text-neutral-900 dark:text-white">Notifications</h3>
                    <p className="text-xs text-neutral-500 dark:text-gray-400 mt-0.5">
                      {loadingNotifications
                        ? "Loading…"
                        : notifications.length > 0
                          ? `${notifications.length} new notification${notifications.length !== 1 ? "s" : ""}`
                          : "You're all caught up"}
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="px-4 py-10 text-center">
                        <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-teal-700 border-r-transparent" />
                      </div>
                    ) : notifications.length > 0 ? (
                      <div className="divide-y divide-neutral-100 dark:divide-gray-700">
                        {notifications.map((notification) => (
                          <div key={notification.id} className="px-4 py-3">
                            <div className="flex gap-3 items-start">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold text-[11px] ${getNotificationColor(notification.action)}`}
                              >
                                {getInitials(notification.user_name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-neutral-900 dark:text-white leading-snug">{notification.description}</p>
                                <p className="text-[11px] text-neutral-400 mt-0.5">
                                  {formatNotificationTime(notification.timestamp)} · {notification.user_name || "Unknown"}
                                </p>
                              </div>
                              <button
                                onClick={(e) => markAsRead(notification.id, e)}
                                className="flex-shrink-0 p-1 text-neutral-300 hover:text-teal-700 rounded-md transition-colors"
                                title="Mark as read"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-10 text-center">
                        <p className="text-xs text-neutral-400">No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <Button variant="ghost" size="icon" onClick={() => onSettingsClick?.()} title="Settings">
            <Settings className="h-4 w-4" />
          </Button>

          <Button variant="danger" size="icon" icon={LogOut} onClick={onLogout} title="Log out" />
        </div>
      </div>
    </header>
  );
}
