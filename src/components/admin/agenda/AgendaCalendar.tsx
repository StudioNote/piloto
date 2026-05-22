"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, MapPin, Calendar } from "lucide-react";

export interface RendezVous {
  id: string;
  titre: string;
  activite: string;
  client_nom: string | null;
  adresse: string | null;
  date: string;
  heure_debut: string;
  heure_fin: string | null;
  description: string | null;
}

const ACTIVITE = {
  sos_ordi: { dot: "bg-blue-500", text: "text-blue-700", badge: "bg-blue-100 text-blue-700", label: "SOS Ordi" },
  builder:  { dot: "bg-amber-500", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", label: "Builder" },
  radio:    { dot: "bg-emerald-500", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", label: "Radio" },
  autre:    { dot: "bg-gray-400", text: "text-gray-600", badge: "bg-gray-100 text-gray-600", label: "Autre" },
} as const;

function getActivite(activite: string) {
  return ACTIVITE[activite as keyof typeof ACTIVITE] ?? ACTIVITE.autre;
}

function buildGrid(year: number, jsMonth: number): (number | null)[] {
  const daysInMonth = new Date(year, jsMonth + 1, 0).getDate();
  const firstDow = (new Date(year, jsMonth, 1).getDay() + 6) % 7; // 0=Mon
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function AgendaCalendar({
  rendezVous,
  mois,
}: {
  rendezVous: RendezVous[];
  mois: string;
}) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const [year, month] = mois.split("-").map(Number);
  const jsMonth = month - 1;

  const cells = buildGrid(year, jsMonth);

  const rdvByDay = new Map<number, RendezVous[]>();
  rendezVous.forEach((rdv) => {
    if (rdv.date.slice(0, 7) === mois) {
      const day = parseInt(rdv.date.split("-")[2], 10);
      const list = rdvByDay.get(day) ?? [];
      list.push(rdv);
      rdvByDay.set(day, list);
    }
  });

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === jsMonth;
  const todayDay = today.getDate();

  const prevMois = (() => {
    const d = new Date(year, jsMonth - 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();
  const nextMois = (() => {
    const d = new Date(year, jsMonth + 1, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  })();

  const monthLabel = new Date(year, jsMonth, 1).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  const selectedDateStr = selectedDay
    ? `${mois}-${String(selectedDay).padStart(2, "0")}`
    : null;
  const selectedRdvs = selectedDay ? (rdvByDay.get(selectedDay) ?? []) : [];

  return (
    <div>
      {/* En-tête navigation mois */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 capitalize">
          {monthLabel}
        </h2>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/agenda?mois=${prevMois}`}
            onClick={() => setSelectedDay(null)}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-rose-600 border border-gray-200 rounded-lg transition-colors"
          >
            ←
          </Link>
          <Link
            href={`/admin/agenda?mois=${nextMois}`}
            onClick={() => setSelectedDay(null)}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-rose-600 border border-gray-200 rounded-lg transition-colors"
          >
            →
          </Link>
        </div>
      </div>

      {/* Jours de la semaine */}
      <div className="grid grid-cols-7 mb-1">
        {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((d) => (
          <div
            key={d}
            className="text-center text-xs text-gray-400 font-medium py-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grille du mois */}
      <div className="grid grid-cols-7 gap-px bg-gray-100 border border-gray-100 rounded-xl overflow-hidden">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={i} className="bg-gray-50 min-h-[6rem]" />;
          }

          const dayRdvs = rdvByDay.get(day) ?? [];
          const isToday = isCurrentMonth && day === todayDay;
          const isSelected = selectedDay === day;

          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedDay(isSelected ? null : day)}
              className={`bg-white min-h-[6rem] p-2 text-left hover:bg-rose-50/50 transition-colors ${
                isSelected ? "ring-2 ring-inset ring-rose-400 bg-rose-50/60" : ""
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full mb-1 ${
                  isToday
                    ? "bg-rose-600 text-white"
                    : "text-gray-700 hover:bg-rose-100"
                }`}
              >
                {day}
              </span>
              <div className="space-y-0.5">
                {dayRdvs.slice(0, 3).map((rdv) => {
                  const c = getActivite(rdv.activite);
                  return (
                    <div
                      key={rdv.id}
                      className={`flex items-center gap-1 ${c.text} overflow-hidden`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`}
                      />
                      <span className="text-xs truncate leading-tight">
                        {rdv.titre}
                      </span>
                    </div>
                  );
                })}
                {dayRdvs.length > 3 && (
                  <p className="text-xs text-gray-400">
                    +{dayRdvs.length - 3}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Panneau du jour sélectionné */}
      {selectedDay && (
        <div className="mt-4 bg-white rounded-xl border border-rose-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="font-semibold text-gray-800 capitalize">
              {new Date(year, jsMonth, selectedDay).toLocaleDateString(
                "fr-FR",
                { weekday: "long", day: "numeric", month: "long" }
              )}
            </h3>
            <Link
              href={`/admin/agenda/nouveau?date=${selectedDateStr}`}
              className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Ajouter un RDV
            </Link>
          </div>

          {selectedRdvs.length === 0 ? (
            <div className="text-center py-6">
              <Calendar size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">
                Aucun rendez-vous ce jour.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedRdvs.map((rdv) => {
                const c = getActivite(rdv.activite);
                return (
                  <div
                    key={rdv.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <span
                      className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${c.dot}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-800 text-sm">
                          {rdv.titre}
                        </p>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-md ${c.badge}`}
                        >
                          {c.label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {rdv.heure_debut.slice(0, 5)}
                        {rdv.heure_fin
                          ? ` – ${rdv.heure_fin.slice(0, 5)}`
                          : ""}
                        {rdv.client_nom ? ` · ${rdv.client_nom}` : ""}
                      </p>
                      {rdv.adresse && (
                        <div className="flex items-start gap-2 mt-0.5 flex-wrap">
                          <p className="text-xs text-gray-400 flex items-center gap-1 min-w-0">
                            <MapPin size={11} className="shrink-0" />
                            <span className="truncate">{rdv.adresse}</span>
                          </p>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rdv.adresse)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 shrink-0 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Itinéraire →
                          </a>
                        </div>
                      )}
                      {rdv.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                          {rdv.description}
                        </p>
                      )}
                    </div>
                    <Link
                      href={`/admin/agenda/${rdv.id}/modifier`}
                      className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors shrink-0"
                      title="Modifier"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Pencil size={14} />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
