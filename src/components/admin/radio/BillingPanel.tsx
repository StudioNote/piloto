"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAllPotentialDays, getJoursFeries, getDurationHours } from "@/lib/jours-feries";

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const DAYS_FR = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];

interface RadioBilling {
  id: string;
  tranche_debut: string;
  tranche_fin: string;
  tarif_horaire: number | string;
  jours_travailles: string[];
}

export function BillingPanel({ radio }: { radio: RadioBilling }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [exclusions, setExclusions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchExclusions = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const mm = String(month + 1).padStart(2, "0");
    const lastDay = new Date(year, month + 1, 0).getDate();
    const { data } = await supabase
      .from("piloto_radio_exclusions")
      .select("date")
      .eq("radio_id", radio.id)
      .gte("date", `${year}-${mm}-01`)
      .lte("date", `${year}-${mm}-${lastDay}`);
    setExclusions(new Set((data ?? []).map((e: { date: string }) => e.date)));
    setLoading(false);
  }, [radio.id, year, month]);

  useEffect(() => { fetchExclusions(); }, [fetchExclusions]);

  async function toggleExclusion(date: string) {
    setToggling(date);
    const supabase = createClient();
    if (exclusions.has(date)) {
      await supabase
        .from("piloto_radio_exclusions")
        .delete()
        .eq("radio_id", radio.id)
        .eq("date", date);
      setExclusions((prev) => { const s = new Set(prev); s.delete(date); return s; });
    } else {
      await supabase
        .from("piloto_radio_exclusions")
        .insert({ radio_id: radio.id, date });
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

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const allPotential = getAllPotentialDays(year, month, radio.jours_travailles);
  const feries = getJoursFeries(year);
  const workedDays = allPotential.filter((d) => !feries.has(d) && !exclusions.has(d));
  const feriesCount = allPotential.filter((d) => feries.has(d)).length;

  const duration = getDurationHours(radio.tranche_debut, radio.tranche_fin);
  const tarif = Number(radio.tarif_horaire);
  const totalHours = workedDays.length * duration;
  const totalAmount = totalHours * tarif;

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

      {/* Résumé chiffré */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Jours travaillés</p>
          <p className="text-3xl font-bold text-gray-900">{workedDays.length}</p>
          <p className="text-xs text-gray-400 mt-1.5">
            {feriesCount > 0 && `${feriesCount} fériés`}
            {feriesCount > 0 && exclusions.size > 0 && " · "}
            {exclusions.size > 0 && `${exclusions.size} exclus`}
            {feriesCount === 0 && exclusions.size === 0 && "Aucune exclusion"}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Heures totales</p>
          <p className="text-3xl font-bold text-gray-900">
            {Number.isInteger(totalHours) ? totalHours : totalHours.toFixed(1)}h
          </p>
          <p className="text-xs text-gray-400 mt-1.5">
            {radio.tranche_debut.slice(0, 5)}–{radio.tranche_fin.slice(0, 5)} · {duration}h/j
          </p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-blue-400 uppercase tracking-wide mb-1">À facturer</p>
          <p className="text-3xl font-bold text-blue-700">
            {totalAmount.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-blue-400 mt-1.5">{tarif} €/h</p>
        </div>
      </div>

      {/* Chips jours */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
          Jours prévus — cliquer pour exclure / réintégrer
        </p>
        {loading ? (
          <p className="text-sm text-gray-400">Chargement…</p>
        ) : allPotential.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun jour prévu ce mois-ci.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allPotential.map((dateStr) => {
              const isFerie = feries.has(dateStr);
              const isExcluded = exclusions.has(dateStr);
              const d = new Date(dateStr + "T00:00:00");
              const label = `${DAYS_FR[d.getDay()]} ${d.getDate()}`;

              if (isFerie) {
                return (
                  <span
                    key={dateStr}
                    title="Jour férié — exclu automatiquement"
                    className="text-xs px-2.5 py-1 rounded-full bg-orange-50 text-orange-400 border border-orange-100 line-through cursor-default"
                  >
                    {label}
                  </span>
                );
              }

              return (
                <button
                  key={dateStr}
                  onClick={() => toggleExclusion(dateStr)}
                  disabled={toggling === dateStr}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    isExcluded
                      ? "bg-gray-100 text-gray-400 border-gray-200 line-through"
                      : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  } disabled:opacity-50`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex gap-5 mt-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-300 inline-block" />
            Travaillé
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-300 inline-block" />
            Jour férié
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300 inline-block" />
            Exclu manuellement
          </span>
        </div>
      </div>
    </div>
  );
}
