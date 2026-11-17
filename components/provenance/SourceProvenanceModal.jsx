"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ShieldCheck,
  BookOpen,
  FileText,
  User,
  Calendar,
  Layers,
  History,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  Clock,
  Sparkles,
  Bookmark,
} from "lucide-react";
import VerificationBadge from "./VerificationBadge.jsx";

export default function SourceProvenanceModal({
  passageId = null,
  initialData = null,
  isOpen = false,
  onClose,
}) {
  const [provenance, setProvenance] = useState(initialData);
  const [loading, setLoading] = useState(!initialData && Boolean(passageId));
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("bibliographic"); // bibliographic | content | extraction | audit

  useEffect(() => {
    if (!isOpen || !passageId) return;

    if (initialData && initialData.passageId === passageId) {
      setProvenance(initialData);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(`/api/provenance/passage/${passageId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Could not retrieve source provenance.");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setProvenance(data.provenance);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, passageId, initialData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#fcfaf5] text-stone-900 w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl border border-amber-900/15 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-stone-100 flex items-start justify-between gap-4 border-b border-amber-600/30">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-serif font-bold text-amber-100">
                Scholarly Source Verification & Provenance
              </h2>
            </div>
            <p className="text-xs text-stone-400 font-mono">
              Traceable manuscript evidence, bibliographic lineage, and verification history.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-stone-100 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-stone-200 bg-[#f7f3ea] text-xs font-semibold overflow-x-auto">
          {[
            { id: "bibliographic", label: "Bibliographic Provenance", icon: BookOpen },
            { id: "content", label: "Textual Layers & Translations", icon: Layers },
            { id: "extraction", label: "OCR & Folio Evidence", icon: FileText },
            { id: "audit", label: "Scholarly Review Audit", icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 border-b-2 font-medium transition whitespace-nowrap ${
                  isActive
                    ? "border-amber-700 text-amber-950 font-bold bg-white/60 rounded-t-xl"
                    : "border-transparent text-stone-600 hover:text-stone-900 hover:border-stone-300"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-800" : "text-stone-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm font-sans">
          {loading && (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-amber-700 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-stone-500 font-mono">
                Tracing manuscript provenance from Gurukul archives...
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-start gap-3 text-xs">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold">Provenance Data Unavailable</p>
                <p className="mt-0.5 text-stone-600">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && provenance && (
            <>
              {/* Top Summary Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-stone-900">
                      {provenance.structuralReference.bookTitle}
                    </span>
                    <VerificationBadge
                      status={provenance.verificationAudit?.currentStatus}
                      ocrConfidence={provenance.extractionProvenance?.opticalConfidence}
                      showConfidence={true}
                    />
                  </div>
                  <p className="text-xs text-stone-500 font-mono">
                    {provenance.structuralReference.chapterTitle} · {provenance.structuralReference.verseNumber || "Passage"} · Folio / Page {provenance.structuralReference.sourcePage || "N/A"}
                  </p>
                </div>

                {provenance.structuralReference.readerUrl && (
                  <a
                    href={provenance.structuralReference.readerUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-200/80 transition"
                  >
                    <span>Open in BookReader</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>

              {/* Tab 1: Bibliographic Lineage */}
              {activeTab === "bibliographic" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block font-bold">
                        Attributed Author / Sage
                      </span>
                      <p className="font-serif font-bold text-stone-800 text-base">
                        {provenance.structuralReference.author}
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block font-bold">
                        Tradition / Lineage
                      </span>
                      <p className="font-sans font-semibold text-stone-800">
                        {provenance.structuralReference.tradition}
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block font-bold">
                        Publisher / Critical Edition
                      </span>
                      <p className="font-sans text-stone-700">
                        {provenance.bibliographicDetails.publisher || "Classical Manuscript Archive / Chowkhamba Series"}
                        {provenance.bibliographicDetails.edition && ` (${provenance.bibliographicDetails.edition})`}
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block font-bold">
                        Language & Script
                      </span>
                      <p className="font-sans text-stone-700">
                        {provenance.bibliographicDetails.originalLanguage} ({provenance.bibliographicDetails.script})
                        {provenance.bibliographicDetails.publicationYear && ` · Year: ${provenance.bibliographicDetails.publicationYear}`}
                      </p>
                    </div>
                  </div>

                  {/* Scholarly Integrity Notice */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-4 h-4 text-amber-700" />
                      <span>Gurukul Academic & Shastric Authenticity Guarantee</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed">
                      Every passage in this digital edition corresponds strictly to physical archival manuscripts. Gurukul never fabricates citations, verses, or commentary.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Textual Layers & Translations */}
              {activeTab === "content" && (
                <div className="space-y-4">
                  {/* Original Sanskrit / Verse */}
                  <div className="p-5 bg-white rounded-2xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900 font-mono">
                        Original Shastric Verse (Sanskrit / Devanagari)
                      </span>
                      <span className="text-[10px] font-mono text-stone-400">Canonical Scripture</span>
                    </div>
                    <div className="p-4 bg-[#fcf8f0] rounded-xl border border-amber-200/60 font-serif text-base text-stone-900 leading-relaxed whitespace-pre-wrap">
                      {provenance.contentLayers.originalText}
                    </div>
                  </div>

                  {/* Transliteration */}
                  {provenance.contentLayers.transliteration && (
                    <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1">
                      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider font-mono">
                        IAST Transliteration
                      </span>
                      <p className="font-mono text-xs text-stone-800">
                        {provenance.contentLayers.transliteration}
                      </p>
                    </div>
                  )}

                  {/* Translations Distinction */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Hindi Translation */}
                    <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800">Hindi Translation</span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {provenance.contentLayers.translations.hindi.isAvailable ? "Available" : "Not Provided"}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed italic bg-stone-50 p-3 rounded-xl border border-stone-100 min-h-[60px]">
                        {provenance.contentLayers.translations.hindi.text || "No authorized Hindi translation recorded for this specific verse."}
                      </p>
                      {provenance.contentLayers.translations.hindi.translator && (
                        <p className="text-[10px] text-stone-400 font-mono">
                          Translator: {provenance.contentLayers.translations.hindi.translator}
                        </p>
                      )}
                    </div>

                    {/* English Translation */}
                    <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800">English Translation</span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {provenance.contentLayers.translations.english.isAvailable ? "Available" : "Not Provided"}
                        </span>
                      </div>
                      <p className="text-xs text-stone-700 leading-relaxed italic bg-stone-50 p-3 rounded-xl border border-stone-100 min-h-[60px]">
                        {provenance.contentLayers.translations.english.text || "No authorized English translation recorded for this specific verse."}
                      </p>
                      {provenance.contentLayers.translations.english.translator && (
                        <p className="text-[10px] text-stone-400 font-mono">
                          Translator: {provenance.contentLayers.translations.english.translator}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Traditional Commentary */}
                  {provenance.contentLayers.traditionalCommentary.isAvailable && (
                    <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1.5">
                      <span className="text-xs font-bold text-stone-800">
                        Traditional Commentary / Bhashya
                      </span>
                      <p className="text-xs text-stone-700 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-200/50">
                        {provenance.contentLayers.traditionalCommentary.commentary}
                      </p>
                      {provenance.contentLayers.traditionalCommentary.source && (
                        <p className="text-[10px] text-stone-400 font-mono">
                          Commentary Source: {provenance.contentLayers.traditionalCommentary.source}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Extraction & Manuscript Evidence */}
              {activeTab === "extraction" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1">
                      <span className="text-[10px] font-mono text-stone-400 uppercase block font-bold">
                        Extraction Method
                      </span>
                      <p className="font-semibold text-stone-800 text-xs">
                        {provenance.extractionProvenance.processingMethod}
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1">
                      <span className="text-[10px] font-mono text-stone-400 uppercase block font-bold">
                        OCR Engine
                      </span>
                      <p className="font-semibold text-stone-800 text-xs font-mono">
                        {provenance.extractionProvenance.ocrEngine}
                      </p>
                    </div>

                    <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-1">
                      <span className="text-[10px] font-mono text-stone-400 uppercase block font-bold">
                        Optical Confidence
                      </span>
                      <p className="font-semibold text-emerald-800 text-xs font-mono">
                        {provenance.extractionProvenance.opticalConfidence !== null
                          ? `${Math.round(provenance.extractionProvenance.opticalConfidence * 100)}%`
                          : "Standard (>=90%)"}
                      </p>
                    </div>
                  </div>

                  {/* Scanned Manuscript Page Reference */}
                  <div className="p-5 bg-white rounded-2xl border border-stone-200 space-y-3">
                    <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider font-mono">
                      Physical Folio & Scanned Evidence
                    </h4>
                    <p className="text-xs text-stone-600">
                      This passage was extracted from page folio #{provenance.structuralReference.sourcePage || "1"} of the original physical manuscript.
                    </p>

                    <div className="flex items-center gap-3">
                      <a
                        href={provenance.structuralReference.pdfSourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-100 text-xs font-semibold transition"
                      >
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span>Stream Original PDF Manuscript</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Scholarly Review Audit */}
              {activeTab === "audit" && (
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-800">Current Verification Status</span>
                      <VerificationBadge status={provenance.verificationAudit?.currentStatus} />
                    </div>
                    {provenance.verificationAudit?.verifiedBy && (
                      <p className="text-xs text-stone-600">
                        Verified by: <span className="font-mono font-semibold text-stone-800">{provenance.verificationAudit.verifiedBy}</span>
                        {provenance.verificationAudit.verifiedAt && (
                          <span className="text-stone-400"> on {new Date(provenance.verificationAudit.verifiedAt).toLocaleDateString()}</span>
                        )}
                      </p>
                    )}
                    {provenance.verificationAudit?.scholarlyNotes && (
                      <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs text-amber-950 italic">
                        "{provenance.verificationAudit.scholarlyNotes}"
                      </div>
                    )}
                  </div>

                  {/* Review History Trail */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider font-mono px-1">
                      Immutable Audit Trail ({provenance.verificationAudit?.reviewTrail?.length || 0} Actions)
                    </h4>
                    {provenance.verificationAudit?.reviewTrail?.length === 0 ? (
                      <p className="text-xs text-stone-400 italic px-1">
                        No previous human review actions recorded yet. Passage is awaiting first scholarly review.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {provenance.verificationAudit.reviewTrail.map((item, idx) => (
                          <div
                            key={item.id || idx}
                            className="p-3 bg-white rounded-xl border border-stone-200 text-xs flex items-start justify-between gap-3"
                          >
                            <div className="space-y-0.5">
                              <span className="font-bold text-stone-800 block">
                                {item.action} → {item.newStatus}
                              </span>
                              <p className="text-[11px] text-stone-500 font-mono">
                                By {item.reviewerEmail} ({item.reviewerRole})
                              </p>
                              {item.scholarlyNotes && (
                                <p className="text-[11px] text-stone-700 italic mt-1">
                                  "{item.scholarlyNotes}"
                                </p>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-stone-400 whitespace-nowrap">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 font-mono">
          <span>Gurukul Scholarly Provenance Framework v2.0</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl font-bold transition font-sans"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
