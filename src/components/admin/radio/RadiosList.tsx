"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Eye, Pencil, Trash2 } from "lucide-react";
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
      <thead className="bg-emerald-50 border-b border-emerald-100">
        <tr>
          <th className="text-left px-5 py-3.5 font-medium text-emerald-600 text-xs">Radio</th>
          <th className="text-left px-5 py-3.5 font-medium text-emerald-600 text-xs">Contact</th>
          <th className="text-left px-5 py-3.5 font-medium text-emerald-600 text-xs">Téléphone</th>
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
              <div className="flex justify-end gap-1">
                <Link
                  href={`/admin/radio/${r.id}`}
                  title="Voir"
                  className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                >
                  <Eye size={16} />
                </Link>
                <Link
                  href={`/admin/radio/${r.id}/modifier`}
                  title="Modifier"
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <Pencil size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(r.id)}
                  title="Supprimer"
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
