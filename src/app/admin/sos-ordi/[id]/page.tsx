import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { notFound } from "next/navigation";
import Link from "next/link";

const STATUT_STYLES: Record<string, string> = {
  "À faire": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "En cours": "bg-blue-50 text-blue-700 border-blue-200",
  Terminé: "bg-green-50 text-green-700 border-green-200",
};

export default async function FicheClientPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await createClient();

  const [{ data: client }, { data: interventions }] = await Promise.all([
    supabase.from("piloto_clients").select("*").eq("id", params.id).single(),
    supabase
      .from("piloto_interventions")
      .select("*")
      .eq("client_id", params.id)
      .order("date", { ascending: false }),
  ]);

  if (!client) notFound();

  const mapsUrl = client.adresse
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(client.adresse)}`
    : null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "SOS Ordi", href: "/admin/sos-ordi" },
          { label: `${client.prenom} ${client.nom}` },
        ]}
      />

      {/* Fiche */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-900">
            {client.prenom} {client.nom}
          </h2>
          <Link
            href={`/admin/sos-ordi/${client.id}/modifier`}
            className="text-sm text-gray-500 hover:text-gray-800 font-medium border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Modifier
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
            <p className="text-gray-800">{client.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Téléphone</p>
            <p className="text-gray-800">{client.telephone ?? "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Adresse</p>
            <div className="flex items-center gap-3">
              <p className="text-gray-800">{client.adresse ?? "—"}</p>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 shrink-0"
                >
                  Ouvrir dans Maps →
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interventions */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Interventions
          {interventions && interventions.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({interventions.length})
            </span>
          )}
        </h3>
        <Link
          href={`/admin/sos-ordi/${client.id}/nouvelle-intervention`}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nouvelle intervention
        </Link>
      </div>

      {!interventions || interventions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-sm text-gray-400">
          Aucune intervention enregistrée.
        </div>
      ) : (
        <div className="space-y-3">
          {interventions.map((intervention) => (
            <div
              key={intervention.id}
              className="bg-white rounded-xl border border-gray-100 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium text-gray-800">
                      {new Date(intervention.date).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    {intervention.duree_minutes && (
                      <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                        {intervention.duree_minutes} min
                      </span>
                    )}
                  </div>
                  {intervention.description && (
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {intervention.description}
                    </p>
                  )}
                </div>
                <span
                  className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border ${
                    STATUT_STYLES[intervention.statut] ?? "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {intervention.statut}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
