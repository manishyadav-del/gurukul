import prisma from "@/lib/prisma.js";
import { getVerificationStatistics } from "@/server/provenance/provenanceService.js";
import ScholarlyReviewStudioClient from "@/components/admin/ScholarlyReviewStudioClient.jsx";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Scholarly Source Verification Studio | Gurukul Admin",
  description: "Verify manuscript folios, Devanagari character accuracy, translation provenance, and Knowledge Graph evidence.",
};

export default async function AdminVerificationPage() {
  const [stats, books] = await Promise.all([
    getVerificationStatistics().catch(() => null),
    prisma.book.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        language: true,
        tradition: true,
      },
      orderBy: { title: "asc" },
    }),
  ]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ScholarlyReviewStudioClient
        initialStats={stats}
        initialBooks={books}
      />
    </div>
  );
}
