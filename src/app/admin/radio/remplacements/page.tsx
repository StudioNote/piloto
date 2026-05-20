import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { supprimerRemplacement } from "./actions";
import Link from "next/link";

function calcDays(debut: string, fin: string): number {
  const d1 = new Date(debut).getTime();
  const d2 = new Date(fin).getTime();
  return Math.max(0, Math.floor((d2 - d1) / 86400000) + 1);
}

function calcHours(debut: string, fin: string): number {
  const [h1, m1] = debut.split(":").map(Number);
  const [h2, m2] = fin.split(":").map(Number);
  return Math.max(0, ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60);
}

function formatDate(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const eur = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export default async function RemplacementsPage() {
  const supabase = await createClient();
  const { data: remplacements } = await supabase
    .from("piloto_radio_remplacements")
    .select("*")
    .order("date_debut", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Radio", href: "/admin/radio" },
          { label: "Remplacements" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Remplacements</h2>
        <Link
          href="/admin/radio/remplacements/nouveau"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nouveau remplacement
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {!remplacements || remplacements.length === 0 ? (
          <div className="p-16 text-center text-sm text-gray-400">
            Aucun remplacement enregistré.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Radio</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Dates</th>
                <th className="text-left px-5 py-3.5 font-medium text-gray-500">Tranche</th>
                <th className="text-right px-5 py-3.5 font-medium text-gray-500">Tarif</th>
                <th className="text-right px-5 py-3.5 font-medium text-gray-500">Montant</th>
                <th className="px-5 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {remplacements.map((r) => {
                const days = calcDays(r.date_debut, r.date_fin);
                const hours = calcHours(r.tranche_debut, r.tranche_fin);
                const amount = days * hours * Number(r.tarif_horaire);
                const isPast = new Date(r.date_fin + "T00:00:00") < new Date();
                const deleteAction = supprimerRemplacement.bind(null, r.id);

                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-medium text-gray-800">{r.nom_radio}</span>
                      {isPast && (
                        <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          passé
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <span>
                        {formatDate(r.date_debut)}
                        {r.date_debut !== r.date_fin && (
                          <> → {formatDate(r.date_fin)}</>
                        )}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">
                        ({days}j)
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {r.tranche_debut.slice(0, 5)} – {r.tranche_fin.slice(0, 5)}
                      <span className="ml-1 text-xs text-gray-400">({hours}h/j)</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-right">
                      {Number(r.tarif_horaire).toLocaleString("fr-FR")} €/h
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-gray-900">
                      {eur(amount)}
                    </td>
                    <td className="px-5 py-4">
                      <form action={deleteAction}>
                        <button
                          type="submit"
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          Supprimer
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
