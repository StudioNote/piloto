"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";

interface Intervention {
  id: string;
  date: string;
  duree_minutes: number | null;
  description: string | null;
  statut: string;
}

const STATUT_STYLES: Record<string, string> = {
  "À faire": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "En cours": "bg-blue-50 text-blue-700 border-blue-200",
  Terminé: "bg-green-50 text-green-700 border-green-200",
};

export function InterventionsList({ initial }: { initial: Intervention[] }) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [interventions, setInterventions] = useState<Intervention[]>(initial);

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer cette intervention ?")) return;
    await supabase.from("piloto_interventions").delete().eq("id", id);
    setInterventions((prev) => prev.filter((i) => i.id !== id));
  }

  if (interventions.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-sm text-gray-400">
        Aucune intervention enregistrée.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {interventions.map((intervention) => (
        <div key={intervention.id} className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-medium text-gray-800">
                  {new Date(intervention.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                {intervention.duree_minutes && (
                  <span className="text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded">
                    {intervention.duree_minutes} min
                  </span>
                )}
              </div>
              {intervention.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{intervention.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                  STATUT_STYLES[intervention.statut] ?? "bg-gray-50 text-gray-600 border-gray-200"
                }`}
              >
                {intervention.statut}
              </span>
              <button
                onClick={() => handleDelete(intervention.id)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
