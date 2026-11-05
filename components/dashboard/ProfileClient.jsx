"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Shield,
  Lock,
  Edit2,
  CheckCircle,
  AlertCircle,
  Camera,
  Award,
  Flame,
  ChevronRight,
  ArrowRight,
  Users,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ProfileClient({ initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: initialUser?.name || "",
    email: initialUser?.email || "",
    currentPassword: "",
    dateOfBirth: initialUser?.dateOfBirth ? new Date(initialUser.dateOfBirth).toISOString().split("T")[0] : "",
    birthTime: initialUser?.birthTime || "",
    birthPlace: initialUser?.birthPlace || "",
    gender: initialUser?.gender || "",
    locale: initialUser?.locale || "en",
    timezone: initialUser?.timezone || "Asia/Kolkata",
    avatarUrl: initialUser?.avatarUrl || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.name.trim()) {
        throw new Error("Name cannot be empty");
      }

      const isChangingEmail = formData.email.toLowerCase().trim() !== (user?.email || "").toLowerCase().trim();
      if (isChangingEmail && !formData.currentPassword) {
        throw new Error("Please enter your current password to authorize email change");
      }

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setUser(data.user);
      setSuccess("Profile updated successfully!");
      setEditing(false);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <ChevronRight className="w-3 h-3 text-stone-400" />
        <span className="text-stone-600">My Profile</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#13382c]">
            Personal Profile & Account
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Manage your personal identity, contact details, and private Vedic astrology birth data.
          </p>
        </div>

        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 rounded-xl bg-[#13382c] hover:bg-[#194939] text-white text-xs font-semibold flex items-center gap-2 transition cursor-pointer shadow-xs self-start sm:self-auto"
          >
            <Edit2 className="w-3.5 h-3.5 text-[#d4a359]" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <button
            onClick={() => setEditing(false)}
            className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition cursor-pointer self-start sm:self-auto"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-stone-100">
          <div className="w-20 h-20 rounded-2xl bg-[#13382c] text-[#d4a359] flex items-center justify-center font-bold text-3xl font-serif shadow-sm shrink-0 border-2 border-[#d4a359]/40">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold font-serif text-stone-900">{user?.name || "Student"}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                {user?.role || "USER"}
              </span>
            </div>
            <p className="text-xs text-stone-500">{user?.email}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 pt-2">
              <span className="flex items-center gap-1.5 font-medium">
                <Award className="w-4 h-4 text-amber-600" />
                Level {user?.level || 1} • {user?.totalXp || 0} XP
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 font-medium text-orange-600">
                <Flame className="w-4 h-4 fill-orange-500" />
                {user?.currentStreak || 0} Day Streak
              </span>
            </div>
          </div>
        </div>

        {/* View or Edit Form */}
        {editing ? (
          <form onSubmit={handleSave} className="space-y-6 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none"
                />
              </div>
            </div>

            {formData.email.toLowerCase().trim() !== (user?.email || "").toLowerCase().trim() && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                  <Lock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Password Authorization Required</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Please enter your current account password to authorize changing your email.
                </p>
                <input
                  type="password"
                  required
                  placeholder="Current password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white outline-none"
                />
              </div>
            )}

            {/* Birth Details Box */}
            <div className="p-5 rounded-2xl bg-[#fdfbf7] border border-stone-200 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                <span className="font-semibold text-stone-800 flex items-center gap-1.5 text-sm">
                  <Calendar className="w-4 h-4 text-[#d4a359]" />
                  Vedic Astrology Birth Profile
                </span>
                <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-600" /> Kept Private
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-stone-600 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white outline-none focus:ring-2 focus:ring-[#d4a359]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-600 mb-1">Birth Time (24h)</label>
                  <input
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white outline-none focus:ring-2 focus:ring-[#d4a359]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-stone-600 mb-1">Birthplace City</label>
                  <input
                    type="text"
                    placeholder="e.g. Varanasi, India"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white outline-none focus:ring-2 focus:ring-[#d4a359]"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-600 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white outline-none focus:ring-2 focus:ring-[#d4a359]"
                  >
                    <option value="">Select Gender</option>
                    <option value="MALE">Male (पुरुष)</option>
                    <option value="FEMALE">Female (महिला)</option>
                    <option value="OTHER">Other (अन्य)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Preferred Language</label>
                <select
                  value={formData.locale}
                  onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white outline-none"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी (Hindi)</option>
                  <option value="sa">संस्कृतम् (Sanskrit)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Timezone</label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white outline-none"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST +05:30)</option>
                  <option value="UTC">UTC (GMT +00:00)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 font-semibold text-stone-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#13382c] hover:bg-[#194939] text-white font-semibold transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <div>
                <span className="text-stone-400 font-medium block">Full Name</span>
                <p className="text-sm font-semibold text-stone-900 mt-0.5">{user?.name || "—"}</p>
              </div>

              <div>
                <span className="text-stone-400 font-medium block">Email Address</span>
                <p className="text-sm font-semibold text-stone-900 mt-0.5">{user?.email || "—"}</p>
              </div>

              <div>
                <span className="text-stone-400 font-medium block">Preferred Language</span>
                <p className="text-sm font-semibold text-stone-900 mt-0.5">
                  {user?.locale === "hi" ? "हिन्दी (Hindi)" : user?.locale === "sa" ? "संस्कृतम् (Sanskrit)" : "English"}
                </p>
              </div>

              <div>
                <span className="text-stone-400 font-medium block">Timezone</span>
                <p className="text-sm font-semibold text-stone-900 mt-0.5">{user?.timezone || "Asia/Kolkata"}</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#d4a359]" />
                  Astrology Birth Profile
                </span>
                <span className="text-[10px] text-stone-400">Encrypted on device</span>
              </div>

              <div className="space-y-2 pt-1 text-stone-600">
                <div className="flex justify-between">
                  <span>Date of Birth:</span>
                  <span className="font-semibold text-stone-800" suppressHydrationWarning>
                    {user?.dateOfBirth ? formatDate(user.dateOfBirth) : "Not set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Birth Time:</span>
                  <span className="font-semibold text-stone-800">{user?.birthTime || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Birthplace:</span>
                  <span className="font-semibold text-stone-800">{user?.birthPlace || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gender:</span>
                  <span className="font-semibold text-stone-800">{user?.gender || "Not specified"}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/astrology?tab=kundli"
                  className="text-amber-800 hover:underline font-semibold flex items-center gap-1 text-[11px]"
                >
                  <span>View your personalized Kundli</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Navigation to Family and Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/family"
          className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-[#d4a359] transition flex items-center justify-between group shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#13382c]/10 text-[#13382c] flex items-center justify-center">
              <Users className="w-5 h-5 text-[#13382c]" />
            </div>
            <div>
              <span className="text-sm font-bold text-stone-900 block">Family Circle</span>
              <span className="text-xs text-stone-500">Manage members and invitations</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#13382c] group-hover:translate-x-1 transition" />
        </Link>

        <Link
          href="/dashboard/settings"
          className="p-5 rounded-2xl bg-white border border-stone-200 hover:border-[#d4a359] transition flex items-center justify-between group shadow-xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-stone-600" />
            </div>
            <div>
              <span className="text-sm font-bold text-stone-900 block">Account Settings</span>
              <span className="text-xs text-stone-500">Security, privacy & preferences</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-[#13382c] group-hover:translate-x-1 transition" />
        </Link>
      </div>
    </div>
  );
}
