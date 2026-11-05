"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Layers,
  BookOpen,
  ScanText,
  FileText,
  Filter,
  Check,
  X,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function ActionCenterAdminClient({ initialData }) {
  const [items, setItems] = useState(initialData?.items || []);
  const [stats, setStats] = useState(initialData?.stats || {});
  const [qualityReport, setQualityReport] = useState(initialData?.qualityReport || {});
  const [activeTab, setActiveTab] = useState("incidents"); // "incidents" | "quality"
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");

  const handleRunScan = async () => {
    setScanning(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/action-center", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Scan complete.");
        // Reload items
        const freshRes = await fetch("/api/admin/action-center");
        if (freshRes.ok) {
          const freshData = await freshRes.json();
          setItems(freshData.items);
          setStats(freshData.stats);
          setQualityReport(freshData.qualityReport);
        }
      }
    } catch (err) {
      setMessage(`Scan error: ${err.message}`);
    } finally {
      setScanning(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/admin/action-center/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setItems(
          items.map((it) => (it.id === id ? { ...it, status: newStatus } : it))
        );
        setMessage(`Incident marked as ${newStatus}.`);
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter((it) => {
    if (severityFilter !== "ALL" && it.severity !== severityFilter) return false;
    if (statusFilter !== "ALL" && it.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">Admin Action Center</h1>
          <p className="text-xs text-stone-500 mt-1">
            Centralized operational alerts, failed pipeline jobs, review queues, and content quality diagnostics.
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={scanning}
          className="px-4 py-2 rounded-xl bg-[#13382c] hover:bg-[#1a4a3a] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60 self-start"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-[#d4a359] ${scanning ? "animate-spin" : ""}`} />
          <span>{scanning ? "Scanning System..." : "Run Diagnostic Scan"}</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-xs uppercase font-bold text-stone-400">Total Open Incidents</span>
          <p className="text-3xl font-black font-serif text-stone-900 mt-1">{stats.totalOpen || 0}</p>
          <p className="text-[11px] text-stone-500 mt-0.5">Requiring administrator review</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-xs uppercase font-bold text-red-600">Critical Priority</span>
          <p className="text-3xl font-black font-serif text-red-600 mt-1">{stats.totalCritical || 0}</p>
          <p className="text-[11px] text-stone-500 mt-0.5">Failed OCR or security alerts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-xs uppercase font-bold text-amber-600">Warnings</span>
          <p className="text-3xl font-black font-serif text-amber-700 mt-1">{stats.totalWarnings || 0}</p>
          <p className="text-[11px] text-stone-500 mt-0.5">Unreviewed books & AI stalls</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-xs uppercase font-bold text-purple-700">Content Quality Flags</span>
          <p className="text-3xl font-black font-serif text-purple-700 mt-1">
            {(qualityReport.emptyChaptersCount || 0) + (qualityReport.missingMetadataCount || 0)}
          </p>
          <p className="text-[11px] text-stone-500 mt-0.5">Empty chapters & metadata gaps</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab("incidents")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "incidents"
              ? "bg-[#13382c] text-white"
              : "text-stone-600 hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          Operational Incidents ({filteredItems.length})
        </button>

        <button
          onClick={() => setActiveTab("quality")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === "quality"
              ? "bg-[#13382c] text-white"
              : "text-stone-600 hover:text-stone-900 bg-white border border-stone-200"
          }`}
        >
          Content Quality Reports
        </button>
      </div>

      {activeTab === "incidents" ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-bold text-stone-700">Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="py-1.5 px-3 rounded-lg border border-stone-300 font-medium"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="WARNING">Warning</option>
                <option value="INFO">Informational</option>
              </select>

              <span className="font-bold text-stone-700 ml-2">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1.5 px-3 rounded-lg border border-stone-300 font-medium"
              >
                <option value="OPEN">Open Only</option>
                <option value="RESOLVED">Resolved</option>
                <option value="DISMISSED">Dismissed</option>
                <option value="ALL">All Records</option>
              </select>
            </div>
          </div>

          {/* Incidents List */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
            <div className="divide-y divide-stone-100">
              {filteredItems.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-400">
                  No active incidents matching your filter. Platform is operating smoothly!
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/60 transition">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            item.severity === "CRITICAL"
                              ? "bg-red-100 text-red-800 border border-red-300 animate-pulse"
                              : item.severity === "WARNING"
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {item.severity}
                        </span>

                        <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md">
                          {item.category}
                        </span>

                        <span className="text-[10px] text-stone-400 font-mono" suppressHydrationWarning>
                          {formatDateTime(item.createdAt)}
                        </span>
                      </div>

                      <h3 className="font-bold text-stone-900 text-xs sm:text-sm font-serif">
                        {item.title}
                      </h3>
                      <p className="text-xs text-stone-600">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                      {item.actionUrl && (
                        <Link
                          href={item.actionUrl}
                          className="px-3 py-1.5 rounded-xl border border-stone-300 hover:border-[#13382c] bg-stone-50 hover:bg-white text-stone-800 text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <span>Investigate</span>
                          <ExternalLink className="w-3 h-3 text-stone-500" />
                        </Link>
                      )}

                      {item.status === "OPEN" ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(item.id, "RESOLVED")}
                            className="px-3 py-1.5 rounded-xl bg-[#13382c] hover:bg-[#1a4a3a] text-white text-xs font-semibold inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 text-[#d4a359]" />
                            <span>Resolve</span>
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(item.id, "DISMISSED")}
                            className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-100 text-xs transition cursor-pointer"
                            title="Dismiss"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-emerald-700 font-bold text-xs inline-flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>{item.status}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Content Quality Reports Tab */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Empty Chapters Report */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-stone-900 font-serif text-sm flex items-center justify-between">
              <span>Empty Chapters (0 Passages)</span>
              <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs">
                {qualityReport.emptyChaptersCount || 0}
              </span>
            </h3>
            <p className="text-stone-500 text-[11px]">Chapters created without any parsed Sanskrit verses or commentary text.</p>

            <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto">
              {qualityReport.emptyChapters?.length === 0 ? (
                <p className="py-4 text-center text-stone-400">All chapters contain structured passages.</p>
              ) : (
                qualityReport.emptyChapters?.map((ch) => (
                  <div key={ch.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-stone-800">{ch.title}</p>
                      <p className="text-[10px] text-stone-400">{ch.book?.title} (Ch #{ch.chapterNumber})</p>
                    </div>
                    <Link
                      href={`/admin/books/${ch.book?.id}/structure`}
                      className="text-[#13382c] font-semibold hover:underline"
                    >
                      Structure →
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Missing Metadata Report */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
            <h3 className="font-bold text-stone-900 font-serif text-sm flex items-center justify-between">
              <span>Books with Incomplete Metadata</span>
              <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs">
                {qualityReport.missingMetadataCount || 0}
              </span>
            </h3>
            <p className="text-stone-500 text-[11px]">Books missing author attribution, synopsis, or cover artwork.</p>

            <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto">
              {qualityReport.missingMetadataBooks?.length === 0 ? (
                <p className="py-4 text-center text-stone-400">All books possess full bibliographic metadata.</p>
              ) : (
                qualityReport.missingMetadataBooks?.map((b) => (
                  <div key={b.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-stone-800">{b.title}</p>
                      <p className="text-[10px] text-stone-400">
                        Missing: {[!b.author && "Author", !b.description && "Description", !b.coverUrl && "Cover"].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <Link
                      href={`/admin/books/${b.id}`}
                      className="text-[#13382c] font-semibold hover:underline"
                    >
                      Edit →
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
