import { getDb } from "@/lib/getDb";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { modifierProspect } from "../../actions";
import { ProspectForm } from "@/components/admin/prospects/ProspectForm";
import { notFound } from "next/navigation";

export default async function ModifierProspectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();

  const { data: prospect } = await db
    .from("piloto_builder_prospects")
    .select("*")
    .eq("id", id)
    .single();

  if (!prospect) notFound();

  const label =
    [prospect.societe, prospect.prenom, prospect.nom].filter(Boolean).join(" · ") || "—";

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Prospects", href: "/admin/prospects" },
          { label: label, href: `/admin/prospects/${id}` },
          { label: "Modifier" },
        ]}
      />
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-7 bg-indigo-600 rounded-full shrink-0" />
        <h1 className="text-2xl font-bold text-gray-900">Modifier le prospect</h1>
      </div>
      <ProspectForm
        action={modifierProspect}
        cancelHref={`/admin/prospects/${id}`}
        defaultValues={{
          id: prospect.id,
          societe: prospect.societe ?? "",
          nom: prospect.nom ?? "",
          prenom: prospect.prenom ?? "",
          email: prospect.email ?? "",
          telephone: prospect.telephone ?? "",
          adresse: prospect.adresse ?? "",
          source: prospect.source ?? "",
          besoin: prospect.besoin ?? "",
          notes: prospect.notes ?? "",
          montant_estime: prospect.montant_estime?.toString() ?? "",
          statut: prospect.statut,
          prochaine_action_date: prospect.prochaine_action_date ?? "",
        }}
      />
    </div>
  );
}
