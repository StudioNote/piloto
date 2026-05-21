import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { PrestationsList } from "@/components/admin/voix-off/PrestationsList";
import { notFound } from "next/navigation";
import Link from "next/link";
import { clientLabel, clientContact } from "@/lib/voixoff-utils";

function prevMonth(mois: string): string {
  const [year, month] = mois.split("-").map(Number);
  const d = new Date(year, month - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function nextMonth(mois: string): string {
  const [year, month] = mois.split("-").map(Number);
  const d = new Date(year, month, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(mois: string): string {
  const [year, month] = mois.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
}

export default async function FicheClientVoixOffPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { mois?: string };
}) {
  const supabase = await createClient();

  const currentMois =
    searchParams.mois ?? new Date().toISOString().slice(0, 7);

  const [{ data: client }, { data: prestations }] = await Promise.all([
    supabase
      .from("piloto_voixoff_clients")
      .select("*")
      .eq("id", params.id)
      .single(),
    supabase
      .from("piloto_voixoff_prestations")
      .select("id, date, description, montant")
      .eq("client_id", params.id)
      .order("date", { ascending: false }),
  ]);

  if (!client) notFound();

  const totalMois = (prestations ?? [])
    .filter((p) => p.date.startsWith(currentMois))
    .reduce((acc: number, p: { montant: number | null }) => acc + (p.montant ?? 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Voix-Off", href: "/admin/voix-off" },
          { label: clientLabel(client) },
        ]}
      />

      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{clientLabel(client)}</h2>
            {clientContact(client) && (
              <p className="text-sm text-gray-500 mt-0.5">{clientContact(client)}</p>
            )}
          </div>
          <Link
            href={`/admin/voix-off/${client.id}/modifier`}
            className="text-sm text-gray-500 hover:text-gray-800 font-medium border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Modifier
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          {client.email && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
              <p className="text-gray-800">{client.email}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Téléphone</p>
            <p className="text-gray-800">{client.telephone ?? "—"}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-blue-500 uppercase tracking-wide mb-0.5">
              Total facturé
            </p>
            <p className="text-2xl font-bold text-blue-900">
              {totalMois.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              €
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/voix-off/${client.id}?mois=${prevMonth(currentMois)}`}
              className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
            >
              ← Précédent
            </Link>
            <span className="text-sm font-medium text-gray-700 capitalize">
              {formatMonthLabel(currentMois)}
            </span>
            <Link
              href={`/admin/voix-off/${client.id}?mois=${nextMonth(currentMois)}`}
              className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Suivant →
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Prestations
          {prestations && prestations.length > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({prestations.length})
            </span>
          )}
        </h3>
        <Link
          href={`/admin/voix-off/${client.id}/nouvelle-prestation`}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nouvelle prestation
        </Link>
      </div>

      <PrestationsList initial={prestations ?? []} />
    </div>
  );
}
