"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { clientLabel, clientContact } from "@/lib/builder-utils";

interface Client {
  id: string;
  societe: string | null;
  nom: string | null;
  prenom: string | null;
  telephone: string | null;
}

function normalize(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function BuilderClientsList({ initial }: { initial: Client[] }) {
  const [clients, setClients] = useState<Client[]>(initial);
  const [query, setQuery] = useState("");

  async function handleDelete(id: string) {
    if (
      !window.confirm(
        "Supprimer ce client ? Toutes ses prestations seront définitivement supprimées.",
      )
    )
      return;
    const supabase = createClient();
    await supabase.from("piloto_builder_clients").delete().eq("id", id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  const filtered =
    query.trim() === ""
      ? clients
      : clients.filter((c) => {
          const q = normalize(query.trim());
          return (
            (c.societe && normalize(c.societe).includes(q)) ||
            (c.nom && normalize(c.nom).includes(q)) ||
            (c.prenom && normalize(c.prenom).includes(q))
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
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-12 text-center text-sm text-gray-400">
          {clients.length === 0 ? "Aucun client enregistré." : "Aucun client trouvé."}
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-amber-50 border-b border-amber-100">
            <tr>
              <th className="text-left px-5 py-3.5 font-medium text-amber-700 text-xs">Client</th>
              <th className="text-left px-5 py-3.5 font-medium text-amber-700 text-xs">Téléphone</th>
              <th className="px-5 py-3.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((c) => {
              const contact = clientContact(c);
              return (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800">{clientLabel(c)}</p>
                    {contact && (
                      <p className="text-xs text-gray-400 mt-0.5">{contact}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-gray-500">{c.telephone ?? "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/admin/builder/${c.id}`}
                        title="Voir"
                        className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        href={`/admin/builder/${c.id}/modifier`}
                        title="Modifier"
                        className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(c.id)}
                        title="Supprimer"
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
