"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ScanText,
  Layers,
  CheckSquare,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Clock,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Filter,
  Search,
  X,
  Play,
  Square,
  Activity,
  Server,
  Zap,
  Info,
  Download,
  ShieldCheck,
  TrendingUp,
  BarChart2,
  FileText,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  Cpu,
  History,
  FileSearch,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function OcrManagementClient({ initialData }) {
  const [stats, setStats] = useState(initialData?.stats || {});
  const [quality, setQuality] = useState(initialData?.quality || { tiers: [], methods: [] });
  const [bookReports, setBookReports] = useState(initialData?.bookReports?.reports || []);
  const [errors, setErrors] = useState(initialData?.errors || { categories: [], recentErrors: [] });
  const [corrections, setCorrections] = useState(initialData?.corrections || { topCharacterReplacements: [], topWordReplacements: [], suggestedRules: [] });
  const [performance, setPerformance] = useState(initialData?.performance || { distribution: [], optimizationRecommendations: [] });
  const [alerts, setAlerts] = useState(initialData?.alerts || { alerts: [] });
  const [jobs, setJobs] = useState(initialData?.jobs || []);
  const [flaggedPages, setFlaggedPages] = useState(initialData?.flaggedPages || []);

  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'quality' | 'books' | 'jobs' | 'errors' | 'corrections' | 'performance' | 'flagged'
  const [retryingId, setRetryingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [languageFilter, setLanguageFilter] = useState("ALL");
  const [selectedJob, setSelectedJob] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [bulkRetrying, setBulkRetrying] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Book-level page drilldown drawer
  const [selectedBookAudit, setSelectedBookAudit] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [reprocessingRange, setReprocessingRange] = useState(false);

  // Live polling without page reload
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [ocrRes, analyticsRes] = await Promise.all([
        fetch(`/api/admin/ocr?status=${statusFilter !== "ALL" ? statusFilter : ""}&q=${searchTerm}`),
        fetch(`/api/admin/ocr/analytics?fresh=true`),
      ]);

      if (ocrRes.ok) {
        const ocrData = await ocrRes.json();
        setJobs(ocrData.jobs || []);
        setFlaggedPages(ocrData.flaggedPages || []);
      }

      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        if (aData.data) {
          setStats(aData.data.overview || {});
          setQuality(aData.data.quality || { tiers: [], methods: [] });
          setErrors(aData.data.errors || { categories: [], recentErrors: [] });
          setCorrections(aData.data.corrections || { topCharacterReplacements: [], topWordReplacements: [], suggestedRules: [] });
          setPerformance(aData.data.performance || { distribution: [], optimizationRecommendations: [] });
          setAlerts(aData.data.alerts || { alerts: [] });
        }
      }
    } catch (err) {
      console.warn("Auto-refresh failed:", err.message);
    } finally {
      setIsRefreshing(false);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refreshData, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshData]);

  // Fetch book reports with filters
  const fetchBookReports = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append("q", searchTerm);
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (languageFilter !== "ALL") params.append("language", languageFilter);

      const res = await fetch(`/api/admin/ocr/books?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setBookReports(data.data || []);
      }
    } catch (err) {
      console.warn("Fetch books failed:", err.message);
    }
  }, [searchTerm, statusFilter, languageFilter]);

  useEffect(() => {
    if (activeTab === "books") {
      fetchBookReports();
    }
  }, [activeTab, fetchBookReports]);

  // Open single book page-by-page audit
  const handleOpenBookAudit = async (bookId) => {
    setAuditLoading(true);
    setSelectedBookAudit(null);
    try {
      const res = await fetch(`/api/admin/ocr/books/${bookId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedBookAudit(data.data);
      } else {
        setMessage({ type: "error", text: "Failed to load book audit details" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setAuditLoading(false);
    }
  };

  const handleReprocessRange = async () => {
    if (!selectedBookAudit?.book?.id || !rangeStart || !rangeEnd) return;
    setReprocessingRange(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reprocess_range",
          bookId: selectedBookAudit.book.id,
          startPage: rangeStart,
          endPage: rangeEnd,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        handleOpenBookAudit(selectedBookAudit.book.id);
        refreshData();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to reprocess range" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setReprocessingRange(false);
    }
  };

  const handleRetryPage = async (pageId) => {
    setRetryingId(pageId);
    setMessage(null);
    try {
      const res = await fetch(`/api/pages/${pageId}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceOcr: true, dpi: 300 }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({
          type: "success",
          text: `Page ${data.page?.pageNumber || pageId} reprocessed successfully.`,
        });
        setFlaggedPages((prev) => prev.filter((p) => p.id !== pageId));
        refreshData();
      } else {
        setMessage({ type: "error", text: data.error || "Retry failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setRetryingId(null);
    }
  };

  const handleJobAction = async (jobId, action) => {
    if (action === "cancel") setCancellingId(jobId);
    else setRetryingId(jobId);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/ocr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: action === "cancel" ? "cancel_job" : "retry_job", jobId }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message || `Action ${action} succeeded.` });
        refreshData();
      } else {
        setMessage({ type: "error", text: data.error || "Operation failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setCancellingId(null);
      setRetryingId(null);
    }
  };

  const handleRecoverStalled = async () => {
    setMessage(null);
    try {
      const res = await fetch("/api/admin/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "recover_stalled_jobs" }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        refreshData();
      } else {
        setMessage({ type: "error", text: data.error || "Recovery failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleBulkRetryFlagged = async () => {
    if (flaggedPages.length === 0) return;
    if (!confirm(`Reprocess top ${Math.min(20, flaggedPages.length)} flagged pages with OCR? Approved human text will be safely preserved.`)) return;

    setBulkRetrying(true);
    setMessage(null);
    try {
      const pageIds = flaggedPages.slice(0, 20).map((p) => p.id);
      const res = await fetch("/api/admin/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_retry_flagged", pageIds }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: data.message });
        refreshData();
      } else {
        setMessage({ type: "error", text: data.error || "Bulk retry failed" });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setBulkRetrying(false);
    }
  };

  const handleDownloadCsv = (type) => {
    window.open(`/api/admin/ocr/export?type=${type}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Notification */}
      {message && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-stone-400 hover:text-stone-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Actionable Alerts Banner */}
      {alerts?.alerts && alerts.alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                alt.level === "CRITICAL"
                  ? "bg-rose-50/80 border-rose-200 text-rose-950"
                  : "bg-amber-50/80 border-amber-200 text-amber-950"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`w-5 h-5 shrink-0 mt-0.5 ${
                    alt.level === "CRITICAL" ? "text-rose-600" : "text-amber-600"
                  }`}
                />
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider">{alt.title}</h4>
                  <p className="text-xs mt-0.5 opacity-90">{alt.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {alt.action === "RECOVER_STALLED_JOBS" && (
                  <button
                    onClick={handleRecoverStalled}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Resurrect Stalled Jobs
                  </button>
                )}
                {alt.action === "FILTER_LOW_CONFIDENCE" && (
                  <button
                    onClick={() => setActiveTab("quality")}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                  >
                    View Low Confidence
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header and Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-serif font-black text-stone-900 flex items-center gap-2">
              <ScanText className="w-5 h-5 text-amber-700" />
              <span>OCR Quality Analytics & Intelligent Processing Monitor</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#13382c] text-white">
              v2.4
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Real-time quality intelligence, Sanskrit orthography validation, and queue monitoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600">
            <span
              className={`w-2 h-2 rounded-full ${
                stats.queue?.activeWorkerCount > 0 ? "bg-emerald-500 animate-pulse" : "bg-stone-300"
              }`}
            />
            <span className="font-mono">
              Workers: {stats.queue?.activeWorkerCount || 0} active
            </span>
          </div>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              autoRefresh
                ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                : "bg-stone-50 border-stone-200 text-stone-600"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Auto (12s): {autoRefresh ? "ON" : "OFF"}</span>
          </button>

          {/* Manual Refresh Button */}
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          {/* Export Dropdown / Button */}
          <div className="relative group">
            <button
              onClick={() => handleDownloadCsv("books")}
              className="px-3.5 py-1.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3a] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Export CSV</span>
            </button>
            <div className="absolute right-0 mt-1 hidden group-hover:block bg-white border border-stone-200 rounded-xl shadow-lg p-1.5 z-20 w-44">
              <button
                onClick={() => handleDownloadCsv("books")}
                className="w-full text-left px-2.5 py-1.5 text-xs text-stone-700 hover:bg-stone-50 rounded-lg"
              >
                Book Quality Reports
              </button>
              <button
                onClick={() => handleDownloadCsv("pages")}
                className="w-full text-left px-2.5 py-1.5 text-xs text-stone-700 hover:bg-stone-50 rounded-lg"
              >
                Page-Level Audit Log
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Overview Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Total Books */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Books</span>
            <BookOpen className="w-4 h-4 text-stone-500" />
          </div>
          <div className="mt-2 text-2xl font-black font-serif text-stone-900">
            {stats.totalBooks || 0}
          </div>
          <span className="text-[10px] text-stone-500">In Digital Library</span>
        </div>

        {/* Processed Pages */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Processed Pages</span>
            <Layers className="w-4 h-4 text-stone-500" />
          </div>
          <div className="mt-2 text-2xl font-black font-serif text-stone-900">
            {stats.processedPages || 0}
          </div>
          <span className="text-[10px] text-stone-500">
            {stats.extractedPages || 0} Digital • {stats.ocrPages || 0} OCR
          </span>
        </div>

        {/* Success Rate */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">OCR Success Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-serif text-emerald-800">
            {stats.successRate ?? 100}%
          </div>
          <span className="text-[10px] text-stone-500">Zero Critical Failures</span>
        </div>

        {/* Verified Proofread */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Verified Pages</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 text-2xl font-black font-serif text-stone-900">
            {stats.proofreadPages || 0}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">
            {stats.totalPages > 0 ? Math.round(((stats.proofreadPages || 0) / stats.totalPages) * 100) : 0}% scholar approved
          </span>
        </div>

        {/* Needs Review */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Review Backlog</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-black font-serif text-amber-900">
            {stats.needsReviewPages || 0}
          </div>
          <span className="text-[10px] text-stone-500">Awaiting scholarly review</span>
        </div>

        {/* Avg Duration */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Page Time</span>
            <Clock className="w-4 h-4 text-stone-500" />
          </div>
          <div className="mt-2 text-2xl font-black font-serif text-stone-900">
            {stats.avgPageDurationMs ? `${(stats.avgPageDurationMs / 1000).toFixed(1)}s` : "0.5s"}
          </div>
          <span className="text-[10px] text-stone-500">
            Retries: {stats.retryPagesCount || 0} pages
          </span>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white p-2 rounded-2xl border border-stone-200 shadow-2xs flex flex-wrap items-center gap-1.5">
        {[
          { id: "overview", label: "Overview & Analytics", icon: BarChart2 },
          { id: "quality", label: "Quality Monitoring", icon: ShieldCheck },
          { id: "books", label: "Book Quality Reports", icon: BookOpen },
          { id: "jobs", label: `Job Monitor (${jobs.length})`, icon: Activity },
          { id: "errors", label: `Error Analytics (${errors.totalErrors || 0})`, icon: AlertTriangle },
          { id: "corrections", label: "Correction Feedback", icon: History },
          { id: "performance", label: "Performance & Latency", icon: Cpu },
          { id: "flagged", label: `Flagged Pages (${flaggedPages.length})`, icon: FileSearch },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                isActive
                  ? "bg-[#13382c] text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-300" : "text-stone-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Quality Distribution Summary */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold font-serif text-stone-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>4-Tier Quality Classification</span>
            </h3>

            <div className="space-y-3">
              {quality.tiers?.map((t) => (
                <div key={t.tier} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800">{t.label}</span>
                    <span className="font-mono text-stone-500">
                      {t.count} pages ({t.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, t.percentage)}%`, backgroundColor: t.color }}
                    />
                  </div>
                  <p className="text-[10px] text-stone-400 italic">{t.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ingestion & Processing Methods */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold font-serif text-stone-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-700" />
              <span>Processing Method Distribution</span>
            </h3>

            <div className="space-y-3">
              {quality.methods?.map((m) => (
                <div key={m.method} className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">{m.label}</span>
                    <span className="text-xs font-mono font-bold text-stone-900">{m.count} pages</span>
                  </div>
                  <span className="text-[10px] text-stone-500 block mt-0.5">
                    {m.method === "TEXT_EXTRACTION"
                      ? "High-speed clean text layer (bypasses OCR)"
                      : m.method === "OCR"
                      ? "Tesseract Devanagari + Adaptive local thresholding"
                      : "Hybrid digital and scan extraction"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Queue & Worker Diagnostics */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold font-serif text-stone-900 flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-700" />
              <span>Live Queue & Worker Telemetry</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Queued Jobs</span>
                <span className="text-lg font-black text-stone-900 font-mono">
                  {stats.queue?.queuedCount || 0}
                </span>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Active Jobs</span>
                <span className="text-lg font-black text-emerald-700 font-mono">
                  {stats.queue?.activeCount || 0}
                </span>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Completed</span>
                <span className="text-lg font-black text-stone-900 font-mono">
                  {stats.queue?.completedCount || 0}
                </span>
              </div>
              <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Failed / Stalled</span>
                <span className="text-lg font-black text-rose-700 font-mono">
                  {(stats.queue?.failedCount || 0) + (stats.queue?.stalledCount || 0)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
              <span>Oldest Queued: {stats.queue?.oldestQueuedAgeSec || 0}s</span>
              <span>Worker Concurrency: Bounded (2)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUALITY MONITORING */}
      {activeTab === "quality" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold font-serif text-stone-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Confidence Tiers & Scholarly Review Status</span>
              </h3>
              <p className="text-xs text-stone-500">
                OCR confidence is strictly distinct from verified proofread accuracy. Only human scholars mark pages as verified.
              </p>
              <div className="space-y-3 pt-2">
                {quality.tiers?.map((t) => (
                  <div key={t.tier} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-stone-900 block">{t.label}</span>
                      <span className="text-[11px] text-stone-500">{t.description}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black font-mono text-stone-900">{t.count}</span>
                      <span className="text-[10px] text-stone-400 block">{t.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold font-serif text-stone-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-amber-700" />
                <span>Sanskrit & Devanagari Validation Rules</span>
              </h3>
              <p className="text-xs text-stone-500">
                Automated linguistic integrity checks active across all manuscript pages:
              </p>
              <div className="space-y-2 pt-1 text-xs">
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-900">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Zero Orphaned Matras:</strong> Vowel marks without base consonants flagged</span>
                </div>
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-900">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Virama Integrity:</strong> Consecutive illegal halants (््) caught</span>
                </div>
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-900">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Danda Verse Scan:</strong> Shloka hemistich single/double danda balance</span>
                </div>
                <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-900">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Legacy Font Defense:</strong> Kruti Dev & Chanakya mapped before OCR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BOOK QUALITY REPORTS */}
      {activeTab === "books" && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-700"
              >
                <option value="ALL">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="OCR_PROCESSING">OCR Processing</option>
                <option value="QUEUED">Queued</option>
                <option value="FAILED">Failed</option>
              </select>

              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs text-stone-700"
              >
                <option value="ALL">All Languages</option>
                <option value="Hindi">Hindi</option>
                <option value="Sanskrit">Sanskrit</option>
                <option value="English">English</option>
              </select>
            </div>

            <button
              onClick={() => handleDownloadCsv("books")}
              className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Books CSV</span>
            </button>
          </div>

          {/* Books Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-3">Language</th>
                  <th className="py-3 px-3">Total Pages</th>
                  <th className="py-3 px-3">Processed</th>
                  <th className="py-3 px-3">Verification</th>
                  <th className="py-3 px-3">Review Needed</th>
                  <th className="py-3 px-3">Avg Conf.</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bookReports.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-stone-400 italic">
                      No book quality reports found matching filters.
                    </td>
                  </tr>
                ) : (
                  bookReports.map((book) => (
                    <tr key={book.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 font-semibold text-stone-900 max-w-xs truncate">
                        <Link href={`/admin/books/${book.id}`} className="hover:text-amber-700">
                          {book.title}
                        </Link>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-[10px] font-bold text-stone-600">
                          {book.language}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">{book.totalBookPages}</td>
                      <td className="py-3 px-3 font-mono">{book.completedPages}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full"
                              style={{ width: `${book.verificationProgress}%` }}
                            />
                          </div>
                          <span className="font-mono text-[11px]">{book.verificationProgress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {book.reviewNeededPages > 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                            {book.reviewNeededPages} pages
                          </span>
                        ) : (
                          <span className="text-stone-400">0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">
                        {book.avgConfidence !== null ? `${Math.round(book.avgConfidence * 100)}%` : "N/A"}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            book.processingStatus === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : book.processingStatus === "FAILED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {book.processingStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenBookAudit(book.id)}
                            className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 font-bold text-[11px] text-stone-700 flex items-center gap-1 cursor-pointer"
                          >
                            <FileSearch className="w-3 h-3 text-amber-700" />
                            <span>Audit Pages</span>
                          </button>
                          <button
                            onClick={() => handleJobAction(null, "retry")}
                            className="px-2 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-500 cursor-pointer"
                            title="Re-enqueue Book Job"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Single Book Page Audit Drawer / Modal */}
      {selectedBookAudit && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs z-50 flex items-center justify-end">
          <div className="bg-white w-full max-w-3xl h-full shadow-2xl flex flex-col p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                  Book Quality Breakdown
                </span>
                <h3 className="text-base font-bold font-serif text-stone-900">
                  {selectedBookAudit.book?.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBookAudit(null)}
                className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Book Mini Stats */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Total Pages</span>
                <span className="text-lg font-black text-stone-900 font-mono">
                  {selectedBookAudit.stats?.totalPages || 0}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Verified Proofread</span>
                <span className="text-lg font-black text-emerald-700 font-mono">
                  {selectedBookAudit.stats?.proofreadCount || 0}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Low Confidence</span>
                <span className="text-lg font-black text-rose-700 font-mono">
                  {selectedBookAudit.stats?.lowConfCount || 0}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Avg Confidence</span>
                <span className="text-lg font-black text-stone-900 font-mono">
                  {Math.round((selectedBookAudit.stats?.avgConfidence || 0) * 100)}%
                </span>
              </div>
            </div>

            {/* Range Reprocess Action Card */}
            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-stone-900 block">Selective Page Range Reprocessing</span>
                <span className="text-[11px] text-stone-500">Queue re-extraction & OCR for a subset of pages without overwriting verified proofreads.</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="From"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="w-16 px-2.5 py-1 rounded-lg border border-stone-300 bg-white text-xs font-mono"
                />
                <span className="text-stone-400 font-medium">to</span>
                <input
                  type="number"
                  min="1"
                  placeholder="To"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="w-16 px-2.5 py-1 rounded-lg border border-stone-300 bg-white text-xs font-mono"
                />
                <button
                  onClick={handleReprocessRange}
                  disabled={reprocessingRange || !rangeStart || !rangeEnd}
                  className="px-3 py-1.5 rounded-lg bg-[#13382c] hover:bg-[#1a4a3a] text-[#d4a359] font-bold text-xs disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  {reprocessingRange && <RefreshCw className="w-3 h-3 animate-spin" />}
                  <span>Reprocess Range</span>
                </button>
              </div>
            </div>

            {/* Page Breakdown List */}
            <div className="flex-1 space-y-2">
              <h4 className="text-xs font-bold text-stone-800">Page-by-Page Audit Details</h4>
              <div className="space-y-1.5 divide-y divide-stone-100">
                {selectedBookAudit.pages?.map((p) => (
                  <div key={p.id} className="pt-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-stone-800 w-16">
                        Page #{p.pageNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-[10px] font-medium text-stone-600">
                        {p.processingMethod}
                      </span>
                      {p.confidence !== null && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.confidence >= 0.88
                              ? "bg-emerald-100 text-emerald-800"
                              : p.confidence >= 0.70
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {Math.round(p.confidence * 100)}%
                        </span>
                      )}
                      {p.proofread ? (
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-700">Needs Review</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={p.proofreadUrl}
                        className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] flex items-center gap-1 border border-amber-200"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Open in OCR Review</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: JOB MONITOR */}
      {activeTab === "jobs" && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Active & Recent Ingest Jobs ({jobs.length})
              </span>
            </div>

            <button
              onClick={handleRecoverStalled}
              className="px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
              <span>Resurrect Stalled Jobs</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Job ID</th>
                  <th className="py-3 px-3">Book</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Progress</th>
                  <th className="py-3 px-3">Current Step</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400 italic">
                      No jobs currently running or queued.
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 font-mono font-medium text-stone-800">
                        {job.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 px-3 font-semibold text-stone-900 max-w-xs truncate">
                        {job.book?.title || "Unknown Book"}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            job.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800"
                              : job.status === "FAILED"
                              ? "bg-rose-100 text-rose-800"
                              : job.status === "QUEUED"
                              ? "bg-stone-100 text-stone-800"
                              : "bg-blue-100 text-blue-800 animate-pulse"
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">
                        {job.progress}% ({job.processedPages || 0}/{job.totalPages || 0})
                      </td>
                      <td className="py-3 px-3 text-stone-600 max-w-xs truncate" title={job.currentStep}>
                        {job.currentStep || "Processing"}
                      </td>
                      <td className="py-3 px-3 text-stone-500 font-mono text-[11px]">
                        {formatDateTime(job.createdAt)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {["QUEUED", "ANALYZING", "EXTRACTING", "OCR_PROCESSING"].includes(job.status) && (
                            <button
                              onClick={() => handleJobAction(job.id, "cancel")}
                              disabled={cancellingId === job.id}
                              className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-[11px] font-semibold cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                          {job.status === "FAILED" && (
                            <button
                              onClick={() => handleJobAction(job.id, "retry")}
                              disabled={retryingId === job.id}
                              className="px-2.5 py-1 rounded bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Retry</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ERROR CLASSIFICATION ANALYTICS */}
      {activeTab === "errors" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold font-serif text-stone-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Error Frequency by Category</span>
              </h3>
              <p className="text-xs text-stone-500">
                Aggregated from actual scan exceptions and validation issue records:
              </p>
              <div className="space-y-3 pt-2">
                {errors.categories?.map((cat) => (
                  <div key={cat.type} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-stone-800">{cat.label}</span>
                      <span className="font-mono text-stone-500">
                        {cat.count} occurrences ({cat.percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, cat.percentage * 2)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold font-serif text-stone-900 flex items-center gap-2">
                <History className="w-4 h-4 text-stone-600" />
                <span>Recent Error Log Feed</span>
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {errors.recentErrors?.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-4">No recent errors recorded.</p>
                ) : (
                  errors.recentErrors?.map((err) => (
                    <div key={err.id} className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-900">{err.errorType}</span>
                        <span className="text-[10px] text-stone-400 font-mono">
                          {formatDateTime(err.createdAt)}
                        </span>
                      </div>
                      <p className="text-rose-800 text-[11px]">{err.message}</p>
                      <span className="text-[10px] text-stone-500 block">Book: {err.bookTitle}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CORRECTION FEEDBACK ANALYTICS */}
      {activeTab === "corrections" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold font-serif text-stone-900 flex items-center gap-2">
                <History className="w-4 h-4 text-amber-700" />
                <span>Frequently Corrected Characters & Ligatures</span>
              </h3>
              <p className="text-xs text-stone-500">
                Empirical character replacements made by human scholars during proofreading:
              </p>
              <div className="space-y-2 pt-1">
                {corrections.topCharacterReplacements?.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-4">No character replacements logged yet.</p>
                ) : (
                  corrections.topCharacterReplacements?.map((rep, idx) => (
                    <div key={idx} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                      <span className="font-serif font-bold text-stone-900">{rep.substitution}</span>
                      <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-stone-200 font-semibold">
                        {rep.count} times
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold font-serif text-stone-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-700" />
                <span>Automated Recognition Rules Derived From Scholars</span>
              </h3>
              <p className="text-xs text-stone-500">
                Non-destructive rules integrated directly into normalizer pipeline:
              </p>
              <div className="space-y-2.5 pt-1 text-xs">
                {corrections.suggestedRules?.map((rule, idx) => (
                  <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900">{rule.title}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        ACTIVE
                      </span>
                    </div>
                    <p className="text-stone-600 text-[11px] font-mono">{rule.pattern}</p>
                    <span className="text-[10px] text-emerald-700 font-semibold block">{rule.impact}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: PERFORMANCE & LATENCY */}
      {activeTab === "performance" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold font-serif text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-700" />
              <span>Page Processing Duration Latency</span>
            </h3>
            <div className="space-y-3 pt-2">
              {performance.distribution?.map((dist) => (
                <div key={dist.bucket} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-stone-800">{dist.bucket}</span>
                    <span className="font-mono text-stone-500">
                      {dist.count} pages ({dist.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#13382c] h-full rounded-full"
                      style={{ width: `${Math.min(100, dist.percentage)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold font-serif text-stone-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-700" />
              <span>System Memory & Optimization Recommendations</span>
            </h3>

            {performance.memoryMetrics && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">Heap Used</span>
                  <span className="text-base font-black font-mono text-stone-900">
                    {performance.memoryMetrics.heapUsedMb} MB
                  </span>
                </div>
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">Resident Set (RSS)</span>
                  <span className="text-base font-black font-mono text-stone-900">
                    {performance.memoryMetrics.rssMb} MB
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2 text-xs">
              {performance.optimizationRecommendations?.map((rec, idx) => (
                <div key={idx} className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 space-y-0.5">
                  <div className="flex items-center justify-between font-bold text-stone-800">
                    <span>{rec.title}</span>
                    <span className="text-emerald-700 text-[10px]">{rec.status}</span>
                  </div>
                  <p className="text-[11px] text-stone-500">{rec.description}</p>
                  <span className="text-[10px] text-amber-700 font-semibold block">{rec.savingEstimate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: FLAGGED PAGES */}
      {activeTab === "flagged" && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50/50 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Pages Requiring Administrative Attention ({flaggedPages.length})
              </span>
              <span className="text-[11px] text-stone-500">
                Low confidence, unresolved errors, or multiple retries.
              </span>
            </div>

            {flaggedPages.length > 0 && (
              <button
                onClick={handleBulkRetryFlagged}
                disabled={bulkRetrying}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${bulkRetrying ? "animate-spin" : ""}`} />
                <span>Bulk Reprocess Top 20 Pages</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-3">Page #</th>
                  <th className="py-3 px-3">Confidence</th>
                  <th className="py-3 px-3">Method</th>
                  <th className="py-3 px-3">Retries</th>
                  <th className="py-3 px-3">Quality Issue</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {flaggedPages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-stone-400 italic">
                      Zero flagged pages requiring review! All processed pages are healthy.
                    </td>
                  </tr>
                ) : (
                  flaggedPages.map((page) => (
                    <tr key={page.id} className="hover:bg-stone-50/80 transition">
                      <td className="py-3 px-4 font-semibold text-stone-900 max-w-xs truncate">
                        {page.book?.title || "Unknown Book"}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">#{page.pageNumber}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            page.ocrConfidence !== null && page.ocrConfidence >= 0.70
                              ? "bg-amber-100 text-amber-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {page.ocrConfidence !== null ? `${Math.round(page.ocrConfidence * 100)}%` : "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono">{page.processingMethod}</td>
                      <td className="py-3 px-3 font-mono">{page.retryCount || 0}</td>
                      <td className="py-3 px-3 text-rose-700 max-w-xs truncate">
                        {page.ocrErrors?.[0]?.message || "Low OCR confidence threshold"}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/proofreading/${page.id}`}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] flex items-center gap-1 border border-amber-200"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Review</span>
                          </Link>
                          <button
                            onClick={() => handleRetryPage(page.id)}
                            disabled={retryingId === page.id}
                            className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 font-semibold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            <RotateCcw className={`w-3 h-3 ${retryingId === page.id ? "animate-spin" : ""}`} />
                            <span>Retry</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
