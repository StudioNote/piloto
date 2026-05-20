import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { BillingPanel } from "@/components/admin/radio/BillingPanel";
import { RecurringSupplements } from "@/components/admin/radio/RecurringSupplements";
import { RadioRemplacements } from "@/components/admin/radio/RadioRemplacements";
import { notFound } from "next/navigation";
import Link from "next/link";

const JOURS_LABELS: Record<string, string> = {
  lundi: "Lun.",
  mardi: "Mar.",
  mercredi: "Mer.",
  jeudi: "Jeu.",
  vendredi: "Ven.",
  samedi: "Sam.",
  dimanche: "Dim.",
};

export default async function FicheRadioPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: radio } = await supabase
    .from("piloto_radios")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!radio) notFound();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Radio", href: "/admin/radio" },
          { label: radio.nom_radio },
        ]}
      />

      {/* Fiche */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-900">{radio.nom_radio}</h2>
          <Link
            href={`/admin/radio/${radio.id}/modifier`}
            className="text-sm text-gray-500 hover:text-gray-800 font-medium border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            Modifier
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-5 text-sm">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Contact</p>
            <p className="text-gray-800">{radio.nom_contact ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Téléphone</p>
            <p className="text-gray-800">{radio.telephone ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tranche horaire</p>
            <p className="text-gray-800">
              {radio.tranche_debut.slice(0, 5)} – {radio.tranche_fin.slice(0, 5)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Tarif horaire</p>
            <p className="text-gray-800">
              {Number(radio.tarif_horaire).toLocaleString("fr-FR")} €/h
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Jours travaillés</p>
            <div className="flex flex-wrap gap-1.5">
              {(radio.jours_travailles as string[]).map((j) => (
                <span
                  key={j}
                  className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium"
                >
                  {JOURS_LABELS[j] ?? j}
                </span>
              ))}
              {radio.jours_travailles.length === 0 && (
                <span className="text-gray-400 text-sm">Aucun jour défini</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Suppléments récurrents */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <RecurringSupplements radioId={radio.id} />
      </div>

      {/* Remplacements */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <RadioRemplacements
          radioId={radio.id}
          trancheDebut={radio.tranche_debut}
          trancheFin={radio.tranche_fin}
          tarifHoraire={Number(radio.tarif_horaire)}
        />
      </div>

      {/* Facturation */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <BillingPanel
          radio={{
            id: radio.id,
            tranche_debut: radio.tranche_debut,
            tranche_fin: radio.tranche_fin,
            tarif_horaire: radio.tarif_horaire,
            jours_travailles: radio.jours_travailles,
          }}
        />
      </div>
    </div>
  );
}
