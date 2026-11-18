import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import VedicNumerologyStudio from "@/components/astrology/VedicNumerologyStudio";
import { calculateVedicNumerology } from "@/server/numerology/numerologyEngine";

export const metadata = {
  title: "Vedic Numerology (Sankhya Shastra) - Gurukul",
  description:
    "Discover your authentic Mulank, Bhagyank, and Namank numbers, planetary rulers, 3x3 Vedic Anka Yantra, and Shastric Beej Mantras.",
};

export const dynamic = "force-dynamic";

export default async function VedicNumerologyPage() {
  const session = await getServerSession(authOptions).catch(() => null);
  const user = session?.user || null;

  let initialProfile = null;
  let initialReport = null;
  let initialSavedReport = null;

  if (user?.id) {
    try {
      // 1. Look for saved NumerologyReport (new versioned system)
      const savedReportRecord = await prisma.numerologyReport.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });

      if (savedReportRecord) {
        initialSavedReport = savedReportRecord;
        initialReport = savedReportRecord.reportData;
      }

      // 2. Look for saved NumerologyProfile (for Vedic matrix & fallback)
      const saved = await prisma.numerologyProfile.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      });

      if (saved) {
        initialProfile = saved;
        if (!initialReport) initialReport = saved.calculationData;
      } else {
        // 3. Look for existing BirthProfile
        const birthProfile = await prisma.birthProfile.findFirst({
          where: { userId: user.id },
          orderBy: { updatedAt: "desc" },
        });

        if (birthProfile) {
          initialProfile = {
            name: birthProfile.name,
            birthDate: birthProfile.birthDate,
          };
          if (!initialReport) {
            initialReport = calculateVedicNumerology({
              name: birthProfile.name,
              birthDate: birthProfile.birthDate.toISOString().split("T")[0],
            });
          }
        }
      }
    } catch (err) {
      console.warn("Error loading user numerology initial state:", err.message);
    }
  }

  return (
    <div className="bg-[#fcfaf5] min-h-screen py-8 text-stone-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <VedicNumerologyStudio
          initialProfile={initialProfile}
          initialReport={initialReport}
          initialSavedReport={initialSavedReport}
          user={user}
        />
      </div>
    </div>
  );
}
