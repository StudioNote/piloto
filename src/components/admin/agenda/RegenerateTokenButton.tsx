"use client";

import { RotateCcw } from "lucide-react";
import { regenererTokenCal } from "@/app/admin/agenda/actions";

export function RegenerateTokenButton() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (
      !confirm(
        "Régénérer le lien ? L'ancien lien ne fonctionnera plus. Vous devrez mettre à jour l'abonnement dans Calendrier."
      )
    )
      return;
    await regenererTokenCal();
  }

  return (
    <form onSubmit={handleSubmit}>
      <button
        type="submit"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-600 border border-gray-200 px-3 py-2 rounded-lg transition-colors"
      >
        <RotateCcw size={14} />
        Régénérer le lien
      </button>
    </form>
  );
}
