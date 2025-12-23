"use client";

import { useState, useEffect } from "react";
import { Search, Sun, Moon, Bell, Settings, LogOut, ChevronDown, UserCircle2 } from "lucide-react";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";

export default function InventoryHeader({ onSettingsClick, onNotificationsClick, onProfileClick }) {
  const [themeOpen, setThemeOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

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
      }
    );
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-3 sm:px-4 md:px-6 py-3 sm:py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        {/* Logo */}
        <h1 className="text-xs sm:text-sm md:text-base font-bold tracking-wide">
          <span className="text-sm sm:text-base md:text-lg font-roboto-condensed">
            <span className="text-[#1fb8a2]">BASHITHA</span> <span className="text-gray-900 dark:text-white">CERAMICS</span>
          </span>
        </h1>

        {/* Theme Dropdown - Hide on Small Mobile */}
        <div className="hidden sm:block relative">
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
                <Sun className="h-3 w-3" /> <span className="hidden sm:inline">Light</span>
              </button>
              <button
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                  theme === "dark" ? "bg-[#1fb8a2]/10 text-[#1fb8a2]" : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
                onClick={() => applyTheme("dark")}
              >
                <Moon className="h-3 w-3" /> <span className="hidden sm:inline">Dark</span>
              </button>
            </div>
          )}
        </div>

        {/* Search - Responsive Width */}
        <div className="hidden md:block flex-1 max-w-xs lg:max-w-sm relative">
          <Search className="absolute left-3 top-1/2 h-3 w-3 sm:h-3.5 sm:w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1.5 sm:py-2 pl-9 sm:pl-10 pr-4 text-xs outline-none focus:border-[#1fb8a2] focus:ring-2 focus:ring-[#1fb8a2]/20 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification */}
          <div className="relative">
            <button
              className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              onClick={() => setNotificationOpen(!notificationOpen)}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-red-500 text-[8px] sm:text-[9px] font-bold text-white flex items-center justify-center">
                3
              </span>
            </button>
            {notificationOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setNotificationOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 max-h-96 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-2xl z-20 max-w-sm sm:max-w-md md:max-w-lg">
                  <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">Notifications</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">You have 3 new notifications</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      <div className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                        <div className="flex gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-xs">
                            Y
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white leading-snug">2 entries entered to "Enterprises" tab</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">16:12 PM by you</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                        <div className="flex gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold text-xs">
                            Y
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white leading-snug">Profile About Changes</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">16:22 PM by you</p>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors">
                        <div className="flex gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold text-xs">
                            S
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white leading-snug">1 Product added with minimum Threshold</p>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">17:32 PM by Suhansek</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2">
                    <button className="text-xs font-semibold text-[#1fb8a2] hover:underline w-full text-center py-1">View all notifications</button>
                  </div>
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
    </header>
  );
}
