import prisma from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Layers, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import IngestionStatus from "@/components/admin/IngestionStatus.jsx";

export const dynamic = "force-dynamic";

export default async function AdminIngestionPage({ searchParams }) {
  const params = await searchParams;
  const targetJobId = params?.jobId;

  const jobs = await prisma.ingestJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      book: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  const activeJob = targetJobId
    ? jobs.find((j) => j.id === targetJobId)
    : jobs.find((j) => j.status !== "COMPLETED" && j.status !== "FAILED");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/admin/books"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-800 mb-2 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Books Management</span>
        </Link>
        <h1 className="text-3xl font-bold text-stone-900 font-serif">
          Ingestion & OCR Pipeline Monitor
        </h1>
        <p className="text-sm text-stone-500 mt-1">
          Monitor background Node.js page rendering, Tesseract OCR execution, text cleaning, and chapter structuring.
        </p>
      </div>

      {/* Active Job Tracker */}
      {activeJob ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-600 px-1">
            <span>Tracking Ingestion for: <strong className="text-stone-900">{activeJob.book?.title}</strong></span>
            <span className="font-mono text-stone-400">Job: {activeJob.id}</span>
          </div>
          <IngestionStatus jobId={activeJob.id} />
        </div>
      ) : targetJobId ? (
        <IngestionStatus jobId={targetJobId} />
      ) : null}

      {/* Recent Jobs History Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-700" />
            <h3 className="font-bold text-stone-900 font-serif text-base">Ingestion Job History</h3>
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="text-center py-12 text-stone-400">
            <p className="text-sm">No ingestion jobs run yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50 text-xs uppercase font-semibold text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4">Pages (Done / Total)</th>
                  <th className="px-6 py-4">Failures</th>
                  <th className="px-6 py-4">Started At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {jobs.map((j) => (
                  <tr key={j.id} className="hover:bg-stone-50/50 transition">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-stone-900">{j.book?.title || "Unknown Book"}</p>
                      <p className="text-xs text-stone-400 font-mono">{j.id}</p>
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
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

                    <td className="px-6 py-4 text-xs font-mono font-medium">
                      {Math.round(j.progress)}%
                    </td>

                    <td className="px-6 py-4 text-xs font-mono">
                      {j.processedPages} / {j.totalPages}
                    </td>

                    <td className="px-6 py-4 text-xs font-mono">
                      <span className={j.failedPages > 0 ? "text-rose-600 font-bold" : "text-stone-400"}>
                        {j.failedPages}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-xs text-stone-500">
                      {new Date(j.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>

                    <td className="px-6 py-4 text-right text-xs">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/ingestion?jobId=${j.id}`}
                          className="text-amber-700 hover:text-amber-900 font-medium"
                        >
                          View Job
                        </Link>
                        {j.bookId && (
                          <Link
                            href={`/admin/proofreading?bookId=${j.bookId}`}
                            className="text-purple-700 hover:text-purple-900 font-medium ml-2"
                          >
                            Proofread
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
