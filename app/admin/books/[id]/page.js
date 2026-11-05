import prisma from "@/lib/prisma";
import Link from "next/link";
import BookLifecycleManagerClient from "@/components/admin/BookLifecycleManagerClient";
import { evaluateBookQuality } from "@/server/ocr/qualityChecks";

export const dynamic = "force-dynamic";

export default async function AdminBookDetailPage({ params }) {
  const { id } = await params;

  const book = await prisma.book.findUnique({
    where: { id },
    include: {
      pages: {
        orderBy: { pageNumber: "asc" },
      },
      chapters: {
        orderBy: { sortOrder: "asc" },
        include: {
          passages: { select: { id: true } },
        },
      },
      ocrErrors: {
        orderBy: { createdAt: "desc" },
      },
      ingestJobs: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      correctionHistory: {
        orderBy: { createdAt: "desc" },
        take: 30,
      },
      _count: {
        select: {
          pages: true,
          ocrErrors: true,
          chapters: true,
          passages: true,
          correctionHistory: true,
        },
      },
    },
  });

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-stone-900">Book Not Found</h2>
        <Link href="/admin/books" className="text-amber-700 underline text-sm mt-2 inline-block">
          Return to books list
        </Link>
      </div>
    );
  }

  const readiness = await evaluateBookQuality(book.id).catch(() => null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <BookLifecycleManagerClient initialBook={book} initialReadiness={readiness} />
    </div>
  );
}
