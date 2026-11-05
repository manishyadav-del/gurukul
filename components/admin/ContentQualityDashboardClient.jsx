"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Flame,
  Layers,
  Search,
  Filter,
  ArrowRight,
  RotateCcw,
  BookMarked,
  FileText,
  Compass,
  Star,
  ChevronRight,
  SlidersHorizontal,
  X,
  Info,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Check,
  UserCheck,
  AlertCircle,
  FileCheck,
  Upload,
  RefreshCw,
  Send,
  Eye,
  CheckSquare,
  Lock,
} from "lucide-react";
import BookUpload from "@/components/admin/BookUpload.jsx";

export default function ContentQualityDashboardClient({
  initialMetrics,
  initialBooks = [],
  initialReviewQueue = [],
  initialAudit = [],
  availableReviewers = [],
  currentUserRole = "ADMIN",
}) {
  // Navigation tabs: 'dashboard' | 'upload' | 'audit'
  const [activeTab, setActiveTab] = useState("dashboard");

  // Filter states
  const [activeMetricFilter, setActiveMetricFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [languageFilter, setLanguageFilter] = useState("ALL");
  const [ocrStatusFilter, setOcrStatusFilter] = useState("ALL");
  const [reviewStatusFilter, setReviewStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'title' | 'pages' | 'coverage' | 'readiness'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Books data state
  const [books, setBooks] = useState(initialBooks);
  const [metrics, setMetrics] = useState(initialMetrics);
  const [reviewQueue, setReviewQueue] = useState(initialReviewQueue);
  const [auditLogs, setAuditLogs] = useState(initialAudit);

  // Interactive Modals
  const [selectedBookForReadiness, setSelectedBookForReadiness] = useState(null);
  const [readinessData, setReadinessData] = useState(null);
  const [loadingReadiness, setLoadingReadiness] = useState(false);

  const [selectedBookForAssign, setSelectedBookForAssign] = useState(null);
  const [assigneeEmail, setAssigneeEmail] = useState("");
  const [assignNotes, setAssignNotes] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Handle clicking on metric cards to filter table immediately
  const handleMetricCardClick = (filterType) => {
    setActiveMetricFilter(filterType);
    setCurrentPage(1);

    if (filterType === "ALL") {
      setStatusFilter("ALL");
      setOcrStatusFilter("ALL");
      setReviewStatusFilter("ALL");
    } else if (filterType === "PUBLISHED") {
      setStatusFilter("PUBLISHED");
      setOcrStatusFilter("ALL");
      setReviewStatusFilter("ALL");
    } else if (filterType === "NEEDS_REVIEW") {
      setStatusFilter("NEEDS_REVIEW");
      setOcrStatusFilter("ALL");
      setReviewStatusFilter("ALL");
    } else if (filterType === "PENDING_APPROVAL") {
      setStatusFilter("PENDING_APPROVAL");
      setOcrStatusFilter("ALL");
      setReviewStatusFilter("ALL");
    } else if (filterType === "FAILED_OR_PARTIAL") {
      setStatusFilter("ALL");
      setOcrStatusFilter("HAS_ERRORS");
      setReviewStatusFilter("ALL");
    } else if (filterType === "NEEDS_PROOFREADING") {
      setStatusFilter("ALL");
      setOcrStatusFilter("ALL");
      setReviewStatusFilter("NEEDS_PROOFREADING");
    } else if (filterType === "REJECTED_OR_ARCHIVED") {
      setStatusFilter("REJECTED_OR_ARCHIVED");
      setOcrStatusFilter("ALL");
      setReviewStatusFilter("ALL");
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setActiveMetricFilter("ALL");
    setStatusFilter("ALL");
    setLanguageFilter("ALL");
    setOcrStatusFilter("ALL");
    setReviewStatusFilter("ALL");
    setSearchQuery("");
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Filter & sort books
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        // Status filter
        if (statusFilter !== "ALL") {
          if (statusFilter === "REJECTED_OR_ARCHIVED") {
            if (!["REJECTED", "ARCHIVED"].includes(book.status)) return false;
          } else if (book.status !== statusFilter) {
            return false;
          }
        }

        // Language filter
        if (languageFilter !== "ALL") {
          const bLang = (book.language || "").toLowerCase();
          const targetLang = languageFilter.toLowerCase();
          if (!bLang.includes(targetLang)) return false;
        }

        // OCR status filter
        if (ocrStatusFilter !== "ALL") {
          if (ocrStatusFilter === "COMPLETED") {
            if (book.totalPages === 0 || book.processedPages < book.totalPages) return false;
          } else if (ocrStatusFilter === "IN_PROGRESS") {
            if (book.processingStatus !== "OCR_PROCESSING" && book.processingStatus !== "ANALYZING") return false;
          } else if (ocrStatusFilter === "HAS_ERRORS") {
            const hasErrors = book.unresolvedErrorsCount > 0 || book.status === "FAILED" || book.processedPages < book.totalPages;
            if (!hasErrors) return false;
          }
        }

        // Review status filter
        if (reviewStatusFilter !== "ALL") {
          if (reviewStatusFilter === "FULLY_PROOFREAD") {
            if (book.proofreadingCoverage < 100) return false;
          } else if (reviewStatusFilter === "NEEDS_PROOFREADING") {
            if (book.pagesRequiringReview === 0) return false;
          } else if (reviewStatusFilter === "LOW_CONFIDENCE") {
            if (book.avgConfidence >= 0.70) return false;
          }
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = (book.title || "").toLowerCase().includes(q);
          const matchAuthor = (book.author || "").toLowerCase().includes(q);
          const matchSlug = (book.slug || "").toLowerCase().includes(q);
          const matchLang = (book.language || "").toLowerCase().includes(q);
          if (!matchTitle && !matchAuthor && !matchSlug && !matchLang) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
        if (sortBy === "pages") return (b.totalPages || 0) - (a.totalPages || 0);
        if (sortBy === "coverage") return (b.proofreadingCoverage || 0) - (a.proofreadingCoverage || 0);
        if (sortBy === "readiness") {
          const score = (val) => (val === "Passed" ? 2 : val === "Needs Attention" ? 1 : 0);
          return score(b.readinessStatus) - score(a.readinessStatus);
        }
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      });
  }, [books, statusFilter, languageFilter, ocrStatusFilter, reviewStatusFilter, searchQuery, sortBy]);

  // Pagination calculation
  const totalItems = filteredBooks.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedBooks = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredBooks.slice(start, start + pageSize);
  }, [filteredBooks, currentPage, pageSize]);

  // Load readiness breakdown
  const handleInspectReadiness = async (book) => {
    setSelectedBookForReadiness(book);
    setLoadingReadiness(true);
    try {
      const res = await fetch(`/api/books/${book.id}/readiness`);
      const data = await res.json();
      if (res.ok) {
        setReadinessData(data);
      } else {
        setReadinessData({
          error: data.error || "Failed to load readiness details",
          checklist: [],
        });
      }
    } catch (err) {
      setReadinessData({ error: err.message, checklist: [] });
    } finally {
      setLoadingReadiness(false);
    }
  };

  // Submit Review Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBookForAssign || !assigneeEmail) return;

    setIsAssigning(true);
    setFeedbackMessage(null);
    try {
      const res = await fetch(`/api/books/${selectedBookForAssign.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reviewerEmail: assigneeEmail,
          notes: assignNotes,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedbackMessage({ type: "success", text: data.message });
        // Update local state
        setBooks((prev) =>
          prev.map((b) =>
            b.id === selectedBookForAssign.id
              ? { ...b, assignedReviewer: assigneeEmail }
              : b
          )
        );
        setSelectedBookForAssign(null);
        setAssigneeEmail("");
        setAssignNotes("");
      } else {
        setFeedbackMessage({ type: "error", text: data.error || "Assignment failed" });
      }
    } catch (err) {
      setFeedbackMessage({ type: "error", text: err.message });
    } finally {
      setIsAssigning(false);
    }
  };

  // Quick submit for approval from review queue
  const handleSubmitForApproval = async (bookId) => {
    try {
      const res = await fetch(`/api/books/${bookId}/lifecycle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetStatus: "PENDING_APPROVAL", notes: "Submitted via Content Quality Queue" }),
      });
      const data = await res.json();
      if (res.ok) {
        setFeedbackMessage({ type: "success", text: `Book submitted for publication approval!` });
        setBooks((prev) =>
          prev.map((b) => (b.id === bookId ? { ...b, status: "PENDING_APPROVAL" } : b))
        );
      } else {
        setFeedbackMessage({ type: "error", text: data.error || "Failed to submit for approval" });
      }
    } catch (err) {
      setFeedbackMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner Navigation & Feedback */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-stone-900">
            Admin Content Quality & Publication Monitor
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real-time verification of book ingestion, OCR accuracy, Sanskrit proofreading, and publication approval readiness.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "dashboard"
                ? "bg-[#13382c] text-white shadow-xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Quality Monitor</span>
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "upload"
                ? "bg-[#13382c] text-white shadow-xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Ingest Manuscript</span>
          </button>
          <button
            onClick={() => setActiveTab("audit")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === "audit"
                ? "bg-[#13382c] text-white shadow-xs"
                : "bg-stone-100 text-stone-700 hover:bg-stone-200"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Audit History</span>
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between animate-in fade-in ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
              : "bg-rose-50 border border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-stone-400 hover:text-stone-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab: Ingest Manuscript Upload */}
      {activeTab === "upload" && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-700" />
              <span>
                Upload high-resolution classical Sanskrit/Hindi manuscript PDFs. Ingestion begins in <strong>DRAFT</strong> status with pure JavaScript OCR processing.
              </span>
            </div>
            <button
              onClick={() => setActiveTab("dashboard")}
              className="text-amber-800 font-semibold underline text-xs cursor-pointer"
            >
              Back to Monitor
            </button>
          </div>
          <BookUpload />
        </div>
      )}

      {/* Tab: Audit History */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold font-serif text-stone-900">
                Book & OCR Lifecycle Audit Trail
              </h3>
              <p className="text-xs text-stone-500">
                Chronological ledger of manuscript uploads, text corrections, reviewer assignments, and publication events.
              </p>
            </div>
            <Link
              href="/admin/audit-logs"
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 flex items-center gap-1"
            >
              <span>Full Audit Logs Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 uppercase text-[10px] font-semibold text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/60">
                    <td className="px-4 py-3 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-semibold text-stone-800">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-stone-600">
                      {log.actorEmail}
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      {log.targetResource} {log.targetId ? `(${log.targetId.slice(0, 8)}...)` : ""}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-500 max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Quality Monitor (Primary Dashboard) */}
      {activeTab === "dashboard" && (
        <div className="space-y-8">
          {/* SECTION 1: LIVE METRICS OVERVIEW (Clickable to filter table) */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 font-mono">
                1. Content Quality Overview (Click card to filter)
              </h2>
              {activeMetricFilter !== "ALL" && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Filter ({activeMetricFilter})</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              {/* 1. Total Books */}
              <button
                onClick={() => handleMetricCardClick("ALL")}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  activeMetricFilter === "ALL"
                    ? "bg-[#13382c] text-white border-[#13382c] shadow-md ring-2 ring-[#d4a359]"
                    : "bg-white text-stone-800 border-stone-200 hover:border-[#13382c]"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[11px] uppercase tracking-wider opacity-80">
                    Total Books
                  </span>
                  <BookOpen className="w-4 h-4 opacity-70" />
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold font-mono">
                    {metrics?.totalBooks ?? books.length}
                  </span>
                  <span className="block text-[10px] opacity-70 mt-0.5">Database Catalog</span>
                </div>
              </button>

              {/* 2. Published Books */}
              <button
                onClick={() => handleMetricCardClick("PUBLISHED")}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  activeMetricFilter === "PUBLISHED"
                    ? "bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-400"
                    : "bg-white text-stone-800 border-stone-200 hover:border-emerald-600"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[11px] uppercase tracking-wider opacity-80">
                    Published
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold font-mono text-emerald-600">
                    {metrics?.publishedBooks ?? 0}
                  </span>
                  <span className="block text-[10px] text-stone-400 mt-0.5">Live to Readers</span>
                </div>
              </button>

              {/* 3. Awaiting Review */}
              <button
                onClick={() => handleMetricCardClick("NEEDS_REVIEW")}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  activeMetricFilter === "NEEDS_REVIEW"
                    ? "bg-amber-800 text-white border-amber-800 shadow-md ring-2 ring-amber-400"
                    : "bg-white text-stone-800 border-stone-200 hover:border-amber-500"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[11px] uppercase tracking-wider opacity-80">
                    Awaiting Review
                  </span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold font-mono text-amber-600">
                    {metrics?.awaitingReview ?? 0}
                  </span>
                  <span className="block text-[10px] text-stone-400 mt-0.5">Needs Editor Pass</span>
                </div>
              </button>

              {/* 4. Awaiting Approval */}
              <button
                onClick={() => handleMetricCardClick("PENDING_APPROVAL")}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  activeMetricFilter === "PENDING_APPROVAL"
                    ? "bg-sky-800 text-white border-sky-800 shadow-md ring-2 ring-sky-400"
                    : "bg-white text-stone-800 border-stone-200 hover:border-sky-500"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[11px] uppercase tracking-wider opacity-80">
                    Awaiting Approval
                  </span>
                  <ShieldCheck className="w-4 h-4 text-sky-500" />
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold font-mono text-sky-600">
                    {metrics?.awaitingApproval ?? 0}
                  </span>
                  <span className="block text-[10px] text-stone-400 mt-0.5">Ready for Approver</span>
                </div>
              </button>

              {/* 5. Failed or Partial OCR */}
              <button
                onClick={() => handleMetricCardClick("FAILED_OR_PARTIAL")}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  activeMetricFilter === "FAILED_OR_PARTIAL"
                    ? "bg-rose-800 text-white border-rose-800 shadow-md ring-2 ring-rose-400"
                    : "bg-white text-stone-800 border-stone-200 hover:border-rose-500"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[11px] uppercase tracking-wider opacity-80">
                    Failed / Partial OCR
                  </span>
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold font-mono text-rose-600">
                    {metrics?.failedOrPartialBooksCount ?? 0}
                  </span>
                  <span className="block text-[10px] text-stone-400 mt-0.5">Errors or Incomplete</span>
                </div>
              </button>

              {/* 6. Pages Requiring Proofreading */}
              <button
                onClick={() => handleMetricCardClick("NEEDS_PROOFREADING")}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  activeMetricFilter === "NEEDS_PROOFREADING"
                    ? "bg-purple-800 text-white border-purple-800 shadow-md ring-2 ring-purple-400"
                    : "bg-white text-stone-800 border-stone-200 hover:border-purple-500"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[11px] uppercase tracking-wider opacity-80">
                    Pages to Proofread
                  </span>
                  <FileText className="w-4 h-4 text-purple-500" />
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold font-mono text-purple-600">
                    {metrics?.pagesRequiringProofreading ?? 0}
                  </span>
                  <span className="block text-[10px] text-stone-400 mt-0.5">Unreviewed / Low Conf</span>
                </div>
              </button>

              {/* 7. Rejected or Archived */}
              <button
                onClick={() => handleMetricCardClick("REJECTED_OR_ARCHIVED")}
                className={`p-3.5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  activeMetricFilter === "REJECTED_OR_ARCHIVED"
                    ? "bg-stone-800 text-white border-stone-800 shadow-md ring-2 ring-stone-400"
                    : "bg-white text-stone-800 border-stone-200 hover:border-stone-500"
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[11px] uppercase tracking-wider opacity-80">
                    Rejected / Archived
                  </span>
                  <Lock className="w-4 h-4 text-stone-400" />
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold font-mono text-stone-600">
                    {metrics?.rejectedOrArchived ?? 0}
                  </span>
                  <span className="block text-[10px] text-stone-400 mt-0.5">Offline Records</span>
                </div>
              </button>
            </div>
          </section>

          {/* SECTION 2: REVIEW QUEUE & ASSIGNMENT PANEL */}
          {reviewQueue.length > 0 && (
            <section className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-semibold">
                    <Clock className="w-3 h-3" />
                    <span>Editorial Review Queue ({reviewQueue.length} Active Items)</span>
                  </div>
                  <h3 className="text-base font-bold font-serif text-stone-900 mt-1">
                    Books Awaiting Staff Review & Approval
                  </h3>
                </div>
                <Link
                  href="/admin/proofreading"
                  className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center gap-1.5 transition self-start"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Proofreading Hub</span>
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {reviewQueue.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-[#fdfbf7] flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          item.status === "PENDING_APPROVAL"
                            ? "bg-sky-100 text-sky-800 border border-sky-200"
                            : item.status === "NEEDS_REVIEW"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-stone-100 text-stone-700"
                        }`}>
                          {item.status}
                        </span>
                        <span className="font-mono text-stone-500">
                          {item.pagesRequiringReview} pages pending
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-stone-900 line-clamp-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-stone-500 mt-0.5 truncate">
                        Assigned: <strong className="text-stone-700">{item.assignedReviewer || "Unassigned"}</strong>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-200/70 flex items-center justify-between gap-1 text-xs">
                      <button
                        onClick={() => setSelectedBookForAssign(item)}
                        className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 underline cursor-pointer"
                      >
                        {item.assignedReviewer ? "Reassign" : "Assign Staff"}
                      </button>

                      <div className="flex items-center gap-1.5">
                        {item.status === "NEEDS_REVIEW" && (
                          <button
                            onClick={() => handleSubmitForApproval(item.id)}
                            className="px-2.5 py-1 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            <span>Submit</span>
                          </button>
                        )}
                        <Link
                          href={`/admin/proofreading?bookId=${item.id}`}
                          className="px-2.5 py-1 rounded-lg bg-[#13382c] hover:bg-[#1a4a3b] text-white text-[11px] font-semibold transition"
                        >
                          Proofread
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 3: BOOK PROCESSING TABLE & SEARCHABLE DASHBOARD */}
          <section className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs space-y-4">
            {/* Filter Toolbar Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search by book title, author, slug, or language..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-[#13382c]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-semibold cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Sort Selector */}
                <div className="flex items-center gap-2 shrink-0 text-xs">
                  <span className="text-stone-500 font-medium flex items-center gap-1">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Sort:</span>
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-xl border border-stone-300 bg-stone-50 text-stone-700 font-medium focus:outline-hidden cursor-pointer"
                  >
                    <option value="newest">Recently Updated</option>
                    <option value="title">Title (A-Z)</option>
                    <option value="pages">Total Pages</option>
                    <option value="coverage">Proofreading Coverage</option>
                    <option value="readiness">Publication Readiness</option>
                  </select>
                </div>
              </div>

              {/* Multi-Criteria Filters Bar */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 font-medium cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
                  <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="PUBLISHED">PUBLISHED</option>
                  <option value="REJECTED">REJECTED</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                  <option value="FAILED">FAILED</option>
                </select>

                {/* Language Filter */}
                <select
                  value={languageFilter}
                  onChange={(e) => {
                    setLanguageFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 font-medium cursor-pointer"
                >
                  <option value="ALL">All Languages</option>
                  <option value="Sanskrit">Sanskrit</option>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                </select>

                {/* OCR Status Filter */}
                <select
                  value={ocrStatusFilter}
                  onChange={(e) => {
                    setOcrStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 font-medium cursor-pointer"
                >
                  <option value="ALL">All OCR Statuses</option>
                  <option value="COMPLETED">OCR Completed</option>
                  <option value="IN_PROGRESS">OCR In Progress</option>
                  <option value="HAS_ERRORS">Has Unresolved Errors</option>
                </select>

                {/* Review Status Filter */}
                <select
                  value={reviewStatusFilter}
                  onChange={(e) => {
                    setReviewStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1 rounded-lg border border-stone-200 bg-stone-50 text-stone-700 font-medium cursor-pointer"
                >
                  <option value="ALL">All Review Statuses</option>
                  <option value="FULLY_PROOFREAD">Fully Proofread (100%)</option>
                  <option value="NEEDS_PROOFREADING">Needs Proofreading</option>
                  <option value="LOW_CONFIDENCE">Low Optical Confidence (&lt;70%)</option>
                </select>

                {(statusFilter !== "ALL" || languageFilter !== "ALL" || ocrStatusFilter !== "ALL" || reviewStatusFilter !== "ALL" || searchQuery) && (
                  <button
                    onClick={handleResetFilters}
                    className="px-2.5 py-1 text-stone-500 hover:text-stone-800 underline font-medium cursor-pointer ml-auto"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            </div>

            {/* Results Count Bar */}
            <div className="px-5 py-2 bg-stone-50/70 border-b border-stone-200 text-xs text-stone-500 flex items-center justify-between">
              <span>
                Showing <strong>{paginatedBooks.length}</strong> of <strong>{totalItems}</strong> matching manuscripts
              </span>
              <div className="flex items-center gap-1.5">
                <span>Per Page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-stone-300 rounded px-1.5 py-0.5 text-xs text-stone-700"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Empty State */}
            {paginatedBooks.length === 0 ? (
              <div className="text-center py-16 px-4 space-y-3 text-stone-500">
                <BookOpen className="w-12 h-12 mx-auto text-stone-300" />
                <h3 className="text-base font-bold font-serif text-stone-800">
                  No manuscripts match the selected criteria
                </h3>
                <p className="text-xs max-w-sm mx-auto">
                  Try clearing active search queries or adjusting your status and language filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-[#13382c] text-white rounded-xl text-xs font-semibold hover:bg-[#1a4a3b] transition cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-600">
                  <thead className="bg-stone-50 uppercase text-[10px] font-semibold text-stone-500 border-b border-stone-200 tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Book Title & Details</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">OCR Engine & Conf</th>
                      <th className="px-4 py-3.5">Pages</th>
                      <th className="px-4 py-3.5">Proofreading Coverage</th>
                      <th className="px-4 py-3.5">Readiness</th>
                      <th className="px-4 py-3.5">Reviewer</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {paginatedBooks.map((b) => (
                      <tr key={b.id} className="hover:bg-stone-50/70 transition">
                        {/* Title & Author */}
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/admin/books/${b.id}`}
                            className="font-serif font-bold text-sm text-stone-900 hover:text-amber-700 transition line-clamp-1"
                            title={b.title}
                          >
                            {b.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                            <span>{b.author}</span>
                            <span>•</span>
                            <span className="font-mono text-stone-400">{b.language}</span>
                            <span>•</span>
                            <span>v{b.publishedVersion || 1}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-[10px] border ${
                              b.status === "PUBLISHED"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : b.status === "APPROVED"
                                ? "bg-teal-50 text-teal-800 border-teal-200"
                                : b.status === "PENDING_APPROVAL"
                                ? "bg-sky-50 text-sky-800 border-sky-200"
                                : b.status === "NEEDS_REVIEW"
                                ? "bg-amber-50 text-amber-800 border-amber-200"
                                : b.status === "PROCESSING"
                                ? "bg-indigo-50 text-indigo-800 border-indigo-200 animate-pulse"
                                : b.status === "FAILED"
                                ? "bg-rose-50 text-rose-800 border-rose-200"
                                : "bg-stone-100 text-stone-700 border-stone-200"
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>

                        {/* OCR Engine & Confidence */}
                        <td className="px-4 py-3.5">
                          <span className="font-mono font-medium text-stone-700 block">
                            {b.ocrEngine || "tesseract"}
                          </span>
                          <span
                            className={`inline-block font-mono text-[10px] mt-0.5 ${
                              b.avgConfidence >= 0.85
                                ? "text-emerald-700 font-semibold"
                                : b.avgConfidence >= 0.70
                                ? "text-amber-700"
                                : "text-rose-700 font-bold"
                            }`}
                          >
                            {Math.round((b.avgConfidence || 0) * 100)}% Conf
                          </span>
                        </td>

                        {/* Pages */}
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-stone-800 font-semibold block">
                            {b.processedPages} / {b.totalPages}p
                          </span>
                          {b.pagesRequiringReview > 0 ? (
                            <span className="text-[10px] text-amber-700 font-medium">
                              {b.pagesRequiringReview} unreviewed
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-700">All reviewed</span>
                          )}
                        </td>

                        {/* Proofreading Coverage */}
                        <td className="px-4 py-3.5 min-w-[130px]">
                          <div className="flex items-center justify-between text-[10px] font-mono mb-1 text-stone-500">
                            <span>Coverage</span>
                            <span className="font-bold text-stone-700">{b.proofreadingCoverage}%</span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                b.proofreadingCoverage === 100
                                  ? "bg-emerald-600"
                                  : b.proofreadingCoverage >= 50
                                  ? "bg-amber-600"
                                  : "bg-rose-500"
                              }`}
                              style={{ width: `${Math.max(5, b.proofreadingCoverage)}%` }}
                            />
                          </div>
                        </td>

                        {/* Publication Readiness */}
                        <td className="px-4 py-3.5">
                          <button
                            onClick={() => handleInspectReadiness(b)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition cursor-pointer ${
                              b.readinessStatus === "Passed"
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                                : b.readinessStatus === "Needs Attention"
                                ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                                : "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100"
                            }`}
                            title="Click to view transparent publication checklist"
                          >
                            {b.readinessStatus === "Passed" ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ) : b.readinessStatus === "Needs Attention" ? (
                              <Clock className="w-3 h-3 text-amber-600" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                            )}
                            <span>{b.readinessStatus}</span>
                          </button>
                        </td>

                        {/* Reviewer Assignment */}
                        <td className="px-4 py-3.5">
                          {b.assignedReviewer ? (
                            <span className="font-mono text-[11px] text-stone-800 truncate block max-w-[120px]" title={b.assignedReviewer}>
                              {b.assignedReviewer.split("@")[0]}
                            </span>
                          ) : (
                            <button
                              onClick={() => setSelectedBookForAssign(b)}
                              className="text-[10px] text-stone-400 hover:text-stone-700 underline cursor-pointer"
                            >
                              Assign
                            </button>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleInspectReadiness(b)}
                              className="px-2 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-[11px] transition cursor-pointer"
                              title="Inspect Publication Checklist"
                            >
                              Inspect
                            </button>
                            <Link
                              href={`/admin/proofreading?bookId=${b.id}`}
                              className="px-2 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-[11px] transition border border-amber-200"
                              title="Proofreading Page Review"
                            >
                              Review
                            </Link>
                            <Link
                              href={`/admin/books/${b.id}`}
                              className="px-2.5 py-1 rounded-md bg-[#13382c] hover:bg-[#1a4a3b] text-white font-semibold text-[11px] transition shadow-2xs"
                              title="Lifecycle & Approval Manager"
                            >
                              Lifecycle
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
                <span>
                  Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100 transition cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border border-stone-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-100 transition cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* MODAL: PUBLICATION READINESS TRANSPARENT CHECKLIST */}
      {selectedBookForReadiness && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBookForReadiness(null);
          }}
        >
          <div className="bg-white w-full max-w-xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-[#13382c] text-white p-5 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block">
                  Publication Quality Inspection
                </span>
                <h3 className="text-lg font-serif font-bold text-white mt-0.5">
                  {selectedBookForReadiness.title}
                </h3>
                <span className="text-xs text-emerald-200/80 mt-1 block">
                  Status: <strong>{selectedBookForReadiness.status}</strong> • v{selectedBookForReadiness.publishedVersion || 1}
                </span>
              </div>
              <button
                onClick={() => setSelectedBookForReadiness(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {loadingReadiness ? (
                <div className="text-center py-10 text-stone-500 space-y-2">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-700" />
                  <p className="text-xs font-semibold">Evaluating Quality Checks & Criteria...</p>
                </div>
              ) : readinessData?.error ? (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-xs text-rose-900">
                  {readinessData.error}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Readiness Score Bar */}
                  <div className="bg-[#faf7f0] rounded-2xl border border-stone-200 p-4 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-stone-500 block uppercase">
                        Readiness Score
                      </span>
                      <span className="text-2xl font-bold font-mono text-[#13382c]">
                        {readinessData?.readinessScore ?? 0}%
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        readinessData?.isReadyForPublication
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-amber-100 text-amber-800 border-amber-300"
                      }`}
                    >
                      {readinessData?.isReadyForPublication ? "Ready for Publication" : "Needs Review"}
                    </span>
                  </div>

                  {/* Checklist Items */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Standard Quality Checklist
                    </h4>
                    <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white">
                      {(readinessData?.checklist || []).map((item, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2.5">
                            {item.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            )}
                            <div>
                              <span className="font-semibold text-stone-800 block">
                                {item.item}
                              </span>
                              <span className="text-[11px] text-stone-500">
                                {item.details}
                              </span>
                            </div>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
                              item.passed
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-amber-50 text-amber-700"
                            }`}
                          >
                            {item.passed ? "Passed" : "Needs Attention"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
              <Link
                href={`/admin/proofreading?bookId=${selectedBookForReadiness.id}`}
                className="text-xs font-semibold text-stone-600 hover:text-stone-900"
              >
                Go to Proofreading Workspace
              </Link>
              <Link
                href={`/admin/books/${selectedBookForReadiness.id}`}
                className="px-4 py-2 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-white text-xs font-semibold"
              >
                Open Full Lifecycle Manager
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN REVIEW WORK TO AUTHORIZED STAFF */}
      {selectedBookForAssign && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBookForAssign(null);
          }}
        >
          <div className="bg-white w-full max-w-md rounded-3xl border border-stone-200 shadow-2xl overflow-hidden">
            <div className="bg-[#13382c] text-white p-5 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-amber-300 uppercase tracking-wider block">
                  Staff Reviewer Assignment
                </span>
                <h3 className="text-base font-serif font-bold text-white mt-0.5">
                  {selectedBookForAssign.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookForAssign(null)}
                className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">
                  Select Authorized Staff Reviewer:
                </label>
                <select
                  value={assigneeEmail}
                  onChange={(e) => setAssigneeEmail(e.target.value)}
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 font-medium focus:ring-2 focus:ring-[#13382c]"
                >
                  <option value="">-- Choose Reviewer --</option>
                  {availableReviewers.map((rev) => (
                    <option key={rev.id} value={rev.email}>
                      {rev.name ? `${rev.name} (${rev.email})` : rev.email} — {rev.role}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 block">
                  Editorial Instructions / Notes (Optional):
                </label>
                <textarea
                  value={assignNotes}
                  onChange={(e) => setAssignNotes(e.target.value)}
                  placeholder="e.g. Please verify Devanagari conjuncts and verses in Chapter 1..."
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white text-stone-800 focus:ring-2 focus:ring-[#13382c]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBookForAssign(null)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:text-stone-900 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning || !assigneeEmail}
                  className="px-5 py-2 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-white text-xs font-semibold disabled:opacity-50 transition cursor-pointer"
                >
                  {isAssigning ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
