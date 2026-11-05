"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Play,
  CheckCircle,
  FileSearch,
  Trash2,
  Loader2,
  ExternalLink,
  RefreshCw,
  Sparkles,
  FileText,
} from "lucide-react";

export default function BookList({ initialBooks = [], onBookUpdated }) {
  const [books, setBooks] = useState(initialBooks);
  const [processingId, setProcessingId] = useState(null);
  const [publishingId, setPublishingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredBooks = books.filter((b) => {
    if (statusFilter === "ALL") return true;
    return b.status === statusFilter;
  });

  const handleStartProcess = async (bookId) => {
    setProcessingId(bookId);
    try {
      const res = await fetch(`/api/books/${bookId}/process`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        // Update local state
        setBooks((prev) =>
          prev.map((b) =>
            b.id === bookId
              ? { ...b, status: "PROCESSING", processingStatus: "ANALYZING" }
              : b
          )
        );
        window.location.href = `/admin/ingestion?jobId=${data.jobId}`;
      } else {
        alert(data.error || "Failed to start processing");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handlePublishToggle = async (bookId, currentStatus) => {
    // Route through the official lifecycle governance manager
    window.location.href = `/admin/books/${bookId}`;
  };

  const handleDelete = async (bookId) => {
    if (!confirm("Are you sure you want to delete this book and all its pages?")) return;
    try {
      const res = await fetch(`/api/books/${bookId}`, { method: "DELETE" });
      if (res.ok) {
        setBooks((prev) => prev.filter((b) => b.id !== bookId));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs space-y-4">
      {/* Filter Toolbar */}
      <div className="p-4 border-b border-stone-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-700" />
          <h3 className="font-bold text-stone-900 font-serif text-base">Astrology Books Library</h3>
          <span className="text-xs text-stone-400">({filteredBooks.length} books)</span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-stone-200 bg-stone-50 text-stone-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="NEEDS_REVIEW">NEEDS_REVIEW</option>
            <option value="PENDING_APPROVAL">PENDING_APPROVAL</option>
            <option value="APPROVED">APPROVED</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="ARCHIVED">ARCHIVED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {filteredBooks.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">No books match the selected filter</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-stone-600">
            <thead className="bg-stone-50 text-xs uppercase font-semibold text-stone-500 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4">Title & Slug</th>
                <th className="px-6 py-4">Language</th>
                <th className="px-6 py-4">Pages</th>
                <th className="px-6 py-4">Pipeline Status</th>
                <th className="px-6 py-4">Book Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredBooks.map((b) => {
                const pageCount = b._count?.pages || b.pageCount || 0;
                const isProcessing = processingId === b.id || b.processingStatus === "OCR_PROCESSING";

                return (
                  <tr key={b.id} className="hover:bg-stone-50/50 transition">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/books/${b.id}`}
                        className="font-semibold text-stone-900 hover:text-amber-700 transition"
                      >
                        {b.title}
                      </Link>
                      <p className="text-xs text-stone-400 font-mono">{b.slug}</p>
                      {b.author && <p className="text-xs text-stone-500 mt-0.5">By {b.author}</p>}
                    </td>

                    <td className="px-6 py-4 text-xs">
                      {b.language} {b.script ? `(${b.script})` : ""}
                    </td>

                    <td className="px-6 py-4 text-xs font-mono">
                      {pageCount > 0 ? `${pageCount} pages` : "Pending scan"}
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          b.processingStatus === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-800"
                            : b.processingStatus === "FAILED"
                            ? "bg-rose-100 text-rose-800"
                            : b.processingStatus === "QUEUED"
                            ? "bg-stone-100 text-stone-700"
                            : "bg-amber-100 text-amber-800 animate-pulse"
                        }`}
                      >
                        {b.processingStatus || "QUEUED"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          b.status === "PUBLISHED"
                            ? "bg-emerald-100 text-emerald-800"
                            : b.status === "EXPERT_APPROVED"
                            ? "bg-blue-100 text-blue-800"
                            : b.status === "PROOFREAD"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-stone-100 text-stone-700"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right text-xs">
                      <div className="flex items-center justify-end gap-2">
                        {/* Process OCR button */}
                        {b.originalFileUrl && (
                          <button
                            onClick={() => handleStartProcess(b.id)}
                            disabled={isProcessing}
                            title="Run / Re-run OCR Ingestion Pipeline"
                            className="p-1.5 rounded-lg border border-stone-200 hover:border-amber-600 hover:text-amber-700 text-stone-600 transition"
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </button>
                        )}

                        {/* Proofread link */}
                        <Link
                          href={`/admin/proofreading?bookId=${b.id}`}
                          title="Open Proofreading Workspace"
                          className="p-1.5 rounded-lg border border-stone-200 hover:border-purple-600 hover:text-purple-700 text-stone-600 transition"
                        >
                          <FileSearch className="w-4 h-4" />
                        </Link>

                        {/* View / Read Digitized Book PDF */}
                        <Link
                          href={`/library/${b.slug}/pdf`}
                          title="View Generated Digital Book PDF"
                          className="p-1.5 rounded-lg border border-stone-200 hover:border-amber-600 hover:text-amber-700 text-stone-600 transition"
                        >
                          <FileText className="w-4 h-4 text-amber-600" />
                        </Link>

                        {/* Publish / Unpublish */}
                        <button
                          onClick={() => handlePublishToggle(b.id, b.status)}
                          disabled={publishingId === b.id}
                          title={b.status === "PUBLISHED" ? "Unpublish Book" : "Publish Book"}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            b.status === "PUBLISHED"
                              ? "bg-stone-100 hover:bg-stone-200 text-stone-700"
                              : "bg-emerald-700 hover:bg-emerald-800 text-white"
                          }`}
                        >
                          {b.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDelete(b.id)}
                          title="Delete Book"
                          className="p-1.5 rounded-lg border border-stone-200 hover:border-rose-400 hover:text-rose-600 text-stone-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
