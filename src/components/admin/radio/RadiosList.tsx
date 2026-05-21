"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface Radio {
  id: string;
  nom_radio: string;
  nom_contact: string | null;
  telephone: string | null;
}

const CONFIRM_MSG =
  "Supprimer cette radio ? Toutes ses tranches, remplacements, suppléments, exclusions et factures validées seront définitivement supprimés.";

export function RadiosList({ initial }: { initial: Radio[] }) {
  const [radios, setRadios] = useState<Radio[]>(initial);

  async function handleDelete(id: string) {
    if (!window.confirm(CONFIRM_MSG)) return;
    const supabase = createClient();
    await supabase.from("piloto_radios").delete().eq("id", id);
    setRadios((prev) => prev.filter((r) => r.id !== id));
  }

  if (radios.length === 0) {
    return (
      <div className="p-16 text-center text-sm text-gray-400">
        Aucune radio enregistrée.
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 border-b border-gray-100">
        <tr>
          <th className="text-left px-5 py-3.5 font-medium text-gray-500">Radio</th>
          <th className="text-left px-5 py-3.5 font-medium text-gray-500">Contact</th>
          <th className="text-left px-5 py-3.5 font-medium text-gray-500">Téléphone</th>
          <th className="px-5 py-3.5" />
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {radios.map((r) => (
          <tr key={r.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-5 py-4 font-medium text-gray-800">{r.nom_radio}</td>
            <td className="px-5 py-4 text-gray-600">{r.nom_contact ?? "—"}</td>
            <td className="px-5 py-4 text-gray-500">{r.telephone ?? "—"}</td>
            <td className="px-5 py-4">
              <div className="flex justify-end gap-3">
                <Link
                  href={`/admin/radio/${r.id}`}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voir
                </Link>
                <Link
                  href={`/admin/radio/${r.id}/modifier`}
                  className="text-gray-500 hover:text-gray-700 font-medium"
                >
                  Modifier
                </Link>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-red-400 hover:text-red-600 font-medium transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
