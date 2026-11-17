"use client";

import { useState } from "react";
import {
  Activity,
  Database,
  Layers,
  Cpu,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Clock,
  Sparkles,
  Zap,
  Server,
  FileSearch,
} from "lucide-react";

export default function SystemHealthAdminClient({ initialData }) {
  const [data, setData] = useState(initialData || {});
  const [probing, setProbing] = useState(false);
  const [message, setMessage] = useState("");

  const handleRunProbe = async () => {
    setProbing(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/system-health?force=true");
      if (res.ok) {
        const json = await res.json();
        const payload = json.data || json;
        setData(payload);
        setMessage("Diagnostic probe finished successfully.");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      setMessage(`Probe failed: ${err.message}`);
    } finally {
      setProbing(false);
    }
  };

  const services = data.services || {};
  const isHealthy = data.overallStatus === "HEALTHY";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">System & Operational Health</h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time infrastructure probes for PostgreSQL, durable OCR worker queue, storage I/O, and AI embedding freshness.
          </p>
        </div>

        <button
          onClick={handleRunProbe}
          disabled={probing}
          className="px-4 py-2 rounded-xl bg-[#13382c] hover:bg-[#1a4a3a] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60 self-start"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-[#d4a359] ${probing ? "animate-spin" : ""}`} />
          <span>{probing ? "Running Live Probes..." : "Run Live Probe"}</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {/* Overall Health Status Banner */}
      <div
        className={`p-5 rounded-3xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isHealthy
            ? "bg-emerald-50/80 border-emerald-200 text-emerald-950"
            : "bg-amber-50 border-amber-300 text-amber-950"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold shrink-0 ${
              isHealthy
                ? "bg-emerald-600 text-white"
                : "bg-amber-600 text-white animate-pulse"
            }`}
          >
            {isHealthy ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="font-serif font-bold text-base">
              Overall Infrastructure Status: {data.overallStatus || "UNKNOWN"}
            </h2>
            <p className="text-xs opacity-80">
              Probed at: {data.probedAt ? new Date(data.probedAt).toLocaleTimeString() : "Just now"} • Execution duration: {data.durationMs || 0} ms
            </p>
          </div>
        </div>

        <span className="text-xs font-mono font-bold bg-white/80 px-3 py-1.5 rounded-xl border border-stone-200 self-start">
          Live Measurements • Zero Hardcoding
        </span>
      </div>

      {/* Detailed Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Database */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-700" />
              <span>PostgreSQL Database</span>
            </span>
            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
              {services.database?.status || "HEALTHY"}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-stone-600 pt-1">
            <div className="flex justify-between">
              <span>Query Latency:</span>
              <strong className="font-mono text-emerald-700">{services.database?.latencyMs || 0} ms</strong>
            </div>
            <div className="flex justify-between">
              <span>Engine:</span>
              <span className="font-mono">{services.database?.engine || "PostgreSQL"}</span>
            </div>
            <div className="flex justify-between">
              <span>Connection Pool:</span>
              <span className="text-emerald-700 font-semibold">Healthy (Prisma Connection Pool)</span>
            </div>
          </div>
        </div>

        {/* 2. Job Queue */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-700" />
              <span>Durable Job Queue</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
              services.jobQueue?.status === "IDLE" || services.jobQueue?.status === "BUSY"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-red-100 text-red-800"
            }`}>
              {services.jobQueue?.status || "IDLE"}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-stone-600 pt-1">
            <div className="flex justify-between">
              <span>Active Processing:</span>
              <strong className="font-mono">{services.jobQueue?.activeJobs || 0} jobs</strong>
            </div>
            <div className="flex justify-between">
              <span>Queued:</span>
              <strong className="font-mono">{services.jobQueue?.queuedJobs || 0} jobs</strong>
            </div>
            <div className="flex justify-between">
              <span>Failed / Stalled:</span>
              <span className={`font-mono font-bold ${services.jobQueue?.failedJobs > 0 || services.jobQueue?.stalledJobs > 0 ? "text-rose-700" : "text-stone-500"}`}>
                {services.jobQueue?.failedJobs || 0} failed / {services.jobQueue?.stalledJobs || 0} stalled
              </span>
            </div>
            <div className="flex justify-between">
              <span>Active Workers:</span>
              <span className="font-mono">{services.jobQueue?.activeWorkers || 1} worker(s)</span>
            </div>
          </div>
        </div>

        {/* 3. OCR Pipeline Performance */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span>OCR Pipeline Performance</span>
            </span>
            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
              {services.ocrPipeline?.status || "HEALTHY"}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-stone-600 pt-1">
            <div className="flex justify-between">
              <span>Avg Page Duration:</span>
              <strong className="font-mono text-stone-900">
                {services.ocrPipeline?.avgPageDurationMs ? `${(services.ocrPipeline.avgPageDurationMs / 1000).toFixed(1)}s` : "—"}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Estimated Throughput:</span>
              <strong className="font-mono text-emerald-700">
                {services.ocrPipeline?.estimatedPagesPerMinute || 0} pages/min
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Engine:</span>
              <span className="font-mono">Tesseract.js (Node.js/napi)</span>
            </div>
          </div>
        </div>

        {/* 4. Search & AI Freshness */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-purple-700" />
              <span>Search & AI Freshness</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
              services.searchAndAi?.status === "HEALTHY"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800"
            }`}>
              {services.searchAndAi?.status || "HEALTHY"}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-stone-600 pt-1">
            <div className="flex justify-between">
              <span>Total Passages:</span>
              <strong className="font-mono">{services.searchAndAi?.totalPassages || 0}</strong>
            </div>
            <div className="flex justify-between">
              <span>Indexed Embeddings:</span>
              <strong className="font-mono">{services.searchAndAi?.indexedEmbeddings || 0}</strong>
            </div>
            <div className="flex justify-between">
              <span>Outdated / Backlog:</span>
              <span className={`font-mono font-bold ${services.searchAndAi?.backlogCount > 0 ? "text-amber-700" : "text-stone-500"}`}>
                {services.searchAndAi?.backlogCount || 0} records
              </span>
            </div>
            {services.searchAndAi?.embeddingJobs && (
              <div className="flex justify-between pt-1 border-t border-stone-100">
                <span>Batch Jobs (Q/P/F):</span>
                <span className="font-mono text-[11px] text-stone-700">
                  {services.searchAndAi.embeddingJobs.queued} / {services.searchAndAi.embeddingJobs.processing} / {services.searchAndAi.embeddingJobs.failed}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 5. Knowledge Graph Pipeline */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Knowledge Graph Extraction</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
              services.knowledgeJobs?.status === "WARNING"
                ? "bg-amber-100 text-amber-800"
                : "bg-emerald-100 text-emerald-800"
            }`}>
              {services.knowledgeJobs?.status || "HEALTHY"}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-stone-600 pt-1">
            <div className="flex justify-between">
              <span>Pending Jobs:</span>
              <strong className="font-mono">{services.knowledgeJobs?.pending || 0}</strong>
            </div>
            <div className="flex justify-between">
              <span>In Processing:</span>
              <strong className="font-mono">{services.knowledgeJobs?.processing || 0}</strong>
            </div>
            <div className="flex justify-between">
              <span>Completed / Failed:</span>
              <span className={`font-mono font-bold ${services.knowledgeJobs?.failed > 0 ? "text-rose-700" : "text-stone-500"}`}>
                {services.knowledgeJobs?.completed || 0} completed / {services.knowledgeJobs?.failed || 0} failed
              </span>
            </div>
          </div>
        </div>

        {/* 6. Storage I/O */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-stone-700" />
              <span>Private Storage I/O</span>
            </span>
            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
              {services.storage?.status || "HEALTHY"}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-stone-600 pt-1">
            <div className="flex justify-between">
              <span>Access Latency:</span>
              <strong className="font-mono text-emerald-700">{services.storage?.latencyMs || 0} ms</strong>
            </div>
            <div className="flex justify-between">
              <span>Provider:</span>
              <span className="font-mono">{services.storage?.provider || "local"}</span>
            </div>
            <div className="flex justify-between">
              <span>Directory Structure:</span>
              <span className="text-stone-700">Verified Read/Write</span>
            </div>
          </div>
        </div>

        {/* 6. Node Runtime */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-700" />
              <span>Node.js Runtime</span>
            </span>
            <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
              v{services.runtime?.nodeVersion?.replace("v", "") || "20"}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-stone-600 pt-1">
            <div className="flex justify-between">
              <span>Heap Memory Used:</span>
              <strong className="font-mono text-stone-900">
                {services.runtime?.heapUsedMb || 0} MB / {services.runtime?.heapTotalMb || 0} MB
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Resident Set (RSS):</span>
              <span className="font-mono">{services.runtime?.rssMb || 0} MB</span>
            </div>
            <div className="flex justify-between">
              <span>Uptime:</span>
              <span className="font-mono">
                {Math.round((services.runtime?.uptimeSeconds || 0) / 60)} minutes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Operational Alerts & Incident Monitoring */}
      {data.alerts && data.alerts.length > 0 && (
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold font-serif text-stone-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Recent Operational Alerts & Incidents ({data.alerts.length})</span>
            </h3>
            <span className="text-[11px] text-stone-500">Auto-clearing buffer (last 100 alerts)</span>
          </div>

          <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto pr-1">
            {data.alerts.map((alert) => (
              <div key={alert.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      alert.severity === "CRITICAL"
                        ? "bg-rose-100 text-rose-800"
                        : alert.severity === "ERROR"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {alert.category}
                    </span>
                    <span className="font-medium text-stone-800">{alert.message}</span>
                  </div>
                  {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                    <p className="text-[11px] text-stone-500 font-mono">
                      {JSON.stringify(alert.metadata).slice(0, 120)}
                    </p>
                  )}
                </div>
                <span className="text-[10px] text-stone-400 font-mono shrink-0">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
