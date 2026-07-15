"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Briefcase, Calendar, Save, Camera, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/button";
import Loader from "@/components/ui/Loader";

const inputClass =
  "w-full h-10 rounded-lg border border-neutral-200 dark:border-gray-700 px-3.5 text-sm outline-none focus:border-brand-600 bg-white dark:bg-gray-800 text-neutral-900 dark:text-white transition-colors";

const emptyProfile = { name: "", email: "", phone: "", address: "", role: "", joinedDate: "", avatar: "" };

export default function ProfilePage() {
  const [profile, setProfile] = useState(emptyProfile);
  const [original, setOriginal] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (response.ok && data.user) {
        const loaded = {
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          address: data.user.address || "",
          role: data.user.role || "User",
          joinedDate: data.user.created_at ? new Date(data.user.created_at).toLocaleDateString() : "N/A",
          avatar: data.user.img_url || "",
        };
        setProfile(loaded);
        setOriginal(loaded);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: profile.name,
        phone: profile.phone,
        address: profile.address,
        img_url: profile.avatar || null,
      };

      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setOriginal(profile);
        toast.success("Profile updated successfully!");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, GIF, or WebP)");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "profiles");

      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await response.json();

      if (response.ok && data.success) {
        setProfile((prev) => ({ ...prev, avatar: data.url }));
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const hasChanges = JSON.stringify(profile) !== JSON.stringify(original);

  if (loading) return <Loader label="Loading profile…" />;

  return (
    <div className="min-h-screen bg-neutral-50/40 dark:bg-gray-900 px-4 sm:px-6 py-5 transition-colors">
      <div className=" mx-auto">
        {/* Page header */}
        <div className="mb-5">
          <h1 className="text-xl sm:text-2xl font-semibold text-neutral-900 dark:text-white" style={{ fontFamily: "'Fraunces', serif" }}>
            My Profile
          </h1>
          <p className="text-sm text-neutral-500 dark:text-gray-400 mt-0.5">Manage your account details and preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-5">
          {/* Avatar card */}
          <div className="rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 h-fit">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-900 ring-1 ring-neutral-200 dark:ring-gray-700" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-brand-800 flex items-center justify-center text-white text-3xl font-bold">
                    {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 p-1.5 rounded-full border border-neutral-200 dark:border-gray-700 hover:bg-neutral-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  {uploading ? <div className="animate-spin h-4 w-4 border-2 border-brand-700 border-t-transparent rounded-full" /> : <Camera className="h-4 w-4 text-neutral-600 dark:text-gray-400" />}
                </label>
              </div>
              <div className="text-center">
                <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white">{profile.name || "User"}</h3>
                <p className="text-sm text-neutral-500 dark:text-gray-400">{profile.role || "User"}</p>
                {uploading && <p className="text-sm text-brand-700 mt-1">Uploading image…</p>}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-gray-700 space-y-3">
              <div className="flex items-center gap-2.5 text-sm text-neutral-500 dark:text-gray-400">
                <Calendar className="h-3.5 w-3.5 shrink-0" /> Member since {profile.joinedDate}
              </div>
              <div className="flex items-center gap-2.5 text-sm text-neutral-500 dark:text-gray-400">
                <Briefcase className="h-3.5 w-3.5 shrink-0" /> {profile.role}
              </div>
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-xl border border-neutral-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="border-b border-neutral-100 dark:border-gray-700 px-5 py-4">
              <h3 className="text-[15px] font-semibold text-neutral-900 dark:text-white">Personal information</h3>
              <p className="text-sm text-neutral-400 mt-0.5">Update your contact details below.</p>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1.5">
                    <User className="h-3.5 w-3.5 text-brand-700" /> Full Name
                  </label>
                  <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className={inputClass} placeholder="Enter your full name" />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1.5">
                    <Mail className="h-3.5 w-3.5 text-brand-700" /> Email Address
                  </label>
                  <input type="email" value={profile.email} disabled className={`${inputClass} bg-neutral-100 dark:bg-gray-800/60 text-neutral-500 cursor-not-allowed`} />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1.5">
                    <Phone className="h-3.5 w-3.5 text-brand-700" /> Phone Number
                  </label>
                  <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className={inputClass} placeholder="+1 (555) 123-4567" />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-brand-700" /> Role
                  </label>
                  <input type="text" value={profile.role} disabled className={`${inputClass} bg-neutral-100 dark:bg-gray-800/60 text-neutral-500 cursor-not-allowed`} />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-gray-300 mb-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand-700" /> Address
                </label>
                <textarea
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-200 dark:border-gray-700 px-3.5 py-2.5 text-sm outline-none focus:border-brand-600 bg-white dark:bg-gray-800 text-neutral-900 dark:text-white resize-none transition-colors"
                  placeholder="Enter your address"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-neutral-100 dark:border-gray-700 px-5 py-4">
              {hasChanges && (
                <Button variant="secondary" size="md" icon={RotateCcw} onClick={() => setProfile(original)}>
                  Discard changes
                </Button>
              )}
              <Button variant="primary" size="md" icon={Save} loading={saving} disabled={!hasChanges} onClick={handleSave}>
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}