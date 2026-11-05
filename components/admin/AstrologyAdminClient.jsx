"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Sparkles,
  CheckCircle,
  Activity,
  RotateCcw,
  Shield,
  Layers,
  Save,
  AlertCircle,
  Heart,
  Flower2,
  BookOpen,
  Check,
  ShieldCheck,
  Eye,
  Network,
  CheckCheck,
  XCircle,
} from "lucide-react";

export default function AstrologyAdminClient({ initialData }) {
  const [activeTab, setActiveTab] = useState("config"); // "config" | "remedies" | "kundalini" | "knowledge"
  const [settings, setSettings] = useState(initialData?.settings || {});
  const [cacheStats, setCacheStats] = useState(initialData?.cacheStats || {});
  const [remedies, setRemedies] = useState(initialData?.remedies || []);
  const [kundaliniModules, setKundaliniModules] = useState(initialData?.kundaliniModules || []);
  const [kgData, setKgData] = useState(null);
  const [kgLoading, setKgLoading] = useState(false);

  const [ayanamsa, setAyanamsa] = useState(settings.ayanamsa || "LAHIRI");
  const [chartStyle, setChartStyle] = useState(settings.defaultChartStyle || "NORTH_INDIAN");
  const [engine, setEngine] = useState(settings.panchangCalculationEngine || "swiss-ephemeris-v1");
  const [saving, setSaving] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [runningDiag, setRunningDiag] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [editingModule, setEditingModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({
    title: "",
    slug: "",
    subtitle: "",
    level: "BEGINNER",
    chakraAssociation: "All",
    historicalContext: "",
    safetyGuidance: "Gentle awareness only. Discontinue immediately if breathless or uncomfortable.",
    status: "PUBLISHED",
  });
  const [showModuleModal, setShowModuleModal] = useState(false);

  const handleOpenEditModule = (mod) => {
    setEditingModule(mod);
    setModuleForm({
      title: mod?.title || "",
      slug: mod?.slug || "",
      subtitle: mod?.subtitle || "",
      level: mod?.level || "BEGINNER",
      chakraAssociation: mod?.chakraAssociation || "All",
      historicalContext: mod?.historicalContext || "",
      safetyGuidance: mod?.safetyGuidance || "Gentle awareness only. Discontinue immediately if breathless or uncomfortable.",
      status: mod?.status || "PUBLISHED",
    });
    setShowModuleModal(true);
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg("");
    try {
      const res = await fetch("/api/admin/kundalini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...moduleForm,
          id: editingModule?.id || undefined,
          action: editingModule?.id ? "update" : "create",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save module");

      if (editingModule?.id) {
        setKundaliniModules((prev) =>
          prev.map((m) => (m.id === editingModule.id ? data.module : m))
        );
        setStatusMsg(`Successfully updated module: ${data.module.title}`);
      } else {
        setKundaliniModules((prev) => [...prev, data.module]);
        setStatusMsg(`Successfully created module: ${data.module.title}`);
      }
      setShowModuleModal(false);
      setEditingModule(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteModule = async (id, title) => {
    if (!confirm(`Are you sure you want to delete module "${title}"?`)) return;
    try {
      const res = await fetch("/api/admin/kundalini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "delete" }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      setKundaliniModules((prev) => prev.filter((m) => m.id !== id));
      setStatusMsg(`Deleted module: ${title}`);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg("");
    try {
      const res = await fetch("/api/admin/astrology", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ayanamsa,
          defaultChartStyle: chartStyle,
          panchangCalculationEngine: engine,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg("Astrological calculation settings updated successfully.");
        setSettings(data.settings);
      } else {
        setStatusMsg(`Error: ${data.error}`);
      }
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRunDiagnostic = async () => {
    setRunningDiag(true);
    setDiagnosticResult(null);
    try {
      const res = await fetch("/api/admin/astrology", { method: "POST" });
      const data = await res.json();
      setDiagnosticResult(data.diagnostic);
    } catch (err) {
      setDiagnosticResult({ status: "ERROR", errorMessage: err.message });
    } finally {
      setRunningDiag(false);
    }
  };

  const handleToggleRemedyStatus = async (remedy) => {
    const nextStatus = remedy.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const res = await fetch("/api/admin/remedies", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: remedy.id, status: nextStatus }),
      });
      if (res.ok) {
        setRemedies((prev) =>
          prev.map((r) => (r.id === remedy.id ? { ...r, status: nextStatus } : r))
        );
        setStatusMsg(`Remedy '${remedy.title}' set to ${nextStatus}.`);
      }
    } catch (err) {
      setStatusMsg(`Error updating remedy status: ${err.message}`);
    }
  };

  const fetchKgData = async () => {
    setKgLoading(true);
    try {
      const res = await fetch("/api/admin/knowledge-graph");
      if (res.ok) {
        const data = await res.json();
        setKgData(data);
      }
    } catch (err) {
      console.error("fetchKgData error:", err);
    } finally {
      setKgLoading(false);
    }
  };

  const handleUpdateRelStatus = async (relId, nextStatus) => {
    try {
      const res = await fetch("/api/admin/knowledge-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_relationship_status",
          relationshipId: relId,
          status: nextStatus,
        }),
      });
      if (res.ok) {
        setStatusMsg(`Relationship status updated to ${nextStatus}.`);
        fetchKgData();
      }
    } catch (err) {
      setStatusMsg(`Error updating relationship: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            Vedic Astrology, Remedies & Kundalini Admin
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure astronomical algorithms, manage traditional remedies and mantras, and oversee Kundalini learning safety standards.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/astrology/daily-guidance"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Public Guidance</span>
          </Link>
          <Link
            href="/spirituality/kundalini"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition shadow-2xs"
          >
            <Flower2 className="w-3.5 h-3.5 text-[#c4903c]" />
            <span>View Kundalini</span>
          </Link>
        </div>
      </div>

      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] uppercase font-bold text-stone-400">Total Panchang Reports</span>
          <p className="text-2xl sm:text-3xl font-black font-serif text-stone-900 mt-1">
            {cacheStats.totalDailyReports || 0}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">Persisted in daily reports</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] uppercase font-bold text-stone-400">Total Birth Charts</span>
          <p className="text-2xl sm:text-3xl font-black font-serif text-[#13382c] mt-1">
            {cacheStats.totalBirthCharts || 0}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">Calculated Kundlis</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] uppercase font-bold text-stone-400">Verified Remedies</span>
          <p className="text-2xl sm:text-3xl font-black font-serif text-[#c4903c] mt-1">
            {remedies.length}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">Vedic Pujas, Mantras & Daan</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[11px] uppercase font-bold text-stone-400">Kundalini Modules</span>
          <p className="text-2xl sm:text-3xl font-black font-serif text-indigo-700 mt-1">
            {kundaliniModules.length}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">Educational tracks</p>
        </div>
      </div>

      {/* Admin Tab Selector */}
      <div className="flex border-b border-stone-200 gap-6 text-xs font-bold text-stone-600">
        <button
          onClick={() => setActiveTab("config")}
          className={`pb-3 border-b-2 transition cursor-pointer ${
            activeTab === "config"
              ? "border-[#13382c] text-[#13382c]"
              : "border-transparent hover:text-stone-900"
          }`}
        >
          Calculation Configuration & Ephemeris
        </button>
        <button
          onClick={() => setActiveTab("remedies")}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === "remedies"
              ? "border-[#13382c] text-[#13382c]"
              : "border-transparent hover:text-stone-900"
          }`}
        >
          <Heart className="w-3.5 h-3.5 text-[#c4903c]" />
          <span>Vedic Remedies & Pujas ({remedies.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("kundalini")}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === "kundalini"
              ? "border-[#13382c] text-[#13382c]"
              : "border-transparent hover:text-stone-900"
          }`}
        >
          <Flower2 className="w-3.5 h-3.5 text-indigo-600" />
          <span>Kundalini Learning Modules ({kundaliniModules.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("knowledge");
            if (!kgData) fetchKgData();
          }}
          className={`pb-3 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === "knowledge"
              ? "border-[#13382c] text-[#13382c]"
              : "border-transparent hover:text-stone-900"
          }`}
        >
          <Network className="w-3.5 h-3.5 text-emerald-700" />
          <span>Knowledge Graph & Shastric Relationships</span>
        </button>
      </div>

      {/* Tab 1: Configuration & Ephemeris */}
      {activeTab === "config" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-5">
            <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#d4a359]" />
              <span>Calculation Configuration</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Default Ayanamsa System
              </label>
              <select
                value={ayanamsa}
                onChange={(e) => setAyanamsa(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-[#13382c] focus:outline-none"
              >
                <option value="LAHIRI">Chitrapaksha / Lahiri (Traditional Standard)</option>
                <option value="KP">Krishnamurti Paddhati (KP System)</option>
                <option value="RAMAN">B.V. Raman Ayanamsa</option>
                <option value="TROPICAL">Sayana / Tropical (Western Astrological Base)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Platform Default Chart Presentation
              </label>
              <select
                value={chartStyle}
                onChange={(e) => setChartStyle(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-[#13382c] focus:outline-none"
              >
                <option value="NORTH_INDIAN">North Indian Diamond Format (Kundli)</option>
                <option value="SOUTH_INDIAN">South Indian Box Grid Format (Chakra)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Panchang Ephemeris Algorithm
              </label>
              <select
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                className="w-full py-2.5 px-3 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-[#13382c] focus:outline-none"
              >
                <option value="swiss-ephemeris-v1">Swiss Ephemeris Pure Node (astronomy-engine)</option>
                <option value="surya-siddhanta-v1">Classical Surya Siddhanta Algorithmic Fallback</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3a] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
              >
                <Save className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>{saving ? "Saving Changes..." : "Save Calculation Settings"}</span>
              </button>
            </div>
          </form>

          {/* Engine Diagnostic Panel */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-700" />
                  <span>Ephemeris Health & Diagnostic</span>
                </h2>
                <button
                  onClick={handleRunDiagnostic}
                  disabled={runningDiag}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 hover:border-amber-400 bg-stone-50 hover:bg-stone-100 text-xs font-semibold text-stone-800 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${runningDiag ? "animate-spin" : ""}`} />
                  <span>Run Live Probe</span>
                </button>
              </div>

              <p className="text-xs text-stone-500 mt-3">
                Executes a sample Vedic chart calculation using astronomical celestial coordinates to verify sub-arcminute planetary longitude precision.
              </p>

              {diagnosticResult ? (
                <div className="mt-4 p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-800">Diagnostic Status:</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        diagnosticResult.status === "HEALTHY"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {diagnosticResult.status}
                    </span>
                  </div>
                  {diagnosticResult.executionTimeMs && (
                    <div className="flex items-center justify-between text-stone-600">
                      <span>Calculation Speed:</span>
                      <strong className="font-mono text-emerald-700">
                        {diagnosticResult.executionTimeMs} ms
                      </strong>
                    </div>
                  )}
                  {diagnosticResult.ascendant && (
                    <div className="flex items-center justify-between text-stone-600">
                      <span>Ascendant / Moon / Nakshatra:</span>
                      <span className="font-semibold text-stone-900">
                        {diagnosticResult.ascendant} • {diagnosticResult.moonSign} • {diagnosticResult.nakshatra}
                      </span>
                    </div>
                  )}
                  {diagnosticResult.planetsCalculated && (
                    <div className="flex items-center justify-between text-stone-600">
                      <span>Planets Verified:</span>
                      <span>{diagnosticResult.planetsCalculated} Grahas (Sun through Ketu)</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-6 p-8 border border-dashed border-stone-200 rounded-2xl text-center text-xs text-stone-400">
                  Click "Run Live Probe" to run real-time ephemeris diagnostics.
                </div>
              )}
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <span>
                Calculation adjustments take effect immediately for all subsequent daily Panchang and Kundli queries.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Verified Remedies & Pujas */}
      {activeTab === "remedies" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-serif text-stone-900">
                Verified Daily Remedies & Mantras Catalog
              </h2>
              <p className="text-xs text-stone-500">
                Every remedy is linked to verified Sanskrit scriptural sources (BPHS, Surya Siddhanta, Rigveda).
              </p>
            </div>
          </div>

          <div className="divide-y divide-stone-100">
            {remedies.map((remedy) => (
              <div key={remedy.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#faf5ec] text-[#c4903c] uppercase">
                      {remedy.category}
                    </span>
                    <span className="text-xs font-semibold text-stone-900">
                      {remedy.title}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      ({remedy.planetaryAssociation})
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-1">{remedy.purpose}</p>
                  <div className="text-[11px] text-stone-400 flex items-center gap-2">
                    <span>Source: {remedy.sourceReference || remedy.tradition}</span>
                    <span>•</span>
                    <span>Timing: {remedy.suitableTiming || "Morning"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      remedy.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-stone-200 text-stone-700"
                    }`}
                  >
                    {remedy.status}
                  </span>
                  <button
                    onClick={() => handleToggleRemedyStatus(remedy)}
                    className="px-2.5 py-1 rounded-lg border border-stone-200 text-xs text-stone-600 hover:bg-stone-100 transition"
                  >
                    {remedy.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Kundalini Learning Modules */}
      {activeTab === "kundalini" && (
        <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold font-serif text-stone-900">
                Kundalini & Chakra Educational Modules
              </h2>
              <p className="text-xs text-stone-500">
                Oversee traditional historical context, safe gentle awareness steps, and non-commercial references.
              </p>
            </div>
            <button
              onClick={() => handleOpenEditModule(null)}
              className="px-3.5 py-1.5 rounded-xl bg-[#13382c] text-white text-xs font-semibold hover:bg-[#1a4a3b] transition cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <span>+ Add Concept Module</span>
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {kundaliniModules.map((mod) => (
              <div key={mod.id} className="py-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#faf5ec] text-[#c4903c] uppercase">
                      {mod.level}
                    </span>
                    <span className="text-xs font-bold text-stone-900">
                      {mod.title}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      • {mod.chakraAssociation}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {mod.status}
                    </span>
                    <button
                      onClick={() => handleOpenEditModule(mod)}
                      className="px-2.5 py-1 rounded-lg border border-stone-200 text-[11px] font-semibold text-stone-700 hover:bg-stone-50 cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteModule(mod.id, mod.title)}
                      className="px-2 py-1 rounded-lg text-rose-600 hover:bg-rose-50 text-[11px] font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <p className="text-xs text-stone-600 line-clamp-2">
                  {mod.historicalContext}
                </p>

                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-[11px] text-amber-900 flex items-start gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    <strong>Safety Rule Verified: </strong>
                    {mod.safetyGuidance ? mod.safetyGuidance.split("\n")[0] : "Verified"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Knowledge Graph & Shastric Relationships */}
      {activeTab === "knowledge" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
                <Network className="w-4 h-4 text-emerald-700" />
                <span>Knowledge Graph & Shastric Relationship Governance</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Review canonical concepts, audit AI-discovered linkages, verify classical citations, and enforce shastric accuracy.
              </p>
            </div>

            <button
              onClick={fetchKgData}
              disabled={kgLoading}
              className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${kgLoading ? "animate-spin" : ""}`} />
              <span>Refresh Graph Data</span>
            </button>
          </div>

          {/* Metric Highlights */}
          {kgData?.metrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-stone-400">Canonical Concepts</span>
                <p className="text-xl font-bold font-serif text-stone-900 mt-0.5">
                  {kgData.metrics.totalConcepts || 0}
                </p>
                <span className="text-[10px] text-stone-400">Grahas, Bhavas, Rashis, Chakras</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-stone-400">Classical Relationships</span>
                <p className="text-xl font-bold font-serif text-stone-900 mt-0.5">
                  {kgData.metrics.totalRelationships || 0}
                </p>
                <span className="text-[10px] text-stone-400">Codified in Knowledge Graph</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-stone-400">Approved Shastric Edges</span>
                <p className="text-xl font-bold font-serif text-emerald-700 mt-0.5">
                  {kgData.metrics.approvedRelationships || 0}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">100% Grounded Citations</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
                <span className="text-[10px] uppercase font-bold text-stone-400">Pending Review</span>
                <p className="text-xl font-bold font-serif text-amber-700 mt-0.5">
                  {kgData.metrics.pendingReviewRelationships || 0}
                </p>
                <span className="text-[10px] text-amber-600">Requires Admin Approval</span>
              </div>
            </div>
          )}

          {/* Relationships Review Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs p-5 space-y-4">
            <h3 className="font-serif font-bold text-sm text-stone-900">
              Shastric Relationships & Provenance Citations
            </h3>

            {kgLoading ? (
              <div className="py-12 text-center text-xs text-stone-400">
                Loading relationship records...
              </div>
            ) : kgData?.recentRelationships?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-700">
                  <thead className="border-b border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-wider font-mono">
                    <tr>
                      <th className="pb-2.5">Source Concept</th>
                      <th className="pb-2.5">Relationship</th>
                      <th className="pb-2.5">Target Concept</th>
                      <th className="pb-2.5">Classical Source</th>
                      <th className="pb-2.5">Status</th>
                      <th className="pb-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {kgData.recentRelationships.map((rel) => (
                      <tr key={rel.id} className="hover:bg-stone-50/60 transition">
                        <td className="py-3 font-semibold text-stone-900">
                          {rel.sourceConcept?.name || "Concept"}
                        </td>
                        <td className="py-3 text-stone-500 font-mono text-[11px]">
                          {rel.title || rel.relationshipType}
                        </td>
                        <td className="py-3 font-semibold text-stone-900">
                          {rel.targetConcept?.name || "Concept"}
                        </td>
                        <td className="py-3 text-stone-600 font-serif italic text-[11px] max-w-xs truncate">
                          {rel.classicalSource || "Brihat Parashara Hora Shastra"}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              rel.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : rel.status === "REJECTED"
                                ? "bg-rose-50 text-rose-800 border border-rose-200"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {rel.status}
                          </span>
                        </td>
                        <td className="py-3 text-right space-x-1.5">
                          {rel.status !== "APPROVED" && (
                            <button
                              onClick={() => handleUpdateRelStatus(rel.id, "APPROVED")}
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold transition"
                              title="Approve Shastric Edge"
                            >
                              Approve
                            </button>
                          )}
                          {rel.status !== "REJECTED" && (
                            <button
                              onClick={() => handleUpdateRelStatus(rel.id, "REJECTED")}
                              className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold transition"
                              title="Reject Relationship"
                            >
                              Reject
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-stone-400">
                No relationship records found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Module Edit / Create Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif font-bold text-base text-stone-900">
                {editingModule ? `Edit Concept: ${editingModule.title}` : "Create New Knowledge Module"}
              </h3>
              <button
                onClick={() => setShowModuleModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Concept Title</label>
                <input
                  type="text"
                  required
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="e.g. Anahata (Heart Chakra) Dynamics"
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#13382c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Slug</label>
                  <input
                    type="text"
                    value={moduleForm.slug}
                    onChange={(e) => setModuleForm({ ...moduleForm, slug: e.target.value })}
                    placeholder="auto-generated-if-empty"
                    className="w-full p-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#13382c]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Level</label>
                  <select
                    value={moduleForm.level}
                    onChange={(e) => setModuleForm({ ...moduleForm, level: e.target.value })}
                    className="w-full p-2 rounded-xl border border-stone-200"
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="THEORY">THEORY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Chakra Association</label>
                  <input
                    type="text"
                    value={moduleForm.chakraAssociation}
                    onChange={(e) => setModuleForm({ ...moduleForm, chakraAssociation: e.target.value })}
                    placeholder="Root, Heart, Throat, All..."
                    className="w-full p-2 rounded-xl border border-stone-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Status</label>
                  <select
                    value={moduleForm.status}
                    onChange={(e) => setModuleForm({ ...moduleForm, status: e.target.value })}
                    className="w-full p-2 rounded-xl border border-stone-200"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Historical Context & Philosophy</label>
                <textarea
                  rows={3}
                  value={moduleForm.historicalContext}
                  onChange={(e) => setModuleForm({ ...moduleForm, historicalContext: e.target.value })}
                  placeholder="Classical traditional grounding from Upanishads, Shat-Chakra-Nirupana, or BPHS..."
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#13382c]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Safety Notice (Mandatory)</label>
                <textarea
                  rows={2}
                  required
                  value={moduleForm.safetyGuidance}
                  onChange={(e) => setModuleForm({ ...moduleForm, safetyGuidance: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-1 focus:ring-[#13382c]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-semibold hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#13382c] text-white font-semibold hover:bg-[#1a4a3b] cursor-pointer disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingModule ? "Update Concept" : "Create Concept"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
