"use client";

import { useState } from "react";
import Link from "next/link";
import { changerStatutDevis, supprimerDevis } from "@/app/admin/devis/actions";

type Devis = {
  id: string;
  numero: string;
  client_nom: string | null;
  objet: string | null;
  date_emission: string;
  date_validite: string;
  total_ht: number;
  statut: string;
};

const STATUTS = [
  { value: "", label: "Tous" },
  { value: "brouillon", label: "Brouillon" },
  { value: "envoye", label: "Envoyé" },
  { value: "accepte", label: "Accepté" },
  { value: "refuse", label: "Refusé" },
];

const STATUT_STYLES: Record<string, string> = {
  brouillon: "bg-gray-100 text-gray-600",
  envoye: "bg-blue-100 text-blue-700",
  accepte: "bg-green-100 text-green-700",
  refuse: "bg-red-100 text-red-600",
};

const STATUT_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé",
  accepte: "Accepté",
  refuse: "Refusé",
};

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatMontant(n: number) {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

export function DevisList({ devis }: { devis: Devis[] }) {
  const [search, setSearch] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [changing, setChanging] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = devis.filter((d) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      d.numero.toLowerCase().includes(q) ||
      (d.client_nom ?? "").toLowerCase().includes(q) ||
      (d.objet ?? "").toLowerCase().includes(q);
    const matchStatut = !filtreStatut || d.statut === filtreStatut;
    return matchSearch && matchStatut;
  });

  async function handleStatut(id: string, statut: string) {
    setChanging(id);
    await changerStatutDevis(id, statut);
    setChanging(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce devis définitivement ?")) return;
    setDeleting(id);
    await supprimerDevis(id);
  }

  return (
    <div>
      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="search"
          placeholder="Rechercher numéro, client, objet…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 w-64"
        />
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {STATUTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setFiltreStatut(s.value)}
              className={`px-3 py-2 text-sm font-medium transition-colors ${
                filtreStatut === s.value
                  ? "bg-orange-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {["brouillon", "envoye", "accepte", "refuse"].map((s) => {
          const count = devis.filter((d) => d.statut === s).length;
          const total = devis.filter((d) => d.statut === s).reduce((sum, d) => sum + d.total_ht, 0);
          return (
            <div key={s} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium mb-1 ${STATUT_STYLES[s]}`}>
                {STATUT_LABELS[s]}
              </div>
              <div className="text-xl font-bold text-gray-800">{count}</div>
              <div className="text-xs text-gray-400">{formatMontant(total)}</div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          {devis.length === 0 ? "Aucun devis encore. Créez le premier !" : "Aucun résultat."}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Numéro</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Client</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Objet</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Date</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500">Total HT</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">Statut</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 hover:bg-orange-50/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-orange-700 font-medium text-xs">
                    {d.numero}
                  </td>
                  <td className="px-4 py-3 text-gray-800 font-medium">
                    {d.client_nom ?? <span className="text-gray-400 italic">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                    {d.objet ?? <span className="text-gray-400 italic">—</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {formatDate(d.date_emission)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-gray-800">
                    {formatMontant(d.total_ht)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={d.statut}
                      disabled={changing === d.id}
                      onChange={(e) => handleStatut(d.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${STATUT_STYLES[d.statut]}`}
                    >
                      <option value="brouillon">Brouillon</option>
                      <option value="envoye">Envoyé</option>
                      <option value="accepte">Accepté</option>
                      <option value="refuse">Refusé</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link
                        href={`/api/devis/${d.id}/pdf`}
                        target="_blank"
                        className="text-xs text-gray-500 hover:text-orange-600 transition-colors"
                        title="Télécharger le PDF"
                      >
                        PDF
                      </Link>
                      <Link
                        href={`/admin/devis/${d.id}`}
                        className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 rounded px-2 py-1 hover:border-gray-400 transition-colors"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDelete(d.id)}
                        disabled={deleting === d.id}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        ✕
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
