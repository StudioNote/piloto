import { supabaseAdmin } from "@/lib/supabase/admin";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { DeleteRdvButton } from "@/components/admin/agenda/DeleteRdvButton";
import { modifierRendezVous } from "../../actions";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";

export default async function ModifierRdvPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: rdv } = await supabaseAdmin
    .from("piloto_rendezvous")
    .select("*")
    .eq("id", id)
    .single();

  if (!rdv) notFound();

  const mois = rdv.date.slice(0, 7);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Agenda", href: `/admin/agenda?mois=${mois}` },
          { label: "Modifier le rendez-vous" },
        ]}
      />

      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-7 bg-rose-600 rounded-full shrink-0" />
        <h1 className="text-2xl font-bold text-gray-900">
          Modifier le rendez-vous
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <form action={modifierRendezVous} className="space-y-5">
          <input type="hidden" name="id" value={rdv.id} />

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Titre <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="titre"
              required
              defaultValue={rdv.titre}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Activité <span className="text-red-400">*</span>
            </label>
            <select
              name="activite"
              required
              defaultValue={rdv.activite}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white"
            >
              <option value="sos_ordi">SOS Ordi</option>
              <option value="builder">Builder</option>
              <option value="radio">Radio</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Date <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="date"
                required
                defaultValue={rdv.date}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Heure début <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                name="heure_debut"
                required
                defaultValue={rdv.heure_debut.slice(0, 5)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Heure fin{" "}
                <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input
                type="time"
                name="heure_fin"
                defaultValue={rdv.heure_fin?.slice(0, 5) ?? ""}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Client{" "}
              <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="text"
              name="client_nom"
              defaultValue={rdv.client_nom ?? ""}
              placeholder="Nom du client"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Adresse{" "}
              <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="adresse"
                defaultValue={rdv.adresse ?? ""}
                placeholder="Adresse du lieu"
                className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
              {rdv.adresse && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rdv.adresse)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 hover:text-rose-600 hover:border-rose-300 transition-colors whitespace-nowrap"
                  title="Ouvrir dans Google Maps"
                >
                  <MapPin size={14} />
                  Itinéraire
                </a>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Description{" "}
              <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              name="description"
              rows={3}
              defaultValue={rdv.description ?? ""}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Enregistrer
            </button>
            <a
              href={`/admin/agenda?mois=${mois}`}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Annuler
            </a>
          </div>
        </form>
      </div>

      {/* Suppression */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Zone de danger
        </h2>
        <DeleteRdvButton id={rdv.id} titre={rdv.titre} mois={mois} />
      </div>
    </div>
  );
}
