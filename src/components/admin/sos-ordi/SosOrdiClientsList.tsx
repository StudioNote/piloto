"use client";

import { useState } from "react";
import { Search, Eye, Pencil } from "lucide-react";
import Link from "next/link";

interface Client {
  id: string;
  civilite: string | null;
  nom: string;
  prenom: string;
  telephone: string | null;
  adresse: string | null;
}

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function SosOrdiClientsList({ initial }: { initial: Client[] }) {
  const [query, setQuery] = useState("");

  const filtered =
    query.trim() === ""
      ? initial
      : initial.filter((c) => {
          const q = normalize(query.trim());
          return (
            normalize(c.nom).includes(q) || normalize(c.prenom).includes(q)
          );
        });

  return (
    <div>
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un client..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center text-sm text-gray-400">
          {initial.length === 0 ? "Aucun client enregistré." : "Aucun client trouvé."}
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-blue-50 border-b border-blue-100">
            <tr>
              <th className="text-left px-5 py-3.5 font-medium text-blue-600 text-xs">Nom</th>
              <th className="text-left px-5 py-3.5 font-medium text-blue-600 text-xs">Prénom</th>
              <th className="text-left px-5 py-3.5 font-medium text-blue-600 text-xs">Téléphone</th>
              <th className="text-left px-5 py-3.5 font-medium text-blue-600 text-xs">Adresse</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-medium text-gray-800">
                  {client.civilite ? `${client.civilite} ${client.nom}` : client.nom}
                </td>
                <td className="px-5 py-4 text-gray-600">{client.prenom}</td>
                <td className="px-5 py-4 text-gray-500">{client.telephone ?? "—"}</td>
                <td className="px-5 py-4 text-gray-500 max-w-xs truncate">
                  {client.adresse ?? "—"}
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/admin/sos-ordi/${client.id}`}
                      title="Voir"
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Eye size={16} />
                    </Link>
                    <Link
                      href={`/admin/sos-ordi/${client.id}/modifier`}
                      title="Modifier"
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      <Pencil size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
