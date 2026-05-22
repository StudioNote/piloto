"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

const JOURS = [
  { value: "lundi", label: "Lun" },
  { value: "mardi", label: "Mar" },
  { value: "mercredi", label: "Mer" },
  { value: "jeudi", label: "Jeu" },
  { value: "vendredi", label: "Ven" },
  { value: "samedi", label: "Sam" },
  { value: "dimanche", label: "Dim" },
];

const JOURS_SHORT: Record<string, string> = {
  lundi: "Lun.", mardi: "Mar.", mercredi: "Mer.", jeudi: "Jeu.",
  vendredi: "Ven.", samedi: "Sam.", dimanche: "Dim.",
};

export interface Tranche {
  id: string;
  tranche_debut: string;
  tranche_fin: string;
  jours_travailles: string[];
  tarif_horaire: number;
}

const inputCls =
  "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

export function RadioTranches({
  radioId,
  onTrancheChange,
  initialTranches,
  readonly,
}: {
  radioId: string;
  onTrancheChange?: (tranches: Tranche[]) => void;
  initialTranches?: Tranche[];
  readonly?: boolean;
}) {
  const supabase = createClient();
  const [tranches, setTranches] = useState<Tranche[]>(initialTranches ?? []);
  const [loading, setLoading] = useState(!initialTranches);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tDebut, setTDebut] = useState("");
  const [tFin, setTFin] = useState("");
  const [jours, setJours] = useState<string[]>([]);
  const [tarif, setTarif] = useState("");

  async function load() {
    const { data } = await supabase
      .from("piloto_radio_tranches")
      .select("id, tranche_debut, tranche_fin, jours_travailles, tarif_horaire")
      .eq("radio_id", radioId)
      .order("created_at");
    const result = data ?? [];
    setTranches(result);
    onTrancheChange?.(result);
    setLoading(false);
  }

  useEffect(() => {
    if (!initialTranches) load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleJour(j: string) {
    setJours((prev) => (prev.includes(j) ? prev.filter((x) => x !== j) : [...prev, j]));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (jours.length === 0) return;
    setSaving(true);
    await supabase.from("piloto_radio_tranches").insert({
      radio_id: radioId,
      tranche_debut: tDebut,
      tranche_fin: tFin,
      jours_travailles: jours,
      tarif_horaire: parseFloat(tarif),
    });
    setAdding(false);
    setTDebut("");
    setTFin("");
    setJours([]);
    setTarif("");
    setSaving(false);
    await load();
  }

  async function handleDelete(id: string) {
    await supabase.from("piloto_radio_tranches").delete().eq("id", id);
    const updated = tranches.filter((t) => t.id !== id);
    setTranches(updated);
    onTrancheChange?.(updated);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Tranches horaires</h3>
        {!readonly && !adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            + Ajouter
          </button>
        )}
      </div>

      {!readonly && adding && (
        <form
          onSubmit={handleAdd}
          className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4 space-y-4"
        >
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Début <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={tDebut}
                onChange={(e) => setTDebut(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Fin <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={tFin}
                onChange={(e) => setTFin(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tarif (€/h) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={tarif}
                onChange={(e) => setTarif(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">
              Jours travaillés <span className="text-red-500">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {JOURS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleJour(value)}
                  className={`px-3 py-1 text-xs rounded-full border font-medium transition-colors ${
                    jours.includes(value)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving || jours.length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-gray-400">Chargement…</p>
      ) : tranches.length === 0 ? (
        <p className="text-sm text-gray-400">Aucune tranche définie.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {tranches.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <div className="font-medium text-gray-800">
                  {t.tranche_debut.slice(0, 5)} – {t.tranche_fin.slice(0, 5)}
                  <span className="ml-2 text-gray-500 font-normal">
                    {Number(t.tarif_horaire).toLocaleString("fr-FR")} €/h
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {(t.jours_travailles as string[]).map((j) => (
                    <span
                      key={j}
                      className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-medium"
                    >
                      {JOURS_SHORT[j] ?? j}
                    </span>
                  ))}
                </div>
              </div>
              {!readonly && (
                <button
                  onClick={() => handleDelete(t.id)}
                  title="Supprimer"
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors ml-2 shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
