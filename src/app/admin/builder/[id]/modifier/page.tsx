import { getDb } from "@/lib/getDb";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { BuilderClientForm } from "@/components/admin/builder/BuilderClientForm";
import { modifierClientBuilder } from "../../actions";
import { notFound } from "next/navigation";
import { clientLabel } from "@/lib/builder-utils";

export default async function ModifierClientBuilderPage({
  params,
}: {
  params: { id: string };
}) {
  const db = await getDb();
  const { data: client } = await db
    .from("piloto_builder_clients")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!client) notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Builder", href: "/admin/builder" },
          {
            label: clientLabel(client),
            href: `/admin/builder/${client.id}`,
          },
          { label: "Modifier" },
        ]}
      />
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifier le client</h2>
      <BuilderClientForm
        action={modifierClientBuilder}
        cancelHref={`/admin/builder/${client.id}`}
        defaultValues={{
          id: client.id,
          societe: client.societe ?? "",
          nom: client.nom ?? "",
          prenom: client.prenom ?? "",
          email: client.email ?? "",
          telephone: client.telephone ?? "",
          adresse: client.adresse ?? "",
        }}
      />
    </div>
  );
}
