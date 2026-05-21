import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { creerPrestationBuilder } from "../../actions";
import { notFound } from "next/navigation";
import { clientLabel } from "@/lib/builder-utils";

export default async function NouvellePrestationBuilderPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();
  const { data: client } = await supabase
    .from("piloto_builder_clients")
    .select("id, societe, nom, prenom")
    .eq("id", params.id)
    .single();

  if (!client) notFound();

  const today = new Date().toISOString().split("T")[0];

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
          { label: "Nouvelle prestation" },
        ]}
      />
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nouvelle prestation</h2>
      <form
        action={creerPrestationBuilder}
        className="bg-white rounded-xl border border-gray-100 p-6 space-y-5"
      >
        <input type="hidden" name="client_id" value={client.id} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1.5">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={today}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="montant" className="block text-sm font-medium text-gray-700 mb-1.5">
              Montant (€)
            </label>
            <input
              id="montant"
              name="montant"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Détails de la prestation…"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Enregistrer
          </button>
          <a
            href={`/admin/builder/${client.id}`}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5 transition-colors"
          >
            Annuler
          </a>
        </div>
      </form>
    </div>
  );
}
