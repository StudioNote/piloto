"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Eye, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { clientLabel, clientContact } from "@/lib/voixoff-utils";

interface Client {
  id: string;
  nom: string | null;
  prenom: string | null;
  societe: string | null;
  telephone: string | null;
}

export function VoixOffClientsList({ initial }: { initial: Client[] }) {
  const [clients, setClients] = useState<Client[]>(initial);

  async function handleDelete(id: string) {
    if (
      !window.confirm(
        "Supprimer ce client ? Toutes ses prestations seront définitivement supprimées.",
      )
    )
      return;
    const supabase = createClient();
    await supabase.from("piloto_voixoff_clients").delete().eq("id", id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  }

  if (clients.length === 0) {
    return (
      <div className="p-16 text-center text-sm text-gray-400">
        Aucun client enregistré.
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          <th className="text-left px-5 py-3.5 font-medium text-gray-500">Client</th>
          <th className="text-left px-5 py-3.5 font-medium text-gray-500">Téléphone</th>
          <th className="px-5 py-3.5" />
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {clients.map((c) => {
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
                    href={`/admin/voix-off/${c.id}`}
                    title="Voir"
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Eye size={16} />
                  </Link>
                  <Link
                    href={`/admin/voix-off/${c.id}/modifier`}
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
  );
}
