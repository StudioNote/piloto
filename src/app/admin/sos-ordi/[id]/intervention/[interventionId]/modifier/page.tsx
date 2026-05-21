import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { modifierIntervention } from "../../../../actions";
import { notFound } from "next/navigation";

export default async function ModifierInterventionPage({
  params,
}: {
  params: { id: string; interventionId: string };
}) {
  const supabase = await createClient();

  const [{ data: client }, { data: intervention }] = await Promise.all([
    supabase
      .from("piloto_clients")
      .select("id, civilite, nom, prenom")
      .eq("id", params.id)
      .single(),
    supabase
      .from("piloto_interventions")
      .select("*")
      .eq("id", params.interventionId)
      .single(),
  ]);

  if (!client || !intervention) notFound();

  const clientName = [client.civilite, client.prenom, client.nom]
    .filter(Boolean)
    .join(" ");

  const inputCls =
    "w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "SOS Ordi", href: "/admin/sos-ordi" },
          { label: clientName, href: `/admin/sos-ordi/${client.id}` },
          { label: "Modifier l'intervention" },
        ]}
      />
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Modifier l&apos;intervention
      </h2>
      <form
        action={modifierIntervention}
        className="bg-white rounded-xl border border-gray-100 p-6 space-y-5"
      >
        <input type="hidden" name="id" value={intervention.id} />
        <input type="hidden" name="client_id" value={client.id} />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1.5">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              id="date"
              name="date"
              type="date"
              required
              defaultValue={intervention.date}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="duree_minutes" className="block text-sm font-medium text-gray-700 mb-1.5">
              Durée estimée (min)
            </label>
            <input
              id="duree_minutes"
              name="duree_minutes"
              type="number"
              min="0"
              step="15"
              defaultValue={intervention.duree_minutes ?? ""}
              className={inputCls}
            />
          </div>
          <div>
            <label htmlFor="montant" className="block text-sm font-medium text-gray-700 mb-1.5">
              Montant facturé (€)
            </label>
            <input
              id="montant"
              name="montant"
              type="number"
              min="0"
              step="0.01"
              defaultValue={intervention.montant ?? ""}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
            Description de la demande
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={intervention.description ?? ""}
            className={`${inputCls} resize-none`}
          />
        </div>

        <div>
          <label htmlFor="statut" className="block text-sm font-medium text-gray-700 mb-1.5">
            Statut <span className="text-red-500">*</span>
          </label>
          <select
            id="statut"
            name="statut"
            required
            defaultValue={intervention.statut}
            className={`${inputCls} bg-white`}
          >
            <option value="À faire">À faire</option>
            <option value="En cours">En cours</option>
            <option value="Terminé">Terminé</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Enregistrer
          </button>
          <a
            href={`/admin/sos-ordi/${client.id}`}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2.5 transition-colors"
          >
            Annuler
          </a>
        </div>
      </form>
    </div>
  );
}
