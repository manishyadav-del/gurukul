"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Network,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  Layers,
  ArrowRight,
  BookOpen,
  GitMerge,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
  Activity,
  FileText,
  Clock,
  Play,
} from "lucide-react";

export default function KnowledgeGraphAdminStudio({ initialData = null }) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [activeTab, setActiveTab] = useState("pending"); // "pending", "entities", "extraction", "overview"
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Pending Review Filters & Pagination
  const [pendingRelationships, setPendingRelationships] = useState(initialData?.pendingRelationships || []);
  const [pendingTotal, setPendingTotal] = useState(initialData?.metrics?.pendingReviewRelationships || 0);
  const [pendingPage, setPendingPage] = useState(1);
  const [confidenceFilter, setConfidenceFilter] = useState("all"); // "all", "high", "low"

  // Extraction Runner State
  const [extractText, setExtractText] = useState("");
  const [extractMethod, setExtractMethod] = useState("RULE_BASED_NLP");
  const [extractAutoApprove, setExtractAutoApprove] = useState(false);
  const [extractionResult, setExtractionResult] = useState(null);

  // Entity Search & Merge State
  const [entityQuery, setEntityQuery] = useState("");
  const [entityCategory, setEntityCategory] = useState("ALL");
  const [searchResults, setSearchResults] = useState([]);
  const [primarySlug, setPrimarySlug] = useState("");
  const [secondarySlug, setSecondarySlug] = useState("");
  const [mergeResult, setMergeResult] = useState(null);

  // Jobs State
  const [jobs, setJobs] = useState(initialData?.recentJobs || []);

  // Fetch / Refresh Overview Data
  const refreshData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/knowledge-graph");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setPendingRelationships(json.pendingRelationships || []);
        setPendingTotal(json.metrics?.pendingReviewRelationships || 0);
        setJobs(json.recentJobs || []);
      }
    } catch (e) {
      console.error("Failed to load admin knowledge graph data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) {
      refreshData();
    }
  }, [initialData]);

  // Load Pending Review Page
  const loadPendingPage = async (page) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/knowledge-graph?view=pending&page=${page}`);
      if (res.ok) {
        const json = await res.json();
        setPendingRelationships(json.relationships || []);
        setPendingTotal(json.total || 0);
        setPendingPage(page);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  // Seed Classical Graph
  const handleSeedGraph = async () => {
    if (!confirm("Seed and synchronize canonical Vedic Astrology, Kundalini, and Sanskrit concepts into PostgreSQL?")) return;
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/knowledge-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "seed_graph" }),
      });
      const json = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Seeded ${json.result?.seededConcepts || 0} concepts and ${json.result?.seededRelationships || 0} relationships!` });
        await refreshData();
      } else {
        setMessage({ type: "error", text: json.error || "Failed to seed graph." });
      }
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Approve (Verify) Relationship
  const handleApprove = async (relationshipId) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/knowledge-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_relationship", relationshipId }),
      });
      if (res.ok) {
        setPendingRelationships((prev) => prev.filter((r) => r.id !== relationshipId));
        setPendingTotal((prev) => Math.max(0, prev - 1));
        setMessage({ type: "success", text: "Relationship approved and verified as classical fact." });
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to approve relationship." });
      }
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Relationship
  const handleReject = async (relationshipId) => {
    const reason = prompt("Enter optional rejection reason:") || "Unsubstantiated or inaccurate classical connection.";
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/knowledge-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject_relationship", relationshipId, reason }),
      });
      if (res.ok) {
        setPendingRelationships((prev) => prev.filter((r) => r.id !== relationshipId));
        setPendingTotal((prev) => Math.max(0, prev - 1));
        setMessage({ type: "info", text: "Relationship rejected and archived." });
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to reject relationship." });
      }
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Run Knowledge Extraction
  const handleRunExtraction = async (e) => {
    e.preventDefault();
    if (!extractText.trim()) return;
    setActionLoading(true);
    setExtractionResult(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/knowledge-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "extract_knowledge",
          text: extractText.trim(),
          method: extractMethod,
          autoApprove: extractAutoApprove,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setExtractionResult(json.extraction);
        setMessage({
          type: "success",
          text: `Extracted ${json.extraction.entitiesFound} entities and ${json.extraction.relationsFound} candidate relationships!`,
        });
        await refreshData();
      } else {
        setMessage({ type: "error", text: json.error || "Extraction failed." });
      }
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Search Concepts for Merge
  const handleSearchConcepts = async (e) => {
    e.preventDefault();
    if (!entityQuery.trim()) return;
    try {
      const res = await fetch(`/api/knowledge-graph/search?q=${encodeURIComponent(entityQuery.trim())}&category=${entityCategory}`);
      if (res.ok) {
        const json = await res.json();
        setSearchResults(json || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Merge Concepts
  const handleMergeConcepts = async (e) => {
    e.preventDefault();
    if (!primarySlug || !secondarySlug) return;
    if (primarySlug === secondarySlug) {
      alert("Primary and secondary concept cannot be the same.");
      return;
    }
    if (!confirm(`Merge '${secondarySlug}' into canonical entity '${primarySlug}'? This will redirect all relationships and aliases permanently.`)) {
      return;
    }
    setActionLoading(true);
    setMergeResult(null);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/knowledge-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "merge_concepts",
          primarySlug: primarySlug.trim(),
          secondarySlug: secondarySlug.trim(),
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setMergeResult(json.mergeResult);
        setMessage({
          type: "success",
          text: `Successfully merged '${secondarySlug}' into '${primarySlug}'. Migrated ${json.mergeResult.migratedOutgoing + json.mergeResult.migratedIncoming} connections!`,
        });
        setSecondarySlug("");
        await refreshData();
      } else {
        setMessage({ type: "error", text: json.error || "Merge failed." });
      }
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Reprocess Job
  const handleReprocessJob = async (jobId) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/knowledge-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reprocess_extraction", jobId }),
      });
      const json = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: `Reprocessed job ${jobId}. Found ${json.reprocessResult?.entitiesFound || 0} entities.` });
        await refreshData();
      } else {
        setMessage({ type: "error", text: json.error || "Reprocess failed." });
      }
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const metrics = data?.metrics || {
    totalConcepts: 0,
    totalRelationships: 0,
    approvedRelationships: 0,
    pendingReviewRelationships: 0,
    totalExtractionJobs: 0,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#13382c] text-white p-6 rounded-2xl shadow-md border border-[#1f5442]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
              <Network className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-300 font-semibold">
              Shastric Intelligence Infrastructure
            </span>
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-white">
            Knowledge Graph Administration Studio
          </h1>
          <p className="text-sm text-emerald-100/70 font-sans max-w-2xl">
            Audit entities, review AI-suggested shastric links, verify source provenance, and execute incremental extraction pipelines across classical treatises.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeedGraph}
            disabled={actionLoading}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-md transition disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-stone-950" />
            <span>Seed Classical Canon</span>
          </button>
          <Link
            href="/explore"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs flex items-center gap-2 border border-white/10 transition"
          >
            <span>Open Public Explorer</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {message && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : message.type === "error"
              ? "bg-rose-50 text-rose-900 border-rose-200"
              : "bg-amber-50 text-amber-900 border-amber-200"
          }`}
        >
          <span>{message.text}</span>
          <button onClick={() => setMessage(null)} className="text-xs font-bold underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold">Total Entities</span>
          <p className="text-2xl font-serif font-black text-stone-900">{metrics.totalConcepts}</p>
          <span className="text-[11px] text-stone-500">Astrology, Kundalini, Rishis</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold">Total Connections</span>
          <p className="text-2xl font-serif font-black text-stone-900">{metrics.totalRelationships}</p>
          <span className="text-[11px] text-emerald-700 font-medium">{metrics.approvedRelationships} verified</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/90 bg-amber-50/30 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-amber-800 font-bold">Pending Review</span>
          <p className="text-2xl font-serif font-black text-amber-900">{metrics.pendingReviewRelationships}</p>
          <span className="text-[11px] text-amber-700">AI-suggested relationships</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold">Verified Facts</span>
          <p className="text-2xl font-serif font-black text-emerald-800">{metrics.approvedRelationships}</p>
          <span className="text-[11px] text-emerald-600">Classical manuscripts</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500 font-bold">Extraction Jobs</span>
          <p className="text-2xl font-serif font-black text-stone-900">{metrics.totalExtractionJobs || jobs.length}</p>
          <span className="text-[11px] text-stone-500">Incremental NLP batches</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-stone-200 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === "pending"
              ? "bg-[#13382c] text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Review Queue ({pendingTotal})</span>
        </button>

        <button
          onClick={() => setActiveTab("entities")}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === "entities"
              ? "bg-[#13382c] text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <GitMerge className="w-4 h-4" />
          <span>Entity Directory & Merge</span>
        </button>

        <button
          onClick={() => setActiveTab("extraction")}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === "extraction"
              ? "bg-[#13382c] text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Run Extraction Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 shrink-0 ${
            activeTab === "jobs"
              ? "bg-[#13382c] text-white shadow-xs"
              : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Extraction Jobs History ({jobs.length})</span>
        </button>
      </div>

      {/* --- TAB 1: PENDING REVIEW QUEUE --- */}
      {activeTab === "pending" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-serif font-bold text-lg text-stone-900">
              AI-Suggested Relationships Awaiting Scholarly Verification
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setConfidenceFilter("all")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    confidenceFilter === "all" ? "bg-white text-stone-900 font-bold shadow-xs" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setConfidenceFilter("high")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    confidenceFilter === "high" ? "bg-white text-emerald-800 font-bold shadow-xs" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  ≥85% High
                </button>
                <button
                  onClick={() => setConfidenceFilter("low")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    confidenceFilter === "low" ? "bg-white text-amber-800 font-bold shadow-xs" : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  &lt;85% Review
                </button>
              </div>
              <button
                onClick={() => loadPendingPage(pendingPage)}
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {(() => {
            const displayed = pendingRelationships.filter((rel) => {
              const conf = rel.confidence || 0.85;
              if (confidenceFilter === "high") return conf >= 0.85;
              if (confidenceFilter === "low") return conf < 0.85;
              return true;
            });

            if (displayed.length === 0) {
              return (
                <div className="bg-white p-12 rounded-2xl border border-stone-200/80 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="font-serif font-bold text-base text-stone-900">Queue is Clear!</h3>
                  <p className="text-xs text-stone-500 max-w-sm mx-auto">
                    No pending relationships match your current confidence filter.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid gap-3">
                {displayed.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:border-amber-300 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-3">
                      {/* Source */}
                      <span className="font-serif font-bold text-sm text-stone-900">
                        {rel.sourceConcept?.name || rel.sourceConceptId}
                      </span>
                      {/* Arrow / Type */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-[10px] font-mono font-bold text-amber-900">
                        <span>{rel.title || rel.relationshipType}</span>
                        <ArrowRight className="w-3 h-3 text-amber-700" />
                      </div>
                      {/* Target */}
                      <span className="font-serif font-bold text-sm text-stone-900">
                        {rel.targetConcept?.name || rel.targetConceptId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-bold">
                        Confidence: {Math.round((rel.confidence || 0.85) * 100)}%
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold uppercase">
                        {rel.status}
                      </span>
                    </div>
                  </div>

                  {/* Provenance & Snippet */}
                  <div className="text-xs text-stone-600 space-y-1">
                    {rel.sourceBook && (
                      <p className="font-mono text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Source: {rel.sourceBook.title} {rel.sourcePassage?.sourcePage ? `(Page ${rel.sourcePassage.sourcePage})` : ""}</span>
                      </p>
                    )}
                    {rel.sourcePassage?.text && (
                      <p className="italic bg-[#fcfaf5] p-3 rounded-xl border border-stone-200/70 font-serif text-stone-800">
                        "{rel.sourcePassage.text.slice(0, 260)}..."
                      </p>
                    )}
                    {rel.description && (
                      <p className="text-stone-700 text-[11px]">{rel.description}</p>
                    )}
                  </div>

                  {/* Review Actions */}
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                    <button
                      onClick={() => handleReject(rel.id)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(rel.id)}
                      disabled={actionLoading}
                      className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Verify as Classical Fact</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
      )}

      {/* --- TAB 2: ENTITY DIRECTORY & MERGE --- */}
      {activeTab === "entities" && (
        <div className="space-y-6">
          {/* Merge Duplicate Tool Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 p-6 rounded-2xl border border-amber-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-amber-900 font-serif font-bold text-base">
              <GitMerge className="w-5 h-5 text-amber-700" />
              <span>Entity Deduplication & Canonical Alias Merge</span>
            </div>
            <p className="text-xs text-stone-700 max-w-2xl">
              Safely merge a duplicate concept into a canonical primary entity. All incoming and outgoing relationships, aliases, and passage references will be transferred automatically without data loss.
            </p>

            <form onSubmit={handleMergeConcepts} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-stone-600 block mb-1">
                  Primary Concept Slug (Target to Keep)
                </label>
                <input
                  type="text"
                  placeholder="e.g. graha-surya"
                  value={primarySlug}
                  onChange={(e) => setPrimarySlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-mono"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-stone-600 block mb-1">
                  Duplicate Concept Slug (To Merge & Archive)
                </label>
                <input
                  type="text"
                  placeholder="e.g. sun-duplicate"
                  value={secondarySlug}
                  onChange={(e) => setSecondarySlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-stone-300 text-xs font-mono"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-2.5 rounded-xl bg-[#13382c] hover:bg-[#1b4b3c] text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
                >
                  <GitMerge className="w-4 h-4 text-amber-300" />
                  <span>Execute Merge</span>
                </button>
              </div>
            </form>

            {mergeResult && (
              <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-mono">
                Merged: {mergeResult.mergedSlug} → {mergeResult.primarySlug} | Migrated Outgoing: {mergeResult.migratedOutgoing}, Incoming: {mergeResult.migratedIncoming}
              </div>
            )}
          </div>

          {/* Concept Search */}
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-base text-stone-900">Entity Lookup</h3>
            <form onSubmit={handleSearchConcepts} className="flex gap-2">
              <input
                type="text"
                placeholder="Search concepts by Sanskrit Devanagari, English, or slug..."
                value={entityQuery}
                onChange={(e) => setEntityQuery(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-xs"
              />
              <select
                value={entityCategory}
                onChange={(e) => setEntityCategory(e.target.value)}
                className="px-3 py-2.5 rounded-xl bg-white border border-stone-300 text-xs"
              >
                <option value="ALL">All Categories</option>
                <option value="VEDIC_ASTROLOGY">Vedic Astrology</option>
                <option value="KUNDALINI_SPIRITUALITY">Kundalini & Tantra</option>
                <option value="DIGITAL_LIBRARY">Digital Library</option>
                <option value="PHILOSOPHY">Philosophy</option>
                <option value="SANSKRIT_SHASTRA">Sanskrit Shastra</option>
              </select>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#13382c] text-white font-bold text-xs"
              >
                Search
              </button>
            </form>

            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {searchResults.map((concept) => (
                  <div
                    key={concept.id}
                    className="p-3.5 rounded-xl bg-white border border-stone-200 hover:border-amber-300 transition space-y-1.5 cursor-pointer"
                    onClick={() => {
                      if (!primarySlug) setPrimarySlug(concept.slug);
                      else if (!secondarySlug) setSecondarySlug(concept.slug);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-stone-500 uppercase">{concept.subCategory || concept.category}</span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold">{concept.slug}</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-stone-900">{concept.name}</h4>
                    {concept.sanskrit && <p className="text-xs font-serif text-amber-800">{concept.sanskrit}</p>}
                    <p className="text-[11px] text-stone-600 line-clamp-2">{concept.summary}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 3: RUN EXTRACTION PIPELINE --- */}
      {activeTab === "extraction" && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-5">
          <div className="space-y-1">
            <h2 className="font-serif font-bold text-lg text-stone-900">
              Execute Knowledge Extraction Pipeline
            </h2>
            <p className="text-xs text-stone-500">
              Extract Sanskrit words, Grahas, Bhavas, Yogas, Chakras, and relationships from arbitrary classical text or manuscripts.
            </p>
          </div>

          <form onSubmit={handleRunExtraction} className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-stone-600 block mb-1">
                Passage / Manuscript Text Content (Devanagari, Hindi, or English)
              </label>
              <textarea
                rows={5}
                placeholder="Paste classical verse, commentary, or OCR passage text here..."
                value={extractText}
                onChange={(e) => setExtractText(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-stone-50 border border-stone-300 text-xs font-serif leading-relaxed"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-stone-600 block mb-1">
                    Extraction Method
                  </label>
                  <select
                    value={extractMethod}
                    onChange={(e) => setExtractMethod(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs"
                  >
                    <option value="RULE_BASED_NLP">Rule-Based NLP & Classical Dictionaries</option>
                    <option value="AI_ASSISTED">AI-Assisted Shastric Extraction</option>
                    <option value="MANUAL_SCHOLARLY">Manual Scholarly Verified</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer pt-4">
                  <input
                    type="checkbox"
                    checked={extractAutoApprove}
                    onChange={(e) => setExtractAutoApprove(e.target.checked)}
                    className="rounded border-stone-300 text-emerald-700"
                  />
                  <span>Auto-Approve as Verified Facts (Bypasses Review Queue)</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="px-6 py-2.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3b] text-amber-300 font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Play className="w-4 h-4" />
                <span>Run Extraction</span>
              </button>
            </div>
          </form>

          {extractionResult && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Extraction Complete (Job ID: {extractionResult.jobId})</span>
              </div>
              <p className="text-emerald-800">
                Found {extractionResult.entitiesFound} matching entities and created {extractionResult.relationsFound} candidate connections in status {extractAutoApprove ? "APPROVED" : "AI_DISCOVERED"}.
              </p>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 4: EXTRACTION JOBS HISTORY --- */}
      {activeTab === "jobs" && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <h2 className="font-serif font-bold text-lg text-stone-900">Recent Extraction Batches & Jobs</h2>
          {jobs.length === 0 ? (
            <p className="text-xs text-stone-500">No background extraction jobs recorded yet.</p>
          ) : (
            <div className="divide-y divide-stone-100 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-mono uppercase text-stone-400 border-b border-stone-200">
                    <th className="py-2.5 font-bold">Job ID</th>
                    <th className="py-2.5 font-bold">Method</th>
                    <th className="py-2.5 font-bold">Status</th>
                    <th className="py-2.5 font-bold">Entities Found</th>
                    <th className="py-2.5 font-bold">Relations Found</th>
                    <th className="py-2.5 font-bold">Date</th>
                    <th className="py-2.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {jobs.map((j) => (
                    <tr key={j.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 font-mono text-stone-600 truncate max-w-[120px]">{j.id}</td>
                      <td className="py-3 font-mono text-[11px] text-stone-700">{j.method}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            j.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : j.status === "FAILED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {j.status}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-stone-800 font-bold">{j.entitiesFound}</td>
                      <td className="py-3 font-mono text-stone-800 font-bold">{j.relationsFound}</td>
                      <td className="py-3 text-stone-500 text-[11px] font-mono">
                        {new Date(j.startedAt).toLocaleString()}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleReprocessJob(j.id)}
                          disabled={actionLoading}
                          className="px-2.5 py-1 rounded-md border border-stone-300 text-stone-700 hover:bg-stone-100 text-[11px] font-bold transition"
                        >
                          Reprocess
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
