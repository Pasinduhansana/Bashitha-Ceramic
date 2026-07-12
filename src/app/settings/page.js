"use client";

import { useState, useEffect } from "react";
import { Save, User, Bell, Shield, Globe, Database, Languages } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/button";

const NAV_SECTIONS = [
  { key: "general", label: "General", icon: User },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Shield },
  { key: "display", label: "Display", icon: Globe },
  { key: "inventory", label: "Inventory", icon: Database },
];

const inputClass =
  "w-full h-9 rounded-lg border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 px-3 text-[13px] outline-none focus:border-teal-600 text-neutral-900 dark:text-white placeholder-neutral-400 transition-colors";

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-600 dark:text-gray-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-[13px] font-medium text-neutral-900 dark:text-white">{label}</p>
        <p className="text-[11.5px] text-neutral-400 mt-0.5">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative h-5.5 h-[22px] w-10 shrink-0 rounded-full transition-colors ${checked ? "bg-teal-700" : "bg-neutral-200 dark:bg-gray-700"}`}
      >
        <span className={`absolute top-[3px] h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-[22px]" : "translate-x-[3px]"}`} />
      </button>
    </div>
  );
}

function SectionCard({ title, description, children, onSave, saving }) {
  return (
    <div className="rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="border-b border-neutral-100 dark:border-gray-700 px-5 py-4">
        <h3 className="text-[14px] font-semibold text-neutral-900 dark:text-white">{title}</h3>
        <p className="text-[11.5px] text-neutral-400 mt-0.5">{description}</p>
      </div>
      <div className="p-5 space-y-1">{children}</div>
      <div className="flex justify-end border-t border-neutral-100 dark:border-gray-700 px-5 py-3.5">
        <Button variant="primary" size="sm" icon={Save} loading={saving} onClick={onSave}>
          Save changes
        </Button>
      </div>
    </div>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState("general");
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    companyName: "Bashitha Ceramics",
    email: "contact@bashithaceramics.com",
    phone: "+94 71 234 5678",
    address: "123 Ceramic Street, Colombo, Sri Lanka",

    emailNotifications: true,
    pushNotifications: true,
    activityAlerts: true,
    lowStockAlerts: true,

    twoFactorAuth: false,
    sessionTimeout: 30,

    theme: "light",
    language: "English",
    displayLanguage: "english",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",

    lowStockThreshold: 100,
    autoReorder: false,
    stockAlertLevel: 50,
  });



  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/preferences?userId=default");
      const data = await response.json();
      if (data.preferences) {
        setSettings(data.preferences);
        if (data.preferences.displayLanguage) {
          localStorage.setItem("displayLanguage", data.preferences.displayLanguage);
        }
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    }
  };

  
  const handleSave = async (section) => {
    setSaving(true);
    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: "default", preferences: settings }),
      });
      const data = await response.json();

      if (response.ok) {
        if (data.displayLanguage) {
          localStorage.setItem("displayLanguage", data.displayLanguage);
          window.dispatchEvent(new Event("displayLanguageChange"));
        }
        toast.success(`${section} settings saved`, { position: "top-right", duration: 3000 });
      } else {
        throw new Error(data.error || "Failed to save");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save settings. Please try again.", { position: "top-right", duration: 3000 });
    } finally {
      setSaving(false);
    }
  };

    useEffect(() => {
    fetchPreferences();
  }, []);
  
  return (
    <div className="px-3 sm:px-5 lg:px-6 py-4 sm:py-5 min-h-screen bg-neutral-50/40 dark:bg-gray-900 transition-colors">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white" style={{ fontFamily: "'Fraunces', serif" }}>
          Settings
        </h1>
        <p className="text-xs text-neutral-500 dark:text-gray-400 mt-0.5">Manage your application settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar nav */}
        <div className="lg:w-56 shrink-0">
          <div className="flex lg:flex-col gap-1 overflow-x-auto rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-1.5">
            {NAV_SECTIONS.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`flex items-center gap-2.5 rounded-lg px-3 h-9 text-[13px] font-medium whitespace-nowrap transition-colors ${
                  activeSection === section.key
                    ? "bg-teal-50 text-teal-800 dark:bg-teal-400/10 dark:text-teal-400"
                    : "text-neutral-600 dark:text-gray-400 hover:bg-neutral-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <section.icon className="h-3.5 w-3.5 shrink-0" />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-5">
          {activeSection === "general" && (
            <SectionCard title="General settings" description="Basic company information" onSave={() => handleSave("General")} saving={saving}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company name">
                  <input type="text" value={settings.companyName} onChange={(e) => setSettings({ ...settings, companyName: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Email">
                  <input type="email" value={settings.email} onChange={(e) => setSettings({ ...settings, email: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Phone">
                  <input type="tel" value={settings.phone} onChange={(e) => setSettings({ ...settings, phone: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Address">
                  <input type="text" value={settings.address} onChange={(e) => setSettings({ ...settings, address: e.target.value })} className={inputClass} />
                </Field>
              </div>
            </SectionCard>
          )}

          {activeSection === "notifications" && (
            <SectionCard title="Notification settings" description="Manage how you receive notifications" onSave={() => handleSave("Notification")} saving={saving}>
              <div className="divide-y divide-neutral-100 dark:divide-gray-700">
                <Toggle
                  checked={settings.emailNotifications}
                  onChange={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
                  label="Email notifications"
                  description="Receive notifications via email"
                />
                <Toggle
                  checked={settings.pushNotifications}
                  onChange={() => setSettings({ ...settings, pushNotifications: !settings.pushNotifications })}
                  label="Push notifications"
                  description="Receive push notifications"
                />
                <Toggle
                  checked={settings.activityAlerts}
                  onChange={() => setSettings({ ...settings, activityAlerts: !settings.activityAlerts })}
                  label="Activity alerts"
                  description="Get notified about user activities"
                />
                <Toggle
                  checked={settings.lowStockAlerts}
                  onChange={() => setSettings({ ...settings, lowStockAlerts: !settings.lowStockAlerts })}
                  label="Low stock alerts"
                  description="Get alerts when stock is low"
                />
              </div>
            </SectionCard>
          )}

          {activeSection === "security" && (
            <SectionCard title="Security settings" description="Manage your account security" onSave={() => handleSave("Security")} saving={saving}>
              <Toggle
                checked={settings.twoFactorAuth}
                onChange={() => setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth })}
                label="Two-factor authentication"
                description="Add an extra layer of security"
              />
              <div className="pt-3">
                <Field label="Session timeout (minutes)">
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                    className={`${inputClass} sm:w-56`}
                  />
                </Field>
              </div>
            </SectionCard>
          )}

          {activeSection === "display" && (
            <SectionCard title="Display settings" description="Customize your display preferences" onSave={() => handleSave("Display")} saving={saving}>
              <div className="rounded-lg border border-neutral-200 dark:border-gray-700 p-4 mb-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-500/10">
                    <Languages className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-semibold text-neutral-900 dark:text-white mb-1">Bilingual data display</h4>
                    <p className="text-[11.5px] text-neutral-500 dark:text-gray-400 mb-3 leading-relaxed">
                      Choose your preferred language for database content. Bilingual values (e.g. "Tiles / ටයිල්") will show only the selected language.
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => setSettings({ ...settings, displayLanguage: "english" })}
                        className={`flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-medium transition-colors ${
                          settings.displayLanguage === "english" ? "bg-teal-800 text-white" : "border border-neutral-200 dark:border-gray-700 text-neutral-700 dark:text-gray-300 hover:bg-neutral-50"
                        }`}
                      >
                        English
                      </button>
                      <button
                        onClick={() => setSettings({ ...settings, displayLanguage: "sinhala" })}
                        className={`flex h-8 items-center gap-2 rounded-lg px-3 text-xs font-medium transition-colors ${
                          settings.displayLanguage === "sinhala" ? "bg-teal-800 text-white" : "border border-neutral-200 dark:border-gray-700 text-neutral-700 dark:text-gray-300 hover:bg-neutral-50"
                        }`}
                      >
                        සිංහල (Sinhala)
                      </button>
                    </div>
                    <div className="mt-3 rounded-lg border border-neutral-100 dark:border-gray-700 bg-neutral-50/60 dark:bg-gray-900/30 px-3 py-2">
                      <p className="text-[11px] text-neutral-500 dark:text-gray-400">
                        Example: "Tiles / ටයිල්" displays as{" "}
                        <span className="font-semibold text-teal-800 dark:text-teal-400">
                          {settings.displayLanguage === "english" ? "Tiles" : "ටයිල්"}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 pt-2">
                <Field label="Interface language">
                  <select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })} className={inputClass}>
                    <option>English</option>
                    <option>Sinhala</option>
                    <option>Tamil</option>
                  </select>
                </Field>
                <Field label="Date format">
                  <select value={settings.dateFormat} onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })} className={inputClass}>
                    <option>MM/DD/YYYY</option>
                    <option>DD/MM/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </Field>
                <Field label="Currency">
                  <select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} className={inputClass}>
                    <option>USD</option>
                    <option>LKR</option>
                    <option>EUR</option>
                    <option>GBP</option>
                  </select>
                </Field>
              </div>
            </SectionCard>
          )}

          {activeSection === "inventory" && (
            <SectionCard title="Inventory settings" description="Configure inventory management" onSave={() => handleSave("Inventory")} saving={saving}>
              <div className="grid gap-4 sm:grid-cols-2 mb-2">
                <Field label="Low stock threshold">
                  <input
                    type="number"
                    value={settings.lowStockThreshold}
                    onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
                    className={inputClass}
                  />
                </Field>
                <Field label="Stock alert level">
                  <input
                    type="number"
                    value={settings.stockAlertLevel}
                    onChange={(e) => setSettings({ ...settings, stockAlertLevel: parseInt(e.target.value) })}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Toggle
                checked={settings.autoReorder}
                onChange={() => setSettings({ ...settings, autoReorder: !settings.autoReorder })}
                label="Auto reorder"
                description="Automatically reorder low stock items"
              />
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
}