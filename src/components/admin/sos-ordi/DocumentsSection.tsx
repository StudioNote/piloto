"use client";

import { useState, useRef } from "react";
import { Trash2, Upload, FileText } from "lucide-react";
import { deposerDocument, supprimerDocument } from "@/app/admin/sos-ordi/actions";

interface Document {
  id: string;
  nom_fichier: string;
  description: string | null;
  url_storage: string;
  created_at: string;
}

interface Props {
  clientId: string;
  initial: Document[];
}

export function DocumentsSection({ clientId, initial }: Props) {
  const [state, setState] = useState<{ error?: string } | null>(null);
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setPending(true);
    setState(null);
    const result = await deposerDocument(null, fd);
    setState(result);
    setPending(false);
    if (!result?.error) formRef.current?.reset();
  }

  async function handleDelete(doc: Document) {
    if (!confirm(`Supprimer « ${doc.nom_fichier} » ? Cette action est irréversible.`)) return;
    const fd = new FormData();
    fd.append("id", doc.id);
    fd.append("client_id", clientId);
    fd.append("path", doc.url_storage);
    await supprimerDocument(fd);
  }

  return (
    <div>
      {/* Liste */}
      {initial.length === 0 ? (
        <p className="text-sm text-gray-400 py-4">Aucun document déposé.</p>
      ) : (
        <div className="space-y-2 mb-6">
          {initial.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText size={16} className="text-gray-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{doc.nom_fichier}</p>
                  {doc.description && (
                    <p className="text-xs text-gray-400 truncate">{doc.description}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(doc)}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors shrink-0 ml-4"
                title="Supprimer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      <form ref={formRef} onSubmit={handleSubmit} className="border border-dashed border-gray-200 rounded-xl p-5 space-y-4">
        <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Upload size={15} className="text-gray-400" />
          Déposer un document
        </p>

        <input type="hidden" name="client_id" value={clientId} />

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Fichier <span className="text-gray-400">(PDF, Word, image…)</span>
          </label>
          <input
            name="fichier"
            type="file"
            accept=".pdf,.doc,.docx,.odt,.jpg,.jpeg,.png,.gif,.webp,.txt"
            required
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Description <span className="text-gray-400">(optionnel)</span>
          </label>
          <input
            name="description"
            type="text"
            placeholder="Ex : Récapitulatif cours du 12 mai"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {state?.error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{state.error}</p>
        )}
        {state && !state.error && (
          <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">Document déposé avec succès.</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {pending ? "Dépôt en cours…" : "Déposer"}
        </button>
      </form>
    </div>
  );
}
