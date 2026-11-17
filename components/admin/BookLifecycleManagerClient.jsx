"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Layers,
  RotateCcw,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  Sliders,
  Database,
  RefreshCw,
  Hash,
  Send,
  ThumbsUp,
  ThumbsDown,
  Archive,
  History,
  Lock,
  Unlock,
  AlertCircle,
  FileCheck,
} from "lucide-react";

export default function BookLifecycleManagerClient({ initialBook, initialReadiness }) {
  const [book, setBook] = useState(initialBook);
  const [readiness, setReadiness] = useState(initialReadiness);
  const [activeTab, setActiveTab] = useState("overview");
  const [loadingAction, setLoadingAction] = useState(null);
  const [message, setMessage] = useState(null);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  // Publish notes state
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishNotes, setPublishNotes] = useState("");
  const [overrideWarnings, setOverrideWarnings] = useState(false);

  const pages = book.pages || [];
  const digitalPages = pages.filter((p) => p.processingMethod === "TEXT_EXTRACTION" && p.rawText);
  const ocrPages = pages.filter((p) => p.processingMethod === "OCR");
  const proofreadPages = pages.filter((p) => p.proofread);
  const correctionHistory = book.correctionHistory || [];

  // Determine active lifecycle step for progress bar
  const getLifecycleStep = () => {
    switch (book.status) {
      case "PUBLISHED":
        return 5;
      case "APPROVED":
        return 4;
      case "PENDING_APPROVAL":
        return 3;
      case "NEEDS_REVIEW":
      case "PROOFREAD":
        return 2;
      case "PROCESSING":
        return 1;
      case "DRAFT":
      case "RECEIVED":
      default:
        return 0;
    }
  };

  const currentStep = getLifecycleStep();

  const lifecycleStages = [
    "Draft",
    "Processing",
    "Needs Review",
    "Pending Approval",
    "Approved",
    "Published",
  ];

  // Lifecycle transition helper
  const handleTransition = async (targetStatus, extraData = {}) => {
    setLoadingAction(targetStatus);
    setMessage(null);
    try {
      const res = await fetch(`/api/books/${book.id}/lifecycle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetStatus,
          ...extraData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to transition book to ${targetStatus}`);
      }

      setBook((prev) => ({
        ...prev,
        ...data.book,
      }));

      // Refresh readiness
      fetch(`/api/books/${book.id}/readiness`)
        .then((r) => (r.ok ? r.json() : null))
        .then((r) => r && setReadiness(r))
        .catch(() => {});

      setMessage({ type: "success", text: data.message });
      setShowRejectModal(false);
      setShowPublishModal(false);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoadingAction(null);
    }
  };

  const handlePublishConfirm = async () => {
    setLoadingAction("publish");
    setMessage(null);
    try {
      const res = await fetch(`/api/books/${book.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          overrideWarnings,
          versionNotes: publishNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to publish book");
      }

      setBook((prev) => ({
        ...prev,
        status: data.book.status,
        publishedVersion: data.book.publishedVersion,
        publishedAt: data.book.publishedAt,
        publishedBy: data.book.publishedBy,
      }));

      setMessage({ type: "success", text: data.message });
      setShowPublishModal(false);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSelectiveReprocess = async (actionType) => {
    setLoadingAction(actionType);
    setMessage(null);
    try {
      if (actionType === "structure") {
        const res = await fetch(`/api/books/${book.id}/structure`, { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Structuring failed");
        setMessage({ type: "success", text: "Book structure rebuilt successfully." });
      } else if (actionType === "pdf") {
        const res = await fetch(`/api/books/${book.id}/pdf`, { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "PDF generation failed");
        setMessage({ type: "success", text: "Digital Book PDF compiled successfully." });
      } else if (actionType === "enqueue_ocr") {
        const res = await fetch(`/api/books/${book.id}/process`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ forceRetry: true, forceOcr: true }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "OCR retry failed");
        setMessage({ type: "success", text: "Background OCR job enqueued." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoadingAction(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "APPROVED":
        return "bg-teal-100 text-teal-800 border-teal-300";
      case "PENDING_APPROVAL":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "NEEDS_REVIEW":
        return "bg-sky-100 text-sky-800 border-sky-300";
      case "REJECTED":
        return "bg-rose-100 text-rose-800 border-rose-300";
      case "ARCHIVED":
        return "bg-stone-200 text-stone-700 border-stone-300";
      default:
        return "bg-stone-100 text-stone-700 border-stone-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Title */}
      <div>
        <Link
          href="/admin/books"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Books Management</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl font-bold text-stone-900 font-serif">{book.title}</h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-stone-100 text-stone-600 border border-stone-200">
                v{book.publishedVersion || 1}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Slug: <code className="bg-stone-100 px-1.5 py-0.5 rounded-sm">{book.slug}</code> • Language: {book.language} ({book.script || "Default"})
            </p>
          </div>

          {/* Governed State Machine Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(book.status)}`}>
              Status: {book.status}
            </span>

            {/* Transition: Submit for Approval */}
            {(book.status === "DRAFT" || book.status === "NEEDS_REVIEW" || book.status === "RECEIVED") && (
              <button
                onClick={() => handleTransition("PENDING_APPROVAL")}
                disabled={loadingAction === "PENDING_APPROVAL"}
                className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loadingAction === "PENDING_APPROVAL" ? "Submitting..." : "Submit for Approval"}</span>
              </button>
            )}

            {/* Transition: Approve Content */}
            {book.status === "PENDING_APPROVAL" && (
              <>
                <button
                  onClick={() => handleTransition("APPROVED")}
                  disabled={loadingAction === "APPROVED"}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{loadingAction === "APPROVED" ? "Approving..." : "Approve Content"}</span>
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={Boolean(loadingAction)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </>
            )}

            {/* Transition: Publish Book (Explicit confirmation & quality gate) */}
            {(book.status === "APPROVED" || book.status === "PENDING_APPROVAL") && (
              <button
                onClick={() => setShowPublishModal(true)}
                disabled={Boolean(loadingAction)}
                className="px-4 py-1.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3a] text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 text-amber-300" />
                <span>Publish Edition</span>
              </button>
            )}

            {/* Transition: Return to Review if Published */}
            {book.status === "PUBLISHED" && (
              <>
                <Link
                  href={`/library/${book.slug || book.id}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View in Reader</span>
                  <ExternalLink className="w-3 h-3 text-emerald-600" />
                </Link>

                <button
                  onClick={() => handleTransition("NEEDS_REVIEW", { reason: "Editor returned manuscript to review" })}
                  disabled={loadingAction === "NEEDS_REVIEW"}
                  className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                  title="Unpublish or return manuscript to review state"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Revise</span>
                </button>
              </>
            )}

            {/* Transition: Archive */}
            {book.status !== "ARCHIVED" && (
              <button
                onClick={() => handleTransition("ARCHIVED", { reason: "Archived by admin" })}
                disabled={loadingAction === "ARCHIVED"}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
                title="Archive book"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Reject Manuscript / Request Corrections</span>
            </h3>
            <p className="text-xs text-stone-600">
              Please state why this book cannot be approved. The reason will be recorded in the audit trail and displayed to the proofreader.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Chapter 3 OCR contains repeated garbled text. Page 14 is missing Devanagari conjuncts."
              className="w-full text-xs p-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleTransition("REJECTED", { reason: rejectionReason })}
                disabled={!rejectionReason.trim() || loadingAction === "REJECTED"}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold disabled:opacity-50"
              >
                {loadingAction === "REJECTED" ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Confirm Explicit Publication</span>
            </h3>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-500">Publication Version:</span>
                <span className="font-bold text-stone-800">Version {(book.publishedVersion || 1) + (book.status === "PUBLISHED" ? 1 : 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Readiness Score:</span>
                <span className={`font-bold ${readiness?.isReadyForPublication ? "text-emerald-700" : "text-amber-700"}`}>
                  {readiness?.readinessScore ?? 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Pages Proofread:</span>
                <span className="font-bold text-stone-800">{proofreadPages.length} of {pages.length}</span>
              </div>
            </div>

            {!readiness?.isReadyForPublication && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Readiness Quality Warnings Present</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Some quality checks have not passed. Publishing will require Super Admin override.
                </p>
                <label className="flex items-center gap-2 pt-1 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={overrideWarnings}
                    onChange={(e) => setOverrideWarnings(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span>Override quality warnings (Requires Admin privilege)</span>
                </label>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Version Release Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={publishNotes}
                onChange={(e) => setPublishNotes(e.target.value)}
                placeholder="e.g. Edition 2 with verified Devanagari passages and commentary corrections."
                className="w-full text-xs p-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowPublishModal(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={handlePublishConfirm}
                disabled={loadingAction === "publish" || (!readiness?.isReadyForPublication && !overrideWarnings)}
                className="px-4 py-1.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3a] text-white text-xs font-bold disabled:opacity-50"
              >
                {loadingAction === "publish" ? "Publishing..." : "Confirm & Make Public"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notice Message */}
      {message && (
        <div
          className={`p-3.5 rounded-2xl text-xs flex items-center justify-between border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Rejection banner if rejected */}
      {book.status === "REJECTED" && book.rejectionReason && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Manuscript Returned for Correction:</span>
            <p className="mt-0.5 text-rose-800">{book.rejectionReason}</p>
          </div>
        </div>
      )}

      {/* Lifecycle Stage Progress Indicator */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-3">
          Book Production & Approval Lifecycle
        </span>
        <div className="flex items-center justify-between relative overflow-x-auto pb-2">
          {lifecycleStages.map((stageName, idx) => {
            const isCompleted = idx <= currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div key={stageName} className="flex flex-col items-center flex-1 min-w-[100px] text-center relative z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition ${
                    isCurrent
                      ? "bg-[#13382c] text-white ring-4 ring-amber-100"
                      : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  {isCompleted && !isCurrent ? <Check className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`text-[11px] mt-1.5 font-semibold ${
                    isCurrent ? "text-stone-900 font-bold" : isCompleted ? "text-emerald-800" : "text-stone-400"
                  }`}
                >
                  {stageName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 text-xs overflow-x-auto">
        {[
          { id: "overview", label: "Overview & Metadata" },
          { id: "readiness", label: `Publication Readiness (${readiness?.readinessScore ?? 0}%)` },
          { id: "pages", label: `Pages (${pages.length})` },
          { id: "chapters", label: `Chapters & Hierarchy (${book.chapters?.length || 0})` },
          { id: "history", label: `Revision History (${correctionHistory.length})` },
          { id: "reprocessing", label: "Selective Reprocessing" },
          { id: "jobs", label: `Ingestion Jobs (${book.ingestJobs?.length || 0})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition cursor-pointer whitespace-nowrap ${
              activeTab === t.id
                ? "bg-[#13382c] text-white"
                : "text-stone-600 hover:text-stone-900 bg-white border border-stone-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="font-serif font-bold text-base text-stone-900">Bibliographic Metadata</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-stone-50 p-2.5 rounded-xl">
                <span className="text-stone-400 text-[10px] uppercase font-bold">Author</span>
                <p className="font-bold text-stone-800 mt-0.5">{book.author || "Not specified"}</p>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl">
                <span className="text-stone-400 text-[10px] uppercase font-bold">Publisher / Edition</span>
                <p className="font-bold text-stone-800 mt-0.5">{book.publisher || "—"} {book.edition ? `(${book.edition})` : ""}</p>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl">
                <span className="text-stone-400 text-[10px] uppercase font-bold">ISBN</span>
                <p className="font-mono text-stone-800 mt-0.5">{book.isbn || "—"}</p>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl">
                <span className="text-stone-400 text-[10px] uppercase font-bold">Publication Version</span>
                <p className="font-mono text-stone-800 mt-0.5">Edition {book.publishedVersion || 1}</p>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl">
                <span className="text-stone-400 text-[10px] uppercase font-bold">Approved By</span>
                <p className="font-mono text-stone-800 mt-0.5">{book.approvedBy || "Awaiting approval"}</p>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl">
                <span className="text-stone-400 text-[10px] uppercase font-bold">Published By</span>
                <p className="font-mono text-stone-800 mt-0.5">{book.publishedBy || "Not yet published"}</p>
              </div>
            </div>

            {book.description && (
              <div className="pt-2">
                <span className="text-stone-400 text-[10px] uppercase font-bold">Description</span>
                <p className="text-xs text-stone-700 leading-relaxed mt-1 font-serif">{book.description}</p>
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3 text-xs">
            <h3 className="font-serif font-bold text-base text-stone-900">Ingestion Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Total Pages:</span>
                <span className="font-bold text-stone-800">{pages.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Extracted Digital Text:</span>
                <span className="font-bold text-stone-800">{digitalPages.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">OCR Scanned:</span>
                <span className="font-bold text-stone-800">{ocrPages.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Proofread & Verified:</span>
                <span className="font-bold text-emerald-700">{proofreadPages.length}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-100">
                <span className="text-stone-500">Active OCR Errors:</span>
                <span className="font-bold text-rose-700">{book.ocrErrors?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Publication Readiness */}
      {activeTab === "readiness" && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">Quality Readiness Checklist</h3>
              <p className="text-stone-500 text-xs mt-0.5">
                Automated gate validation for Devanagari script integrity, proofreading coverage, and chapter boundaries.
              </p>
            </div>
            <div className="text-right">
              <span className={`text-2xl font-bold font-mono ${readiness?.isReadyForPublication ? "text-emerald-700" : "text-amber-700"}`}>
                {readiness?.readinessScore ?? 0}%
              </span>
              <span className="block text-[10px] uppercase font-bold text-stone-400">Readiness Score</span>
            </div>
          </div>

          <div className="space-y-2.5">
            {readiness?.checklist?.map((chk, i) => (
              <div key={i} className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  {chk.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-stone-800">{chk.item}</span>
                    <p className="text-stone-500 text-[11px] mt-0.5">{chk.details}</p>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${chk.passed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {chk.passed ? "Passed" : "Action Required"}
                </span>
              </div>
            ))}
          </div>

          {readiness?.issues?.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <h4 className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Actionable Quality Warnings ({readiness.issues.length})</span>
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-[11px]">
                {readiness.issues.map((iss, i) => (
                  <li key={i}>{iss.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Pages Inventory */}
      {activeTab === "pages" && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 uppercase font-bold text-stone-500">
                <tr>
                  <th className="px-5 py-3">Page #</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Confidence</th>
                  <th className="px-5 py-3">Engine</th>
                  <th className="px-5 py-3">Proofreading</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {pages.map((p) => {
                  const conf = p.ocrConfidence !== null ? Math.round(p.ocrConfidence * 100) : null;
                  return (
                    <tr key={p.id} className="hover:bg-stone-50/70">
                      <td className="px-5 py-3 font-bold text-stone-900">Page #{p.pageNumber}</td>
                      <td className="px-5 py-3">{p.processingMethod}</td>
                      <td className="px-5 py-3 font-mono font-bold">
                        {conf !== null ? `${conf}%` : "—"}
                      </td>
                      <td className="px-5 py-3 font-mono text-[11px] text-stone-500">
                        {p.ocrEngine || "tesseract"}
                      </td>
                      <td className="px-5 py-3">
                        {p.proofread ? (
                          <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Proofread
                          </span>
                        ) : (
                          <span className="text-amber-700 text-[11px]">Awaiting Review</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/proofreading/${p.id}`}
                          className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 text-[11px] font-semibold inline-flex items-center gap-1"
                        >
                          <span>Review</span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Chapters & Hierarchy */}
      {activeTab === "chapters" && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-serif font-bold text-base text-stone-900">Structured Chapters & Vedic Manuscript</h3>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/books/${book.id}/manuscript`}
                className="px-3 py-1.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-[#d4a359] text-xs font-semibold flex items-center gap-1.5 shadow-xs border border-[#d4a359]/40"
              >
                <Layers className="w-3.5 h-3.5 text-[#d4a359]" />
                <span>Manuscript Control Studio</span>
              </Link>
              <Link
                href={`/admin/books/${book.id}/structure`}
                className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open Structure Editor</span>
              </Link>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {book.chapters?.map((ch) => (
              <div key={ch.id} className="p-3 rounded-xl border border-stone-200 bg-stone-50/50 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900">Chapter {ch.chapterNumber}: {ch.title}</h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Spans Pages {ch.startPage || "?"} – {ch.endPage || "?"} • Passages: {ch.passages?.length || 0}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-800">
                  {ch.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Revision & Correction History */}
      {activeTab === "history" && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <h3 className="font-serif font-bold text-base text-stone-900 flex items-center gap-2">
            <History className="w-4 h-4 text-amber-600" />
            <span>Immutable Revision & Correction History</span>
          </h3>
          <p className="text-xs text-stone-500">
            Audit trail of human corrections across all pages. Raw OCR and previous text are strictly preserved.
          </p>

          <div className="space-y-2 text-xs pt-2">
            {correctionHistory.length === 0 ? (
              <p className="text-stone-400 italic py-4 text-center">No manual corrections recorded yet for this manuscript.</p>
            ) : (
              correctionHistory.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl border border-stone-200 bg-stone-50/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-800">Page {item.page?.pageNumber || "?"}</span>
                      <span className="text-stone-400">•</span>
                      <span className="font-mono text-stone-600">Corrected by {item.correctedBy}</span>
                    </div>
                    <span className="text-stone-400 font-mono">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-rose-50/80 p-2 rounded-lg border border-rose-200 text-rose-900">
                      <span className="text-[10px] uppercase font-bold text-rose-500 block mb-1">Previous Text</span>
                      <p className="line-clamp-3 whitespace-pre-wrap">{item.previousText || "—"}</p>
                    </div>
                    <div className="bg-emerald-50/80 p-2 rounded-lg border border-emerald-200 text-emerald-900">
                      <span className="text-[10px] uppercase font-bold text-emerald-500 block mb-1">Corrected Text</span>
                      <p className="line-clamp-3 whitespace-pre-wrap">{item.correctedText || "—"}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Selective Reprocessing */}
      {activeTab === "reprocessing" && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4 text-xs">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">Selective Stage Reprocessing</h3>
            <p className="text-stone-500 mt-0.5">
              Execute individual pipeline stages safely without re-running the entire book from scratch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
              <h4 className="font-bold text-stone-900">1. Rebuild Hierarchy & Passages</h4>
              <p className="text-stone-500 text-[11px]">
                Re-runs chapter detection and verse shloka assembly from current cleaned & proofread page texts.
              </p>
              <button
                disabled={loadingAction === "structure"}
                onClick={() => handleSelectiveReprocess("structure")}
                className="w-full mt-2 px-3 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl font-semibold cursor-pointer disabled:opacity-50"
              >
                {loadingAction === "structure" ? "Structuring..." : "Rebuild Structure"}
              </button>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
              <h4 className="font-bold text-stone-900">2. Re-typeset Digital PDF</h4>
              <p className="text-stone-500 text-[11px]">
                Compiles fresh publication-grade digital book PDF containing approved proofread texts.
              </p>
              <button
                disabled={loadingAction === "pdf"}
                onClick={() => handleSelectiveReprocess("pdf")}
                className="w-full mt-2 px-3 py-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 rounded-xl font-semibold cursor-pointer disabled:opacity-50"
              >
                {loadingAction === "pdf" ? "Compiling PDF..." : "Generate Book PDF"}
              </button>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-2">
              <h4 className="font-bold text-stone-900">3. Background OCR Reprocess</h4>
              <p className="text-stone-500 text-[11px]">
                Re-enqueues OCR job into background worker queue. Approved human text is strictly preserved.
              </p>
              <button
                disabled={loadingAction === "enqueue_ocr"}
                onClick={() => handleSelectiveReprocess("enqueue_ocr")}
                className="w-full mt-2 px-3 py-2 bg-[#13382c] hover:bg-[#1a4a3a] text-white rounded-xl font-semibold cursor-pointer disabled:opacity-50"
              >
                {loadingAction === "enqueue_ocr" ? "Enqueuing..." : "Enqueue Background OCR"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 7: Ingestion Jobs */}
      {activeTab === "jobs" && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <h3 className="font-serif font-bold text-base text-stone-900">Historical Ingestion Jobs</h3>
          <div className="space-y-2 text-xs">
            {book.ingestJobs?.map((job) => (
              <div key={job.id} className="p-3 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-800">Job {job.id.slice(0, 8)}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-800">
                      {job.status}
                    </span>
                  </div>
                  <p className="text-stone-500 text-[11px] mt-1">{job.currentStep || "—"}</p>
                </div>
                <div className="text-right text-[11px] font-mono text-stone-400">
                  {new Date(job.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
