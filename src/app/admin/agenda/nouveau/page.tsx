import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { creerRendezVous } from "../actions";

export default async function NouveauRdvPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const sp = await searchParams;
  const dateDefaut = sp.date ?? new Date().toISOString().slice(0, 10);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[
          { label: "Admin", href: "/admin" },
          { label: "Agenda", href: "/admin/agenda" },
          { label: "Nouveau rendez-vous" },
        ]}
      />

      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-7 bg-rose-600 rounded-full shrink-0" />
        <h1 className="text-2xl font-bold text-gray-900">
          Nouveau rendez-vous
        </h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <form action={creerRendezVous} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Titre <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="titre"
              required
              autoFocus
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
                defaultValue={dateDefaut}
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
              placeholder="Nom du client"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Adresse{" "}
              <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="text"
              name="adresse"
              placeholder="Adresse du lieu"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Description{" "}
              <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Créer le rendez-vous
            </button>
            <a
              href="/admin/agenda"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Annuler
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
