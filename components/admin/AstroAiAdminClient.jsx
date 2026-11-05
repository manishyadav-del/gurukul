"use client";

import { useState } from "react";
import {
  Bot,
  BrainCircuit,
  Sparkles,
  Save,
  CheckCircle,
  Activity,
  Layers,
  Database,
  Sliders,
} from "lucide-react";

export default function AstroAiAdminClient({ initialData }) {
  const [settings, setSettings] = useState(initialData?.settings || {});
  const [stats, setStats] = useState(initialData?.stats || {});
  const [batchJobs, setBatchJobs] = useState(initialData?.batchJobs || []);
  const [model, setModel] = useState(settings.astroAiModel || "gemini-1.5-flash");
  const [temperature, setTemperature] = useState(settings.astroAiTemperature ?? 0.7);
  const [maxTokens, setMaxTokens] = useState(settings.astroAiMaxTokens || 1024);
  const [systemPrompt, setSystemPrompt] = useState(settings.astroAiSystemPrompt || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/astro-ai", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          astroAiModel: model,
          astroAiTemperature: parseFloat(temperature),
          astroAiMaxTokens: parseInt(maxTokens, 10),
          astroAiSystemPrompt: systemPrompt,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Astro AI model parameters saved successfully.");
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
          <h1 className="text-2xl font-bold font-serif text-stone-900">Astro AI & RAG Sources</h1>
          <p className="text-xs text-stone-500 mt-1">
            Configure LLM parameters, monitor vector embeddings, and manage classical source coverage.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-xs uppercase font-bold text-stone-400">Total Conversations</span>
          <p className="text-3xl font-black font-serif text-stone-900 mt-1">{stats.totalConversations || 0}</p>
          <p className="text-[11px] text-stone-500 mt-0.5">Interactive student discussions</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-xs uppercase font-bold text-stone-400">Total AI Messages</span>
          <p className="text-3xl font-black font-serif text-purple-700 mt-1">{stats.totalMessages || 0}</p>
          <p className="text-[11px] text-stone-500 mt-0.5">Vedic astrological responses</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-xs uppercase font-bold text-stone-400">Vector Coverage</span>
          <p className="text-3xl font-black font-serif text-emerald-700 mt-1">{stats.coveragePct || 100}%</p>
          <p className="text-[11px] text-stone-500 mt-0.5">{stats.totalEmbeddedPassages || 0} / {stats.totalPassages || 0} passages embedded</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-xs uppercase font-bold text-stone-400">Approved Classical Sources</span>
          <p className="text-3xl font-black font-serif text-amber-800 mt-1">{stats.sourcesCount || 0}</p>
          <p className="text-[11px] text-stone-500 mt-0.5">Citable Sanskrit & Hindi texts</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Config Form */}
        <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
          <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#d4a359]" />
            <span>LLM Parameter Settings</span>
          </h2>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Active LLM Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl border border-stone-300 text-xs font-medium focus:ring-2 focus:ring-[#13382c] focus:outline-none"
            >
              <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Ultra-Fast, Low Latency)</option>
              <option value="gemini-1.5-pro">Google Gemini 1.5 Pro (Deep Vedic Reasoning)</option>
              <option value="gemini-2.0-flash-exp">Google Gemini 2.0 Flash</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Temperature ({temperature})
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full accent-[#13382c]"
              />
              <span className="text-[10px] text-stone-400">Lower = deterministic, Higher = creative</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Max Output Tokens
              </label>
              <input
                type="number"
                min="256"
                max="4096"
                step="128"
                value={maxTokens}
                onChange={(e) => setMaxTokens(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-stone-300 text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
              Global Astro AI System Instructions
            </label>
            <textarea
              rows={4}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are Gurukul Astro AI, a compassionate and scholarly Vedic guide grounded in Brihat Parashara Hora Shastra..."
              className="w-full p-3 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#13382c] focus:outline-none"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Strictly non-fatalistic, respectful, with citations to classical Vedic shlokas.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3a] text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>{saving ? "Saving Changes..." : "Save AI Parameters"}</span>
            </button>
          </div>
        </form>

        {/* Batch Vector Jobs Panel */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h2 className="text-base font-bold font-serif text-stone-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-700" />
              <span>Vector Embedding Jobs</span>
            </h2>
          </div>

          <p className="text-xs text-stone-500">
            Passage chunk embeddings computed with text-embedding-004 (768 dimensions) for semantic RAG lookups.
          </p>

          <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
            {batchJobs.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                All passages indexed into vector store. No active batch jobs.
              </div>
            ) : (
              batchJobs.map((job) => (
                <div key={job.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-stone-800">{job.model}</span>
                    <p className="text-stone-400 text-[11px]">
                      {job.processedCount} / {job.totalCount} passages processed
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      job.status === "COMPLETED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
