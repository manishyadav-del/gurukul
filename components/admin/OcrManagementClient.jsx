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
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function OcrManagementClient({ initialData }) {
  const [stats, setStats] = useState(initialData?.stats || {});
  const [jobs, setJobs] = useState(initialData?.jobs || []);
  const [flaggedPages, setFlaggedPages] = useState(initialData?.flaggedPages || []);
  const [activeTab, setActiveTab] = useState("jobs");
  const [retryingId, setRetryingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedJob, setSelectedJob] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [bulkRetrying, setBulkRetrying] = useState(false);

  // Live polling without page reload
  const refreshData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (searchTerm) params.append("q", searchTerm);

      const res = await fetch(`/api/admin/ocr?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || {});
        setJobs(data.jobs || []);
        setFlaggedPages(data.flaggedPages || []);
      }
    } catch (err) {
      console.warn("Auto-refresh failed:", err.message);
    }
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(refreshData, 8000);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshData]);

  const handleRetryPage = async (pageId) => {
    setRetryingId(pageId);
    setMessage("");
    try {
      const res = await fetch(`/api/pages/${pageId}/retry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceOcr: true, dpi: 300 }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Page ${data.page?.pageNumber || pageId} reprocessed successfully.`);
        setFlaggedPages((prev) => prev.filter((p) => p.id !== pageId));
        refreshData();
      } else {
        setMessage(`Error: ${data.error || "Retry failed"}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setRetryingId(null);
    }
  };

  const handleJobAction = async (jobId, action) => {
    if (action === "cancel") setCancellingId(jobId);
    else setRetryingId(jobId);
    setMessage("");

    try {
      const res = await fetch(`/api/ingest/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || `Action ${action} succeeded.`);
        refreshData();
      } else {
        setMessage(`Error: ${data.error || "Operation failed"}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setCancellingId(null);
      setRetryingId(null);
    }
  };

  const handleBulkRetryFlagged = async () => {
    if (flaggedPages.length === 0) return;
    if (!confirm(`Reprocess top ${Math.min(20, flaggedPages.length)} flagged pages with OCR? Approved human text will be safely preserved.`)) return;

    setBulkRetrying(true);
    setMessage("");
    try {
      const pageIds = flaggedPages.slice(0, 20).map((p) => p.id);
      const res = await fetch("/api/admin/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "bulk_retry_flagged", pageIds }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        refreshData();
      } else {
        setMessage(`Error: ${data.error || "Bulk retry failed"}`);
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setBulkRetrying(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    if (statusFilter !== "ALL" && job.status !== statusFilter) return false;
    if (searchTerm) {
      const title = job.book?.title?.toLowerCase() || "";
      if (!title.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-serif text-stone-900">OCR Control Center</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Engine
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Production background job queue, worker heartbeats, stalled recovery, and quality inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              autoRefresh
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-stone-200 bg-white text-stone-600"
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${autoRefresh ? "text-emerald-600 animate-spin" : ""}`} />
            <span>{autoRefresh ? "Polling (8s)" : "Polling Paused"}</span>
          </button>
          <Link
            href="/admin/proofreading"
            className="px-3.5 py-1.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3a] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
          >
            <CheckSquare className="w-3.5 h-3.5 text-amber-300" />
            <span>Proofreading Workspace</span>
          </Link>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage("")} className="text-stone-400 hover:text-stone-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row 1: Document Processing Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-stone-400">Total Pages</span>
          <p className="text-2xl font-black font-serif text-stone-900 mt-0.5">{stats.totalPages || 0}</p>
          <div className="text-[10px] text-stone-500 mt-1">
            <span className="text-emerald-700 font-semibold">{stats.extractedPages || 0} Digital</span> •{" "}
            <span className="text-blue-700 font-semibold">{stats.ocrCompletedPages || 0} OCR</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-stone-400">Proofread</span>
          <p className="text-2xl font-black font-serif text-emerald-700 mt-0.5">{stats.proofreadPages || 0}</p>
          <span className="text-[10px] text-stone-400">Human reviewed</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-stone-400">Awaiting Review</span>
          <p className="text-2xl font-black font-serif text-amber-700 mt-0.5">{stats.pendingProofread || 0}</p>
          <span className="text-[10px] text-stone-400">Ready for editor</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-stone-400">Low Confidence</span>
          <p className="text-2xl font-black font-serif text-rose-700 mt-0.5">{stats.lowConfidencePages || 0}</p>
          <span className="text-[10px] text-rose-600 font-medium">&lt; 75% accuracy</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-stone-400">Active Jobs</span>
          <p className="text-2xl font-black font-serif text-blue-700 mt-0.5">{stats.activeJobsCount || 0}</p>
          <span className="text-[10px] text-blue-600 font-medium">{stats.queuedJobsCount || 0} Queued</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-stone-400">OCR Success Rate</span>
          <p className="text-2xl font-black font-serif text-stone-900 mt-0.5">{stats.ocrSuccessRate || 100}%</p>
          <span className="text-[10px] text-stone-400">Avg {stats.avgPageDurationMs ? `${(stats.avgPageDurationMs / 1000).toFixed(1)}s` : "—"}/page</span>
        </div>
      </div>

      {/* Metrics Row 2: Queue Worker Health & Infrastructure */}
      <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 font-medium">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-stone-500" />
            <span>Active Workers: <strong className="text-stone-900 font-bold">{stats.activeWorkerCount || 1}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Last Heartbeat: <strong className="text-stone-900 font-mono font-bold">{stats.lastWorkerHeartbeat ? formatDateTime(stats.lastWorkerHeartbeat) : "Live"}</strong></span>
          </div>
          {stats.stalledJobsCount > 0 && (
            <div className="flex items-center gap-1.5 text-rose-700 font-bold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{stats.stalledJobsCount} Stalled Worker Jobs</span>
            </div>
          )}
        </div>

        {activeTab === "flagged" && flaggedPages.length > 0 && (
          <button
            onClick={handleBulkRetryFlagged}
            disabled={bulkRetrying}
            className="px-3 py-1 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <RotateCcw className={`w-3 h-3 ${bulkRetrying ? "animate-spin" : ""}`} />
            <span>{bulkRetrying ? "Processing Batch..." : `Reprocess Top ${Math.min(20, flaggedPages.length)} Pages`}</span>
          </button>
        )}
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "jobs"
                ? "bg-[#13382c] text-white"
                : "text-stone-600 hover:text-stone-900 bg-white border border-stone-200"
            }`}
          >
            Ingestion & OCR Jobs ({jobs.length})
          </button>
          <button
            onClick={() => setActiveTab("flagged")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
              activeTab === "flagged"
                ? "bg-[#13382c] text-white"
                : "text-stone-600 hover:text-stone-900 bg-white border border-stone-200"
            }`}
          >
            Flagged & Low-Confidence Pages ({flaggedPages.length})
          </button>
        </div>

        {activeTab === "jobs" && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by book title..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs w-48 bg-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-xs bg-white text-stone-700 font-medium focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="QUEUED">QUEUED</option>
              <option value="ANALYZING">ANALYZING</option>
              <option value="EXTRACTING">EXTRACTING</option>
              <option value="OCR_PROCESSING">OCR_PROCESSING</option>
              <option value="STRUCTURING">STRUCTURING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="FAILED">FAILED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        )}
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        {activeTab === "jobs" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 uppercase font-bold text-stone-500">
                <tr>
                  <th className="px-5 py-3.5">Book Title</th>
                  <th className="px-5 py-3.5">Status & Stage</th>
                  <th className="px-5 py-3.5">Progress</th>
                  <th className="px-5 py-3.5">Heartbeat / Priority</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-stone-400">
                      No ingestion jobs match the selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => {
                    const isActive = ["ANALYZING", "EXTRACTING", "OCR_PROCESSING", "STRUCTURING"].includes(job.status);
                    return (
                      <tr key={job.id} className="hover:bg-stone-50/70 transition">
                        <td className="px-5 py-3.5 font-bold text-stone-900">
                          <div>{job.book?.title || "Book Ingestion"}</div>
                          <div className="text-[10px] text-stone-400 font-normal font-mono">Job ID: {job.id.slice(0, 8)}...</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                job.status === "COMPLETED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : job.status === "FAILED"
                                  ? "bg-red-100 text-red-800"
                                  : job.status === "CANCELLED"
                                  ? "bg-stone-200 text-stone-800"
                                  : "bg-amber-100 text-amber-800 animate-pulse"
                              }`}
                            >
                              {job.status}
                            </span>
                            {job.errorCategory && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-rose-50 text-rose-700 font-mono">
                                {job.errorCategory}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-500 mt-1 max-w-xs truncate">{job.currentStep || "—"}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="w-32 bg-stone-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full ${
                                job.status === "COMPLETED"
                                  ? "bg-emerald-600"
                                  : job.status === "FAILED"
                                  ? "bg-rose-500"
                                  : "bg-amber-500"
                              }`}
                              style={{ width: `${Math.min(100, Math.max(5, job.progress || 0))}%` }}
                            ></div>
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono mt-1">
                            {job.processedPages || 0}/{job.totalPages || "?"} pages ({Math.round(job.progress || 0)}%)
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-stone-500 font-mono text-[11px]">
                          <div>Priority: {job.priority || 0}</div>
                          <div className="text-[10px] text-stone-400" suppressHydrationWarning>
                            {formatDateTime(job.createdAt)}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => setSelectedJob(job)}
                            className="px-2.5 py-1 rounded-lg border border-stone-200 hover:bg-stone-100 text-stone-700 text-[11px] font-semibold cursor-pointer"
                          >
                            Details
                          </button>
                          {isActive ? (
                            <button
                              disabled={cancellingId === job.id || job.cancelRequested}
                              onClick={() => handleJobAction(job.id, "cancel")}
                              className="px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-semibold cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                            >
                              <Square className="w-3 h-3" />
                              <span>{job.cancelRequested ? "Cancelling..." : "Cancel"}</span>
                            </button>
                          ) : (
                            <button
                              disabled={retryingId === job.id}
                              onClick={() => handleJobAction(job.id, "retry")}
                              className="px-2.5 py-1 rounded-lg bg-[#13382c] hover:bg-[#1a4a3a] text-white text-[11px] font-semibold cursor-pointer disabled:opacity-50 inline-flex items-center gap-1"
                            >
                              <RotateCcw className={`w-3 h-3 ${retryingId === job.id ? "animate-spin" : ""}`} />
                              <span>Retry</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600">
              <thead className="bg-stone-50 border-b border-stone-200 uppercase font-bold text-stone-500">
                <tr>
                  <th className="px-5 py-3.5">Book & Page</th>
                  <th className="px-5 py-3.5">Confidence</th>
                  <th className="px-5 py-3.5">Method / Retries</th>
                  <th className="px-5 py-3.5">Status & Error</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {flaggedPages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-stone-400">
                      No flagged or low-confidence pages detected.
                    </td>
                  </tr>
                ) : (
                  flaggedPages.map((page) => {
                    const score = page.ocrConfidence !== null ? page.ocrConfidence : 0;
                    const percent = Math.round(score * 100);
                    return (
                      <tr key={page.id} className="hover:bg-stone-50/70 transition">
                        <td className="px-5 py-3.5">
                          <p className="font-bold text-stone-900">{page.book?.title || "Book"}</p>
                          <p className="text-[11px] text-stone-400">Page Number: {page.pageNumber}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`font-mono font-bold ${
                              percent < 60
                                ? "text-red-600"
                                : percent < 75
                                ? "text-amber-700"
                                : "text-emerald-700"
                            }`}
                          >
                            {page.ocrConfidence !== null ? `${percent}%` : "Not evaluated"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-stone-600">
                          <div>{page.processingMethod}</div>
                          <div className="text-[10px] text-stone-400 font-mono">Retries: {page.retryCount}</div>
                        </td>
                        <td className="px-5 py-3.5">
                          {page.ocrErrors?.[0] ? (
                            <span className="text-rose-700 font-semibold text-[11px] block">
                              {page.ocrErrors[0].errorType}
                            </span>
                          ) : page.proofread ? (
                            <span className="text-emerald-700 font-semibold text-[11px]">Proofread</span>
                          ) : (
                            <span className="text-amber-700 font-semibold text-[11px]">Awaiting Review</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-2">
                          <Link
                            href={`/admin/proofreading/${page.id}`}
                            className="px-2.5 py-1 rounded-lg border border-stone-200 hover:border-amber-300 bg-stone-50 text-stone-700 font-semibold text-[11px] inline-flex items-center gap-1"
                          >
                            <span>Review</span>
                            <ExternalLink className="w-3 h-3 text-stone-400" />
                          </Link>
                          <button
                            disabled={retryingId === page.id}
                            onClick={() => handleRetryPage(page.id)}
                            className="px-2.5 py-1 rounded-lg bg-[#13382c] hover:bg-[#1a4a3a] text-white font-semibold text-[11px] inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                          >
                            <RotateCcw className={`w-3 h-3 ${retryingId === page.id ? "animate-spin" : ""}`} />
                            <span>{retryingId === page.id ? "Retrying..." : "Reprocess"}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 border border-stone-200 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-900">
                  Job Details: {selectedJob.book?.title || "Ingestion Job"}
                </h3>
                <p className="text-[11px] font-mono text-stone-400">ID: {selectedJob.id}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-stone-50 p-2.5 rounded-xl">
                <span className="text-stone-400 text-[10px] uppercase font-bold">Status</span>
                <p className="font-bold text-stone-900 mt-0.5">{selectedJob.status}</p>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl">
                <span className="text-stone-400 text-[10px] uppercase font-bold">Attempts</span>
                <p className="font-bold text-stone-900 mt-0.5">{selectedJob.attempts || 1} / {selectedJob.maxAttempts || 3}</p>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl">
                <span className="text-stone-400 text-[10px] uppercase font-bold">Worker ID</span>
                <p className="font-mono text-stone-900 mt-0.5">{selectedJob.workerId || "None (Queued)"}</p>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl">
                <span className="text-stone-400 text-[10px] uppercase font-bold">Checkpointed Page</span>
                <p className="font-bold text-stone-900 mt-0.5">{selectedJob.checkpointPage || 0}</p>
              </div>
            </div>

            {selectedJob.errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 text-xs">
                <strong className="block font-bold">Error ({selectedJob.errorCategory || "Uncategorized"}):</strong>
                <span>{selectedJob.errorMessage}</span>
              </div>
            )}

            <div>
              <h4 className="font-bold text-xs text-stone-900 uppercase tracking-wider mb-2">Stage History Checkpoints</h4>
              <div className="bg-stone-50 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
                {Array.isArray(selectedJob.stageHistory) && selectedJob.stageHistory.length > 0 ? (
                  selectedJob.stageHistory.map((sh, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] pb-1 border-b border-stone-100 last:border-0">
                      <span className="font-mono font-bold text-stone-700">{sh.stage}</span>
                      <span className="text-stone-400">{sh.timestamp ? new Date(sh.timestamp).toLocaleTimeString() : ""}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-stone-400 text-center py-2">No intermediate stage checkpoints recorded.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
