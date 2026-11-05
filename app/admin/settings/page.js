import prisma from "@/lib/prisma";
import PlatformSettingsAdminClient from "@/components/admin/PlatformSettingsAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  let settings = await prisma.platformSettings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    settings = await prisma.platformSettings.create({
      data: { id: "default" },
    });
  }

  return <PlatformSettingsAdminClient initialSettings={settings} />;
}
