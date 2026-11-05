"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  RefreshCw,
  History,
  Layers,
  ChevronDown,
  ChevronRight,
  FileText,
  Save,
  X,
} from "lucide-react";

export default function StructureManager({ bookId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reprocessing, setReprocessing] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterForm, setChapterForm] = useState({ title: "", subheading: "", startPage: 1, endPage: 1, status: "DRAFT" });
  const [editingPassage, setEditingPassage] = useState(null);
  const [passageForm, setPassageForm] = useState({ text: "", passageType: "PARAGRAPH", status: "DRAFT" });
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchStructure();
  }, [bookId]);

  async function fetchStructure() {
    setLoading(true);
    try {
      const res = await fetch(`/api/books/${bookId}/structure`, {
        headers: { "x-user-role": "ADMIN" },
      });
      if (!res.ok) throw new Error("Failed to load book structure");
      const json = await res.json();
      setData(json);

      // Auto-expand all chapters initially
      const initialExpanded = {};
      json.chapters?.forEach((ch) => {
        initialExpanded[ch.id] = true;
      });
      setExpandedChapters(initialExpanded);
    } catch (err) {
      console.error(err);
      showNotification("error", err.message || "Failed to load structure");
    } finally {
      setLoading(false);
    }
  }

  function showNotification(type, message) {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  }

  function toggleChapter(chId) {
    setExpandedChapters((prev) => ({ ...prev, [chId]: !prev[chId] }));
  }

  async function handleReprocess() {
    if (!confirm("Reprocess structuring for this book? This will re-analyze text and boundaries, preserving already-approved passages.")) {
      return;
    }
    setReprocessing(true);
    try {
      const res = await fetch(`/api/books/${bookId}/structure`, {
        method: "POST",
        headers: { "x-user-role": "ADMIN" },
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Structuring failed");
      showNotification("success", `Structured ${result.stats.chaptersCount} chapters and ${result.stats.passagesCount} passages.`);
      fetchStructure();
    } catch (err) {
      showNotification("error", err.message);
    } finally {
      setReprocessing(false);
    }
  }

  function openEditChapter(chapter) {
    setEditingChapter(chapter.id);
    setChapterForm({
      title: chapter.title,
      subheading: chapter.subheading || "",
      startPage: chapter.startPage || 1,
      endPage: chapter.endPage || 1,
      status: chapter.status || "DRAFT",
    });
  }

  async function saveChapter(chapterId) {
    try {
      const res = await fetch(`/api/chapters/${chapterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-role": "ADMIN" },
        body: JSON.stringify(chapterForm),
      });
      if (!res.ok) throw new Error("Failed to update chapter");
      showNotification("success", "Chapter updated successfully");
      setEditingChapter(null);
      fetchStructure();
    } catch (err) {
      showNotification("error", err.message);
    }
  }

  function openEditPassage(passage) {
    setEditingPassage(passage.id);
    setPassageForm({
      text: passage.text,
      passageType: passage.passageType || "PARAGRAPH",
      status: passage.status || "DRAFT",
    });
  }

  async function savePassage(passageId) {
    try {
      const res = await fetch(`/api/passages/${passageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-user-role": "ADMIN" },
        body: JSON.stringify(passageForm),
      });
      if (!res.ok) throw new Error("Failed to update passage");
      showNotification("success", "Passage updated and previous text preserved in audit history");
      setEditingPassage(null);
      fetchStructure();
    } catch (err) {
      showNotification("error", err.message);
    }
  }

  async function deletePassage(passageId) {
    if (!confirm("Are you sure you want to delete this passage?")) return;
    try {
      const res = await fetch(`/api/passages/${passageId}`, {
        method: "DELETE",
        headers: { "x-user-role": "ADMIN" },
      });
      if (!res.ok) throw new Error("Failed to delete passage");
      showNotification("success", "Passage deleted");
      fetchStructure();
    } catch (err) {
      showNotification("error", err.message);
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <RefreshCw className="w-8 h-8 text-amber-700 animate-spin mx-auto mb-3" />
        <p className="text-stone-600 text-sm font-medium">Loading digital book structure...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-stone-700">
        <p>No structure information found.</p>
        <Link href={`/admin/books/${bookId}`} className="text-amber-700 underline text-sm mt-2 inline-block">
          Return to Book Details
        </Link>
      </div>
    );
  }

  const { book, chapters = [], unassignedPassages = [] } = data;
  const totalPassages = chapters.reduce((acc, c) => acc + (c.passages?.length || 0), 0) + unassignedPassages.length;
  const needsReviewCount = chapters.reduce((acc, c) => acc + (c.passages?.filter((p) => p.needsReview || p.status === "DRAFT")?.length || 0), 0);
  const approvedCount = chapters.reduce((acc, c) => acc + (c.passages?.filter((p) => p.status === "APPROVED" || p.status === "PUBLISHED")?.length || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center justify-between border ${
            notification.type === "error"
              ? "bg-rose-50 text-rose-800 border-rose-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <Link
          href={`/admin/books/${bookId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Book Overview</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 font-serif">Digital Book Structure</h1>
            <p className="text-sm text-stone-500 mt-0.5">
              Book: <span className="font-semibold text-stone-800">{book.title}</span> • Status: <span className="font-mono">{book.status}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReprocess}
              disabled={reprocessing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${reprocessing ? "animate-spin" : ""}`} />
              <span>{reprocessing ? "Reprocessing..." : "Reprocess Structure"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-xs text-stone-500 font-medium">Total Chapters</p>
          <p className="text-2xl font-bold text-stone-900 font-serif mt-1">{chapters.length}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <p className="text-xs text-stone-500 font-medium">Total Passages</p>
          <p className="text-2xl font-bold text-stone-900 font-serif mt-1">{totalPassages}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs">
          <p className="text-xs text-amber-700 font-medium">Draft / Pending Review</p>
          <p className="text-2xl font-bold text-amber-700 font-serif mt-1">{needsReviewCount}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <p className="text-xs text-emerald-700 font-medium">Approved / Published</p>
          <p className="text-2xl font-bold text-emerald-700 font-serif mt-1">{approvedCount}</p>
        </div>
      </div>

      {/* Chapters & Passages Hierarchy */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-700" />
            <h2 className="text-lg font-bold text-stone-900 font-serif">Chapters and Content Hierarchy</h2>
          </div>
          <span className="text-xs text-stone-500">
            {chapters.length} chapters organized in reading order
          </span>
        </div>

        {chapters.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-400">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">No chapters detected yet.</p>
            <p className="text-xs text-stone-500 mt-1">Click &quot;Reprocess Structure&quot; above to analyze extracted text into chapters and verses.</p>
          </div>
        ) : (
          chapters.map((ch) => {
            const isExpanded = !!expandedChapters[ch.id];
            const isEditingThisChapter = editingChapter === ch.id;

            return (
              <div key={ch.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                {/* Chapter Header */}
                <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleChapter(ch.id)}
                      className="p-1 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-lg transition"
                    >
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                          Chapter {ch.chapterNumber}
                        </span>
                        <h3 className="font-bold text-stone-900 font-serif text-base">{ch.title}</h3>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Pages {ch.startPage || 1} – {ch.endPage || ch.startPage || 1} • {ch.passages?.length || 0} passages
                        {ch.confidence !== null && (
                          <span className="ml-2 font-mono">
                            (Confidence: {Math.round((ch.confidence || 0) * 100)}%)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ch.status === "APPROVED" || ch.status === "PUBLISHED"
                          ? "bg-emerald-100 text-emerald-800"
                          : ch.status === "REVIEWED"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {ch.status}
                    </span>
                    <button
                      onClick={() => openEditChapter(ch)}
                      className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-lg text-xs transition"
                      title="Edit Chapter Details"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Chapter Edit Form Inline */}
                {isEditingThisChapter && (
                  <div className="p-4 bg-amber-50/50 border-b border-amber-200 space-y-3">
                    <h4 className="text-xs font-bold text-amber-900 uppercase">Edit Chapter Properties</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-stone-600 block mb-1">Chapter Title</label>
                        <input
                          type="text"
                          value={chapterForm.title}
                          onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                          className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-stone-600 block mb-1">Subheading / Description</label>
                        <input
                          type="text"
                          value={chapterForm.subheading}
                          onChange={(e) => setChapterForm({ ...chapterForm, subheading: e.target.value })}
                          className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-[11px] font-medium text-stone-600 block mb-1">Start Page</label>
                          <input
                            type="number"
                            value={chapterForm.startPage}
                            onChange={(e) => setChapterForm({ ...chapterForm, startPage: e.target.value })}
                            className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[11px] font-medium text-stone-600 block mb-1">End Page</label>
                          <input
                            type="number"
                            value={chapterForm.endPage}
                            onChange={(e) => setChapterForm({ ...chapterForm, endPage: e.target.value })}
                            className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-stone-600 block mb-1">Review Status</label>
                        <select
                          value={chapterForm.status}
                          onChange={(e) => setChapterForm({ ...chapterForm, status: e.target.value })}
                          className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="REVIEWED">REVIEWED</option>
                          <option value="APPROVED">APPROVED</option>
                          <option value="PUBLISHED">PUBLISHED</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingChapter(null)}
                        className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200 rounded-lg transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveChapter(ch.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold transition"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Passages List */}
                {isExpanded && (
                  <div className="divide-y divide-stone-100">
                    {ch.passages?.length === 0 ? (
                      <div className="p-6 text-center text-stone-400 text-xs">No passages in this chapter.</div>
                    ) : (
                      ch.passages.map((passage, pIdx) => {
                        const isEditingThisPassage = editingPassage === passage.id;
                        const hasAudit = passage.correctionHistory && passage.correctionHistory.length > 0;

                        return (
                          <div key={passage.id} className="p-4 sm:p-5 hover:bg-stone-50/40 transition">
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[11px] text-stone-400 font-semibold">
                                  #{pIdx + 1}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                                    passage.passageType === "VERSE"
                                      ? "bg-purple-100 text-purple-800 border border-purple-200"
                                      : passage.passageType === "HEADING"
                                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                                      : passage.passageType === "SUBHEADING"
                                      ? "bg-stone-200 text-stone-800"
                                      : passage.passageType === "FOOTNOTE"
                                      ? "bg-rose-100 text-rose-800"
                                      : "bg-stone-100 text-stone-700"
                                  }`}
                                >
                                  {passage.passageType}
                                </span>
                                <span className="text-xs text-stone-500 font-mono">
                                  Source: Page {passage.sourcePage || 1}
                                </span>
                                {passage.needsReview && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                    <AlertCircle className="w-3 h-3" />
                                    <span>Needs Review</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    passage.status === "APPROVED" || passage.status === "PUBLISHED"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : passage.status === "REVIEWED"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {passage.status}
                                </span>
                                <button
                                  onClick={() => openEditPassage(passage)}
                                  className="p-1 text-stone-500 hover:text-stone-800 hover:bg-stone-200 rounded-md transition"
                                  title="Edit Passage"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deletePassage(passage.id)}
                                  className="p-1 text-rose-500 hover:text-rose-800 hover:bg-rose-50 rounded-md transition"
                                  title="Delete Passage"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Passage Content or Edit Form */}
                            {isEditingThisPassage ? (
                              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                                <label className="text-xs font-bold text-amber-900 block">Edit Passage Content</label>
                                <textarea
                                  rows={4}
                                  value={passageForm.text}
                                  onChange={(e) => setPassageForm({ ...passageForm, text: e.target.value })}
                                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white font-sans focus:outline-amber-600"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[11px] font-medium text-stone-600 block mb-1">Passage Type</label>
                                    <select
                                      value={passageForm.passageType}
                                      onChange={(e) => setPassageForm({ ...passageForm, passageType: e.target.value })}
                                      className="w-full text-xs p-1.5 rounded-lg border border-stone-300 bg-white"
                                    >
                                      <option value="PARAGRAPH">PARAGRAPH</option>
                                      <option value="VERSE">VERSE (Shloka/Mantra)</option>
                                      <option value="HEADING">HEADING</option>
                                      <option value="SUBHEADING">SUBHEADING</option>
                                      <option value="CHAPTER_TITLE">CHAPTER_TITLE</option>
                                      <option value="FOOTNOTE">FOOTNOTE</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="text-[11px] font-medium text-stone-600 block mb-1">Status</label>
                                    <select
                                      value={passageForm.status}
                                      onChange={(e) => setPassageForm({ ...passageForm, status: e.target.value })}
                                      className="w-full text-xs p-1.5 rounded-lg border border-stone-300 bg-white"
                                    >
                                      <option value="DRAFT">DRAFT</option>
                                      <option value="REVIEWED">REVIEWED</option>
                                      <option value="APPROVED">APPROVED</option>
                                      <option value="PUBLISHED">PUBLISHED</option>
                                    </select>
                                  </div>
                                </div>
                                <div className="flex justify-end gap-2 pt-1">
                                  <button
                                    onClick={() => setEditingPassage(null)}
                                    className="px-3 py-1 text-xs text-stone-600 hover:bg-stone-200 rounded-lg transition"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => savePassage(passage.id)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-semibold transition"
                                  >
                                    <Save className="w-3.5 h-3.5" />
                                    <span>Save & Audit</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="mt-1">
                                <p
                                  className={`text-xs text-stone-800 whitespace-pre-wrap leading-relaxed ${
                                    passage.passageType === "VERSE"
                                      ? "font-serif text-purple-950 bg-purple-50/50 p-2.5 rounded-lg border-l-2 border-purple-400"
                                      : passage.passageType === "HEADING"
                                      ? "font-bold font-serif text-stone-900"
                                      : ""
                                  }`}
                                >
                                  {passage.text}
                                </p>

                                {/* Audit History Indicator */}
                                {hasAudit && (
                                  <div className="mt-2 text-[11px] text-stone-500 bg-stone-100 p-2 rounded-lg flex items-start gap-2">
                                    <History className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                                    <div>
                                      <span className="font-semibold text-stone-700">Audit History:</span> Previous revision preserved (&quot;
                                      <span className="italic">{passage.correctionHistory[0].previousText.slice(0, 60)}...</span>&quot;) edited by {passage.correctionHistory[0].correctedBy}.
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
