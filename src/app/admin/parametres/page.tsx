import { getDb } from "@/lib/getDb";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { changerMotDePasse, sauvegarderInfos } from "./actions";
import { CatalogueDevis } from "@/components/admin/parametres/CatalogueDevis";

export default async function ParametresPage({
  searchParams,
}: {
  searchParams: Promise<{ succes?: string; erreur_mdp?: string; erreur_infos?: string }>;
}) {
  const sp = await searchParams;

  const db = await getDb();
  const [{ data: params }, { data: catalogue }] = await Promise.all([
    db.from("piloto_parametres").select("*").eq("id", "singleton").single(),
    db.from("piloto_devis_catalogue").select("*").order("ordre", { ascending: true }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Breadcrumb items={[{ label: "Admin", href: "/admin" }, { label: "Paramètres" }]} />

      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-7 bg-slate-400 rounded-full shrink-0" />
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
      </div>

      {/* Sécurité */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-5">
          Sécurité — Changer mon mot de passe
        </h2>

        {sp.succes === "mdp" && (
          <p className="text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg mb-5">
            Mot de passe mis à jour avec succès.
          </p>
        )}
        {sp.erreur_mdp === "mismatch" && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-5">
            Les deux mots de passe ne correspondent pas.
          </p>
        )}
        {sp.erreur_mdp === "trop_court" && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-5">
            Le mot de passe doit contenir au moins 8 caractères.
          </p>
        )}
        {sp.erreur_mdp && !["mismatch", "trop_court"].includes(sp.erreur_mdp) && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-5">
            Erreur : {sp.erreur_mdp}
          </p>
        )}

        <form action={changerMotDePasse} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              name="mot_de_passe"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Confirmation</label>
            <input
              type="password"
              name="confirmation"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Mettre à jour le mot de passe
          </button>
        </form>
      </section>

      {/* Infos professionnelles */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-5">Infos professionnelles</h2>
        <p className="text-xs text-gray-400 mb-5">
          Ces informations seront utilisées pour la facturation.
        </p>

        {sp.succes === "infos" && (
          <p className="text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg mb-5">
            Informations sauvegardées.
          </p>
        )}
        {sp.erreur_infos && (
          <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-5">
            Erreur : {sp.erreur_infos}
          </p>
        )}

        <form action={sauvegarderInfos} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Raison sociale
              </label>
              <input
                type="text"
                name="raison_sociale"
                defaultValue={params?.raison_sociale ?? ""}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">SIRET</label>
              <input
                type="text"
                name="siret"
                defaultValue={params?.siret ?? ""}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Adresse (rue)</label>
            <input
              type="text"
              name="adresse"
              defaultValue={params?.adresse ?? ""}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Code postal et ville</label>
            <input
              type="text"
              name="cp_ville"
              defaultValue={(params as { cp_ville?: string } | null)?.cp_ville ?? ""}
              placeholder="ex. 29170 Fouesnant"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Téléphone</label>
              <input
                type="tel"
                name="telephone"
                defaultValue={params?.telephone ?? ""}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                defaultValue={params?.email ?? ""}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Site web</label>
            <input
              type="text"
              name="site_web"
              defaultValue={(params as { site_web?: string } | null)?.site_web ?? ""}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Mentions diverses{" "}
              <span className="text-gray-400 font-normal">(TVA, mentions légales…)</span>
            </label>
            <textarea
              name="mentions"
              rows={4}
              defaultValue={params?.mentions ?? ""}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
            />
          </div>
          <button
            type="submit"
            className="bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Sauvegarder
          </button>
        </form>
      </section>

      {/* Catalogue devis */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mt-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-orange-500 shrink-0" />
          <h2 className="text-base font-semibold text-gray-800">Catalogue devis</h2>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Éléments disponibles lors de la création d&apos;un devis. Réorganisez l&apos;ordre avec ↑ ↓.
        </p>
        <CatalogueDevis items={catalogue ?? []} />
      </section>
    </div>
  );
}
