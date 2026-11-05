"use client";

import { useState, useEffect } from "react";
import PagePreview from "./PagePreview.jsx";
import OCRReview from "./OCRReview.jsx";
import {
  Save,
  CheckCircle,
  Flag,
  ArrowLeft,
  ArrowRight,
  Loader2,
  FileText,
  AlertCircle,
  Check,
  RefreshCw,
  RotateCcw,
  History,
  ShieldCheck,
  Eye,
  Sliders,
  X,
} from "lucide-react";

export default function ProofreadingEditor({
  page,
  navigation,
  onNavigate,
  onSaved,
  qualityReport,
}) {
  const [proofreadText, setProofreadText] = useState(
    page?.proofreadText || page?.cleanedText || page?.rawText || ""
  );
  const [activeTab, setActiveTab] = useState("proofread"); // 'proofread' | 'cleaned' | 'raw' | 'diff' | 'history'
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [message, setMessage] = useState(null);
  const [isApproved, setIsApproved] = useState(page?.proofread || false);
  const [historyList, setHistoryList] = useState(page?.correctionHistory || []);

  // Flag issue modal
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagType, setFlagType] = useState("LOW_CONFIDENCE");
  const [flagMessage, setFlagMessage] = useState("");

  // Retry settings modal
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [retryDpi, setRetryDpi] = useState(300);
  const [forceOcr, setForceOcr] = useState(true);
  const [forceOverwriteProofread, setForceOverwriteProofread] = useState(false);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const confidenceScore = page?.ocrConfidence !== null ? page.ocrConfidence : 0.85;
  const confPercent = Math.round(confidenceScore * 100);

  const getConfBadge = (score) => {
    if (score >= 0.9) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (score >= 0.75) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-rose-100 text-rose-800 border-rose-300";
  };

  // Keyboard shortcuts: Ctrl+S to save, Ctrl+Enter to approve
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave(false);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSave(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [proofreadText, isApproved]);

  const handleSave = async (andApprove = false) => {
    if (andApprove) setApproving(true);
    else setSaving(true);
    setMessage(null);

    try {
      if (andApprove) {
        // First save text
        await fetch(`/api/pages/${page.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proofreadText }),
        });

        // Call dedicated transactional approval endpoint
        const approveRes = await fetch(`/api/pages/${page.id}/approve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ approve: true }),
        });
        const approveData = await approveRes.json();
        if (!approveRes.ok) {
          throw new Error(approveData.error || "Approval failed eligibility check");
        }

        setIsApproved(true);
        setMessage({ type: "success", text: "Page content saved and approved successfully!" });
      } else {
        const res = await fetch(`/api/pages/${page.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ proofreadText }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to update page");
        }
        setMessage({ type: "success", text: "Changes saved to correction history!" });
      }

      if (onSaved) onSaved();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
      setApproving(false);
    }
  };

  const handleToggleApproval = async () => {
    setApproving(true);
    setMessage(null);
    try {
      const nextStatus = !isApproved;
      const res = await fetch(`/api/pages/${page.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approve: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Approval toggle failed");
      }
      setIsApproved(nextStatus);
      setMessage({
        type: "success",
        text: nextStatus ? "Page marked as approved." : "Page approval revoked.",
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setApproving(false);
    }
  };

  const handleRollback = async (historyId) => {
    if (!confirm("Are you sure you want to rollback to this historical text revision?")) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rollbackCorrectionId: historyId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rollback failed");

      setProofreadText(data.page?.proofreadText || "");
      setMessage({ type: "success", text: "Successfully rolled back to selected revision!" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleRetrySubmit = async (e) => {
    e.preventDefault();
    setRetrying(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/pages/${page.id}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dpi: retryDpi,
          forceOcr,
          forceOverwriteProofread,
          confirmOverwrite: forceOverwriteProofread ? confirmOverwrite : false,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Retry failed");

      setMessage({ type: "success", text: `Page ${page.pageNumber} OCR reprocessed successfully.` });
      setShowRetryModal(false);
      if (onSaved) onSaved();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setRetrying(false);
    }
  };

  const handleFlagSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flagError: {
            errorType: flagType,
            message: flagMessage || "Flagged by editorial proofreader",
          },
        }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "OCR issue flagged in review queue." });
        setShowFlagModal(false);
        setFlagMessage("");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Message */}
      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center justify-between border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Reviewer Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-serif font-bold text-stone-900 text-sm">
            Page #{page.pageNumber}
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-xs text-stone-500 font-medium">
            Method: <strong className="text-stone-700">{page.processingMethod}</strong>
          </span>
          <span className="text-stone-300">•</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getConfBadge(
              confidenceScore
            )}`}
          >
            {confPercent}% Confidence
          </span>
          <span className="text-stone-300">•</span>
          {isApproved ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-300">
              <Check className="w-3 h-3" />
              <span>Approved</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Needs Review
            </span>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowRetryModal(true)}
            className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5 text-stone-500" />
            <span>OCR Settings & Retry</span>
          </button>

          <button
            onClick={() => setShowFlagModal(true)}
            className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-50 text-rose-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Flag className="w-3.5 h-3.5 text-rose-600" />
            <span>Flag Issue</span>
          </button>

          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-3.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save (Ctrl+S)</span>
          </button>

          <button
            onClick={handleToggleApproval}
            disabled={approving}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50 ${
              isApproved
                ? "bg-stone-200 hover:bg-stone-300 text-stone-800"
                : "bg-[#13382c] hover:bg-[#1a4a3a] text-white"
            }`}
          >
            {approving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isApproved ? (
              <RotateCcw className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>{isApproved ? "Revoke Approval" : "Approve Page"}</span>
          </button>
        </div>
      </div>

      {/* Two-Column Side-by-Side View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left Column: Original Scanned Page Preview */}
        <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs h-[720px] flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <span className="font-serif font-bold text-xs uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-stone-400" />
              <span>Original Scanned Manuscript</span>
            </span>
            <span className="text-[11px] text-stone-400 font-mono">
              {page.width && page.height ? `${page.width}x${page.height}px` : "Scan Image"}
            </span>
          </div>
          <div className="flex-1 mt-3 overflow-hidden rounded-xl bg-stone-100">
            <PagePreview
              imageUrl={page.imageUrl}
              pageNumber={page.pageNumber}
              ocrBlocks={page.ocrBlocks}
            />
          </div>
        </div>

        {/* Right Column: Editable Text, Diff, & History Tabs */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs h-[720px] flex flex-col overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-stone-200 bg-stone-50/70">
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setActiveTab("proofread")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                  activeTab === "proofread"
                    ? "bg-white text-stone-900 shadow-2xs border border-stone-200"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Proofread Text
              </button>
              <button
                onClick={() => setActiveTab("cleaned")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                  activeTab === "cleaned"
                    ? "bg-white text-stone-900 shadow-2xs border border-stone-200"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Cleaned
              </button>
              <button
                onClick={() => setActiveTab("raw")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                  activeTab === "raw"
                    ? "bg-white text-stone-900 shadow-2xs border border-stone-200"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Raw OCR
              </button>
              <button
                onClick={() => setActiveTab("diff")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer ${
                  activeTab === "diff"
                    ? "bg-white text-stone-900 shadow-2xs border border-stone-200"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                Version Diff
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer flex items-center gap-1 ${
                  activeTab === "history"
                    ? "bg-white text-stone-900 shadow-2xs border border-stone-200"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <History className="w-3 h-3 text-stone-400" />
                <span>History ({historyList.length})</span>
              </button>
            </div>
            <span className="text-[11px] text-stone-400 font-mono">
              {proofreadText.length} chars
            </span>
          </div>

          {/* Active Tab Body */}
          <div className="flex-1 p-4 flex flex-col overflow-y-auto">
            {activeTab === "proofread" && (
              <textarea
                value={proofreadText}
                onChange={(e) => setProofreadText(e.target.value)}
                placeholder="Proofread text here. Sanskrit shlokas, dandas, and Devanagari ligatures are strictly preserved."
                className="w-full flex-1 p-3.5 text-sm font-serif leading-relaxed text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-500 resize-none font-sans"
              />
            )}

            {activeTab === "cleaned" && (
              <div className="flex-1 p-3.5 text-sm font-serif leading-relaxed text-stone-800 bg-stone-50/70 border border-stone-200 rounded-xl overflow-auto whitespace-pre-wrap select-text">
                {page.cleanedText || "No cleaned text available."}
              </div>
            )}

            {activeTab === "raw" && (
              <div className="flex-1 p-3.5 text-xs font-mono leading-relaxed text-stone-700 bg-stone-50 border border-stone-200 rounded-xl overflow-auto whitespace-pre-wrap select-text">
                {page.rawText || "No raw text available."}
              </div>
            )}

            {activeTab === "diff" && (
              <div className="flex-1 grid grid-cols-2 gap-3 overflow-hidden">
                <div className="flex flex-col border border-stone-200 rounded-xl p-3 bg-stone-50/50">
                  <span className="text-[10px] font-bold text-stone-400 uppercase pb-1.5 border-b border-stone-200">
                    Baseline (Raw / Cleaned)
                  </span>
                  <div className="flex-1 overflow-auto text-xs font-serif leading-relaxed text-stone-700 pt-2 whitespace-pre-wrap">
                    {page.cleanedText || page.rawText || "None"}
                  </div>
                </div>
                <div className="flex flex-col border border-emerald-200 rounded-xl p-3 bg-emerald-50/30">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase pb-1.5 border-b border-emerald-200">
                    Corrected Proofread Version
                  </span>
                  <div className="flex-1 overflow-auto text-xs font-serif leading-relaxed text-stone-900 pt-2 whitespace-pre-wrap">
                    {proofreadText}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "history" && (
              <div className="space-y-3">
                {historyList.length === 0 ? (
                  <p className="text-xs text-stone-400 text-center py-10">
                    No historical revisions recorded for this page yet.
                  </p>
                ) : (
                  historyList.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-800">
                          Editor: {rev.correctedBy}
                        </span>
                        <span className="text-[11px] text-stone-400 font-mono">
                          {new Date(rev.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-stone-600 line-clamp-2 text-[11px] font-serif italic bg-white p-2 rounded-lg border border-stone-200">
                        &quot;{rev.previousText}&quot;
                      </p>
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleRollback(rev.id)}
                          className="px-2.5 py-1 rounded-lg border border-stone-300 hover:bg-stone-200 text-[11px] font-semibold text-stone-700 flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 text-stone-500" />
                          <span>Rollback to this version</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Diagnostics Section at Bottom of Editor */}
          <div className="p-3.5 border-t border-stone-200 bg-stone-50/50">
            <OCRReview
              blocks={page.ocrBlocks || []}
              ocrErrors={page.ocrErrors || []}
              confidence={page.ocrConfidence}
              language={page.language}
            />
          </div>
        </div>
      </div>

      {/* OCR Settings & Retry Modal */}
      {showRetryModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-700" />
                <span>Reprocess Page #{page.pageNumber} OCR</span>
              </h3>
              <button
                onClick={() => setShowRetryModal(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRetrySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Render Resolution (DPI)
                </label>
                <select
                  value={retryDpi}
                  onChange={(e) => setRetryDpi(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                >
                  <option value={150}>150 DPI (Fast, draft)</option>
                  <option value={300}>300 DPI (Standard, recommended)</option>
                  <option value={400}>400 DPI (High precision for dense Sanskrit)</option>
                  <option value={600}>600 DPI (Maximum resolution for aged prints)</option>
                </select>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={forceOcr}
                    onChange={(e) => setForceOcr(e.target.checked)}
                    className="rounded-sm border-stone-300 text-amber-600"
                  />
                  <span className="font-medium text-stone-700">Force Optical Character Recognition pass</span>
                </label>

                {isApproved && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-rose-900 font-bold">
                      <input
                        type="checkbox"
                        checked={forceOverwriteProofread}
                        onChange={(e) => setForceOverwriteProofread(e.target.checked)}
                        className="rounded-sm border-rose-400 text-rose-700"
                      />
                      <span>Exceptional: Overwrite human-approved text</span>
                    </label>

                    {forceOverwriteProofread && (
                      <label className="flex items-center gap-2 cursor-pointer text-[11px] text-rose-800">
                        <input
                          type="checkbox"
                          checked={confirmOverwrite}
                          onChange={(e) => setConfirmOverwrite(e.target.checked)}
                          className="rounded-sm border-rose-400 text-rose-700"
                        />
                        <span>I understand this will overwrite human-reviewed content.</span>
                      </label>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowRetryModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={retrying || (forceOverwriteProofread && !confirmOverwrite)}
                  className="px-4 py-2 bg-[#13382c] hover:bg-[#1a4a3a] text-white rounded-xl font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {retrying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>{retrying ? "Reprocessing..." : "Start OCR Reprocess"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flag Issue Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-stone-900 font-serif flex items-center gap-2">
              <Flag className="w-4 h-4 text-rose-600" />
              <span>Flag OCR Issue on Page #{page.pageNumber}</span>
            </h3>

            <form onSubmit={handleFlagSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Issue Type
                </label>
                <select
                  value={flagType}
                  onChange={(e) => setFlagType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white"
                >
                  <option value="LOW_CONFIDENCE">LOW_CONFIDENCE (Unclear characters)</option>
                  <option value="EMPTY_PAGE">EMPTY_PAGE (Missing content)</option>
                  <option value="OCR_FAILED">OCR_FAILED (Misaligned or scrambled)</option>
                  <option value="IMAGE_RENDER_FAILED">IMAGE_RENDER_FAILED (Corrupt scan)</option>
                  <option value="TEXT_EXTRACTION_FAILED">TEXT_EXTRACTION_FAILED</option>
                  <option value="LANGUAGE_DETECTION_FAILED">LANGUAGE_DETECTION_FAILED</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Description / Note
                </label>
                <textarea
                  value={flagMessage}
                  onChange={(e) => setFlagMessage(e.target.value)}
                  placeholder="e.g. Sanskrit verse ligatures blurred on bottom half of page..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowFlagModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-semibold shadow-xs cursor-pointer"
                >
                  Submit Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
