import prisma from "@/lib/prisma";
import AuditLogsAdminClient from "@/components/admin/AuditLogsAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const page = Math.max(1, parseInt(resolvedParams?.page || "1", 10));
  const limit = 25;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.adminAuditLog.count(),
  ]);

  const initialData = {
    logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };

  return <AuditLogsAdminClient initialData={initialData} />;
}
