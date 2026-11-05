"use client";

import { useState } from "react";
import {
  GraduationCap,
  Plus,
  BookOpen,
  CheckCircle,
  Eye,
  Trash2,
  Edit2,
  AlertCircle,
  X,
  Layers,
} from "lucide-react";

export default function LearnAdminClient({ initialModules }) {
  const [modules, setModules] = useState(initialModules || []);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("ASTROLOGY_FOUNDATIONS");
  const [difficulty, setDifficulty] = useState("BEGINNER");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const handleCreateModule = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          category,
          difficulty,
          description,
          isPublished: false,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setModules([data.module, ...modules]);
        setCreateModalOpen(false);
        setTitle("");
        setSlug("");
        setDescription("");
        setMessage("Learning module created successfully.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (mod) => {
    try {
      const res = await fetch(`/api/admin/learn/${mod.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !mod.isPublished }),
      });
      if (res.ok) {
        setModules(
          modules.map((m) =>
            m.id === mod.id ? { ...m, isPublished: !m.isPublished } : m
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteModule = async (id) => {
    if (!confirm("Delete this learning module and its curriculum lessons?")) return;
    try {
      const res = await fetch(`/api/admin/learn/${id}`, { method: "DELETE" });
      if (res.ok) {
        setModules(modules.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">Learning Curriculum</h1>
          <p className="text-xs text-stone-500 mt-1">
            Organize structured Vedic knowledge into modules, lessons, and interactive study tracks.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#13382c] hover:bg-[#1a4a3a] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs self-start"
        >
          <Plus className="w-4 h-4 text-[#d4a359]" />
          <span>New Learning Module</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Modules List */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 uppercase font-bold text-stone-500">
              <tr>
                <th className="px-5 py-3.5">Module Title</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Difficulty</th>
                <th className="px-5 py-3.5">Lessons</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {modules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-stone-400">
                    No learning modules created yet. Click "New Learning Module" to start.
                  </td>
                </tr>
              ) : (
                modules.map((m) => (
                  <tr key={m.id} className="hover:bg-stone-50/70 transition">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-stone-900">{m.title}</p>
                      <p className="text-[11px] text-stone-400 font-mono">/{m.slug}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-semibold">
                        {m.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-stone-700">{m.difficulty}</td>
                    <td className="px-5 py-3.5 text-stone-800 font-bold">
                      {m._count?.lessons || 0} lessons
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleTogglePublish(m)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${
                          m.isPublished
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : "bg-stone-100 text-stone-600 border border-stone-300"
                        }`}
                      >
                        {m.isPublished ? "PUBLISHED" : "DRAFT"}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDeleteModule(m.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                        title="Delete Module"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Module Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-stone-900 font-serif text-base">New Learning Module</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateModule} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Module Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
                  }}
                  placeholder="e.g. Navamsha (D9) Chart Fundamentals"
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Slug URL</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="navamsha-chart-fundamentals"
                  className="w-full p-2.5 rounded-xl border border-stone-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  >
                    <option value="ASTROLOGY_FOUNDATIONS">Astrology Foundations</option>
                    <option value="GRAHAS_AND_BHAVAS">Grahas & Bhavas</option>
                    <option value="NAKSHATRAS">Nakshatras</option>
                    <option value="PANCHANG_CALC">Panchang Calculation</option>
                    <option value="SANSKRIT_SLOKAS">Sanskrit & Shlokas</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-stone-300"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Overview Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Comprehensive guide to reading the D9 Navamsha chart..."
                  className="w-full p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#13382c] text-white font-bold disabled:opacity-60"
                >
                  {saving ? "Creating..." : "Create Module"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
