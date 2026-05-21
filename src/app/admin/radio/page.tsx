import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { RadiosList } from "@/components/admin/radio/RadiosList";
import Link from "next/link";

export default async function RadioPage({
  searchParams,
}: {
  searchParams: { annee?: string };
}) {
  const supabase = await createClient();

  const currentYear = Number(searchParams.annee) || new Date().getFullYear();

  const [{ data: radios }, { data: factures }] = await Promise.all([
    supabase
      .from("piloto_radios")
      .select("id, nom_radio, nom_contact, telephone")
      .order("nom_radio"),
    supabase
      .from("piloto_radio_factures")
      .select("montant")
      .eq("annee", currentYear),
  ]);

  const annualCA = (factures ?? []).reduce((sum, f) => sum + Number(f.montant), 0);
  const moisValides = (factures ?? []).length;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Radio" }]} />

      {/* CA annuel — factures validées uniquement */}
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
            <p className="text-xs text-violet-400 mt-1">
              {moisValides === 0
                ? "Aucun mois validé"
                : `${moisValides} mois validé${moisValides > 1 ? "s" : ""} sur 12`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/admin/radio?annee=${currentYear - 1}`}
              className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 bg-white px-3 py-1.5 rounded-lg transition-colors"
            >
              ← Précédente
            </Link>
            <span className="text-sm font-medium text-gray-700">{currentYear}</span>
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
        <RadiosList initial={radios ?? []} />
      </div>
    </div>
  );
}
