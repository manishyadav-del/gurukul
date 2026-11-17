import prisma from "@/lib/prisma";
import AdminFestivalStudioClient from "@/components/admin/AdminFestivalStudioClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vedic Festival & Observance Management - Gurukul Admin",
  description: "Configure Hindu festivals, astronomical determination rules, Vrata guidelines, and verified manuscript references.",
};

export default async function AdminFestivalsPage() {
  const festivals = await prisma.vedicFestival.findMany({
    include: {
      rule: true,
      scriptureReferences: true,
      _count: {
        select: {
          preferences: true,
          reminders: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <AdminFestivalStudioClient initialFestivals={festivals} />
    </div>
  );
}
