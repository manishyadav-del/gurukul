"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Upload,
  Download,
  FileCheck,
  RefreshCw,
  Search,
  Filter,
  ArrowLeft,
  ExternalLink,
  Loader2,
  Check,
} from "lucide-react";

export default function ManuscriptStudioClient({ bookId, initialBook = null }) {
  const [activeTab, setActiveTab] = useState("pages"); // 'pages' | 'structure' | 'explanations' | 'publishing'
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState(initialBook);
  const [pages, setPages] = useState([]);
  const [structureTree, setStructureTree] = useState([]);
  const [explanations, setExplanations] = useState([]);
  const [manifests, setManifests] = useState([]);
  const [selectedPages, setSelectedPages] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filter state for pages
  const [pageFilter, setPageFilter] = useState("ALL"); // 'ALL' | 'VERIFIED' | 'UNREVIEWED' | 'EXCLUDED' | 'PUBLISHED'
  const [pageSearch, setPageSearch] = useState("");

  // Modal / form state for structure
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [sectionForm, setSectionForm] = useState({
    title: "",
    sanskritTitle: "",
    hindiTitle: "",
    englishTitle: "",
    structuralType: "ADHYAYA",
    parentId: "",
    startPage: "",
    endPage: "",
  });

  // Modal / form state for explanations
  const [showAddExplanationModal, setShowAddExplanationModal] = useState(false);
  const [explanationForm, setExplanationForm] = useState({
    pageNumber: "",
    explanationType: "COMMENTARY",
    content: "",
    language: "en",
  });

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Fetch Pages Data
  const loadPages = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/manuscript/${bookId}/pages`);
      if (!res.ok) throw new Error("Failed to load manuscript pages");
      const data = await res.json();
      setBook(data.book);
      setPages(data.pages || []);
    } catch (err) {
      showToast("error", err.message);
    }
  }, [bookId]);

  // 2. Fetch Structure Data
  const loadStructure = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/manuscript/${bookId}/structure`);
      if (!res.ok) throw new Error("Failed to load manuscript structure");
      const data = await res.json();
      setStructureTree(data.tree || []);
    } catch (err) {
      showToast("error", err.message);
    }
  }, [bookId]);

  // 3. Fetch Explanations Data
  const loadExplanations = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/manuscript/${bookId}/explanations`);
      if (!res.ok) throw new Error("Failed to load explanations");
      const data = await res.json();
      setExplanations(data.explanations || []);
    } catch (err) {
      showToast("error", err.message);
    }
  }, [bookId]);

  // 4. Fetch Publication Manifests
  const loadManifests = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/manuscript/${bookId}/publish`);
      if (!res.ok) throw new Error("Failed to load publication history");
      const data = await res.json();
      setManifests(data.manifests || []);
    } catch (err) {
      showToast("error", err.message);
    }
  }, [bookId]);

  // Initial load
  useEffect(() => {
    async function init() {
      setLoading(true);
      await Promise.allSettled([loadPages(), loadStructure(), loadExplanations(), loadManifests()]);
      setLoading(false);
    }
    init();
  }, [loadPages, loadStructure, loadExplanations, loadManifests]);

  // Handle Page Action (Approve, Exclude, Publish, etc.)
  const handlePageAction = async (action, pageNumbers) => {
    if (!pageNumbers || pageNumbers.length === 0) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/manuscript/${bookId}/pages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageNumbers,
          action,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update pages");
      showToast("success", `Updated ${data.updatedCount || pageNumbers.length} page(s) successfully`);
      setSelectedPages(new Set());
      await loadPages();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Section Creation / Update
  const handleSaveSection = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const isEditing = Boolean(editingSection);
      const url = `/api/admin/manuscript/${bookId}/structure`;
      const method = isEditing ? "PUT" : "POST";
      const payload = isEditing ? { sectionId: editingSection.id, ...sectionForm } : sectionForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save section");

      showToast("success", isEditing ? "Section updated" : "Section created");
      setShowAddSectionModal(false);
      setEditingSection(null);
      setSectionForm({
        title: "",
        sanskritTitle: "",
        hindiTitle: "",
        englishTitle: "",
        structuralType: "ADHYAYA",
        parentId: "",
        startPage: "",
        endPage: "",
      });
      await loadStructure();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Section Deletion
  const handleDeleteSection = async (sectionId) => {
    if (!confirm("Are you sure you want to delete this structural section?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/manuscript/${bookId}/structure?sectionId=${sectionId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete section");
      showToast("success", "Section removed");
      await loadStructure();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Explanation Action (Approve, Reject, Publish)
  const handleExplanationAction = async (explanationId, action, extra = {}) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/manuscript/${bookId}/explanations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ explanationId, action, ...extra }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update explanation");
      showToast("success", `Explanation ${action}d successfully`);
      await loadExplanations();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Publish Artifact Generation
  const handlePublishArtifact = async () => {
    if (!confirm("Compile and release a new verified publication PDF containing only approved pages?")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/manuscript/${bookId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notes: "Scholarly Council release via Admin Studio",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publication artifact generation failed");
      showToast("success", data.message || "Verified publication artifact compiled successfully!");
      await loadManifests();
      await loadPages();
    } catch (err) {
      showToast("error", err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered pages for grid
  const filteredPages = pages.filter((p) => {
    if (pageFilter === "VERIFIED" && !["VERIFIED", "VERIFIED_WITH_CORRECTIONS"].includes(p.verificationStatus)) return false;
    if (pageFilter === "UNREVIEWED" && p.verificationStatus !== "UNREVIEWED") return false;
    if (pageFilter === "EXCLUDED" && p.isIncluded !== false) return false;
    if (pageFilter === "PUBLISHED" && (!p.isPublished || !p.isIncluded)) return false;
    if (pageSearch) {
      const q = pageSearch.toLowerCase();
      const numMatch = String(p.pageNumber).includes(q);
      const textMatch = (p.proofreadText || p.cleanedText || p.rawText || "").toLowerCase().includes(q);
      if (!numMatch && !textMatch) return false;
    }
    return true;
  });

  const togglePageSelection = (pageNum) => {
    const next = new Set(selectedPages);
    if (next.has(pageNum)) next.delete(pageNum);
    else next.add(pageNum);
    setSelectedPages(next);
  };

  const selectAllFiltered = () => {
    if (selectedPages.size === filteredPages.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(filteredPages.map((p) => p.pageNumber)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2 ${
            notification.type === "success"
              ? "bg-emerald-950 text-emerald-100 border-emerald-600/40"
              : "bg-rose-950 text-rose-100 border-rose-600/40"
          }`}
        >
          {notification.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Header & Breadcrumb */}
      <div className="bg-[#13382c] text-white p-6 rounded-2xl border border-[#d4a359]/30 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-amber-200/80 font-mono">
              <Link href="/admin/books" className="hover:underline flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Books
              </Link>
              <span>/</span>
              <span>{book?.title || "Manuscript"}</span>
              <span>/</span>
              <span className="text-white font-semibold">Manuscript Control Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white flex items-center gap-3">
              <span>{book?.title || "Vedic Digital Manuscript"}</span>
              <span className="text-xs px-2.5 py-1 rounded-full font-mono border border-amber-400/40 bg-amber-400/10 text-amber-300">
                Scholarly Control Center
              </span>
            </h1>
            <p className="text-xs text-stone-300 max-w-2xl">
              Configure granular Vedic hierarchy, inspect and verify individual PDF pages, review AI vs traditional explanations, and compile publication-grade verified PDF artifacts.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/library/${book?.slug || bookId}/pdf`}
              target="_blank"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Open 3D Reader</span>
            </Link>

            <button
              onClick={handlePublishArtifact}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-[#d4a359] hover:bg-[#c49247] text-stone-950 text-xs font-serif font-bold shadow-md flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
            >
              {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>Compile & Publish Artifact</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-white/10 text-xs font-medium">
          <button
            onClick={() => setActiveTab("pages")}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === "pages"
                ? "bg-[#d4a359] text-stone-950 font-bold shadow-xs"
                : "text-stone-200 hover:bg-white/10"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Page Verification & Inclusion ({pages.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("structure")}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === "structure"
                ? "bg-[#d4a359] text-stone-950 font-bold shadow-xs"
                : "text-stone-200 hover:bg-white/10"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Vedic Hierarchy Builder</span>
          </button>

          <button
            onClick={() => setActiveTab("explanations")}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === "explanations"
                ? "bg-[#d4a359] text-stone-950 font-bold shadow-xs"
                : "text-stone-200 hover:bg-white/10"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Scholarly Explanations Studio ({explanations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("publishing")}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer ${
              activeTab === "publishing"
                ? "bg-[#d4a359] text-stone-950 font-bold shadow-xs"
                : "text-stone-200 hover:bg-white/10"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Publication Manifests ({manifests.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PAGE VERIFICATION & INCLUSION GRID */}
      {activeTab === "pages" && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-6">
          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search page or text..."
                  value={pageSearch}
                  onChange={(e) => setPageSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-600 w-44 sm:w-56"
                />
              </div>

              <select
                value={pageFilter}
                onChange={(e) => setPageFilter(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-xl border border-stone-200 focus:outline-hidden text-stone-700 bg-white"
              >
                <option value="ALL">All Pages ({pages.length})</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="UNREVIEWED">Unreviewed Only</option>
                <option value="PUBLISHED">Published Only</option>
                <option value="EXCLUDED">Excluded Only</option>
              </select>

              <button
                onClick={selectAllFiltered}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold cursor-pointer"
              >
                {selectedPages.size === filteredPages.length ? "Deselect All" : `Select All (${filteredPages.length})`}
              </button>
            </div>

            {/* Batch Actions for Selected Pages */}
            {selectedPages.size > 0 && (
              <div className="flex items-center gap-2 bg-amber-50 p-1.5 rounded-xl border border-amber-200">
                <span className="text-xs font-mono font-bold text-amber-900 px-2">
                  {selectedPages.size} selected:
                </span>
                <button
                  onClick={() => handlePageAction("approve", Array.from(selectedPages))}
                  disabled={actionLoading}
                  className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3" /> Approve
                </button>
                <button
                  onClick={() => handlePageAction("exclude", Array.from(selectedPages))}
                  disabled={actionLoading}
                  className="px-2.5 py-1 rounded-lg bg-rose-700 hover:bg-rose-800 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <XCircle className="w-3 h-3" /> Exclude
                </button>
                <button
                  onClick={() => handlePageAction("include", Array.from(selectedPages))}
                  disabled={actionLoading}
                  className="px-2.5 py-1 rounded-lg bg-stone-700 hover:bg-stone-800 text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3 h-3" /> Include
                </button>
              </div>
            )}
          </div>

          {/* Page Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredPages.map((page) => {
              const isSelected = selectedPages.has(page.pageNumber);
              const isVerified = ["VERIFIED", "VERIFIED_WITH_CORRECTIONS"].includes(page.verificationStatus);
              const isExcluded = page.isIncluded === false;
              const isPublished = page.isPublished && !isExcluded;

              return (
                <div
                  key={page.id}
                  onClick={() => togglePageSelection(page.pageNumber)}
                  className={`group relative rounded-xl border p-3 flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? "ring-2 ring-amber-600 bg-amber-50/40 border-amber-500"
                      : isExcluded
                      ? "bg-stone-50 border-stone-200 opacity-60"
                      : "bg-white hover:border-amber-400 border-stone-200 shadow-2xs hover:shadow-xs"
                  }`}
                >
                  {/* Thumbnail / Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-stone-900">
                        Page {page.pageNumber}
                      </span>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                      />
                    </div>

                    {/* Page Thumbnail Preview or Placeholder */}
                    <div className="h-32 rounded-lg bg-[#fcfbf9] border border-stone-200 flex flex-col items-center justify-center p-2 text-center overflow-hidden relative">
                      {page.imageUrl ? (
                        <img
                          src={page.imageUrl}
                          alt={`Page ${page.pageNumber}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <p className="text-[10px] text-stone-500 line-clamp-4 font-serif">
                          {page.proofreadText || page.cleanedText || page.rawText || "No text extracted"}
                        </p>
                      )}

                      {/* Excluded Overlay */}
                      {isExcluded && (
                        <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white font-mono text-[10px] font-bold">
                          EXCLUDED
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-stone-100 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-1.5 py-0.5 rounded font-mono font-semibold ${
                          isVerified
                            ? "bg-emerald-100 text-emerald-800"
                            : page.verificationStatus === "REJECTED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {page.verificationStatus}
                      </span>

                      <span
                        className={`px-1.5 py-0.5 rounded font-mono ${
                          isPublished
                            ? "bg-blue-100 text-blue-800"
                            : "bg-stone-200 text-stone-600"
                        }`}
                      >
                        {isPublished ? "PUBLISHED" : "HIDDEN"}
                      </span>
                    </div>

                    {/* Quick 1-click toggles */}
                    <div className="flex items-center gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handlePageAction(isVerified ? "reject" : "approve", [page.pageNumber])}
                        className={`flex-1 py-1 rounded text-[10px] font-semibold border transition cursor-pointer ${
                          isVerified
                            ? "border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                            : "border-stone-300 text-stone-700 hover:bg-stone-100"
                        }`}
                        title="Toggle Verification"
                      >
                        {isVerified ? "Verified ✓" : "Verify"}
                      </button>

                      <button
                        onClick={() => handlePageAction(isExcluded ? "include" : "exclude", [page.pageNumber])}
                        className={`py-1 px-2 rounded text-[10px] font-semibold border transition cursor-pointer ${
                          isExcluded
                            ? "border-rose-300 text-rose-700 bg-rose-50 hover:bg-rose-100"
                            : "border-stone-200 text-stone-500 hover:bg-stone-100"
                        }`}
                        title={isExcluded ? "Include in Publication" : "Exclude from Publication"}
                      >
                        {isExcluded ? "Excluded" : "Exclude"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: VEDIC HIERARCHY BUILDER */}
      {activeTab === "structure" && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Manuscript Structural Tree
              </h3>
              <p className="text-xs text-stone-500">
                Organize this treatise into configurable Vedic units (Grantha → Kanda / Bhaga → Adhyaya → Prakarana → Shloka).
              </p>
            </div>

            <button
              onClick={() => {
                setEditingSection(null);
                setSectionForm({
                  title: "",
                  sanskritTitle: "",
                  hindiTitle: "",
                  englishTitle: "",
                  structuralType: "ADHYAYA",
                  parentId: "",
                  startPage: "",
                  endPage: "",
                });
                setShowAddSectionModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Add Structural Section</span>
            </button>
          </div>

          {/* Tree View */}
          {structureTree.length === 0 ? (
            <div className="py-12 text-center text-stone-500 space-y-3">
              <Layers className="w-10 h-10 mx-auto text-stone-300" />
              <p className="text-sm font-serif">No custom hierarchical sections configured yet.</p>
              <button
                onClick={() => setShowAddSectionModal(true)}
                className="px-4 py-2 rounded-xl border border-stone-300 hover:border-amber-600 text-xs font-semibold text-stone-700 transition"
              >
                Create First Section (e.g. Kanda or Adhyaya)
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {structureTree.map((node) => (
                <StructureNodeCard
                  key={node.id}
                  node={node}
                  onEdit={(sec) => {
                    setEditingSection(sec);
                    setSectionForm({
                      title: sec.title || "",
                      sanskritTitle: sec.sanskritTitle || "",
                      hindiTitle: sec.hindiTitle || "",
                      englishTitle: sec.englishTitle || "",
                      structuralType: sec.structuralType || "ADHYAYA",
                      parentId: sec.parentId || "",
                      startPage: sec.startPage || "",
                      endPage: sec.endPage || "",
                    });
                    setShowAddSectionModal(true);
                  }}
                  onDelete={handleDeleteSection}
                  onAddChild={(parent) => {
                    setEditingSection(null);
                    setSectionForm({
                      title: "",
                      sanskritTitle: "",
                      hindiTitle: "",
                      englishTitle: "",
                      structuralType: parent.structuralType === "KANDA" ? "ADHYAYA" : "PRAKARANA",
                      parentId: parent.id,
                      startPage: parent.startPage || "",
                      endPage: parent.endPage || "",
                    });
                    setShowAddSectionModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SCHOLARLY EXPLANATIONS STUDIO */}
      {activeTab === "explanations" && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Scholarly Commentary & Explanation Review
              </h3>
              <p className="text-xs text-stone-500">
                Audit council commentary, approve verified translations, and gate AI drafts from public exposure.
              </p>
            </div>

            <button
              onClick={() => setShowAddExplanationModal(true)}
              className="px-4 py-2 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#d4a359]" />
              <span>Add Scholarly Commentary</span>
            </button>
          </div>

          {explanations.length === 0 ? (
            <div className="py-12 text-center text-stone-500 space-y-2">
              <Sparkles className="w-8 h-8 mx-auto text-amber-500/40" />
              <p className="text-sm font-serif">No verified explanations recorded yet.</p>
              <span className="text-xs text-stone-400">
                Explanations generated via the 3D Reader AI will appear here for scholarly review and publication approval.
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              {explanations.map((exp) => {
                const isVerified = ["VERIFIED", "VERIFIED_WITH_CORRECTIONS"].includes(exp.status);
                return (
                  <div
                    key={exp.id}
                    className="p-5 rounded-2xl border border-stone-200 bg-stone-50/50 hover:bg-stone-50 transition space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#13382c] text-[#d4a359]">
                          {exp.explanationType}
                        </span>
                        {exp.pageNumber && (
                          <span className="text-xs font-mono text-stone-500">
                            Page {exp.pageNumber}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                            isVerified
                              ? "bg-emerald-100 text-emerald-800"
                              : exp.status === "REJECTED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {exp.status}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                            exp.isPublished
                              ? "bg-blue-100 text-blue-800"
                              : "bg-stone-200 text-stone-600"
                          }`}
                        >
                          {exp.isPublished ? "PUBLISHED" : "UNPUBLISHED"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isVerified && (
                          <button
                            onClick={() => handleExplanationAction(exp.id, "approve")}
                            className="px-3 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
                          >
                            Approve & Publish
                          </button>
                        )}
                        {exp.isPublished ? (
                          <button
                            onClick={() => handleExplanationAction(exp.id, "unpublish")}
                            className="px-3 py-1 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                          >
                            Unpublish
                          </button>
                        ) : (
                          <button
                            onClick={() => handleExplanationAction(exp.id, "publish")}
                            className="px-3 py-1 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold cursor-pointer"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => handleExplanationAction(exp.id, "reject")}
                          className="px-3 py-1 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs font-serif leading-relaxed text-stone-800 whitespace-pre-wrap">
                      {exp.content}
                    </div>

                    {exp.reviewerEmail && (
                      <p className="text-[11px] font-mono text-stone-400">
                        Reviewer: {exp.reviewerEmail} • Version {exp.version}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PUBLICATION MANIFESTS & ARTIFACT RELEASE */}
      {activeTab === "publishing" && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-stone-100">
            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">
                Verified PDF Publication Manifests
              </h3>
              <p className="text-xs text-stone-500">
                Release artifacts contain strictly approved pages with cryptographic checksums and immutable audit trails.
              </p>
            </div>

            <button
              onClick={handlePublishArtifact}
              disabled={actionLoading}
              className="px-4 py-2 rounded-xl bg-[#d4a359] hover:bg-[#c49247] text-stone-950 text-xs font-serif font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Compile New Release Version</span>
            </button>
          </div>

          {manifests.length === 0 ? (
            <div className="py-12 text-center text-stone-500 space-y-3">
              <FileCheck className="w-10 h-10 mx-auto text-stone-300" />
              <p className="text-sm font-serif">No publication manifests compiled yet.</p>
              <button
                onClick={handlePublishArtifact}
                className="px-4 py-2 rounded-xl bg-[#13382c] text-white text-xs font-semibold"
              >
                Compile Initial Publication (v1)
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {manifests.map((man) => (
                <div
                  key={man.id}
                  className="p-5 rounded-2xl border border-stone-200 bg-[#fdfbf7] flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-serif font-bold text-base text-stone-900">
                        Edition Release v{man.version}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                        {man.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 font-serif">
                      {man.notes || "Scholarly Council publication"}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-stone-400">
                      <span>Pages: {man.pageCount}</span>
                      <span>•</span>
                      <span>Published by: {man.publishedBy}</span>
                      <span>•</span>
                      <span>Date: {new Date(man.publishedAt || man.createdAt).toLocaleDateString()}</span>
                    </div>
                    {man.fileHash && (
                      <p className="text-[10px] font-mono text-stone-400 truncate max-w-md">
                        SHA256: {man.fileHash}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {man.publishedPdfPath && (
                      <a
                        href={man.publishedPdfPath}
                        target="_blank"
                        className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:border-amber-600 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition"
                      >
                        <Download className="w-3.5 h-3.5 text-[#d4a359]" />
                        <span>Download PDF</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD / EDIT SECTION */}
      {showAddSectionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-serif font-bold text-base text-stone-900">
              {editingSection ? "Edit Structural Section" : "Add Vedic Manuscript Section"}
            </h3>

            <form onSubmit={handleSaveSection} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Title (Primary) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bala Kanda, Chapter 1, Mangalacharanam"
                  value={sectionForm.title}
                  onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-600 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Sanskrit (Devanagari)</label>
                  <input
                    type="text"
                    placeholder="e.g. मङ्गलाचरणम्"
                    value={sectionForm.sanskritTitle}
                    onChange={(e) => setSectionForm({ ...sectionForm, sanskritTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-hidden text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Hindi Title</label>
                  <input
                    type="text"
                    placeholder="e.g. मंगलाचरण"
                    value={sectionForm.hindiTitle}
                    onChange={(e) => setSectionForm({ ...sectionForm, hindiTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Hierarchy Level</label>
                  <select
                    value={sectionForm.structuralType}
                    onChange={(e) => setSectionForm({ ...sectionForm, structuralType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-hidden text-xs"
                  >
                    <option value="GRANTHA">Grantha (Book/Treatise)</option>
                    <option value="KANDA">Kanda / Bhaga (Part)</option>
                    <option value="ADHYAYA">Adhyaya (Chapter)</option>
                    <option value="PRAKARANA">Prakarana (Section)</option>
                    <option value="SHLOKA_GROUP">Shloka / Passage Group</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Parent Section</label>
                  <select
                    value={sectionForm.parentId}
                    onChange={(e) => setSectionForm({ ...sectionForm, parentId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-hidden text-xs"
                  >
                    <option value="">None (Top Level)</option>
                    {structureTree.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.title} ({sec.structuralType})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Start Page</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={sectionForm.startPage}
                    onChange={(e) => setSectionForm({ ...sectionForm, startPage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">End Page</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="20"
                    value={sectionForm.endPage}
                    onChange={(e) => setSectionForm({ ...sectionForm, endPage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddSectionModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-white font-semibold cursor-pointer"
                >
                  {actionLoading ? "Saving..." : "Save Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SCHOLARLY COMMENTARY */}
      {showAddExplanationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-serif font-bold text-base text-stone-900">
              Add Scholarly Commentary
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setActionLoading(true);
                try {
                  const res = await fetch(`/api/admin/manuscript/${bookId}/explanations`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(explanationForm),
                  });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Failed to create explanation");
                  showToast("success", "Scholarly commentary created and verified");
                  setShowAddExplanationModal(false);
                  setExplanationForm({ pageNumber: "", explanationType: "COMMENTARY", content: "", language: "en" });
                  await loadExplanations();
                } catch (err) {
                  showToast("error", err.message);
                } finally {
                  setActionLoading(false);
                }
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Target Page Number</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 3"
                    value={explanationForm.pageNumber}
                    onChange={(e) => setExplanationForm({ ...explanationForm, pageNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-hidden text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Commentary Type</label>
                  <select
                    value={explanationForm.explanationType}
                    onChange={(e) => setExplanationForm({ ...explanationForm, explanationType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white focus:outline-hidden text-xs"
                  >
                    <option value="COMMENTARY">Traditional Commentary (Bhashya)</option>
                    <option value="WORD_BY_WORD">Word-by-Word (Pada-Artha)</option>
                    <option value="ANVAYA">Syntactic Order (Anvaya)</option>
                    <option value="GRAMMAR">Grammar & Etymology (Vyakarana)</option>
                    <option value="SIMPLE">Plain Translation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Commentary Text *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Enter scholarly explanation, word breakdown, or classical commentary..."
                  value={explanationForm.content}
                  onChange={(e) => setExplanationForm({ ...explanationForm, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-hidden focus:border-amber-600 text-xs font-serif leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddExplanationModal(false)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-white font-semibold cursor-pointer"
                >
                  {actionLoading ? "Saving..." : "Save & Verify"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Recursive Tree Node Card Component for Vedic Structure
 */
function StructureNodeCard({ node, onEdit, onDelete, onAddChild }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {hasChildren && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-stone-200 rounded cursor-pointer"
            >
              {expanded ? <ChevronDown className="w-3.5 h-3.5 text-stone-600" /> : <ChevronRight className="w-3.5 h-3.5 text-stone-600" />}
            </button>
          )}

          <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-[#13382c] text-[#d4a359]">
            {node.structuralType}
          </span>

          <span className="font-serif font-bold text-sm text-stone-900">
            {node.title}
          </span>

          {node.sanskritTitle && (
            <span className="font-serif text-xs text-amber-800">
              ({node.sanskritTitle})
            </span>
          )}

          {node.startPage && (
            <span className="text-[11px] font-mono text-stone-500">
              Pages {node.startPage}{node.endPage ? `–${node.endPage}` : ""}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onAddChild(node)}
            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
            title="Add Child Sub-Section"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Add Child</span>
          </button>

          <button
            onClick={() => onEdit(node)}
            className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg text-xs cursor-pointer"
            title="Edit Section"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onDelete(node.id)}
            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs cursor-pointer"
            title="Delete Section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Nested Children */}
      {hasChildren && expanded && (
        <div className="pl-6 border-l-2 border-[#d4a359]/30 space-y-2 mt-2">
          {node.children.map((child) => (
            <StructureNodeCard
              key={child.id}
              node={child}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}
