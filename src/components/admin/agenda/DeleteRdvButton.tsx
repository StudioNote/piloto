"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { supprimerRendezVous } from "@/app/admin/agenda/actions";

export function DeleteRdvButton({
  id,
  titre,
  mois,
}: {
  id: string;
  titre: string;
  mois: string;
}) {
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm(`Supprimer le rendez-vous « ${titre} » ? Cette action est irréversible.`)) return;
    setPending(true);
    const fd = new FormData();
    fd.append("id", id);
    fd.append("mois", mois);
    await supprimerRendezVous(fd);
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 disabled:opacity-50 transition-colors"
    >
      <Trash2 size={15} />
      {pending ? "Suppression…" : "Supprimer ce rendez-vous"}
    </button>
  );
}
