import { getDb } from "@/lib/getDb";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { ClientVoixOffForm } from "@/components/admin/voix-off/ClientVoixOffForm";
import { modifierClientVoixOff } from "../../actions";
import { notFound } from "next/navigation";
import { clientLabel } from "@/lib/voixoff-utils";

export default async function ModifierClientVoixOffPage({
  params,
}: {
  params: { id: string };
}) {
  const db = await getDb();
  const { data: client } = await db
    .from("piloto_voixoff_clients")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!client) notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Voix-Off", href: "/admin/voix-off" },
          {
            label: clientLabel(client),
            href: `/admin/voix-off/${client.id}`,
          },
          { label: "Modifier" },
        ]}
      />
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifier le client</h2>
      <ClientVoixOffForm
        action={modifierClientVoixOff}
        cancelHref={`/admin/voix-off/${client.id}`}
        defaultValues={{
          id: client.id,
          societe: client.societe ?? "",
          nom: client.nom ?? "",
          prenom: client.prenom ?? "",
          email: client.email ?? "",
          telephone: client.telephone ?? "",
        }}
      />
    </div>
  );
}
