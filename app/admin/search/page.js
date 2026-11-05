import GlobalSearchAdminClient from "@/components/admin/GlobalSearchAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminSearchPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const initialQuery = resolvedParams?.q || "";

  return <GlobalSearchAdminClient initialQuery={initialQuery} />;
}
