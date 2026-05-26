import { getDb } from "@/lib/getDb";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { DevisForm } from "@/components/admin/devis/DevisForm";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function DevisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();

  const [
    { data: devis },
    { data: catalogue },
    { data: prospects },
    { data: builderClients },
  ] = await Promise.all([
    db
      .from("piloto_devis")
      .select("*, piloto_devis_lignes(*)")
      .eq("id", id)
      .single(),
    db.from("piloto_devis_catalogue").select("id, libelle, description, prix_ht, categorie").eq("actif", true).order("ordre"),
    db.from("piloto_builder_prospects").select("id, societe, nom, prenom, email, telephone, adresse").order("created_at", { ascending: false }),
    db.from("piloto_builder_clients").select("id, societe, nom, prenom, email, telephone, adresse").order("created_at", { ascending: false }),
  ]);

  if (!devis) notFound();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Devis", href: "/admin/devis" },
          { label: devis.numero },
        ]}
      />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-1 h-7 bg-orange-500 rounded-full shrink-0" />
          <h1 className="text-2xl font-bold text-gray-900">{devis.numero}</h1>
        </div>
        <Link
          href={`/api/devis/${id}/pdf`}
          target="_blank"
          className="text-sm font-medium text-orange-600 hover:text-orange-800 border border-orange-200 rounded-lg px-4 py-2 transition-colors"
        >
          Télécharger le PDF
        </Link>
      </div>

      <DevisForm
        catalogue={catalogue ?? []}
        prospects={prospects ?? []}
        builderClients={builderClients ?? []}
        devis={devis}
      />
    </div>
  );
}
