import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { VoixOffClientsList } from "@/components/admin/voix-off/VoixOffClientsList";
import Link from "next/link";

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

export default async function VoixOffPage({
  searchParams,
}: {
  searchParams: { mois?: string; annee?: string };
}) {
  const supabase = await createClient();

  const currentMois =
    searchParams.mois ?? new Date().toISOString().slice(0, 7);
  const currentAnnee =
    Number(searchParams.annee) || new Date().getFullYear();

  const [year, month] = currentMois.split("-").map(Number);
  const debutMois = `${currentMois}-01`;
  const finMois = `${currentMois}-${String(new Date(year, month, 0).getDate()).padStart(2, "0")}`;
  const debutAnnee = `${currentAnnee}-01-01`;
  const finAnnee = `${currentAnnee}-12-31`;

  const [
    { data: clients },
    { data: prestationsMois },
    { data: prestationsAnnee },
  ] = await Promise.all([
    supabase
      .from("piloto_voixoff_clients")
      .select("id, nom, prenom, telephone")
      .order("nom"),
    supabase
      .from("piloto_voixoff_prestations")
      .select("montant")
      .gte("date", debutMois)
      .lte("date", finMois),
    supabase
      .from("piloto_voixoff_prestations")
      .select("montant")
      .gte("date", debutAnnee)
      .lte("date", finAnnee),
  ]);

  const totalMois = (prestationsMois ?? []).reduce(
    (acc: number, p: { montant: number | null }) => acc + (p.montant ?? 0),
    0,
  );
  const totalAnnee = (prestationsAnnee ?? []).reduce(
    (acc: number, p: { montant: number | null }) => acc + (p.montant ?? 0),
    0,
  );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[{ label: "Admin", href: "/admin" }, { label: "Voix-Off" }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-blue-500 uppercase tracking-wide mb-0.5">
                Total Voix-Off
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {totalMois.toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                €
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/voix-off?mois=${prevMonth(currentMois)}&annee=${currentAnnee}`}
                className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
              >
                ←
              </Link>
              <span className="text-sm font-medium text-gray-700 capitalize whitespace-nowrap">
                {formatMonthLabel(currentMois)}
              </span>
              <Link
                href={`/admin/voix-off?mois=${nextMonth(currentMois)}&annee=${currentAnnee}`}
                className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
              >
                →
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-violet-50 border border-violet-100 rounded-xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs text-violet-500 uppercase tracking-wide mb-0.5">
                Total de l&apos;année
              </p>
              <p className="text-2xl font-bold text-violet-900">
                {totalAnnee.toLocaleString("fr-FR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                €
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/voix-off?annee=${currentAnnee - 1}&mois=${currentMois}`}
                className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
              >
                ←
              </Link>
              <span className="text-sm font-medium text-gray-700">
                {currentAnnee}
              </span>
              <Link
                href={`/admin/voix-off?annee=${currentAnnee + 1}&mois=${currentMois}`}
                className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
              >
                →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Clients</h2>
        <Link
          href="/admin/voix-off/nouveau"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nouveau client
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <VoixOffClientsList initial={clients ?? []} />
      </div>
    </div>
  );
}
