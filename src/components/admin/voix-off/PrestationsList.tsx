"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trash2 } from "lucide-react";

interface Prestation {
  id: string;
  date: string;
  description: string | null;
  montant: number | null;
}

export function PrestationsList({ initial }: { initial: Prestation[] }) {
  const [prestations, setPrestations] = useState<Prestation[]>(initial);

  async function handleDelete(id: string) {
    if (!window.confirm("Supprimer cette prestation ?")) return;
    const supabase = createClient();
    await supabase.from("piloto_voixoff_prestations").delete().eq("id", id);
    setPrestations((prev) => prev.filter((p) => p.id !== id));
  }

  if (prestations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-sm text-gray-400">
        Aucune prestation enregistrée.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {prestations.map((p) => (
        <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 mb-1">
                {new Date(p.date).toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {p.description && (
                <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {p.montant !== null && (
                <span className="text-sm font-semibold text-gray-800">
                  {p.montant.toLocaleString("fr-FR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  €
                </span>
              )}
              <button
                onClick={() => handleDelete(p.id)}
                title="Supprimer"
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
