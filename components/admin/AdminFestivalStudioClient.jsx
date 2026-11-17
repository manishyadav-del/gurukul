"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Sparkles,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Eye,
  BookOpen,
  ExternalLink,
  Loader2,
  X,
  Flame,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export default function AdminFestivalStudioClient({ initialFestivals = [] }) {
  const [festivals, setFestivals] = useState(initialFestivals);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFestival, setEditingFestival] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const initialForm = {
    name: "",
    nameHi: "",
    nameSanskrit: "",
    slug: "",
    category: "FESTIVAL",
    description: "",
    descriptionHi: "",
    significance: "",
    significanceHi: "",
    deitiesStr: "",
    pujaVidhi: "",
    pujaVidhiHi: "",
    vrataRules: "",
    vrataRulesHi: "",
    isPublished: true,
    status: "PUBLISHED",
    rule: {
      lunarMonth: "Chaitra",
      paksha: "Shukla",
      tithi: 1,
      determinationRule: "UDAYA_TITHI",
      traditionConvention: "ALL",
      solarSign: "",
      isRecurringMonthly: false,
    },
    scriptureReference: {
      bookSlug: "brihat-parashara-hora-shastra",
      bookTitle: "Brihat Parashara Hora Shastra",
      chapterTitle: "",
      verseNumber: "",
      pageNumber: 1,
      shlokaSanskrit: "",
      translationEn: "",
      translationHi: "",
      readerUrl: "/library/brihat-parashara-hora-shastra/pdf?page=1",
    },
  };

  const [formData, setFormData] = useState(initialForm);

  const openCreateModal = () => {
    setEditingFestival(null);
    setFormData(initialForm);
    setErrorMsg("");
    setIsModalOpen(true);
  };

  const openEditModal = (f) => {
    setEditingFestival(f);
    setFormData({
      name: f.name || "",
      nameHi: f.nameHi || "",
      nameSanskrit: f.nameSanskrit || "",
      slug: f.slug || "",
      category: f.category || "FESTIVAL",
      description: f.description || "",
      descriptionHi: f.descriptionHi || "",
      significance: f.significance || "",
      significanceHi: f.significanceHi || "",
      deitiesStr: Array.isArray(f.deities) ? f.deities.join(", ") : "",
      pujaVidhi: f.pujaVidhi || "",
      pujaVidhiHi: f.pujaVidhiHi || "",
      vrataRules: f.vrataRules || "",
      vrataRulesHi: f.vrataRulesHi || "",
      isPublished: f.isPublished ?? true,
      status: f.status || "PUBLISHED",
      rule: f.rule
        ? {
            lunarMonth: f.rule.lunarMonth || "ALL",
            paksha: f.rule.paksha || "BOTH",
            tithi: f.rule.tithi || 1,
            determinationRule: f.rule.determinationRule || "UDAYA_TITHI",
            traditionConvention: f.rule.traditionConvention || "ALL",
            solarSign: f.rule.solarSign || "",
            isRecurringMonthly: !!f.rule.isRecurringMonthly,
          }
        : initialForm.rule,
      scriptureReference:
        f.scriptureReferences && f.scriptureReferences.length > 0
          ? {
              bookSlug: f.scriptureReferences[0].bookSlug || "brihat-parashara-hora-shastra",
              bookTitle: f.scriptureReferences[0].bookTitle || "Brihat Parashara Hora Shastra",
              chapterTitle: f.scriptureReferences[0].chapterTitle || "",
              verseNumber: f.scriptureReferences[0].verseNumber || "",
              pageNumber: f.scriptureReferences[0].pageNumber || 1,
              shlokaSanskrit: f.scriptureReferences[0].shlokaSanskrit || "",
              translationEn: f.scriptureReferences[0].translationEn || "",
              translationHi: f.scriptureReferences[0].translationHi || "",
              readerUrl: f.scriptureReferences[0].readerUrl || "",
            }
          : initialForm.scriptureReference,
    });
    setErrorMsg("");
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg("");

      const payload = {
        ...formData,
        deities: formData.deitiesStr
          ? formData.deitiesStr.split(",").map((d) => d.trim()).filter(Boolean)
          : [],
      };

      const url = editingFestival
        ? `/api/admin/festivals/${editingFestival.id}`
        : "/api/admin/festivals";
      const method = editingFestival ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save festival");
      }

      setSuccessMsg(editingFestival ? "Festival updated!" : "Festival created!");
      setTimeout(() => setSuccessMsg(""), 3500);

      // Refresh list
      const refRes = await fetch("/api/admin/festivals");
      const refData = await refRes.json();
      if (refData.success) {
        setFestivals(refData.festivals);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Save festival error:", err);
      setErrorMsg(err.message || "Failed to save festival");
    } finally {
      setSaving(false);
    }
  };

  // Delete Festival
  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete festival "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/festivals/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setFestivals(festivals.filter((f) => f.id !== id));
      } else {
        alert(data.error || "Failed to delete festival");
      }
    } catch {
      alert("Error deleting festival");
    }
  };

  // Filtered List
  const filtered = festivals.filter((f) => {
    if (selectedCategory !== "ALL" && f.category !== selectedCategory) return false;
    if (selectedStatus !== "ALL" && f.status !== selectedStatus) return false;
    if (search) {
      const q = search.toLowerCase();
      const matchName = f.name?.toLowerCase().includes(q);
      const matchHi = f.nameHi?.toLowerCase().includes(q);
      const matchSlug = f.slug?.toLowerCase().includes(q);
      if (!matchName && !matchHi && !matchSlug) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#c4903c] uppercase tracking-wider">
              Scholarly Calendar Studio
            </span>
            <span className="text-xs text-stone-300">•</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>RBAC & Audit Verified</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">
            Vedic Festival & Observance Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure astronomical festival determination rules, regional traditions, and verified 3D reader manuscript citations.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#13382c] text-white hover:bg-[#1a4a3b] text-xs font-semibold shadow-xs transition cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#d4a359]" />
          <span>Add Vedic Festival</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#ede5d6] shadow-2xs">
          <span className="text-[11px] font-semibold text-stone-400 block uppercase">Total Observances</span>
          <span className="text-2xl font-bold font-serif text-stone-900 mt-1 block">{festivals.length}</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#ede5d6] shadow-2xs">
          <span className="text-[11px] font-semibold text-stone-400 block uppercase">Published</span>
          <span className="text-2xl font-bold font-serif text-emerald-800 mt-1 block">
            {festivals.filter((f) => f.isPublished).length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#ede5d6] shadow-2xs">
          <span className="text-[11px] font-semibold text-stone-400 block uppercase">Manuscript Citations</span>
          <span className="text-2xl font-bold font-serif text-[#c4903c] mt-1 block">
            {festivals.reduce((acc, f) => acc + (f.scriptureReferences?.length || 0), 0)}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-[#ede5d6] shadow-2xs">
          <span className="text-[11px] font-semibold text-stone-400 block uppercase">Monthly Vrats</span>
          <span className="text-2xl font-bold font-serif text-purple-900 mt-1 block">
            {festivals.filter((f) => f.rule?.isRecurringMonthly).length}
          </span>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#ede5d6] p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search festival by English name, Hindi name, or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#faf7f0] border border-[#ede5d6] text-xs text-stone-900 focus:outline-none focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#faf7f0] border border-[#ede5d6] text-xs text-stone-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="FESTIVAL">Festivals</option>
            <option value="VRATA">Vrats & Fasts</option>
            <option value="JAYANTI">Jayantis</option>
            <option value="SANKRANTI">Sankrantis</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#faf7f0] border border-[#ede5d6] text-xs text-stone-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 3. Festivals Table */}
      <div className="bg-white rounded-2xl border border-[#ede5d6] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#faf7f0] border-b border-[#ede5d6] text-stone-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Festival Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Astronomical Rule</th>
                <th className="py-3 px-4">Determination Rule</th>
                <th className="py-3 px-4">Citations</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ede5d6]">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-[#faf7f0]/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold font-serif text-stone-900 text-sm">{f.name}</div>
                    <div className="text-[11px] text-[#c4903c]">{f.nameHi} • {f.slug}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 border border-stone-200 uppercase">
                      {f.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-700">
                    {f.rule?.solarSign ? (
                      <span className="font-semibold text-orange-900">Solar: {f.rule.solarSign}</span>
                    ) : f.rule?.isRecurringMonthly ? (
                      <span className="font-semibold text-purple-900">Every Month (Tithi {f.rule?.tithi})</span>
                    ) : (
                      <span>
                        {f.rule?.lunarMonth} • {f.rule?.paksha} Tithi {f.rule?.tithi}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">
                    {f.rule?.determinationRule || "UDAYA_TITHI"}
                  </td>
                  <td className="py-3.5 px-4">
                    {f.scriptureReferences && f.scriptureReferences.length > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#13382c]">
                        <BookOpen className="w-3.5 h-3.5 text-[#c4903c]" />
                        <span>{f.scriptureReferences.length} verified</span>
                      </span>
                    ) : (
                      <span className="text-stone-400">None</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        f.isPublished
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-stone-200 text-stone-700"
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(f)}
                      className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition cursor-pointer"
                      title="Edit Festival"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(f.id, f.name)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Festival"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Create / Edit Festival Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-[#ede5d6] shadow-2xl max-w-2xl w-full p-6 sm:p-7 space-y-5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ede5d6] pb-3">
              <div>
                <h3 className="text-base font-bold font-serif text-stone-900">
                  {editingFestival ? `Edit Festival: ${editingFestival.name}` : "Create New Vedic Festival"}
                </h3>
                <p className="text-[11px] text-stone-500">
                  Configure astronomical rules, traditional Puja Vidhi, and classical manuscript citations.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Row 1: Names & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Festival Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs"
                    placeholder="e.g. Maha Shivaratri"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Hindi Name (हिंदी)</label>
                  <input
                    type="text"
                    value={formData.nameHi}
                    onChange={(e) => setFormData({ ...formData, nameHi: e.target.value })}
                    className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs"
                    placeholder="e.g. महाशिवरात्रि"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingFestival}
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs disabled:opacity-60"
                    placeholder="e.g. maha-shivaratri"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="FESTIVAL">Festival</option>
                    <option value="VRATA">Vrata (Fast)</option>
                    <option value="JAYANTI">Jayanti</option>
                    <option value="SANKRANTI">Sankranti</option>
                    <option value="REGIONAL">Regional</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Publication Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value, isPublished: e.target.value === "PUBLISHED" })}
                    className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              {/* Astronomical Determination Rule Section */}
              <div className="p-3.5 rounded-2xl bg-[#faf5eb] border border-[#ede2cc] space-y-3">
                <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px] block">
                  Panchang Determination Rule
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">Lunar Month</label>
                    <select
                      value={formData.rule.lunarMonth}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rule: { ...formData.rule, lunarMonth: e.target.value },
                        })
                      }
                      className="w-full bg-white border border-[#ede5d6] rounded-xl px-2 py-1.5 text-xs"
                    >
                      <option value="ALL">ALL (Monthly)</option>
                      <option value="Chaitra">Chaitra</option>
                      <option value="Vaishakha">Vaishakha</option>
                      <option value="Jyeshtha">Jyeshtha</option>
                      <option value="Ashadha">Ashadha</option>
                      <option value="Shravana">Shravana</option>
                      <option value="Bhadrapada">Bhadrapada</option>
                      <option value="Ashwina">Ashwina</option>
                      <option value="Kartika">Kartika</option>
                      <option value="Margashirsha">Margashirsha</option>
                      <option value="Pausha">Pausha</option>
                      <option value="Magha">Magha</option>
                      <option value="Phalguna">Phalguna</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">Paksha</label>
                    <select
                      value={formData.rule.paksha}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rule: { ...formData.rule, paksha: e.target.value },
                        })
                      }
                      className="w-full bg-white border border-[#ede5d6] rounded-xl px-2 py-1.5 text-xs"
                    >
                      <option value="Shukla">Shukla</option>
                      <option value="Krishna">Krishna</option>
                      <option value="BOTH">Both Pakshas</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">Tithi (1-30)</label>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={formData.rule.tithi}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rule: { ...formData.rule, tithi: parseInt(e.target.value, 10) },
                        })
                      }
                      className="w-full bg-white border border-[#ede5d6] rounded-xl px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">Rule Method</label>
                    <select
                      value={formData.rule.determinationRule}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rule: { ...formData.rule, determinationRule: e.target.value },
                        })
                      }
                      className="w-full bg-white border border-[#ede5d6] rounded-xl px-2 py-1.5 text-xs"
                    >
                      <option value="UDAYA_TITHI">Udaya Tithi (Sunrise)</option>
                      <option value="PRADOSHA_KAAL">Pradosha Kaal (Twilight)</option>
                      <option value="NISHITA_KAAL">Nishita Kaal (Midnight)</option>
                      <option value="MADHYAHNA_KAAL">Madhyahna (Solar Noon)</option>
                      <option value="APARAHNA_KAAL">Aparahna (Afternoon)</option>
                      <option value="SANKRANTI_ENTRY">Sankranti (Solar)</option>
                      <option value="ARUNODAYA_EKADASHI">Arunodaya Ekadashi</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Significance & Puja Vidhi */}
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Spiritual Significance</label>
                <textarea
                  rows={2}
                  value={formData.significance}
                  onChange={(e) => setFormData({ ...formData, significance: e.target.value })}
                  className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl p-2.5 text-xs"
                  placeholder="Explain historical and traditional significance..."
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Puja Vidhi (Step-by-Step Instructions)</label>
                <textarea
                  rows={3}
                  value={formData.pujaVidhi}
                  onChange={(e) => setFormData({ ...formData, pujaVidhi: e.target.value })}
                  className="w-full bg-[#faf7f0] border border-[#ede5d6] rounded-xl p-2.5 text-xs"
                  placeholder="1. Sacred bath... 2. Establish altar... 3. Aarti..."
                />
              </div>

              {/* Verified Scripture Reference */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-2.5">
                <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] block flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Attach Verified Manuscript Reference (3D Reader Link)</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[11px] font-semibold text-emerald-900 block mb-1">Book</label>
                    <select
                      value={formData.scriptureReference.bookSlug}
                      onChange={(e) => {
                        const slug = e.target.value;
                        const title =
                          slug === "phaladeepika"
                            ? "Phaladeepika"
                            : slug === "arogyanidhii"
                            ? "Arogyanidhii"
                            : "Brihat Parashara Hora Shastra";
                        setFormData({
                          ...formData,
                          scriptureReference: {
                            ...formData.scriptureReference,
                            bookSlug: slug,
                            bookTitle: title,
                            readerUrl: `/library/${slug}/pdf?page=${formData.scriptureReference.pageNumber || 1}`,
                          },
                        });
                      }}
                      className="w-full bg-white border border-emerald-200 rounded-xl px-2 py-1.5 text-xs"
                    >
                      <option value="brihat-parashara-hora-shastra">Brihat Parashara Hora Shastra</option>
                      <option value="phaladeepika">Phaladeepika</option>
                      <option value="arogyanidhii">Arogyanidhii</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-emerald-900 block mb-1">Page Number</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.scriptureReference.pageNumber}
                      onChange={(e) => {
                        const p = parseInt(e.target.value, 10) || 1;
                        setFormData({
                          ...formData,
                          scriptureReference: {
                            ...formData.scriptureReference,
                            pageNumber: p,
                            readerUrl: `/library/${formData.scriptureReference.bookSlug}/pdf?page=${p}`,
                          },
                        });
                      }}
                      className="w-full bg-white border border-emerald-200 rounded-xl px-2 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-emerald-900 block mb-1">Verse Number</label>
                    <input
                      type="text"
                      value={formData.scriptureReference.verseNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scriptureReference: {
                            ...formData.scriptureReference,
                            verseNumber: e.target.value,
                          },
                        })
                      }
                      className="w-full bg-white border border-emerald-200 rounded-xl px-2 py-1.5 text-xs"
                      placeholder="e.g. Shloka 14"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-emerald-900 block mb-1">Sanskrit Shloka</label>
                  <input
                    type="text"
                    value={formData.scriptureReference.shlokaSanskrit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        scriptureReference: {
                          ...formData.scriptureReference,
                          shlokaSanskrit: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 text-xs"
                    placeholder="Sanskrit verse text..."
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#ede5d6]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#13382c] text-white text-xs font-semibold shadow-xs hover:bg-[#1a4a3b] transition cursor-pointer flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingFestival ? "Save Changes" : "Create Festival"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
