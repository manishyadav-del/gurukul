"use client";

import { useState } from "react";
import {
  Settings,
  Shield,
  Save,
  CheckCircle,
  AlertTriangle,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";

export default function PlatformSettingsAdminClient({ initialSettings }) {
  const [settings, setSettings] = useState(initialSettings || {});
  const [registrationEnabled, setRegistrationEnabled] = useState(
    settings.registrationEnabled ?? true
  );
  const [maintenanceMode, setMaintenanceMode] = useState(
    settings.maintenanceMode ?? false
  );
  const [allowFamilySharing, setAllowFamilySharing] = useState(
    settings.allowFamilySharing ?? true
  );
  const [ocrEngine, setOcrEngine] = useState(settings.ocrDefaultEngine || "tesseract");
  const [ocrLanguages, setOcrLanguages] = useState(settings.ocrLanguages || "hin+san+eng");
  const [ocrDpi, setOcrDpi] = useState(settings.ocrDpi || 300);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationEnabled,
          maintenanceMode,
          allowFamilySharing,
          ocrDefaultEngine: ocrEngine,
          ocrLanguages,
          ocrDpi: parseInt(ocrDpi, 10),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Platform settings updated successfully.");
        setSettings(data.settings);
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">Platform Configuration</h1>
          <p className="text-xs text-stone-500 mt-1">
            Global system flags, OCR pipeline defaults, and environment security controls.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {maintenanceMode && (
        <div className="p-4 rounded-2xl bg-amber-500 text-stone-950 text-xs font-bold flex items-center gap-2.5 shadow-md">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Maintenance Mode is ACTIVE. Non-admin users will be presented with a scheduled maintenance screen.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-5">
          <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#d4a359]" />
            <span>Operational Flags</span>
          </h2>

          {/* Registration Enabled */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
            <div>
              <p className="font-bold text-stone-900">Public User Registration</p>
              <p className="text-[11px] text-stone-500">Allow guest visitors to sign up for student accounts.</p>
            </div>
            <input
              type="checkbox"
              checked={registrationEnabled}
              onChange={(e) => setRegistrationEnabled(e.target.checked)}
              className="w-5 h-5 accent-[#13382c] rounded-md cursor-pointer"
            />
          </div>

          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
            <div>
              <p className="font-bold text-stone-900">Platform Maintenance Mode</p>
              <p className="text-[11px] text-stone-500">Temporarily restrict public portal during database migrations.</p>
            </div>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-5 h-5 accent-amber-600 rounded-md cursor-pointer"
            />
          </div>

          {/* Family Sharing */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
            <div>
              <p className="font-bold text-stone-900">Family Circle Sharing</p>
              <p className="text-[11px] text-stone-500">Permit users to invite and link family member accounts.</p>
            </div>
            <input
              type="checkbox"
              checked={allowFamilySharing}
              onChange={(e) => setAllowFamilySharing(e.target.checked)}
              className="w-5 h-5 accent-[#13382c] rounded-md cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-stone-100">
            <h3 className="font-bold text-stone-800 text-xs uppercase tracking-wider mb-3">
              OCR Ingestion Defaults
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">OCR Engine</label>
                <input
                  type="text"
                  value={ocrEngine}
                  onChange={(e) => setOcrEngine(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">OCR Languages</label>
                  <input
                    type="text"
                    value={ocrLanguages}
                    onChange={(e) => setOcrLanguages(e.target.value)}
                    placeholder="hin+san+eng"
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Rendering DPI</label>
                  <input
                    type="number"
                    value={ocrDpi}
                    onChange={(e) => setOcrDpi(e.target.value)}
                    min="150"
                    max="600"
                    className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3a] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>{saving ? "Saving Changes..." : "Save Platform Configuration"}</span>
            </button>
          </div>
        </form>

        {/* Security Policy & Architecture Panel */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-700" />
              <span>Active Security Hardening</span>
            </h2>

            <div className="space-y-3 text-xs text-stone-600">
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <p className="font-bold text-stone-900">Access Tokens (Short-Lived JWT)</p>
                <p className="text-[11px] text-stone-500">
                  15-minute validity window. Signed with HMAC-SHA256, strictly validated against user database record.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <p className="font-bold text-stone-900">Rotating Refresh Tokens</p>
                <p className="text-[11px] text-stone-500">
                  256-bit cryptographic entropy stored as SHA-256 hashes. Single-use rotation on each refresh.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <p className="font-bold text-stone-900">Token Reuse Invalidation</p>
                <p className="text-[11px] text-stone-500">
                  Detects token replay attacks and revokes the entire token family session cluster instantly.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1">
                <p className="font-bold text-stone-900">Super Admin Safe Recovery Guard</p>
                <p className="text-[11px] text-stone-500">
                  System server-side validation strictly prevents deactivation or demotion of the final active Super Administrator.
                </p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-stone-100/70 rounded-xl text-[11px] text-stone-500 flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Config changes are recorded to the immutable AdminAuditLog table.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
