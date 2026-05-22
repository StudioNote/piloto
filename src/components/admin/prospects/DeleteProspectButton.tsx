"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { supprimerProspect } from "@/app/admin/prospects/actions";

export function DeleteProspectButton({ id, label }: { id: string; label: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Supprimer "${label}" ? Cette action est irréversible.`)) return;
    setLoading(true);
    await supprimerProspect(id);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      <Trash2 size={14} />
      {loading ? "Suppression…" : "Supprimer ce prospect"}
    </button>
  );
}
