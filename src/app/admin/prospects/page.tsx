import { getDb } from "@/lib/getDb";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { KanbanBoard } from "@/components/admin/prospects/KanbanBoard";
import Link from "next/link";
import { Target, Bell } from "lucide-react";

const STATUT_LABELS: Record<string, string> = {
  a_contacter:  "À contacter",
  contacte:     "Contacté",
  rdv:          "RDV",
  devis_envoye: "Devis envoyé",
  gagne:        "Gagné",
  perdu:        "Perdu",
};

export default async function ProspectsPage() {
  const db = await getDb();
  const { data: prospects } = await db
    .from("piloto_builder_prospects")
    .select("id, societe, nom, prenom, montant_estime, statut, prochaine_action_date, converted_client_id")
    .order("created_at", { ascending: false });

  const list = prospects ?? [];
  const today = new Date().toISOString().slice(0, 10);

  const aRelancer = list.filter(
    (p) =>
      p.prochaine_action_date &&
      p.prochaine_action_date <= today &&
      p.statut !== "gagne" &&
      p.statut !== "perdu"
  ).length;

  const stats = ["a_contacter", "contacte", "rdv", "devis_envoye", "gagne", "perdu"].map(
    (s) => ({ key: s, count: list.filter((p) => p.statut === s).length })
  );

  const totalEstime = list
    .filter((p) => p.statut !== "perdu" && p.montant_estime != null)
    .reduce((acc, p) => acc + (p.montant_estime ?? 0), 0);

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <Breadcrumb
        items={[{ label: "Admin", href: "/admin" }, { label: "Prospects" }]}
      />

      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-indigo-600 rounded-full shrink-0" />
        <Target size={20} className="text-indigo-600" />
        <h1 className="text-2xl font-bold text-gray-900">Prospects</h1>
        <Link
          href="/admin/prospects/nouveau"
          className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nouveau prospect
        </Link>
      </div>

      {/* Indicateurs */}
      <div className="flex flex-wrap gap-3 mb-8">
        {aRelancer > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            <Bell size={14} className="text-red-500 shrink-0" />
            <span className="text-sm font-semibold text-red-600">{aRelancer}</span>
            <span className="text-xs text-red-500">à relancer</span>
          </div>
        )}
        {stats.map((s) => (
          <div
            key={s.key}
            className="bg-white border border-gray-100 rounded-xl px-4 py-2.5 flex items-center gap-2"
          >
            <span className="text-sm font-semibold text-gray-800">{s.count}</span>
            <span className="text-xs text-gray-400">{STATUT_LABELS[s.key]}</span>
          </div>
        ))}
        {totalEstime > 0 && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-2.5 flex items-center gap-2 ml-auto">
            <span className="text-sm font-semibold text-indigo-700">
              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(totalEstime)}
            </span>
            <span className="text-xs text-indigo-400">pipeline estimé</span>
          </div>
        )}
      </div>

      {/* Kanban */}
      <KanbanBoard initialProspects={list} />
    </div>
  );
}
