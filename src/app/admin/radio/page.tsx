import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import {
  calcRadioMonthAmount,
  calcRemplacementAmountInPeriod,
} from "@/lib/radio-billing";
import Link from "next/link";

export default async function RadioPage({
  searchParams,
}: {
  searchParams: { annee?: string };
}) {
  const supabase = await createClient();

  const currentYear =
    Number(searchParams.annee) || new Date().getFullYear();
  const yearStart = `${currentYear}-01-01`;
  const yearEnd = `${currentYear}-12-31`;

  const [
    { data: radios },
    { data: allTranches },
    { data: allExclusions },
    { data: allSupplements },
    { data: allRemplacements },
  ] = await Promise.all([
    supabase
      .from("piloto_radios")
      .select("id, nom_radio, nom_contact, telephone")
      .order("nom_radio"),
    supabase
      .from("piloto_radio_tranches")
      .select("radio_id, tranche_debut, tranche_fin, jours_travailles, tarif_horaire"),
    supabase
      .from("piloto_radio_exclusions")
      .select("radio_id, date")
      .gte("date", yearStart)
      .lte("date", yearEnd),
    supabase
      .from("piloto_radio_supplements")
      .select("radio_id, montant")
      .eq("recurrent", true),
    supabase
      .from("piloto_radio_remplacements")
      .select("date_debut, date_fin, tranche_debut, tranche_fin, tarif_horaire")
      .lte("date_debut", yearEnd)
      .gte("date_fin", yearStart),
  ]);

  // Annual CA: sum of all radios × 12 months (tranches + recurring supplements - exclusions)
  let tranchesTotal = 0;
  for (const radio of radios ?? []) {
    const radioTranches = (allTranches ?? []).filter(
      (t) => t.radio_id === radio.id,
    );
    const radioSupplements = (allSupplements ?? []).filter(
      (s) => s.radio_id === radio.id,
    );
    for (let m = 0; m < 12; m++) {
      const mm = String(m + 1).padStart(2, "0");
      const monthStart = `${currentYear}-${mm}-01`;
      const monthEnd = `${currentYear}-${mm}-${String(
        new Date(currentYear, m + 1, 0).getDate(),
      ).padStart(2, "0")}`;
      const exclusionSet = new Set(
        (allExclusions ?? [])
          .filter(
            (e) =>
              e.radio_id === radio.id &&
              e.date >= monthStart &&
              e.date <= monthEnd,
          )
          .map((e) => e.date),
      );
      tranchesTotal += calcRadioMonthAmount(
        radioTranches,
        exclusionSet,
        radioSupplements,
        currentYear,
        m,
      );
    }
  }

  const remplacementsTotal = (allRemplacements ?? []).reduce(
    (sum, r) => sum + calcRemplacementAmountInPeriod(r, yearStart, yearEnd),
    0,
  );

  const annualCA = tranchesTotal + remplacementsTotal;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Radio" }]} />

      {/* CA annuel */}
      <div className="bg-violet-50 border border-violet-100 rounded-xl p-5 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-violet-500 uppercase tracking-wide mb-0.5">
              CA Radio de l&apos;année
            </p>
            <p className="text-2xl font-bold text-violet-900">
              {annualCA.toLocaleString("fr-FR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              €
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/radio?annee=${currentYear - 1}`}
              className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
            >
              ← Précédente
            </Link>
            <span className="text-sm font-medium text-gray-700">
              {currentYear}
            </span>
            <Link
              href={`/admin/radio?annee=${currentYear + 1}`}
              className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Suivante →
            </Link>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Radios</h2>
        <Link
          href="/admin/radio/nouveau"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nouvelle radio
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {!radios || radios.length === 0 ? (
          <div className="p-16 text-center text-sm text-gray-400">
            Aucune radio enregistrée.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Radio</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Contact</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Téléphone</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {radios.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-800">{r.nom_radio}</td>
                  <td className="px-5 py-4 text-gray-600">{r.nom_contact ?? "—"}</td>
                  <td className="px-5 py-4 text-gray-500">{r.telephone ?? "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/radio/${r.id}`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Voir
                      </Link>
                      <Link
                        href={`/admin/radio/${r.id}/modifier`}
                        className="text-gray-500 hover:text-gray-700 font-medium"
                      >
                        Modifier
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
