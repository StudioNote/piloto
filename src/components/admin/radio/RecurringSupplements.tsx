"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Supplement {
  id: string;
  label: string;
  montant: number | string;
}

export function RecurringSupplements({ radioId }: { radioId: string }) {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState("");
  const [montant, setMontant] = useState("");

  async function fetchSupplements() {
    const supabase = createClient();
    const { data } = await supabase
      .from("piloto_radio_supplements")
      .select("id, label, montant")
      .eq("radio_id", radioId)
      .eq("recurrent", true)
      .order("created_at");
    setSupplements(data ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchSupplements(); }, [radioId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!label || !montant) return;
    setSaving(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("piloto_radio_supplements")
      .insert({ radio_id: radioId, label, montant: parseFloat(montant), recurrent: true })
      .select("id, label, montant")
      .single();
    if (data) setSupplements((prev) => [...prev, data]);
    setLabel("");
    setMontant("");
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("piloto_radio_supplements").delete().eq("id", id);
    setSupplements((prev) => prev.filter((s) => s.id !== id));
  }

  const eur = (n: number) =>
    n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Suppléments récurrents</h3>

      {loading ? (
        <p className="text-sm text-gray-400 mb-4">Chargement…</p>
      ) : supplements.length === 0 ? (
        <p className="text-sm text-gray-400 mb-4">
          Aucun supplément récurrent. Ils seront automatiquement inclus dans la facturation mensuelle.
        </p>
      ) : (
        <div className="space-y-1 mb-4">
          {supplements.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between py-2.5 border-b border-gray-50"
            >
              <span className="text-sm text-gray-700">{s.label}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-900">
                  +{eur(Number(s.montant))}
                </span>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (ex: Jeu antenne)"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          value={montant}
          onChange={(e) => setMontant(e.target.value)}
          placeholder="€"
          step="0.01"
          min="0"
          className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={saving || !label || !montant}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Ajouter
        </button>
      </form>
    </div>
  );
}
