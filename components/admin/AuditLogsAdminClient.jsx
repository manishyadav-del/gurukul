"use client";

import { useState } from "react";
import {
  FileCheck,
  Search,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Lock,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

export default function AuditLogsAdminClient({ initialData }) {
  const [logs, setLogs] = useState(initialData?.logs || []);
  const [pagination, setPagination] = useState(initialData?.pagination || { total: 0, page: 1, totalPages: 1 });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async (page = 1, searchQuery = search, status = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        search: searchQuery,
        status,
      });
      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setLogs(json.logs);
        setPagination(json.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs(1, search, statusFilter);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-bold font-serif text-stone-900">Administrative Audit Trail</h1>
          <p className="text-xs text-stone-500 mt-1">
            Immutable chronicle of security events, role modifications, logins, and operational mutations.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold self-start">
          <Lock className="w-3.5 h-3.5" />
          <span>Tamper-Resistant Ledger</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor email, action name, or target resource..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#13382c]"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              fetchLogs(1, search, e.target.value);
            }}
            className="text-xs py-2 px-3 rounded-xl border border-stone-300 bg-white font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#13382c]"
          >
            <option value="ALL">All Outcomes</option>
            <option value="SUCCESS">Success Only</option>
            <option value="FAILED">Failed Operations</option>
            <option value="FORBIDDEN">Access Forbidden</option>
          </select>

          <button
            onClick={() => fetchLogs(1, search, statusFilter)}
            className="px-3.5 py-2 rounded-xl bg-[#13382c] text-white text-xs font-semibold hover:bg-[#1a4a3a] transition cursor-pointer"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 uppercase font-bold text-stone-500">
              <tr>
                <th className="px-5 py-3.5">Action Event</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Target Resource</th>
                <th className="px-5 py-3.5">Outcome</th>
                <th className="px-5 py-3.5">IP Address</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-stone-400">Loading audit records...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-stone-400">No audit events found.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/70 transition">
                    <td className="px-5 py-3.5 font-bold text-stone-900 font-mono">
                      {log.action}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-stone-800">{log.actorEmail}</p>
                      <span className="text-[10px] text-stone-400 font-mono">{log.actorRole}</span>
                    </td>
                    <td className="px-5 py-3.5 text-stone-700">
                      <div>{log.targetResource}</div>
                      {log.targetId && (
                        <div className="text-[10px] text-stone-400 font-mono truncate max-w-[120px]">
                          ID: {log.targetId}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === "SUCCESS"
                            ? "bg-emerald-100 text-emerald-800"
                            : log.status === "FAILED"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.status === "SUCCESS" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        <span>{log.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-stone-400 font-mono text-[11px]">
                      {log.ipAddress || "—"}
                    </td>
                    <td className="px-5 py-3.5 text-stone-400 font-mono text-[11px]" suppressHydrationWarning>
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {log.details ? (
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-lg border border-stone-200 hover:border-amber-400 text-stone-700 text-[11px] font-semibold transition cursor-pointer"
                        >
                          Inspect
                        </button>
                      ) : (
                        <span className="text-stone-300 text-[11px]">None</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>Page {pagination.page} of {pagination.totalPages || 1}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1 || loading}
              onClick={() => fetchLogs(pagination.page - 1, search, statusFilter)}
              className="p-1.5 rounded-lg border border-stone-200 enabled:hover:bg-stone-50 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => fetchLogs(pagination.page + 1, search, statusFilter)}
              className="p-1.5 rounded-lg border border-stone-200 enabled:hover:bg-stone-50 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="font-bold text-stone-900 font-serif text-base">Audit Event Details</h3>
                <p className="text-xs text-stone-500 font-mono">{selectedLog.action}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 text-stone-600 bg-stone-50 p-3 rounded-2xl border border-stone-200">
                <div><strong>Actor:</strong> {selectedLog.actorEmail}</div>
                <div><strong>Role:</strong> {selectedLog.actorRole}</div>
                <div><strong>Target:</strong> {selectedLog.targetResource}</div>
                <div><strong>IP:</strong> {selectedLog.ipAddress || "127.0.0.1"}</div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Sanitized Event Payload
                </label>
                <pre className="p-3 bg-stone-950 text-emerald-400 rounded-xl overflow-x-auto font-mono text-[11px] leading-relaxed max-h-60">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
