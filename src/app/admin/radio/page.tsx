import { getDb } from "@/lib/getDb";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { RadiosList } from "@/components/admin/radio/RadiosList";
import Link from "next/link";

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

function buildUrl(base: Record<string, string | number>) {
  const params = new URLSearchParams(
    Object.entries(base).map(([k, v]) => [k, String(v)]),
  );
  return `/admin/radio?${params.toString()}`;
}

export default async function RadioPage({
  searchParams,
}: {
  searchParams: { annee?: string; mois?: string; vue?: string };
}) {
  const db = await getDb();
  const now = new Date();

  const vue = searchParams.vue === "mensuel" ? "mensuel" : "annuel";
  const currentYear = Number(searchParams.annee) || now.getFullYear();
  const currentMonth = Math.max(
    1,
    Math.min(12, Number(searchParams.mois) || now.getMonth() + 1),
  );

  const [{ data: radios }, { data: factures }] = await Promise.all([
    db.from("piloto_radios").select("id, nom_radio, nom_contact, telephone").order("nom_radio"),
    vue === "mensuel"
      ? db
          .from("piloto_radio_factures")
          .select("montant, radio_id")
          .eq("annee", currentYear)
          .eq("mois", currentMonth)
      : db
          .from("piloto_radio_factures")
          .select("montant")
          .eq("annee", currentYear),
  ]);

  const caDisplay = (factures ?? []).reduce((sum, f) => sum + Number(f.montant), 0);
  const factureCount = (factures ?? []).length;

  // Navigation mois précédent / suivant
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Radio" }]} />

      {/* Bloc CA Radio */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-8">
        {/* Ligne titre + toggle */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-emerald-600 uppercase tracking-wide font-medium">
            CA Radio — {vue === "mensuel" ? `${MONTHS_FR[currentMonth - 1]} ${currentYear}` : String(currentYear)}
          </p>

          {/* Toggle Mensuel / Annuel */}
          <div className="flex items-center gap-0.5 bg-white border border-emerald-200 rounded-lg p-0.5">
            <Link
              href={buildUrl({ vue: "mensuel", annee: currentYear, mois: currentMonth })}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                vue === "mensuel"
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              Mensuel
            </Link>
            <Link
              href={buildUrl({ vue: "annuel", annee: currentYear })}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                vue === "annuel"
                  ? "bg-emerald-600 text-white"
                  : "text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              Annuel
            </Link>
          </div>
        </div>

        {/* Montant + navigation */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-bold text-emerald-900">
              {caDisplay.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              €
            </p>
            <p className="text-xs text-emerald-400 mt-1">
              {vue === "mensuel"
                ? factureCount === 0
                  ? "Aucune radio facturée ce mois"
                  : `${factureCount} radio${factureCount > 1 ? "s" : ""} facturée${factureCount > 1 ? "s" : ""} ce mois`
                : factureCount === 0
                ? "Aucune facture validée cette année"
                : `${factureCount} facture${factureCount > 1 ? "s" : ""} validée${factureCount > 1 ? "s" : ""} sur l'année`}
            </p>
          </div>

          {vue === "mensuel" ? (
            <div className="flex items-center gap-3">
              <Link
                href={buildUrl({ vue: "mensuel", annee: prevYear, mois: prevMonth })}
                className="text-sm text-emerald-500 hover:text-emerald-800 border border-emerald-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
              >
                ←
              </Link>
              <span className="text-sm font-medium text-emerald-700 w-28 text-center">
                {MONTHS_FR[currentMonth - 1]} {currentYear}
              </span>
              <Link
                href={buildUrl({ vue: "mensuel", annee: nextYear, mois: nextMonth })}
                className="text-sm text-emerald-500 hover:text-emerald-800 border border-emerald-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
              >
                →
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href={buildUrl({ vue: "annuel", annee: currentYear - 1 })}
                className="text-sm text-emerald-500 hover:text-emerald-800 border border-emerald-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
              >
                ← Précédente
              </Link>
              <span className="text-sm font-medium text-emerald-700">{currentYear}</span>
              <Link
                href={buildUrl({ vue: "annuel", annee: currentYear + 1 })}
                className="text-sm text-emerald-500 hover:text-emerald-800 border border-emerald-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Suivante →
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-emerald-500 rounded-full shrink-0" />
        <h2 className="text-2xl font-bold text-gray-900">Radios</h2>
        <Link
          href="/admin/radio/nouveau"
          className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nouvelle radio
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <RadiosList initial={radios ?? []} />
      </div>
    </div>
  );
}
