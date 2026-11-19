import prisma from "@/lib/prisma";
import MuseumHero from "@/components/museum/MuseumHero";
import ExploreKnowledgeSection from "@/components/museum/ExploreKnowledgeSection";
import FeaturedManuscriptsSection from "@/components/museum/FeaturedManuscriptsSection";
import DigitalLibrarySection from "@/components/museum/DigitalLibrarySection";
import KnowledgeCollectionsSection from "@/components/museum/KnowledgeCollectionsSection";
import ResearchDiscoverSection from "@/components/museum/ResearchDiscoverSection";
import VedicAstrologyMuseumSection from "@/components/museum/VedicAstrologyMuseumSection";
import LearnGrowMuseumSection from "@/components/museum/LearnGrowMuseumSection";
import LatestPublicationsSection from "@/components/museum/LatestPublicationsSection";
import { computePanchang } from "@/server/astrology/panchang";

export const metadata = {
  title: "Gurukul – Digital Museum of Timeless Wisdom",
  description:
    "Explore authentic sacred Vedic manuscripts, classical Jyotisha shastras, Sanskrit grammar, and Upanishadic wisdom through a museum-grade digital experience.",
};

export default async function HomePage() {
  // Fetch real published books ordered by publication date
  const books = await prisma.book
    .findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        author: true,
        description: true,
        tradition: true,
        language: true,
        script: true,
        coverUrl: true,
        coverImageUrl: true,
        pageCount: true,
        status: true,
        publishedAt: true,
        createdAt: true,
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 12,
    })
    .catch(() => []);

  // Compute today's Panchang for India (IST default)
  let initialPanchang = null;
  try {
    const todayStr = new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().split("T")[0];
    initialPanchang = computePanchang({
      date: todayStr,
      latitude: 28.6139,
      longitude: 77.209,
      tzOffset: 5.5,
      timezone: "Asia/Kolkata",
    });
  } catch (err) {
    console.error("Failed to compute initial home panchang:", err);
  }

  return (
    <div className="bg-[#F7F5F0] min-h-screen text-[#30251F]">
      {/* 1. Hero – Digital Museum of Timeless Wisdom */}
      <MuseumHero />

      {/* 2. Explore Knowledge – Shastra, Vedic Astrology, Heritage, Sanskrit, Philosophy & Science */}
      <ExploreKnowledgeSection />

      {/* 3. Featured Manuscripts – Large visual manuscript cards */}
      <FeaturedManuscriptsSection books={books} />

      {/* 4. Digital Library – Actual published books and categories */}
      <DigitalLibrarySection books={books} />

      {/* 5. Knowledge Collections – Curated collections of related texts */}
      <KnowledgeCollectionsSection />

      {/* 6. Research and Discover – Original passages, translations and explanations */}
      <ResearchDiscoverSection />

      {/* 7. Vedic Astrology – Kundli, Numerology, Panchang and Dasha */}
      <VedicAstrologyMuseumSection panchang={initialPanchang} />

      {/* 8. Learn and Grow – Learning resources and Sanskrit education */}
      <LearnGrowMuseumSection />

      {/* 9. Latest Publications – Actual published articles and books */}
      <LatestPublicationsSection books={books} />
    </div>
  );
}
