"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Calendar,
  Clock,
  MapPin,
  Globe,
  Shield,
  Lock,
  Camera,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";

export default function UserProfileModal({ isOpen, onClose, user, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split("T")[0] : "",
    birthTime: user?.birthTime || "",
    birthPlace: user?.birthPlace || "",
    gender: user?.gender || "",
    locale: user?.locale || "en",
    timezone: user?.timezone || "Asia/Kolkata",
    avatarUrl: user?.avatarUrl || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const isChangingEmail = formData.email.toLowerCase().trim() !== (user?.email || "").toLowerCase().trim();

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (!formData.name.trim()) {
        throw new Error("Name cannot be empty");
      }

      if (isChangingEmail && !formData.currentPassword) {
        throw new Error("Please enter your current password to confirm changing your email address");
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

      setSuccess(true);
      if (onProfileUpdated) {
        onProfileUpdated(data.user);
      }
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-stone-200 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#13382c] text-[#d4a359] flex items-center justify-center font-bold text-lg">
              {formData.name.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif text-[#13382c]">Profile Management</h3>
              <p className="text-xs text-stone-500">Edit your personal details and astrology preferences</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Profile successfully updated!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Full Name</label>
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

          {isChangingEmail && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Security Verification Required</span>
              </div>
              <p className="text-[11px] text-amber-800">
                You are updating your account login email. Please enter your current account password to authorize this change.
              </p>
              <input
                type="password"
                required
                placeholder="Current password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white focus:ring-2 focus:ring-[#d4a359] outline-none"
              />
            </div>
          )}

          {/* Birth Details Box */}
          <div className="p-4 rounded-2xl bg-[#fdfbf7] border border-stone-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#d4a359]" />
                Personal Birth Details (Vedic Astrology)
              </span>
              <span className="text-[10px] text-stone-500 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-600" /> Private
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-stone-600 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-[#d4a359] outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-600 mb-1">Birth Time</label>
                <input
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-[#d4a359] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-stone-600 mb-1">Birthplace City</label>
                <input
                  type="text"
                  value={formData.birthPlace}
                  onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                  placeholder="e.g. Varanasi, India"
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-[#d4a359] outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-600 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-[#d4a359] outline-none"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Language & Timezone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Language</label>
              <select
                value={formData.locale}
                onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-[#d4a359] outline-none"
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
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:ring-2 focus:ring-[#d4a359] outline-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-50 font-semibold text-stone-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-[#13382c] hover:bg-[#194939] text-white font-semibold transition disabled:opacity-50"
            >
              {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
