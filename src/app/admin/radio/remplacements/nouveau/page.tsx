import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { NouveauRemplacementForm } from "@/components/admin/radio/NouveauRemplacementForm";

export default async function NouveauRemplacementPage() {
  const supabase = await createClient();
  const { data: radios } = await supabase
    .from("piloto_radios")
    .select("id, nom_radio, tranche_debut, tranche_fin, tarif_horaire")
    .order("nom_radio");

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Radio", href: "/admin/radio" },
          { label: "Remplacements", href: "/admin/radio/remplacements" },
          { label: "Nouveau remplacement" },
        ]}
      />
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nouveau remplacement</h2>
      <NouveauRemplacementForm radios={radios ?? []} />
    </div>
  );
}
