import { getDb } from "@/lib/getDb";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { ModelesList } from "@/components/admin/modeles/ModelesList";

export default async function ModelesPage() {
  const db = await getDb();
  const { data: modeles } = await db
    .from("piloto_modeles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Modèles" }]} />
      <ModelesList initial={modeles ?? []} />
    </div>
  );
}
