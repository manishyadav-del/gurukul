"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  Lock,
  Globe,
  Bell,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Eye,
  Sliders,
} from "lucide-react";

export default function SettingsClient({ initialUser }) {
  const [settings, setSettings] = useState({
    ayanamsa: "Lahiri",
    chartFormat: "NorthIndian",
    isPublicLeaderboard: initialUser?.isPublicLeaderboard ?? true,
    emailNotifications: true,
    hideBirthDetailsDefault: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordErr, setPasswordErr] = useState(null);

  function handleSaveSettings(e) {
    e.preventDefault();
    setSavingSettings(true);
    setTimeout(() => {
      setSavingSettings(false);
      setSettingsMsg("Settings saved successfully!");
      setTimeout(() => setSettingsMsg(null), 4000);
    }, 400);
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordErr(null);
    setPasswordMsg(null);

    if (passwordForm.newPassword.length < 8) {
      setPasswordErr("New password must be at least 8 characters long.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErr("New passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      setPasswordMsg("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setPasswordMsg(null), 4000);
    } catch (err) {
      setPasswordErr(err.message);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
        <Link href="/dashboard" className="hover:underline">Dashboard</Link>
        <ChevronRight className="w-3 h-3 text-stone-400" />
        <span className="text-stone-600">Settings</span>
      </div>

      {/* Header */}
      <div className="border-b border-stone-200 pb-6">
        <h1 className="text-3xl font-bold font-serif text-[#13382c]">
          Account & Astrology Settings
        </h1>
        <p className="text-sm text-stone-600 mt-1">
          Configure ephemeris calculation preferences, privacy guardrails, and security credentials.
        </p>
      </div>

      {/* Settings Form */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
          <Sliders className="w-5 h-5 text-[#d4a359]" />
          <h2 className="text-lg font-bold font-serif text-stone-900">Astrological Preferences</h2>
        </div>

        {settingsMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{settingsMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Ayanamsa System (अयनांश)
              </label>
              <select
                value={settings.ayanamsa}
                onChange={(e) => setSettings({ ...settings, ayanamsa: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white outline-none focus:ring-2 focus:ring-[#d4a359]"
              >
                <option value="Lahiri">Chitra Paksha / Lahiri (Standard Indian Ephemeris)</option>
                <option value="KP">Krishnamurti Paddhati (KP System)</option>
                <option value="Raman">B.V. Raman Ayanamsa</option>
                <option value="Yukteshwar">Sri Yukteshwar Ayanamsa</option>
              </select>
              <span className="text-[11px] text-stone-500 block mt-1">
                Used for converting tropical planetary coordinates to sidereal Vedic zodiac.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Chart Display Format (कुण्डली शैली)
              </label>
              <select
                value={settings.chartFormat}
                onChange={(e) => setSettings({ ...settings, chartFormat: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white outline-none focus:ring-2 focus:ring-[#d4a359]"
              >
                <option value="NorthIndian">North Indian Diamond (उत्तर भारतीय)</option>
                <option value="SouthIndian">South Indian Square (दक्षिण भारतीय)</option>
              </select>
              <span className="text-[11px] text-stone-500 block mt-1">
                Preferred visual diagram style across your personal and family charts.
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 space-y-3">
            <h3 className="font-semibold text-stone-800 text-xs">Privacy & Community Guardrails</h3>

            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.isPublicLeaderboard}
                  onChange={(e) => setSettings({ ...settings, isPublicLeaderboard: e.target.checked })}
                  className="rounded text-[#13382c] focus:ring-[#d4a359]"
                />
                <div>
                  <span className="font-semibold text-stone-900 block">Show profile on Study Leaderboard</span>
                  <span className="text-[11px] text-stone-500">Allow your XP and reading badges to appear on the public student rankings.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.hideBirthDetailsDefault}
                  onChange={(e) => setSettings({ ...settings, hideBirthDetailsDefault: e.target.checked })}
                  className="rounded text-[#13382c] focus:ring-[#d4a359]"
                />
                <div>
                  <span className="font-semibold text-stone-900 block">Hide sensitive birth details by default</span>
                  <span className="text-[11px] text-stone-500">Mask birth time and city on family cards until explicitly revealed.</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-5 py-2 rounded-xl bg-[#13382c] hover:bg-[#194939] text-white font-semibold transition"
            >
              {savingSettings ? "Saving..." : "Save Preferences"}
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-stone-100">
          <Lock className="w-5 h-5 text-amber-700" />
          <h2 className="text-lg font-bold font-serif text-stone-900">Security & Credentials</h2>
        </div>

        {passwordErr && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{passwordErr}</span>
          </div>
        )}

        {passwordMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{passwordMsg}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs max-w-lg">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">New Password</label>
            <input
              type="password"
              required
              placeholder="Minimum 8 characters"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:ring-2 focus:ring-[#d4a359] outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#13382c] hover:bg-[#194939] text-white font-semibold transition cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
