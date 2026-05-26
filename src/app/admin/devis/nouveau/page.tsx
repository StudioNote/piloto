import { getDb } from "@/lib/getDb";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { DevisForm } from "@/components/admin/devis/DevisForm";

export default async function NouveauDevisPage() {
  const db = await getDb();
  const [{ data: catalogue }, { data: prospects }, { data: builderClients }] = await Promise.all([
    db.from("piloto_devis_catalogue").select("id, libelle, description, prix_ht, categorie").eq("actif", true).order("ordre"),
    db.from("piloto_builder_prospects").select("id, societe, nom, prenom, email, telephone, adresse").order("created_at", { ascending: false }),
    db.from("piloto_builder_clients").select("id, societe, nom, prenom, email, telephone, adresse").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Devis", href: "/admin/devis" },
          { label: "Nouveau devis" },
        ]}
      />

      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-7 bg-orange-500 rounded-full shrink-0" />
        <h1 className="text-2xl font-bold text-gray-900">Nouveau devis</h1>
      </div>

      <DevisForm
        catalogue={catalogue ?? []}
        prospects={prospects ?? []}
        builderClients={builderClients ?? []}
      />
    </div>
  );
}
