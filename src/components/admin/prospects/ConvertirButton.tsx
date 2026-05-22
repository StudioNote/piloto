"use client";

import { useState } from "react";
import { UserCheck } from "lucide-react";
import { convertirEnClient } from "@/app/admin/prospects/actions";

export function ConvertirButton({ prospectId }: { prospectId: string }) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (
      !confirm(
        "Convertir ce prospect en client Builder ?\nUne fiche client sera créée et vous serez redirigé vers celle-ci."
      )
    )
      return;
    setLoading(true);
    await convertirEnClient(prospectId);
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
    >
      <UserCheck size={15} />
      {loading ? "Conversion en cours…" : "Convertir en client Builder"}
    </button>
  );
}
