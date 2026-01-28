"use client";

import { useState, useEffect } from "react";
import { Save, User, Bell, Lock, Database, Globe, Mail, Shield, Languages } from "lucide-react";
import toast from "react-hot-toast";

export default function Settings() {
  const [settings, setSettings] = useState({
    // General Settings
    companyName: "Bashitha Ceramics",
    email: "contact@bashithaceramics.com",
    phone: "+94 71 234 5678",
    address: "123 Ceramic Street, Colombo, Sri Lanka",

    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    activityAlerts: true,
    lowStockAlerts: true,

    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,

    // Display Settings
    theme: "light",
    language: "English",
    displayLanguage: "english", // For bilingual data: 'english' or 'sinhala'
    dateFormat: "MM/DD/YYYY",
    currency: "USD",

    // Inventory Settings
    lowStockThreshold: 100,
    autoReorder: false,
    stockAlertLevel: 50,
  });

  // Load all preferences from API on mount
  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/preferences?userId=default");
      const data = await response.json();
      if (data.preferences) {
        setSettings(data.preferences);
        // Also set localStorage for displayLanguage
        if (data.preferences.displayLanguage) {
          localStorage.setItem("displayLanguage", data.preferences.displayLanguage);
        }
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  const handleSave = async (section) => {
    try {
      // Save all preferences to API
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "default",
          preferences: settings,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save display language to localStorage
        if (data.displayLanguage) {
          localStorage.setItem("displayLanguage", data.displayLanguage);
          // Dispatch custom event to notify other components of language change
          window.dispatchEvent(new Event("displayLanguageChange"));
        }

        toast.success(`${section} settings saved successfully!`, {
          position: "top-right",
          duration: 3000,
        });
      } else {
        throw new Error(data.error || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save settings. Please try again.", {
        position: "top-right",
        duration: 3000,
      });
    }
  };

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">Settings</h2>
        <p className="text-sm text-gray-500">Manage your application settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-100">
                <User className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">General Settings</h3>
                <p className="text-xs text-gray-500">Basic company information</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => handleSave("General")}
                className="flex items-center gap-2 rounded bg-[#1fb8a2] px-4 py-2 text-sm font-medium text-white hover:bg-[#189d8b] transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-purple-100">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Notification Settings</h3>
                <p className="text-xs text-gray-500">Manage how you receive notifications</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive notifications via email</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings.emailNotifications ? "bg-[#1fb8a2]" : "bg-gray-300"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    settings.emailNotifications ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                <p className="text-xs text-gray-500">Receive push notifications</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, pushNotifications: !settings.pushNotifications })}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings.pushNotifications ? "bg-[#1fb8a2]" : "bg-gray-300"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    settings.pushNotifications ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Activity Alerts</p>
                <p className="text-xs text-gray-500">Get notified about user activities</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, activityAlerts: !settings.activityAlerts })}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings.activityAlerts ? "bg-[#1fb8a2]" : "bg-gray-300"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    settings.activityAlerts ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Low Stock Alerts</p>
                <p className="text-xs text-gray-500">Get alerts when stock is low</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, lowStockAlerts: !settings.lowStockAlerts })}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings.lowStockAlerts ? "bg-[#1fb8a2]" : "bg-gray-300"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    settings.lowStockAlerts ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => handleSave("Notification")}
                className="flex items-center gap-2 rounded bg-[#1fb8a2] px-4 py-2 text-sm font-medium text-white hover:bg-[#189d8b] transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-red-100">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Security Settings</h3>
                <p className="text-xs text-gray-500">Manage your account security</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Add an extra layer of security</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth })}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings.twoFactorAuth ? "bg-[#1fb8a2]" : "bg-gray-300"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    settings.twoFactorAuth ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => handleSave("Security")}
                className="flex items-center gap-2 rounded bg-[#1fb8a2] px-4 py-2 text-sm font-medium text-white hover:bg-[#189d8b] transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-green-100">
                <Globe className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Display Settings</h3>
                <p className="text-xs text-gray-500">Customize your display preferences</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {/* Bilingual Data Display Preference */}
            <div className="rounded-md border border-blue-200 bg-blue-50/30 p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-100">
                  <Languages className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Bilingual Data Display</h4>
                  <p className="text-xs text-gray-600 mb-3">
                    Choose your preferred language for displaying database content. When data contains both English and Sinhala (e.g., "Tiles /
                    ටයිල්"), the system will show only your selected language.
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSettings({ ...settings, displayLanguage: "english" })}
                      className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                        settings.displayLanguage === "english"
                          ? "bg-[#1fb8a2] text-white shadow-md"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-base">🇬🇧</span>
                      English
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, displayLanguage: "sinhala" })}
                      className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
                        settings.displayLanguage === "sinhala"
                          ? "bg-[#1fb8a2] text-white shadow-md"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-base">🇱🇰</span>
                      සිංහල (Sinhala)
                    </button>
                  </div>
                  <div className="mt-3 rounded bg-white border border-blue-200 p-2">
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Example:</span> Database value "Tiles / ටයිල්" will display as:
                    </p>
                    <p className="text-xs font-medium text-[#1fb8a2] mt-1">{settings.displayLanguage === "english" ? "→ Tiles" : "→ ටයිල්"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Interface Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]"
                >
                  <option>English</option>
                  <option>Sinhala</option>
                  <option>Tamil</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]"
                >
                  <option>MM/DD/YYYY</option>
                  <option>DD/MM/YYYY</option>
                  <option>YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]"
                >
                  <option>USD</option>
                  <option>LKR</option>
                  <option>EUR</option>
                  <option>GBP</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => handleSave("Display")}
                className="flex items-center gap-2 rounded bg-[#1fb8a2] px-4 py-2 text-sm font-medium text-white hover:bg-[#189d8b] transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Settings */}
        <div className="rounded-md border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-orange-100">
                <Database className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Inventory Settings</h3>
                <p className="text-xs text-gray-500">Configure inventory management</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                <input
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Alert Level</label>
                <input
                  type="number"
                  value={settings.stockAlertLevel}
                  onChange={(e) => setSettings({ ...settings, stockAlertLevel: parseInt(e.target.value) })}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#1fb8a2] focus:ring-1 focus:ring-[#1fb8a2]"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Auto Reorder</p>
                <p className="text-xs text-gray-500">Automatically reorder low stock items</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, autoReorder: !settings.autoReorder })}
                className={`relative h-6 w-11 rounded-full transition-colors ${settings.autoReorder ? "bg-[#1fb8a2]" : "bg-gray-300"}`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    settings.autoReorder ? "left-5.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => handleSave("Inventory")}
                className="flex items-center gap-2 rounded bg-[#1fb8a2] px-4 py-2 text-sm font-medium text-white hover:bg-[#189d8b] transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
