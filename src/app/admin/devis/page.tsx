import { getDb } from "@/lib/getDb";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { DevisList } from "@/components/admin/devis/DevisList";
import Link from "next/link";

export default async function DevisPage() {
  const db = await getDb();
  const { data: devis } = await db
    .from("piloto_devis")
    .select("id, numero, client_nom, objet, date_emission, date_validite, total_ht, statut")
    .order("date_emission", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Devis" }]} />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-orange-500 rounded-full shrink-0" />
          <h1 className="text-2xl font-bold text-gray-900">Devis</h1>
          <span className="text-sm text-gray-400 font-normal">({devis?.length ?? 0})</span>
        </div>
        <Link
          href="/admin/devis/nouveau"
          className="bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nouveau devis
        </Link>
      </div>

      <DevisList devis={devis ?? []} />
    </div>
  );
}
