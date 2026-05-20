"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAllPotentialDays, getJoursFeries, getDurationHours } from "@/lib/jours-feries";

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const DAYS_FR = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];

interface Tranche {
  id: string;
  tranche_debut: string;
  tranche_fin: string;
  jours_travailles: string[];
  tarif_horaire: number | string;
}
interface DbSupplement { id: string; label: string; montant: number | string; }
interface OneTimeSupplement { key: number; label: string; montant: number; }

const eur = (n: number, decimals = 0) =>
  n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: decimals });

export function BillingPanel({ radioId }: { radioId: string }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [tranches, setTranches] = useState<Tranche[]>([]);
  const [exclusions, setExclusions] = useState<Set<string>>(new Set());
  const [recurring, setRecurring] = useState<DbSupplement[]>([]);
  const [oneTime, setOneTime] = useState<OneTimeSupplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [otLabel, setOtLabel] = useState("");
  const [otMontant, setOtMontant] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const mm = String(month + 1).padStart(2, "0");
    const lastDay = new Date(year, month + 1, 0).getDate();

    const [trancheRes, exclRes, suppRes] = await Promise.all([
      supabase
        .from("piloto_radio_tranches")
        .select("id, tranche_debut, tranche_fin, jours_travailles, tarif_horaire")
        .eq("radio_id", radioId)
        .order("created_at"),
      supabase
        .from("piloto_radio_exclusions")
        .select("date")
        .eq("radio_id", radioId)
        .gte("date", `${year}-${mm}-01`)
        .lte("date", `${year}-${mm}-${String(lastDay).padStart(2, "0")}`),
      supabase
        .from("piloto_radio_supplements")
        .select("id, label, montant")
        .eq("radio_id", radioId)
        .eq("recurrent", true)
        .order("created_at"),
    ]);

    setTranches(trancheRes.data ?? []);
    setExclusions(new Set((exclRes.data ?? []).map((e: { date: string }) => e.date)));
    setRecurring(suppRes.data ?? []);
    setLoading(false);
  }, [radioId, year, month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function toggleExclusion(date: string) {
    setToggling(date);
    const supabase = createClient();
    if (exclusions.has(date)) {
      await supabase.from("piloto_radio_exclusions").delete()
        .eq("radio_id", radioId).eq("date", date);
      setExclusions((prev) => { const s = new Set(prev); s.delete(date); return s; });
    } else {
      await supabase.from("piloto_radio_exclusions").insert({ radio_id: radioId, date });
      setExclusions((prev) => { const s = new Set(prev); s.add(date); return s; });
    }
    setToggling(null);
  }

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth())) return;
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  function addOneTime(e: React.FormEvent) {
    e.preventDefault();
    if (!otLabel || !otMontant) return;
    setOneTime((prev) => [...prev, { key: Date.now(), label: otLabel, montant: parseFloat(otMontant) }]);
    setOtLabel("");
    setOtMontant("");
  }

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
  const feries = getJoursFeries(year);

  // Union de tous les jours potentiels toutes tranches confondues
  const allPotentialMap: Record<string, true> = {};
  for (const t of tranches) {
    getAllPotentialDays(year, month, t.jours_travailles).forEach((d) => { allPotentialMap[d] = true; });
  }
  const allPotentialUnion = Object.keys(allPotentialMap).sort();

  // Jours travaillés uniques (pour les suppléments récurrents et le résumé)
  const workedUnion = allPotentialUnion.filter((d) => !exclusions.has(d));
  const workedFeriesCount = allPotentialUnion.filter((d) => feries.has(d) && !exclusions.has(d)).length;

  // Calcul par tranche
  const perTranche = tranches.map((t) => {
    const potential = getAllPotentialDays(year, month, t.jours_travailles);
    const worked = potential.filter((d) => !exclusions.has(d));
    const duration = getDurationHours(t.tranche_debut, t.tranche_fin);
    const tarif = Number(t.tarif_horaire);
    return { t, worked, duration, tarif, amount: worked.length * duration * tarif };
  });

  const totalHours = perTranche.reduce((sum, p) => sum + p.worked.length * p.duration, 0);
  const hoursAmount = perTranche.reduce((sum, p) => sum + p.amount, 0);
  const recurringTotal = recurring.reduce((sum, s) => sum + Number(s.montant) * workedUnion.length, 0);
  const oneTimeTotal = oneTime.reduce((sum, s) => sum + s.montant, 0);
  const grandTotal = hoursAmount + recurringTotal + oneTimeTotal;
  const hasSupplements = recurring.length > 0 || oneTime.length > 0;
  const showDetail = tranches.length > 1 || hasSupplements;

  return (
    <div>
      {/* Navigation mois */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Facturation du mois</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            ←
          </button>
          <span className="text-sm font-medium text-gray-700 w-36 text-center">
            {MONTHS_FR[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Chargement…</p>
      ) : tranches.length === 0 ? (
        <p className="text-sm text-gray-400">
          Aucune tranche définie. Ajoutez des tranches horaires pour activer la facturation.
        </p>
      ) : (
        <>
          {/* Cartes résumé */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Jours travaillés</p>
              <p className="text-3xl font-bold text-gray-900">{workedUnion.length}</p>
              <p className="text-xs text-gray-400 mt-1.5">
                {workedFeriesCount > 0 && `★ ${workedFeriesCount} féri${workedFeriesCount > 1 ? "és" : "é"}`}
                {workedFeriesCount > 0 && exclusions.size > 0 && " · "}
                {exclusions.size > 0 && `${exclusions.size} exclu${exclusions.size > 1 ? "s" : ""}`}
                {workedFeriesCount === 0 && exclusions.size === 0 && "Aucune exclusion"}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Heures totales</p>
              <p className="text-3xl font-bold text-gray-900">
                {Number.isInteger(totalHours) ? totalHours : totalHours.toFixed(1)}h
              </p>
              <p className="text-xs text-gray-400 mt-1.5">
                {tranches.length === 1
                  ? `${tranches[0].tranche_debut.slice(0, 5)}–${tranches[0].tranche_fin.slice(0, 5)} · ${getDurationHours(tranches[0].tranche_debut, tranches[0].tranche_fin)}h/j`
                  : `${tranches.length} tranches`}
              </p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs text-blue-400 uppercase tracking-wide mb-1">Total à facturer</p>
              <p className="text-3xl font-bold text-blue-700">{eur(grandTotal)}</p>
              <p className="text-xs text-blue-400 mt-1.5">
                {hasSupplements ? "Heures + suppléments" : "Heures uniquement"}
              </p>
            </div>
          </div>

          {/* Détail par tranche + suppléments */}
          {showDetail && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2 text-sm">
              {perTranche.map(({ t, worked, duration, tarif, amount }) => (
                <div key={t.id} className="flex justify-between text-gray-600">
                  <span>
                    {t.tranche_debut.slice(0, 5)}–{t.tranche_fin.slice(0, 5)}{" "}
                    <span className="text-gray-400">
                      ({worked.length}j × {duration}h × {tarif} €)
                    </span>
                  </span>
                  <span>{eur(amount, 2)}</span>
                </div>
              ))}
              {recurring.map((s) => (
                <div key={s.id} className="flex justify-between text-gray-600">
                  <span>
                    {s.label}{" "}
                    <span className="text-xs text-gray-400">
                      {eur(Number(s.montant), 2)} × {workedUnion.length}j
                    </span>
                  </span>
                  <span>+{eur(Number(s.montant) * workedUnion.length, 2)}</span>
                </div>
              ))}
              {oneTime.map((s) => (
                <div key={s.key} className="flex justify-between text-gray-600">
                  <span>
                    {s.label} <span className="text-xs text-gray-400">ponctuel</span>
                  </span>
                  <span>+{eur(s.montant, 2)}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total</span>
                <span>{eur(grandTotal, 2)}</span>
              </div>
            </div>
          )}

          {/* Chips jours */}
          <div className="mb-6">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
              Jours prévus — cliquer pour exclure / réintégrer
            </p>
            {allPotentialUnion.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun jour prévu ce mois-ci.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allPotentialUnion.map((dateStr) => {
                  const isFerie = feries.has(dateStr);
                  const isExcluded = exclusions.has(dateStr);
                  const d = new Date(dateStr + "T00:00:00");
                  const dayLabel = `${DAYS_FR[d.getDay()]} ${d.getDate()}`;
                  return (
                    <button
                      key={dateStr}
                      onClick={() => toggleExclusion(dateStr)}
                      disabled={toggling === dateStr}
                      title={
                        isFerie
                          ? isExcluded
                            ? "Férié — exclu (cliquer pour travailler)"
                            : "Férié — travaillé (cliquer pour exclure)"
                          : isExcluded
                          ? "Exclu (cliquer pour réintégrer)"
                          : "Cliquer pour exclure"
                      }
                      className={`text-xs px-2.5 py-1 rounded-full border transition-all disabled:opacity-50 ${
                        isExcluded
                          ? "bg-gray-100 text-gray-400 border-gray-200 line-through"
                          : isFerie
                          ? "bg-green-50 text-green-700 border-green-400 ring-1 ring-green-300 hover:bg-green-100"
                          : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      }`}
                    >
                      {isFerie && !isExcluded ? `★ ${dayLabel}` : dayLabel}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex gap-5 mt-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-300 inline-block" />
                Travaillé
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />
                ★ Férié travaillé
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />
                Exclu
              </span>
            </div>
          </div>

          {/* Suppléments ponctuels */}
          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
              Suppléments ponctuels ce mois
            </p>
            {oneTime.length > 0 && (
              <div className="space-y-1.5 mb-3">
                {oneTime.map((s) => (
                  <div key={s.key} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-700">{s.label}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-900">+{eur(s.montant, 2)}</span>
                      <button
                        onClick={() => setOneTime((prev) => prev.filter((x) => x.key !== s.key))}
                        className="text-sm text-red-400 hover:text-red-600 leading-none"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <form onSubmit={addOneTime} className="flex gap-2">
              <input
                type="text"
                value={otLabel}
                onChange={(e) => setOtLabel(e.target.value)}
                placeholder="Label (ex: Transport)"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                value={otMontant}
                onChange={(e) => setOtMontant(e.target.value)}
                placeholder="€"
                step="0.01"
                min="0"
                className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!otLabel || !otMontant}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
              >
                + Ajouter
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
