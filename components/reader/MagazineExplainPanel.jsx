"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  X,
  BookOpen,
  Languages,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ChevronRight,
  Bookmark,
  Share2,
  HelpCircle,
  Layers,
  FileText,
} from "lucide-react";

/**
 * On-Demand Contextual AI & Shastra Explanation Panel.
 * Non-destructive slide-over drawer that provides deep scholarly explanations
 * grounded strictly in the authentic text of the current PDF page.
 */
export default function MagazineExplainPanel({
  isOpen,
  onClose,
  currentPage,
  numPages,
  bookId,
  bookTitle,
  pagesMap = {},
  passages = [],
  spreadPages = null, // { left: number, right: number } if in 2-page spread
}) {
  // If in spread mode, allow reader to pick which page of the spread to inspect
  const [selectedPageNum, setSelectedPageNum] = useState(currentPage);
  const [language, setLanguage] = useState("en"); // "en" | "hi"
  const [loading, setLoading] = useState(false);
  const [explanationData, setExplanationData] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [selectedPassageId, setSelectedPassageId] = useState(null);

  // Sync selected page when currentPage changes
  useEffect(() => {
    setSelectedPageNum(currentPage);
    setExplanationData(null);
    setError(null);
    setSelectedPassageId(null);
  }, [currentPage]);

  if (!isOpen) return null;

  const activePageData = pagesMap[selectedPageNum] || null;
  const rawPageText =
    activePageData?.proofreadText ||
    activePageData?.cleanedText ||
    activePageData?.rawText ||
    "";

  // Filter passages belonging to the selected page
  const pagePassages = passages.filter(
    (p) => Number(p.sourcePage) === Number(selectedPageNum)
  );

  const isVerified = Boolean(
    activePageData?.proofread ||
      (activePageData?.verificationStatus &&
        activePageData.verificationStatus !== "UNREVIEWED")
  );

  // Trigger On-Demand AI Explanation
  const handleExplain = async (customText = null, customPassageId = null) => {
    const textToExplain = (customText || rawPageText).trim();

    if (!textToExplain && !customPassageId) {
      setError("No digitized text layer found for this page yet.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reader/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          bookTitle,
          pageNumber: selectedPageNum,
          passageId: customPassageId || selectedPassageId,
          passageText: textToExplain,
          language,
          action: "explain",
          ocrConfidence: activePageData?.ocrConfidence || 0.9,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to generate explanation");
      }

      setExplanationData(data);
    } catch (err) {
      console.error("Explanation error:", err);
      setError(err.message || "Failed to synthesize classical explanation");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside
      aria-label="Scholarly Explanation Drawer"
      className="fixed inset-y-0 right-0 w-full sm:w-[480px] lg:w-[540px] bg-[#fdfbf7] text-stone-900 z-50 shadow-2xl border-l border-[#d4a359]/40 flex flex-col justify-between animate-in slide-in-from-right duration-300"
    >
      {/* Drawer Header */}
      <div className="p-4 sm:p-5 bg-[#13382c] text-white flex items-center justify-between shrink-0 border-b border-[#0f2e24]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#d4a359] text-[#13382c] flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg tracking-tight text-white">
              Shastra Explanations
            </h3>
            <p className="text-xs text-amber-200/80 font-serif">
              Page {selectedPageNum} • {bookTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex bg-black/30 rounded-lg p-0.5 border border-white/10 text-xs">
            <button
              onClick={() => {
                setLanguage("en");
                if (explanationData) handleExplain();
              }}
              className={`px-2 py-1 rounded-md transition font-medium min-h-[32px] ${
                language === "en"
                  ? "bg-[#d4a359] text-stone-950 font-bold"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => {
                setLanguage("hi");
                if (explanationData) handleExplain();
              }}
              className={`px-2 py-1 rounded-md transition font-medium min-h-[32px] ${
                language === "hi"
                  ? "bg-[#d4a359] text-stone-950 font-bold"
                  : "text-stone-300 hover:text-white"
              }`}
            >
              हिन्दी
            </button>
          </div>

          <button
            onClick={onClose}
            aria-label="Close explanation drawer"
            className="min-w-[44px] min-h-[44px] rounded-lg hover:bg-white/10 text-stone-300 hover:text-white transition cursor-pointer flex items-center justify-center"
            title="Close Drawer (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Spread Selector (when viewing two-page magazine spread) */}
      {spreadPages && (
        <div className="px-4 py-2.5 bg-[#f5ede0] border-b border-[#e2d5c0] flex items-center justify-between text-xs font-serif shrink-0">
          <span className="text-stone-700 font-semibold">Inspect Page:</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setSelectedPageNum(spreadPages.left)}
              className={`px-3 py-1.5 rounded-lg border text-xs transition cursor-pointer min-h-[36px] ${
                selectedPageNum === spreadPages.left
                  ? "bg-[#13382c] text-white font-bold shadow-2xs border-[#13382c]"
                  : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
              }`}
            >
              Left (p. {spreadPages.left})
            </button>
            <button
              onClick={() => setSelectedPageNum(spreadPages.right)}
              className={`px-3 py-1.5 rounded-lg border text-xs transition cursor-pointer min-h-[36px] ${
                selectedPageNum === spreadPages.right
                  ? "bg-[#13382c] text-white font-bold shadow-2xs border-[#13382c]"
                  : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
              }`}
            >
              Right (p. {spreadPages.right})
            </button>
          </div>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {/* Page Context Badge */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-stone-700 font-bold">
            Manuscript Page {selectedPageNum} of {numPages}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-2.5 py-1 rounded-full border ${
              isVerified
                ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                : "bg-amber-50 text-amber-900 border-amber-300"
            }`}
          >
            {isVerified ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Verified Shastra Text</span>
              </>
            ) : (
              <>
                <FileText className="w-3.5 h-3.5 text-amber-700" />
                <span>OCR Extracted Layer</span>
              </>
            )}
          </span>
        </div>

        {/* Individual Passages Chips (if multiple verses on this page) */}
        {pagePassages.length > 1 && (
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase font-bold text-stone-700 block">
              Verses on this Page ({pagePassages.length}):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {pagePassages.map((p, idx) => (
                <button
                  key={p.id || idx}
                  onClick={() => {
                    setSelectedPassageId(p.id);
                    handleExplain(p.text, p.id);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition cursor-pointer min-h-[36px] ${
                    selectedPassageId === p.id
                      ? "bg-[#13382c] text-white border-[#13382c] font-bold"
                      : "bg-white text-stone-800 border-[#ede5d6] hover:border-[#d4a359]"
                  }`}
                >
                  Shloka {p.passageNumber || idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Original Page Text Card */}
        <div className="bg-white rounded-2xl border border-[#ede5d6] p-4 sm:p-5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-mono font-bold tracking-wider text-[#6b4213]">
              Original Page Text (Sanskrit / Hindi)
            </span>
            {rawPageText && (
              <button
                onClick={() => handleCopy(rawPageText)}
                className="text-stone-600 hover:text-stone-900 transition cursor-pointer p-1 rounded-md hover:bg-stone-100 min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                title="Copy original text"
                aria-label="Copy page text to clipboard"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {rawPageText ? (
            <p className="font-sanskrit text-sm sm:text-base text-stone-900 leading-relaxed max-h-56 overflow-y-auto whitespace-pre-wrap pr-1 scrollbar-thin">
              {rawPageText}
            </p>
          ) : (
            <p className="text-xs sm:text-sm text-stone-500 font-serif italic">
              No extracted text available for this page. Click below to inspect.
            </p>
          )}
        </div>

        {/* Explain CTA Button */}
        {!explanationData && !loading && (
          <button
            onClick={() => handleExplain()}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#13382c] hover:bg-[#1a4a3b] text-white font-serif font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-[#d4a359]/40 group min-h-[48px]"
          >
            <Sparkles className="w-4 h-4 text-[#d4a359] group-hover:scale-110 transition-transform" />
            <span>Explain Page {selectedPageNum} with Sage AI</span>
          </button>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="bg-white rounded-2xl border border-[#ede5d6] p-8 flex flex-col items-center justify-center space-y-3 text-center shadow-2xs">
            <Loader2 className="w-8 h-8 text-[#d4a359] animate-spin" />
            <p className="font-serif font-bold text-sm text-stone-900">
              Synthesizing Classical Wisdom...
            </p>
            <p className="text-xs text-stone-600 font-serif italic max-w-xs">
              Grounded in the authentic Sanskrit and Vedic principles of Page {selectedPageNum}.
            </p>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="bg-amber-50 border border-amber-300 text-amber-950 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-800 shrink-0" />
              <span>Explanation Notice</span>
            </div>
            <p className="leading-relaxed">{error}</p>
            <button
              onClick={() => handleExplain()}
              className="text-xs font-bold text-amber-900 underline cursor-pointer mt-1 block min-h-[36px]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* AI Synthesis Result */}
        {explanationData && !loading && (
          <div className="bg-white rounded-2xl border border-[#d4a359]/40 p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
            {/* AI Identification Badge */}
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-200">
              <span className="text-xs font-mono uppercase font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300">
                AI Research Synthesis • Grounded in Shastra
              </span>
              <span className="text-xs font-mono text-stone-600 font-medium">
                {language === "en" ? "English Commentary" : "Hindi Bhashya"}
              </span>
            </div>

            {/* Core Meaning / Simple Meaning */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-stone-700 block">
                Essence & Meaning:
              </span>
              <div className="font-serif text-sm sm:text-base text-stone-900 leading-relaxed whitespace-pre-wrap">
                {explanationData.simpleMeaning ||
                  explanationData.answerText ||
                  explanationData.explanation ||
                  explanationData.summary ||
                  "Classical explanation generated based on verified textual principles."}
              </div>
            </div>

            {/* Word-by-Word Breakdown Chips */}
            {explanationData.wordMeanings &&
              Array.isArray(explanationData.wordMeanings) &&
              explanationData.wordMeanings.length > 0 && (
                <div className="space-y-2.5 pt-3 border-t border-stone-100">
                  <span className="text-xs font-mono uppercase tracking-wider font-bold text-stone-700 block">
                    Word-by-Word Sanskrit Analysis ({explanationData.wordMeanings.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {explanationData.wordMeanings.map((wm, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-xl bg-[#faf6ef] border border-[#ede5d6] text-xs space-y-1"
                      >
                        <strong className="font-sanskrit text-stone-900 block text-sm font-bold">
                          {wm.word || wm.sanskrit || wm.term}
                        </strong>
                        <span className="text-xs text-stone-700 italic block font-medium">
                          {wm.meaning || wm.translation || wm.english}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Context & Significance */}
            {explanationData.context && (
              <div className="space-y-2 pt-3 border-t border-stone-100">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-stone-700 block">
                  Philosophical Context & Significance:
                </span>
                <p className="font-serif text-xs sm:text-sm text-stone-800 leading-relaxed italic">
                  {explanationData.context}
                </p>
              </div>
            )}

            {/* Citations / Passages */}
            {explanationData.citations && explanationData.citations.length > 0 && (
              <div className="space-y-2 pt-3 border-t border-stone-100 text-xs">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-stone-700 block">
                  Cited Classical Passages:
                </span>
                <div className="space-y-1.5">
                  {explanationData.citations.map((c, idx) => (
                    <div
                      key={idx}
                      className="text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-stone-800 flex justify-between items-center"
                    >
                      <span className="font-bold text-stone-900">
                        {c.bookTitle || bookTitle} (Page {c.pageNumber || selectedPageNum})
                      </span>
                      {c.isHumanVerified && (
                        <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar inside Drawer */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <button
                onClick={() => handleExplain()}
                className="text-[#6b4213] hover:text-[#13382c] font-bold underline cursor-pointer min-h-[44px] inline-flex items-center"
              >
                Re-Synthesize
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-white font-serif font-bold text-xs transition cursor-pointer min-h-[44px] inline-flex items-center"
              >
                Resume Reading
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Return Bar */}
      <div className="p-4 bg-[#faf6ef] border-t border-[#ede5d6] flex items-center justify-between shrink-0">
        <span className="text-xs text-stone-600 font-serif">
          Grounded in authentic Vedic manuscripts
        </span>
        <button
          onClick={onClose}
          className="text-xs font-bold text-[#13382c] hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
        >
          Close Drawer
        </button>
      </div>
    </aside>
  );
}
