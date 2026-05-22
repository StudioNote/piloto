import { supabaseAdmin } from "@/lib/supabase/admin";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Mail, Phone, MapPin, Calendar, Euro, MessageSquare,
  Pencil, ExternalLink, ArrowRight,
} from "lucide-react";
import { DeleteProspectButton } from "@/components/admin/prospects/DeleteProspectButton";
import { StatutButton } from "@/components/admin/prospects/StatutButton";
import { ConvertirButton } from "@/components/admin/prospects/ConvertirButton";

const STATUT_LABELS: Record<string, string> = {
  a_contacter:  "À contacter",
  contacte:     "Contacté",
  rdv:          "RDV",
  devis_envoye: "Devis envoyé",
  gagne:        "Gagné",
  perdu:        "Perdu",
};

const STATUT_COLORS: Record<string, string> = {
  a_contacter:  "bg-gray-100 text-gray-600",
  contacte:     "bg-blue-100 text-blue-700",
  rdv:          "bg-indigo-100 text-indigo-700",
  devis_envoye: "bg-amber-100 text-amber-700",
  gagne:        "bg-emerald-100 text-emerald-700",
  perdu:        "bg-red-100 text-red-600",
};

const STATUT_ORDER = ["a_contacter", "contacte", "rdv", "devis_envoye", "gagne", "perdu"];

export default async function ProspectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: prospect } = await supabaseAdmin
    .from("piloto_builder_prospects")
    .select("*")
    .eq("id", id)
    .single();

  if (!prospect) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const overdue =
    prospect.prochaine_action_date &&
    prospect.prochaine_action_date < today &&
    prospect.statut !== "gagne" &&
    prospect.statut !== "perdu";

  const label =
    [prospect.societe, prospect.prenom, prospect.nom].filter(Boolean).join(" · ") || "—";

  const currentIdx = STATUT_ORDER.indexOf(prospect.statut);
  const nextStatut =
    currentIdx >= 0 && currentIdx < STATUT_ORDER.length - 1
      ? STATUT_ORDER[currentIdx + 1]
      : null;

  let clientNom: string | null = null;
  if (prospect.converted_client_id) {
    const { data: client } = await supabaseAdmin
      .from("piloto_builder_clients")
      .select("societe, nom, prenom")
      .eq("id", prospect.converted_client_id)
      .single();
    if (client) {
      clientNom =
        [client.societe, client.prenom, client.nom].filter(Boolean).join(" ") || "Client Builder";
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Prospects", href: "/admin/prospects" },
          { label: label },
        ]}
      />

      <div className="flex items-start gap-3 mb-8 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-1 h-7 bg-indigo-600 rounded-full shrink-0" />
            <h1 className="text-2xl font-bold text-gray-900">{label}</h1>
          </div>
          <div className="pl-4">
            <span
              className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                STATUT_COLORS[prospect.statut] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {STATUT_LABELS[prospect.statut] ?? prospect.statut}
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href={`/admin/prospects/${id}/modifier`}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
          >
            <Pencil size={14} />
            Modifier
          </Link>
        </div>
      </div>

      {/* Coordonnées */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Coordonnées</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {prospect.email && (
            <a
              href={`mailto:${prospect.email}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Mail size={14} className="text-gray-400 shrink-0" />
              {prospect.email}
            </a>
          )}
          {prospect.telephone && (
            <a
              href={`tel:${prospect.telephone}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              <Phone size={14} className="text-gray-400 shrink-0" />
              {prospect.telephone}
            </a>
          )}
          {prospect.adresse && (
            <div className="flex items-start gap-2 sm:col-span-2">
              <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">{prospect.adresse}</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(prospect.adresse)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  <ExternalLink size={11} />
                  Itinéraire
                </a>
              </div>
            </div>
          )}
          {prospect.source && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-gray-400 text-xs font-medium">Source :</span>
              {prospect.source}
            </div>
          )}
        </div>
      </div>

      {/* Projet */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Projet</h2>
        <div className="space-y-3">
          {prospect.montant_estime != null && (
            <div className="flex items-center gap-2">
              <Euro size={14} className="text-gray-400 shrink-0" />
              <span className="text-sm font-semibold text-indigo-700">
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                }).format(prospect.montant_estime)}
              </span>
              <span className="text-xs text-gray-400">estimé</span>
            </div>
          )}
          {prospect.besoin && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1">Besoin exprimé</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{prospect.besoin}</p>
            </div>
          )}
          {prospect.prochaine_action_date && (
            <div className={`flex items-center gap-2 ${overdue ? "text-red-600" : "text-gray-600"}`}>
              <Calendar size={14} className="shrink-0" />
              <span className="text-sm">
                Prochaine action :{" "}
                <strong>
                  {new Date(prospect.prochaine_action_date + "T00:00:00").toLocaleDateString(
                    "fr-FR",
                    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
                  )}
                </strong>
                {overdue && <span className="ml-2 text-xs font-medium text-red-500">— en retard</span>}
              </span>
            </div>
          )}
          {prospect.notes && (
            <div>
              <p className="text-xs font-medium text-gray-400 mb-1 flex items-center gap-1">
                <MessageSquare size={11} />
                Notes
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{prospect.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Étape suivante */}
      {prospect.statut !== "gagne" && prospect.statut !== "perdu" && nextStatut && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Avancer dans le pipeline</h2>
          <div className="flex flex-wrap gap-2">
            <StatutButton
              id={prospect.id}
              statut={nextStatut}
              label={`→ ${STATUT_LABELS[nextStatut]}`}
              variant="primary"
            />
            {prospect.statut !== "perdu" && (
              <StatutButton
                id={prospect.id}
                statut="perdu"
                label="Marquer Perdu"
                variant="danger"
              />
            )}
          </div>
        </div>
      )}

      {/* Conversion */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Conversion</h2>
        {prospect.converted_client_id ? (
          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-medium">
              Déjà converti
            </span>
            <Link
              href={`/admin/builder/${prospect.converted_client_id}`}
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
            >
              <ArrowRight size={14} />
              Voir la fiche client : {clientNom}
            </Link>
          </div>
        ) : (
          <div>
            <p className="text-xs text-gray-400 mb-3">
              Crée une fiche client Builder à partir de ce prospect, passe le statut à &ldquo;Gagné&rdquo;
              et redirige vers la fiche client.
            </p>
            <ConvertirButton prospectId={prospect.id} />
          </div>
        )}
      </div>

      {/* Danger */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Zone de danger</h2>
        <DeleteProspectButton id={prospect.id} label={label} />
      </div>
    </div>
  );
}
