import StructureManager from "@/components/admin/StructureManager";

export const dynamic = "force-dynamic";

export default async function AdminBookStructurePage({ params }) {
  const { id } = await params;
  return <StructureManager bookId={id} />;
}
