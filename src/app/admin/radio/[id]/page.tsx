import { createClient } from "@/lib/supabase/server";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { BillingPanel } from "@/components/admin/radio/BillingPanel";
import { RecurringSupplements } from "@/components/admin/radio/RecurringSupplements";
import { RadioRemplacements } from "@/components/admin/radio/RadioRemplacements";
import { RadioTranches } from "@/components/admin/radio/RadioTranches";
import { notFound } from "next/navigation";
import Link from "next/link";

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
        </div>
      </div>

      {/* Tranches horaires */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <RadioTranches radioId={radio.id} />
      </div>

      {/* Suppléments récurrents */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <RecurringSupplements radioId={radio.id} />
      </div>

      {/* Remplacements */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <RadioRemplacements radioId={radio.id} />
      </div>

      {/* Facturation */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <BillingPanel radioId={radio.id} />
      </div>
    </div>
  );
}
