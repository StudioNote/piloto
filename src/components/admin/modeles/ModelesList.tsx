"use client";

import { useState, useRef } from "react";
import { FileText, Trash2, Upload, Download } from "lucide-react";
import { ajouterModele, supprimerModele } from "@/app/admin/modeles/actions";

interface Modele {
  id: string;
  nom: string;
  description: string | null;
  url_storage: string;
  categorie: string | null;
  created_at: string;
}

export function ModelesList({ initial }: { initial: Modele[] }) {
  const [modeles, setModeles] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [state, setState] = useState<{ error?: string } | null>(null);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    setState(null);
    const result = await ajouterModele(null, fd);
    setPending(false);
    if (result?.error) {
      setState(result);
    } else {
      setShowForm(false);
      formRef.current?.reset();
      window.location.reload();
    }
  }

  async function handleDelete(m: Modele) {
    if (!confirm(`Supprimer « ${m.nom} » ? Cette action est irréversible.`)) return;
    const fd = new FormData();
    fd.append("id", m.id);
    fd.append("path", m.url_storage);
    setModeles((prev) => prev.filter((x) => x.id !== m.id));
    await supprimerModele(fd);
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-teal-500 rounded-full shrink-0" />
        <h1 className="text-2xl font-bold text-gray-900">Modèles</h1>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="ml-auto inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <Upload size={15} />
          Ajouter un modèle
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-dashed border-teal-200 p-6 mb-6 space-y-4"
        >
          <p className="text-sm font-semibold text-gray-800">Nouveau modèle</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Nom <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="nom"
                required
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Catégorie <span className="text-gray-400">(optionnel)</span>
              </label>
              <input
                type="text"
                name="categorie"
                placeholder="Ex : Formation, Devis, Contrat…"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Description <span className="text-gray-400">(optionnel)</span>
            </label>
            <input
              type="text"
              name="description"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              Fichier <span className="text-red-400">*</span>
            </label>
            <input
              type="file"
              name="fichier"
              required
              accept=".pdf,.doc,.docx,.odt,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={pending}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              {pending ? "Envoi en cours…" : "Ajouter"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Liste */}
      {modeles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <FileText size={32} className="text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Aucun modèle dans la bibliothèque.</p>
          <p className="text-xs text-gray-400 mt-1">
            Cliquez sur &quot;Ajouter un modèle&quot; pour commencer.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-teal-100 bg-teal-50">
                <th className="text-left px-5 py-3 text-xs font-medium text-teal-600">Nom</th>
                <th className="text-left px-5 py-3 text-xs font-medium text-teal-600 hidden sm:table-cell">
                  Catégorie
                </th>
                <th className="text-left px-5 py-3 text-xs font-medium text-teal-600 hidden md:table-cell">
                  Date
                </th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {modeles.map((m) => (
                <tr key={m.id} className="hover:bg-teal-50/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <FileText size={15} className="text-teal-300 shrink-0" />
                      <div>
                        <p className="font-medium text-gray-800">{m.nom}</p>
                        {m.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{m.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    {m.categorie ? (
                      <span className="inline-block text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded-md">
                        {m.categorie}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-400 hidden md:table-cell">
                    {new Date(m.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/admin/modeles/download/${m.id}`}
                        className="p-1.5 text-gray-400 hover:text-teal-600 transition-colors"
                        title="Télécharger"
                      >
                        <Download size={15} />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDelete(m)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
