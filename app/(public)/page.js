import prisma from "@/lib/prisma";
import HomeHero from "@/components/home/HomeHero";
import FeatureCategoryBar from "@/components/home/FeatureCategoryBar";
import HomePanchangSection from "@/components/home/HomePanchangSection";
import HomeQuickActions from "@/components/home/HomeQuickActions";
import QuoteRibbon from "@/components/home/QuoteRibbon";
import RecentlyAddedBooks from "@/components/home/RecentlyAddedBooks";
import TrendingTopics from "@/components/home/TrendingTopics";
import PopularTools from "@/components/home/PopularTools";
import { computePanchang } from "@/server/astrology/panchang";

export default async function HomePage() {
  // Fetch published books ordered by publication date
  const books = await prisma.book
    .findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        language: true,
        coverUrl: true,
        coverImageUrl: true,
        pageCount: true,
        publishedAt: true,
      },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      take: 6,
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
    <div className="bg-[#fcfaf5] min-h-screen space-y-6 pb-12">
      {/* 1. Hero Section */}
      <HomeHero />

      {/* Main Content Width Container */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* 2. Feature Category Pills Bar */}
        <FeatureCategoryBar />

        {/* 3. Today's Panchang Section */}
        <HomePanchangSection initialPanchang={initialPanchang} />

        {/* 4. Quick Actions */}
        <HomeQuickActions />

        {/* 5. Quote Ribbon */}
        <QuoteRibbon />

        {/* 6. Discover Books, Topics & Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
          <div className="lg:col-span-6">
            <RecentlyAddedBooks books={books} />
          </div>
          <div className="lg:col-span-3">
            <TrendingTopics />
          </div>
          <div className="lg:col-span-3">
            <PopularTools />
          </div>
        </div>
      </div>
    </div>
  );
}
