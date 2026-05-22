"use client";

import { useState } from "react";
import { changerStatutProspect } from "@/app/admin/prospects/actions";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  statut: string;
  label: string;
  variant: "primary" | "danger";
}

export function StatutButton({ id, statut, label, variant }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handle() {
    setLoading(true);
    await changerStatutProspect(id, statut);
    router.refresh();
    setLoading(false);
  }

  const base = "px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50";
  const cls =
    variant === "primary"
      ? `${base} bg-indigo-600 hover:bg-indigo-700 text-white`
      : `${base} border border-red-200 text-red-600 hover:bg-red-50`;

  return (
    <button type="button" onClick={handle} disabled={loading} className={cls}>
      {loading ? "…" : label}
    </button>
  );
}
