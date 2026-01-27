"use client";

import { useState, useEffect } from "react";
import { Search, Sun, Moon, Bell, Settings, LogOut, ChevronDown, UserCircle2, CheckCircle } from "lucide-react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

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
  const [theme, setTheme] = useState("light");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Filter products based on search term
  const filteredProducts = searchTerm.trim()
    ? products
        .filter(
          (product) =>
            product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        .slice(0, 5) // Show max 5 suggestions
    : [];

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await fetch("/api/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      } else if (response.status === 401) {
        // User not authenticated, silently ignore
        setNotifications([]);
      } else {
        console.error("Failed to fetch notifications:", response.status);
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
        // Remove the notification from the list
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        toast.success("Notification marked as read", {
          duration: 2000,
          style: {
            background: "#1fb8a2",
            color: "#fff",
          },
        });
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
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

  const getNotificationColor = (action) => {
    if (action.includes("CREATE") || action.includes("ADD")) {
      return "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400";
    } else if (action.includes("UPDATE") || action.includes("EDIT")) {
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400";
    } else if (action.includes("DELETE") || action.includes("REMOVE")) {
      return "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400";
    }
    return "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400";
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
          <p className="font-medium text-gray-900">Are you sure you want to log out?</p>
          <div className="flex gap-2">
            <button
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
              className="flex-1 rounded bg-[#1fb8a2] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#189d8b]"
            >
              Yes, Log out
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
      {
        duration: 5000,
        position: "top-center",
      },
    );
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 transition-colors">
      {/* Desktop Layout */}
      <div className="hidden md:flex items-center justify-between gap-3 sm:gap-6">
        {/* Logo */}
        <h1 className="text-xs sm:text-sm md:text-base font-bold tracking-wide flex flex-row gap-10">
          <span className="text-sm sm:text-base md:text-lg font-roboto-condensed">
            <span className="text-[#1fb8a2]">BASHITHA</span> <span className="text-gray-900 dark:text-white">CERAMICS</span>
          </span>

          {/* Theme Dropdown */}
          <div className="relative">
            <button
              onClick={() => setThemeOpen((s) => !s)}
              className="flex items-center gap-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 sm:px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === "dark" ? <Moon className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <Sun className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
              <span className="hidden md:inline text-xs">{theme === "dark" ? "Dark" : "Light"}</span>
              <ChevronDown className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </button>
            {themeOpen && (
              <div className="absolute z-20 mt-2 w-32 sm:w-36 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-1">
                <button
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    theme === "light" ? "bg-[#1fb8a2]/10 text-[#1fb8a2]" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => applyTheme("light")}
                >
                  <Sun className="h-3 w-3" /> Light
                </button>
                <button
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                    theme === "dark" ? "bg-[#1fb8a2]/10 text-[#1fb8a2]" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => applyTheme("dark")}
                >
                  <Moon className="h-3 w-3" /> Dark
                </button>
              </div>
            )}
          </div>
        </h1>

        {/* Search - Desktop */}
        <div className="flex-1 max-w-xs lg:max-w-sm relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
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
            className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-xs outline-none focus:border-[#1fb8a2] focus:ring-2 focus:ring-[#1fb8a2]/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
          />

          {/* Autocomplete Dropdown - Desktop */}
          {searchOpen && filteredProducts.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl z-50 max-h-80 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    onProductSelect?.(product);
                    setSearchOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors text-left"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#1fb8a2]/10 to-[#1fb8a2]/5 flex items-center justify-center">
                    <span className="text-[#1fb8a2] font-bold text-xs">{product.code || product.name?.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {product.brand && product.shade ? `${product.brand} - ${product.shade}` : product.brand || product.shade || "No details"}
                      {product.code && ` • ${product.code}`}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-semibold text-[#1fb8a2]">${product.selling_price || 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {product.qty || 0} {product.unit || "Pcs"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification */}
          <div className="relative">
            <button
              className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              onClick={() => {
                setNotificationOpen(!notificationOpen);
                if (!notificationOpen) fetchNotifications();
              }}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-red-500 text-[8px] sm:text-[9px] font-bold text-white flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            {notificationOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotificationOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl z-20 max-w-sm sm:max-w-md md:max-w-lg">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {loadingNotifications
                        ? "Loading..."
                        : notifications.length > 0
                          ? `You have ${notifications.length} new notification${notifications.length !== 1 ? "s" : ""}`
                          : "No new notifications"}
                    </p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="px-4 py-8 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#1fb8a2] border-r-transparent"></div>
                      </div>
                    ) : notifications.length > 0 ? (
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {notifications.map((notification) => (
                          <div key={notification.id} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                            <div className="flex gap-2.5 items-start">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getNotificationColor(notification.action)} font-bold text-xs`}
                              >
                                {getInitials(notification.user_name)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-900 dark:text-white leading-snug">{notification.description}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                  {formatNotificationTime(notification.timestamp)} by {notification.user_name || "Unknown"}
                                </p>
                              </div>
                              <button
                                onClick={(e) => markAsRead(notification.id, e)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-[#1fb8a2] hover:bg-[#1fb8a2]/10 rounded-lg"
                                title="Mark as read"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">No notifications to display</p>
                      </div>
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
                      <button
                        onClick={() => onNotificationsClick?.()}
                        className="text-xs font-semibold text-[#1fb8a2] hover:underline w-full text-center py-1"
                      >
                        View all notifications
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Settings */}
          <button
            className="p-1.5 sm:p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            onClick={() => onSettingsClick?.()}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* User Profile */}
          <button
            onClick={() => onProfileClick?.()}
            className="hidden sm:flex items-center gap-2 border-l-2 border-gray-200 dark:border-gray-700 pl-2 sm:pl-3 text-gray-600 dark:text-gray-400 hover:text-[#1fb8a2] dark:hover:text-[#1fb8a2] transition-colors"
            title="Profile"
          >
            <UserCircle2 className="h-4 w-4" />
            <span className="text-xs font-semibold hidden md:inline">Profile</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="flex items-center gap-1 sm:gap-2 rounded-lg bg-gradient-to-r from-[#1fb8a2] to-[#17a694] hover:from-[#1aa693] hover:to-[#158f82] px-2 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all whitespace-nowrap"
            title="Logout"
          >
            <LogOut className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span className="hidden sm:inline">LOG OUT</span>
          </button>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Top Row: Logo and Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Logo */}
          <h1 className="text-xs font-bold tracking-wide">
            <span className="font-roboto-condensed">
              <span className="text-[#1fb8a2]">BASHITHA</span> <span className="text-gray-900 dark:text-white">CERAMICS</span>
            </span>
          </h1>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* Notification */}
            <div className="relative">
              <button
                className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                onClick={() => {
                  setNotificationOpen(!notificationOpen);
                  if (!notificationOpen) fetchNotifications();
                }}
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-red-500 text-[8px] font-bold text-white flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              {notificationOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setNotificationOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 max-h-96 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl z-20">
                    <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {loadingNotifications
                          ? "Loading..."
                          : notifications.length > 0
                            ? `You have ${notifications.length} new notification${notifications.length !== 1 ? "s" : ""}`
                            : "No new notifications"}
                      </p>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {loadingNotifications ? (
                        <div className="px-4 py-8 text-center">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-[#1fb8a2] border-r-transparent"></div>
                        </div>
                      ) : notifications.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                          {notifications.map((notification) => (
                            <div key={notification.id} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                              <div className="flex gap-2.5 items-start">
                                <div
                                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${getNotificationColor(notification.action)} font-bold text-xs`}
                                >
                                  {notification.action?.charAt(0) || "N"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2">{notification.details}</p>
                                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                                    {formatNotificationTime(notification.timestamp)}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => markAsRead(notification.id, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-all"
                                  title="Mark as read"
                                >
                                  <CheckCircle className="h-4 w-4 text-[#1fb8a2]" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="px-4 py-8 text-center">
                          <p className="text-sm text-gray-500 dark:text-gray-400">No new notifications</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Settings */}
            <button
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              onClick={() => onSettingsClick?.()}
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#1fb8a2] to-[#17a694] hover:from-[#1aa693] hover:to-[#158f82] px-2 py-1.5 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all"
              title="Logout"
            >
              <LogOut className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search products..."
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
            className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 pl-10 pr-4 text-xs outline-none focus:border-[#1fb8a2] focus:ring-2 focus:ring-[#1fb8a2]/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
          />

          {/* Autocomplete Dropdown - Mobile */}
          {searchOpen && filteredProducts.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl z-50 max-h-64 overflow-y-auto">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    onProductSelect?.(product);
                    setSearchOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors text-left"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-[#1fb8a2]/10 to-[#1fb8a2]/5 flex items-center justify-center">
                    <span className="text-[#1fb8a2] font-bold text-[10px]">{product.code || product.name?.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{product.name}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{product.brand || product.shade || "No details"}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-[10px] font-semibold text-[#1fb8a2]">${product.selling_price || 0}</p>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{product.qty || 0}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
