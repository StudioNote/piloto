"use client";

import { useState } from "react";

interface DefaultValues {
  id?: string;
  societe?: string;
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  source?: string;
  besoin?: string;
  notes?: string;
  montant_estime?: string;
  statut?: string;
  prochaine_action_date?: string;
}

interface Props {
  action: (formData: FormData) => Promise<void>;
  cancelHref: string;
  defaultValues?: DefaultValues;
}

const STATUTS = [
  { value: "a_contacter",  label: "À contacter" },
  { value: "contacte",     label: "Contacté" },
  { value: "rdv",          label: "RDV" },
  { value: "devis_envoye", label: "Devis envoyé" },
  { value: "gagne",        label: "Gagné" },
  { value: "perdu",        label: "Perdu" },
];

const inputCls =
  "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400";

const labelCls = "block text-xs font-medium text-gray-600 mb-1.5";

export function ProspectForm({ action, cancelHref, defaultValues = {} }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const societe = (fd.get("societe") as string).trim();
    const nom = (fd.get("nom") as string).trim();
    if (!societe && !nom) {
      setError("Renseignez au moins la société ou le nom du contact.");
      return;
    }
    setLoading(true);
    try {
      await action(fd);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur inattendue");
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        {defaultValues.id && (
          <input type="hidden" name="id" value={defaultValues.id} />
        )}

        {/* Identité */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>
              Société{" "}
              <span className="text-gray-400 font-normal">(ou nom obligatoire)</span>
            </label>
            <input
              type="text"
              name="societe"
              defaultValue={defaultValues.societe}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Prénom</label>
            <input
              type="text"
              name="prenom"
              defaultValue={defaultValues.prenom}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Nom</label>
            <input
              type="text"
              name="nom"
              defaultValue={defaultValues.nom}
              className={inputCls}
            />
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              name="email"
              defaultValue={defaultValues.email}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Téléphone</label>
            <input
              type="tel"
              name="telephone"
              defaultValue={defaultValues.telephone}
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Adresse</label>
            <input
              type="text"
              name="adresse"
              defaultValue={defaultValues.adresse}
              className={inputCls}
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-5 space-y-4">
          {/* Pipeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Statut</label>
              <select
                name="statut"
                defaultValue={defaultValues.statut ?? "a_contacter"}
                className={`${inputCls} bg-white`}
              >
                {STATUTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                Montant estimé{" "}
                <span className="text-gray-400 font-normal">(€)</span>
              </label>
              <input
                type="number"
                name="montant_estime"
                min="0"
                step="1"
                defaultValue={defaultValues.montant_estime}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Source</label>
              <input
                type="text"
                name="source"
                placeholder="Bouche-à-oreille, site, réseau…"
                defaultValue={defaultValues.source}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Date de prochaine action</label>
              <input
                type="date"
                name="prochaine_action_date"
                defaultValue={defaultValues.prochaine_action_date}
                className={inputCls}
              />
            </div>
          </div>

          {/* Besoin & Notes */}
          <div>
            <label className={labelCls}>Besoin exprimé</label>
            <textarea
              name="besoin"
              rows={3}
              defaultValue={defaultValues.besoin}
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className={labelCls}>Notes internes</label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={defaultValues.notes}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading
              ? "Enregistrement…"
              : defaultValues.id
              ? "Enregistrer"
              : "Créer le prospect"}
          </button>
          <a
            href={cancelHref}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Annuler
          </a>
        </div>
      </form>
    </div>
  );
}
