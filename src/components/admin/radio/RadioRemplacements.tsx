"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useState } from "react";

interface Remplacement {
  id: string;
  date_debut: string;
  date_fin: string;
  tranche_debut: string;
  tranche_fin: string;
  tarif_horaire: number;
  notes: string | null;
}

interface Props {
  radioId: string;
  trancheDebut: string;
  trancheFin: string;
  tarifHoraire: number;
}

function calcDays(debut: string, fin: string): number {
  if (!debut || !fin) return 0;
  const d1 = new Date(debut).getTime();
  const d2 = new Date(fin).getTime();
  return Math.max(0, Math.floor((d2 - d1) / 86400000) + 1);
}

function calcHours(debut: string, fin: string): number {
  if (!debut || !fin) return 0;
  const [h1, m1] = debut.split(":").map(Number);
  const [h2, m2] = fin.split(":").map(Number);
  return Math.max(0, (h2 * 60 + m2 - (h1 * 60 + m1)) / 60);
}

function formatDate(s: string) {
  return new Date(s + "T00:00:00").toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const eur = (n: number) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export function RadioRemplacements({ radioId, trancheDebut, trancheFin, tarifHoraire }: Props) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [remplacements, setRemplacements] = useState<Remplacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [tDebut, setTDebut] = useState(trancheDebut.slice(0, 5));
  const [tFin, setTFin] = useState(trancheFin.slice(0, 5));
  const [tarif, setTarif] = useState(String(tarifHoraire));
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const days = calcDays(dateDebut, dateFin);
  const hours = calcHours(tDebut, tFin);
  const tarifNum = parseFloat(tarif) || 0;
  const amount = days * hours * tarifNum;
  const showPreview = days > 0 && hours > 0 && tarifNum > 0;

  async function load() {
    const { data } = await supabase
      .from("piloto_radio_remplacements")
      .select("id, date_debut, date_fin, tranche_debut, tranche_fin, tarif_horaire, notes")
      .eq("radio_id", radioId)
      .order("date_debut", { ascending: false });
    setRemplacements(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await supabase.from("piloto_radio_remplacements").insert({
      radio_id: radioId,
      nom_radio: "",
      date_debut: dateDebut,
      date_fin: dateFin,
      tranche_debut: tDebut,
      tranche_fin: tFin,
      tarif_horaire: tarifNum,
      notes: notes || null,
    });
    setAdding(false);
    setDateDebut("");
    setDateFin("");
    setTDebut(trancheDebut.slice(0, 5));
    setTFin(trancheFin.slice(0, 5));
    setTarif(String(tarifHoraire));
    setNotes("");
    setSaving(false);
    await load();
  }

  async function handleDelete(id: string) {
    await supabase.from("piloto_radio_remplacements").delete().eq("id", id);
    setRemplacements((prev) => prev.filter((r) => r.id !== id));
  }

  const inputCls =
    "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Remplacements</h3>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            + Ajouter
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="bg-gray-50 rounded-xl border border-gray-200 p-4 mb-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Date début <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={dateDebut}
                onChange={(e) => {
                  setDateDebut(e.target.value);
                  if (dateFin && e.target.value > dateFin) setDateFin(e.target.value);
                }}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Date fin <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                min={dateDebut}
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Début tranche <span className="text-red-500">*</span>
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
                Fin tranche <span className="text-red-500">*</span>
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
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations complémentaires…"
              className={`${inputCls} resize-none`}
            />
          </div>

          {showPreview && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm">
              <p className="text-blue-400 text-xs uppercase tracking-wide mb-1">Estimation</p>
              <p className="text-blue-800 font-medium">
                {days}j × {hours}h × {tarifNum} €/h ={" "}
                <span className="font-bold">{eur(amount)}</span>
              </p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
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
      ) : remplacements.length === 0 ? (
        <p className="text-sm text-gray-400">Aucun remplacement enregistré.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {remplacements.map((r) => {
            const d = calcDays(r.date_debut, r.date_fin);
            const h = calcHours(r.tranche_debut, r.tranche_fin);
            const a = d * h * Number(r.tarif_horaire);
            const isPast = new Date(r.date_fin + "T00:00:00") < new Date();
            return (
              <div key={r.id} className="flex items-center justify-between py-3 text-sm">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-800 font-medium">
                      {formatDate(r.date_debut)}
                      {r.date_debut !== r.date_fin && <> → {formatDate(r.date_fin)}</>}
                    </span>
                    <span className="text-gray-400 text-xs">({d}j)</span>
                    {isPast && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        passé
                      </span>
                    )}
                  </div>
                  <div className="text-gray-500 text-xs mt-0.5">
                    {r.tranche_debut.slice(0, 5)} – {r.tranche_fin.slice(0, 5)} · {h}h/j · {Number(r.tarif_horaire).toLocaleString("fr-FR")} €/h
                  </div>
                  {r.notes && <div className="text-gray-400 text-xs mt-0.5 italic">{r.notes}</div>}
                </div>
                <div className="flex items-center gap-4 ml-4 shrink-0">
                  <span className="font-semibold text-gray-900">{eur(a)}</span>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
