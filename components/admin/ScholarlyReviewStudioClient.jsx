"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  XCircle,
  FileText,
  Search,
  Filter,
  RefreshCw,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Check,
  Edit3,
  Network,
  History,
  Sparkles,
} from "lucide-react";
import VerificationBadge from "@/components/provenance/VerificationBadge.jsx";

export default function ScholarlyReviewStudioClient({
  initialStats = null,
  initialBooks = [],
  currentUser = null,
}) {
  const [activeTab, setActiveTab] = useState("queue"); // queue | inspector | knowledge | stats
  const [stats, setStats] = useState(initialStats);
  const [books] = useState(initialBooks || []);

  // Filter State
  const [selectedStatus, setSelectedStatus] = useState("PENDING_REVIEW");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [page, setPage] = useState(1);

  // Queue State
  const [queue, setQueue] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loadingQueue, setLoadingQueue] = useState(false);

  // Inspector State
  const [selectedPassage, setSelectedPassage] = useState(null);
  const [inspectorData, setInspectorData] = useState(null);
  const [loadingInspector, setLoadingInspector] = useState(false);

  // Editable Form Fields
  const [editText, setEditText] = useState("");
  const [editTransliteration, setEditTransliteration] = useState("");
  const [editHindi, setEditHindi] = useState("");
  const [editEnglish, setEditEnglish] = useState("");
  const [editTranslationSource, setEditTranslationSource] = useState("");
  const [editTranslator, setEditTranslator] = useState("");
  const [editAnvaya, setEditAnvaya] = useState("");
  const [editCommentary, setEditCommentary] = useState("");
  const [editCommentarySource, setEditCommentarySource] = useState("");
  const [editReason, setEditReason] = useState("");
  const [editNotes, setEditNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Knowledge Graph Review State
  const [pendingRelations, setPendingRelations] = useState([]);
  const [loadingRelations, setLoadingRelations] = useState(false);
  const [relationNotes, setRelationNotes] = useState({});

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 4000);
  };

  // Load Queue
  const loadQueue = useCallback(async () => {
    setLoadingQueue(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus && selectedStatus !== "ALL") params.set("status", selectedStatus);
      if (selectedBookId) params.set("bookId", selectedBookId);
      params.set("page", String(page));
      params.set("limit", "15");

      const res = await fetch(`/api/provenance/queue?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setQueue(data.queue || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error("Failed to load verification queue:", err);
    } finally {
      setLoadingQueue(false);
    }
  }, [selectedStatus, selectedBookId, page]);

  // Load Stats
  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/provenance/statistics");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
    }
  }, []);

  // Load Knowledge Graph Pending Relationships
  const loadPendingRelationships = useCallback(async () => {
    setLoadingRelations(true);
    try {
      const res = await fetch("/api/admin/knowledge-graph?view=pending");
      if (res.ok) {
        const data = await res.json();
        setPendingRelations(data.relationships || []);
      }
    } catch (err) {
      console.error("Failed to load knowledge relationships:", err);
    } finally {
      setLoadingRelations(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  useEffect(() => {
    if (activeTab === "knowledge") {
      loadPendingRelationships();
    }
  }, [activeTab, loadPendingRelationships]);

  // Open Passage in Inspector
  const openPassageInspector = async (passageId) => {
    setSelectedPassage(passageId);
    setLoadingInspector(true);
    setActiveTab("inspector");

    try {
      const res = await fetch(`/api/provenance/passage/${passageId}`);
      if (res.ok) {
        const data = await res.json();
        const p = data.provenance;
        setInspectorData(p);
        setEditText(p.contentLayers?.originalText || "");
        setEditTransliteration(p.contentLayers?.transliteration || "");
        setEditHindi(p.contentLayers?.translations?.hindi?.text || "");
        setEditEnglish(p.contentLayers?.translations?.english?.text || "");
        setEditTranslationSource(p.contentLayers?.translations?.hindi?.source || "");
        setEditTranslator(p.contentLayers?.translations?.hindi?.translator || "");
        setEditAnvaya(p.contentLayers?.anvaya || "");
        setEditCommentary(p.contentLayers?.traditionalCommentary?.commentary || "");
        setEditCommentarySource(p.contentLayers?.traditionalCommentary?.source || "");
        setEditNotes(p.verificationAudit?.scholarlyNotes || "");
        setEditReason("");
      }
    } catch (err) {
      showToast("Failed to load passage details for review.");
    } finally {
      setLoadingInspector(false);
    }
  };

  // Submit Review Action
  const handleReviewAction = async (targetStatus) => {
    if (!inspectorData?.passageId) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/provenance/passage/${inspectorData.passageId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: targetStatus,
          correctedText: editText,
          reason: editReason || null,
          scholarlyNotes: editNotes || null,
          transliteration: editTransliteration || null,
          hindiTranslation: editHindi || null,
          englishTranslation: editEnglish || null,
          translationSource: editTranslationSource || null,
          translator: editTranslator || null,
          commentary: editCommentary || null,
          commentarySource: editCommentarySource || null,
          anvaya: editAnvaya || null,
        }),
      });

      if (res.ok) {
        showToast(`Passage successfully updated to ${targetStatus}`);
        loadQueue();
        loadStats();
        // Refresh inspector with new state
        openPassageInspector(inspectorData.passageId);
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to submit verification.");
      }
    } catch (err) {
      showToast("Error executing review operation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Knowledge Relationship Review
  const handleRelationshipAction = async (relationshipId, action) => {
    try {
      const notes = relationNotes[relationshipId] || "";
      const res = await fetch("/api/admin/knowledge-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action === "APPROVE" ? "approve_relationship" : "reject_relationship",
          relationshipId,
          reviewerNotes: notes,
          reason: action === "REJECT" ? notes || "Unverified by scholar" : undefined,
        }),
      });

      if (res.ok) {
        showToast(`Relationship marked as ${action === "APPROVE" ? "APPROVED" : "REJECTED"}`);
        setPendingRelations((prev) => prev.filter((r) => r.id !== relationshipId));
      } else {
        showToast("Failed to update relationship.");
      }
    } catch (err) {
      showToast("Error processing relationship review.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#13382c] text-amber-200 px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/30 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-900 border border-amber-500/20">
              <ShieldCheck className="w-6 h-6 text-emerald-800" />
            </span>
            <div>
              <h1 className="text-2xl font-bold font-serif text-stone-900">
                Scholarly Source Verification Studio
              </h1>
              <p className="text-xs text-stone-500 font-mono">
                Inspect original manuscript folios, verify Sanskrit/Hindi passages, audit OCR accuracy, and validate Knowledge Graph evidence.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-2xl text-xs font-semibold">
          {[
            { id: "queue", label: "Verification Queue", icon: Clock },
            { id: "inspector", label: "Passage Inspector", icon: Edit3 },
            { id: "knowledge", label: "Knowledge Graph Evidence", icon: Network },
            { id: "stats", label: "Scholarly Audit & Metrics", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition ${
                  isActive
                    ? "bg-[#13382c] text-white shadow-xs"
                    : "text-stone-700 hover:text-stone-950 hover:bg-stone-300/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Stats Bar */}
      {stats?.overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold">
              Total Passages
            </span>
            <p className="text-xl font-bold font-serif text-stone-900">
              {stats.overview.totalPassages?.toLocaleString() || 0}
            </p>
            <p className="text-[11px] text-stone-500 font-mono">
              across {stats.overview.totalBooks || 0} manuscripts
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 font-bold">
              Verified Scholarly Text
            </span>
            <p className="text-xl font-bold font-serif text-emerald-800">
              {stats.overview.verifiedTotal?.toLocaleString() || 0}
            </p>
            <p className="text-[11px] text-emerald-600 font-mono">
              {stats.overview.verifiedPercentage || 0}% scholarly coverage
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700 font-bold">
              Pending / Under Review
            </span>
            <p className="text-xl font-bold font-serif text-amber-800">
              {((stats.byStatus?.PENDING_REVIEW || 0) + (stats.byStatus?.UNDER_REVIEW || 0)).toLocaleString()}
            </p>
            <p className="text-[11px] text-amber-600 font-mono">
              awaiting scholar inspection
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-rose-700 font-bold">
              Needs Correction
            </span>
            <p className="text-xl font-bold font-serif text-rose-800">
              {stats.byStatus?.NEEDS_CORRECTION || 0}
            </p>
            <p className="text-[11px] text-rose-600 font-mono">
              flagged for scan defects
            </p>
          </div>
        </div>
      )}

      {/* Tab 1: Verification Queue */}
      {activeTab === "queue" && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-5">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-stone-500 font-mono">Filter Status:</span>
              {[
                { id: "ALL", label: "All Items" },
                { id: "PENDING_REVIEW", label: "Pending Review" },
                { id: "UNDER_REVIEW", label: "Under Review" },
                { id: "NEEDS_CORRECTION", label: "Needs Correction" },
                { id: "VERIFIED", label: "Verified" },
                { id: "UNREVIEWED", label: "OCR Drafts" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    setSelectedStatus(st.id);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedStatus === st.id
                      ? "bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs"
                      : "bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Book Selector */}
            <div className="flex items-center gap-2">
              <select
                value={selectedBookId}
                onChange={(e) => {
                  setSelectedBookId(e.target.value);
                  setPage(1);
                }}
                className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-700 font-medium"
              >
                <option value="">All Manuscripts / Books</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title}
                  </option>
                ))}
              </select>

              <button
                onClick={loadQueue}
                className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
                title="Refresh Queue"
              >
                <RefreshCw className={`w-4 h-4 ${loadingQueue ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Queue List Table */}
          {loadingQueue ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-500 font-mono">Loading verification queue...</p>
            </div>
          ) : queue.length === 0 ? (
            <div className="p-12 text-center space-y-2 text-stone-400">
              <ShieldCheck className="w-10 h-10 mx-auto opacity-30 text-emerald-800" />
              <h3 className="font-bold text-stone-700 text-sm">No Passages Match Selected Filter</h3>
              <p className="text-xs text-stone-500">
                Change the status filter or select another manuscript to view more records.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-[#fcfaf5] border border-stone-200 hover:border-amber-300/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-bold text-sm text-stone-900">
                        {item.bookTitle}
                      </span>
                      <span className="text-stone-300">·</span>
                      <span className="text-xs text-stone-500 font-mono">
                        {item.chapterTitle || "Chapter"} · Page #{item.sourcePage || "N/A"}
                        {item.verseNumber && ` · ${item.verseNumber}`}
                      </span>
                      <VerificationBadge
                        status={item.verificationStatus}
                        ocrConfidence={item.ocrConfidence}
                        showConfidence={true}
                      />
                    </div>

                    <p className="font-serif text-stone-800 text-xs line-clamp-2 leading-relaxed bg-white p-2.5 rounded-xl border border-stone-200/60">
                      {item.text}
                    </p>

                    {item.scholarlyNotes && (
                      <p className="text-[11px] text-amber-900 italic font-mono">
                        Scholar Note: {item.scholarlyNotes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openPassageInspector(item.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-white text-xs font-bold transition shadow-xs"
                    >
                      <span>Inspect & Verify</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-stone-100 text-xs font-mono text-stone-500">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} passages)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Side-by-Side Review Inspector */}
      {activeTab === "inspector" && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-6">
          {!inspectorData ? (
            <div className="p-16 text-center space-y-3 text-stone-400">
              <BookOpen className="w-12 h-12 mx-auto opacity-30 text-amber-800" />
              <h3 className="font-bold text-stone-700 text-base">Select a Passage from the Queue</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Go to the Verification Queue tab and click "Inspect & Verify" to load the manuscript folio and text layers.
              </p>
              <button
                onClick={() => setActiveTab("queue")}
                className="mt-2 px-4 py-2 rounded-xl bg-[#13382c] text-white text-xs font-bold inline-block"
              >
                Go to Queue
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Details Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#fcfaf5] rounded-2xl border border-stone-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-serif font-bold text-base text-stone-900">
                      {inspectorData.structuralReference?.bookTitle}
                    </h2>
                    <VerificationBadge status={inspectorData.verificationAudit?.currentStatus} />
                  </div>
                  <p className="text-xs text-stone-500 font-mono">
                    {inspectorData.structuralReference?.chapterTitle} · Folio #{inspectorData.structuralReference?.sourcePage || "N/A"} · ID: {inspectorData.passageId}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={inspectorData.structuralReference?.pdfSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium border border-stone-200 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Source PDF</span>
                  </a>

                  {inspectorData.structuralReference?.readerUrl && (
                    <a
                      href={inspectorData.structuralReference?.readerUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-medium border border-amber-200 transition"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-700" />
                      <span>BookReader</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Side-by-Side Comparison Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Original Manuscript / Raw OCR */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500 font-mono">
                      Original Extraction / Raw OCR Baseline
                    </span>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                      {inspectorData.extractionProvenance?.opticalConfidence
                        ? `${Math.round(inspectorData.extractionProvenance.opticalConfidence * 100)}% Conf`
                        : "Raw Text"}
                    </span>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 font-serif text-sm text-stone-800 leading-relaxed whitespace-pre-wrap min-h-[220px]">
                    {inspectorData.contentLayers?.rawOcrText || inspectorData.contentLayers?.originalText}
                  </div>

                  {inspectorData.structuralReference?.manuscriptPageUrl && (
                    <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 text-center">
                      <p className="text-xs text-stone-600 mb-2 font-mono">Scanned Manuscript Page Available</p>
                      <a
                        href={inspectorData.structuralReference.manuscriptPageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-amber-900 font-bold hover:underline"
                      >
                        <span>Open High-Res Folio Scan</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Previous Correction History if present */}
                  {inspectorData.verificationAudit?.correctionHistory?.length > 0 && (
                    <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 space-y-1.5 text-xs">
                      <span className="font-bold text-amber-950 font-mono block">
                        Previous Correction History:
                      </span>
                      {inspectorData.verificationAudit.correctionHistory.slice(0, 2).map((c) => (
                        <div key={c.id} className="text-[11px] text-stone-700 border-t border-amber-200/40 pt-1">
                          <p className="italic text-stone-500">"{c.previousText.slice(0, 90)}..."</p>
                          <p className="text-emerald-900 font-semibold mt-0.5">By {c.correctedBy} on {new Date(c.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Scholar Editing & Correction Form */}
                <div className="space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono block">
                    Verified Shastric Text (Devanagari Editor)
                  </span>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Sanskrit Verse (Correct broken ligatures, conjuncts, and virama):
                    </label>
                    <textarea
                      rows={5}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full p-3 font-serif text-sm bg-white border border-stone-300 rounded-2xl focus:ring-2 focus:ring-emerald-700 focus:outline-hidden text-stone-900 leading-relaxed"
                    />
                  </div>

                  {/* Translations & Scholarly Layers Accordion */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">
                        Hindi Translation:
                      </label>
                      <textarea
                        rows={2}
                        value={editHindi}
                        onChange={(e) => setEditHindi(e.target.value)}
                        placeholder="प्रमाणिक हिंदी अनुवाद..."
                        className="w-full p-2.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">
                        English Translation:
                      </label>
                      <textarea
                        rows={2}
                        value={editEnglish}
                        onChange={(e) => setEditEnglish(e.target.value)}
                        placeholder="Scholarly English translation..."
                        className="w-full p-2.5 text-xs bg-white border border-stone-200 rounded-xl text-stone-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">
                        Translation Attribution / Source:
                      </label>
                      <input
                        type="text"
                        value={editTranslationSource}
                        onChange={(e) => setEditTranslationSource(e.target.value)}
                        placeholder="e.g. Chowkhamba Sanskrit Series 1954"
                        className="w-full p-2 text-xs bg-white border border-stone-200 rounded-xl text-stone-800"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-600 block mb-1">
                        Translator Name:
                      </label>
                      <input
                        type="text"
                        value={editTranslator}
                        onChange={(e) => setEditTranslator(e.target.value)}
                        placeholder="e.g. Dr. Ramkrishna Sharma"
                        className="w-full p-2 text-xs bg-white border border-stone-200 rounded-xl text-stone-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Correction Reason (Required if modifying text):
                    </label>
                    <input
                      type="text"
                      value={editReason}
                      onChange={(e) => setEditReason(e.target.value)}
                      placeholder="e.g. Corrected Devanagari anusvara and repaired broken conjunct ligature"
                      className="w-full p-2 text-xs bg-white border border-stone-200 rounded-xl text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-stone-600 block mb-1">
                      Scholarly Notes (Publicly visible in provenance record):
                    </label>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Scholarly notes regarding manuscript variations or critical readings..."
                      className="w-full p-2 text-xs bg-white border border-stone-200 rounded-xl text-stone-800"
                    />
                  </div>

                  {/* Action Review Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-stone-200">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleReviewAction("VERIFIED")}
                      className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                      <span>{editText !== inspectorData.contentLayers?.originalText ? "Save Corrections & Mark Verified" : "Approve as Verified"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleReviewAction("NEEDS_CORRECTION")}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Flag Needs Correction</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleReviewAction("REJECTED")}
                      className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold disabled:opacity-50 transition"
                    >
                      <XCircle className="w-4 h-4 text-stone-500" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Knowledge Graph Evidence Verification */}
      {activeTab === "knowledge" && (
        <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-base">
                Knowledge Graph Relationship Evidence Review
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Verify AI-discovered shastric relationships against their underlying textual passages before they become canonical facts.
              </p>
            </div>

            <button
              onClick={loadPendingRelationships}
              className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition"
              title="Refresh Pending Relationships"
            >
              <RefreshCw className={`w-4 h-4 ${loadingRelations ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loadingRelations ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-8 h-8 border-3 border-emerald-800 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-500 font-mono">Loading relationships requiring verification...</p>
            </div>
          ) : pendingRelations.length === 0 ? (
            <div className="p-12 text-center space-y-2 text-stone-400">
              <Network className="w-10 h-10 mx-auto opacity-30 text-emerald-800" />
              <h3 className="font-bold text-stone-700 text-sm">All Knowledge Relationships Verified</h3>
              <p className="text-xs text-stone-500">
                No pending or AI-discovered candidate relationships currently require scholarly approval.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRelations.map((rel) => (
                <div
                  key={rel.id}
                  className="p-5 rounded-2xl bg-[#fcfaf5] border border-stone-200 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap text-sm font-semibold">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-950 font-serif font-bold">
                        {rel.sourceConcept?.name || rel.sourceConcept?.slug}
                      </span>
                      <span className="text-xs font-mono text-stone-400 uppercase">
                        — {rel.relationshipType} →
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 font-serif font-bold">
                        {rel.targetConcept?.name || rel.targetConcept?.slug}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                        Status: {rel.status}
                      </span>
                    </div>

                    <span className="text-xs font-mono text-stone-400">
                      Discovered on {new Date(rel.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Supporting Passage Evidence */}
                  <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-1 text-xs">
                    <span className="font-bold text-stone-700 font-mono block text-[11px]">
                      Supporting Manuscript Evidence:
                    </span>
                    <p className="font-serif text-stone-800 italic leading-relaxed">
                      "{rel.sourcePassage?.text || rel.description || "Relationship discovered via rule-based astrological semantic parser."}"
                    </p>
                    {rel.sourceBook && (
                      <p className="text-[10px] text-stone-500 font-mono">
                        Source: {rel.sourceBook.title} {rel.sourcePassage?.sourcePage ? `(Page ${rel.sourcePassage.sourcePage})` : ""}
                      </p>
                    )}
                  </div>

                  {/* Reviewer Note Input */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <input
                      type="text"
                      placeholder="Add scholarly verification note..."
                      value={relationNotes[rel.id] || ""}
                      onChange={(e) =>
                        setRelationNotes({ ...relationNotes, [rel.id]: e.target.value })
                      }
                      className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800"
                    />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRelationshipAction(rel.id, "APPROVE")}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition shadow-xs"
                      >
                        Approve (Verify Fact)
                      </button>

                      <button
                        onClick={() => handleRelationshipAction(rel.id, "REJECT")}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-rose-700 text-xs font-semibold transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Scholarly Audit & Metrics */}
      {activeTab === "stats" && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm p-6 space-y-4">
            <h3 className="font-serif font-bold text-stone-900 text-base">
              Recent Scholarly Review Actions & Audit Trail
            </h3>
            <p className="text-xs text-stone-500 font-mono">
              Immutable log of reviewer approvals, text corrections, and verification status changes.
            </p>

            {stats?.recentReviews?.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-6 text-center">
                No recent review records logged.
              </p>
            ) : (
              <div className="space-y-2">
                {stats?.recentReviews?.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{r.action}</span>
                        <VerificationBadge status={r.newStatus} size="xs" />
                        <span className="text-stone-400 font-mono text-[11px]">
                          in {r.bookTitle || "Manuscript"}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-mono">
                        By {r.reviewerEmail} ({r.reviewerRole})
                      </p>
                      {r.scholarlyNotes && (
                        <p className="text-[11px] text-stone-700 italic">
                          "{r.scholarlyNotes}"
                        </p>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-stone-400 shrink-0">
                      {new Date(r.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
