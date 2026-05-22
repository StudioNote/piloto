"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, MapPin, Calendar } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

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

export interface AgendaCalendarProps {
  rendezVous: RendezVous[];
  vue: "mois" | "semaine" | "jour";
  mois: string;         // YYYY-MM
  date: string;         // YYYY-MM-DD (ancre pour semaine/jour)
  semaineStart: string; // YYYY-MM-DD (lundi de la semaine affichée)
}

// ─── Constantes activité ──────────────────────────────────────────────────────

const ACTIVITE = {
  sos_ordi: {
    dot: "bg-blue-500",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-700",
    block: "bg-blue-50 border-l-[3px] border-blue-500 text-blue-900",
    label: "SOS Ordi",
  },
  builder: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
    block: "bg-amber-50 border-l-[3px] border-amber-500 text-amber-900",
    label: "Builder",
  },
  radio: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    block: "bg-emerald-50 border-l-[3px] border-emerald-500 text-emerald-900",
    label: "Radio",
  },
  autre: {
    dot: "bg-gray-400",
    text: "text-gray-600",
    badge: "bg-gray-100 text-gray-600",
    block: "bg-gray-100 border-l-[3px] border-gray-400 text-gray-800",
    label: "Autre",
  },
} as const;

function getA(activite: string) {
  return ACTIVITE[activite as keyof typeof ACTIVITE] ?? ACTIVITE.autre;
}

// ─── Constantes grille horaire ────────────────────────────────────────────────

const H_START = 7;
const H_END = 21;
const HOURS = H_END - H_START; // 14
const SLOT_H = 60; // px par heure
const GRID_H = HOURS * SLOT_H; // 840px

// ─── Helpers ─────────────────────────────────────────────────────────────────

function heureToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

function addOneHourStr(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${String((h + 1) % 24).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
}

function dateStrAddDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function buildGrid(year: number, jsMonth: number): (number | null)[] {
  const daysInMonth = new Date(year, jsMonth + 1, 0).getDate();
  const firstDow = (new Date(year, jsMonth, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// ─── Sélecteur de vue ─────────────────────────────────────────────────────────

function ViewSwitcher({
  vue,
  mois,
  date,
  semaineStart,
}: {
  vue: string;
  mois: string;
  date: string;
  semaineStart: string;
}) {
  const contextDate =
    vue === "mois" ? new Date().toISOString().slice(0, 10) : date;

  const views = [
    {
      key: "mois",
      label: "Mois",
      href: `/admin/agenda?vue=mois&mois=${
        vue === "mois" ? mois : contextDate.slice(0, 7)
      }`,
    },
    {
      key: "semaine",
      label: "Semaine",
      href: `/admin/agenda?vue=semaine&date=${
        vue === "semaine" ? date : vue === "jour" ? date : contextDate
      }`,
    },
    {
      key: "jour",
      label: "Jour",
      href: `/admin/agenda?vue=jour&date=${
        vue === "jour" ? date : vue === "semaine" ? semaineStart : contextDate
      }`,
    },
  ];

  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
      {views.map((v) => (
        <Link
          key={v.key}
          href={v.href}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            vue === v.key
              ? "bg-rose-600 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          {v.label}
        </Link>
      ))}
    </div>
  );
}

// ─── Panneau détail d'un jour (réutilisé dans Vue Mois et Vue Jour) ───────────

function DayPanel({
  rdvs,
  dateStr,
}: {
  rdvs: RendezVous[];
  dateStr: string;
}) {
  const dateLabel = new Date(dateStr + "T00:00:00").toLocaleDateString(
    "fr-FR",
    { weekday: "long", day: "numeric", month: "long" }
  );

  return (
    <div className="mt-4 bg-white rounded-xl border border-rose-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-semibold text-gray-800 capitalize">{dateLabel}</h3>
        <Link
          href={`/admin/agenda/nouveau?date=${dateStr}`}
          className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Ajouter un RDV
        </Link>
      </div>

      {rdvs.length === 0 ? (
        <div className="text-center py-6">
          <Calendar size={28} className="text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">Aucun rendez-vous ce jour.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rdvs.map((rdv) => {
            const c = getA(rdv.activite);
            return (
              <div
                key={rdv.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${c.dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-800 text-sm">{rdv.titre}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-md ${c.badge}`}>
                      {c.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {rdv.heure_debut.slice(0, 5)}
                    {rdv.heure_fin ? ` – ${rdv.heure_fin.slice(0, 5)}` : ""}
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
                      >
                        Itinéraire →
                      </a>
                    </div>
                  )}
                </div>
                <Link
                  href={`/admin/agenda/${rdv.id}/modifier`}
                  className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors shrink-0"
                  title="Modifier"
                >
                  <Pencil size={14} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Bloc RDV dans la grille horaire ─────────────────────────────────────────

function RdvBlock({ rdv }: { rdv: RendezVous }) {
  const c = getA(rdv.activite);
  const startMin = heureToMinutes(rdv.heure_debut);
  const endMin = heureToMinutes(rdv.heure_fin ?? addOneHourStr(rdv.heure_debut));
  const top = (startMin - H_START * 60) * (SLOT_H / 60);
  const height = Math.max(24, (endMin - startMin) * (SLOT_H / 60));

  return (
    <Link
      href={`/admin/agenda/${rdv.id}/modifier`}
      data-rdv="true"
      className={`absolute left-1 right-1 rounded px-1.5 py-0.5 overflow-hidden cursor-pointer hover:brightness-95 transition-all z-10 ${c.block}`}
      style={{ top, height }}
      title={`${rdv.titre} — ${rdv.heure_debut.slice(0, 5)}${rdv.heure_fin ? ` – ${rdv.heure_fin.slice(0, 5)}` : ""}`}
    >
      <p className="text-xs font-semibold leading-tight truncate">{rdv.titre}</p>
      {height >= 40 && (
        <p className="text-xs opacity-70 leading-tight">
          {rdv.heure_debut.slice(0, 5)}
          {rdv.heure_fin ? `–${rdv.heure_fin.slice(0, 5)}` : ""}
        </p>
      )}
    </Link>
  );
}

// ─── Grille horaire partagée (semaine + jour) ─────────────────────────────────

function TimeGrid({
  colonnes,
}: {
  colonnes: { dateStr: string; label: React.ReactNode; rdvs: RendezVous[] }[];
}) {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  function handleColClick(
    e: React.MouseEvent<HTMLDivElement>,
    dateStr: string
  ) {
    if ((e.target as HTMLElement).closest("[data-rdv]")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const hour = Math.min(H_END - 1, Math.max(H_START, H_START + Math.floor(y / SLOT_H)));
    router.push(
      `/admin/agenda/nouveau?date=${dateStr}&heure=${String(hour).padStart(2, "0")}:00`
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* En-têtes des colonnes */}
      <div
        className="flex border-b border-gray-100"
        style={{ paddingLeft: 48 }}
      >
        {colonnes.map((col) => (
          <div
            key={col.dateStr}
            className={`flex-1 text-center pb-2 pt-1 min-w-[80px] ${
              col.dateStr === today ? "text-rose-600" : "text-gray-500"
            }`}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Corps : axe horaire + colonnes */}
      <div className="flex" style={{ height: GRID_H }}>
        {/* Axe horaire */}
        <div className="w-12 shrink-0 relative select-none">
          {Array.from({ length: HOURS }, (_, i) => (
            <div
              key={i}
              className="absolute right-2 text-[10px] text-gray-400 leading-none"
              style={{ top: i * SLOT_H - 6 }}
            >
              {H_START + i}h
            </div>
          ))}
        </div>

        {/* Colonnes des jours */}
        <div
          className="flex-1 relative grid"
          style={{
            gridTemplateColumns: `repeat(${colonnes.length}, minmax(0, 1fr))`,
            height: GRID_H,
          }}
        >
          {/* Lignes horizontales (heures) */}
          {Array.from({ length: HOURS + 1 }, (_, i) => (
            <div
              key={i}
              className="absolute w-full border-t border-gray-100 pointer-events-none"
              style={{ top: i * SLOT_H, zIndex: 1 }}
            />
          ))}

          {/* Lignes des demi-heures */}
          {Array.from({ length: HOURS }, (_, i) => (
            <div
              key={`half-${i}`}
              className="absolute w-full border-t border-dashed border-gray-50 pointer-events-none"
              style={{ top: i * SLOT_H + SLOT_H / 2, zIndex: 1 }}
            />
          ))}

          {/* Colonnes cliquables avec RDV */}
          {colonnes.map((col) => (
            <div
              key={col.dateStr}
              className="relative border-l border-gray-100 cursor-pointer hover:bg-rose-50/20 transition-colors"
              style={{ height: GRID_H, zIndex: 2 }}
              onClick={(e) => handleColClick(e, col.dateStr)}
              title="Cliquer pour ajouter un RDV"
            >
              {col.rdvs.map((rdv) => (
                <RdvBlock key={rdv.id} rdv={rdv} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Vue Mois ─────────────────────────────────────────────────────────────────

function VueMois({
  rendezVous,
  mois,
  date,
}: {
  rendezVous: RendezVous[];
  mois: string;
  date: string;
}) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [year, month] = mois.split("-").map(Number);
  const jsMonth = month - 1;
  const cells = buildGrid(year, jsMonth);

  const rdvByDay = new Map<number, RendezVous[]>();
  rendezVous.forEach((rdv) => {
    if (rdv.date.slice(0, 7) === mois) {
      const day = parseInt(rdv.date.split("-")[2], 10);
      rdvByDay.set(day, [...(rdvByDay.get(day) ?? []), rdv]);
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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800 capitalize">
          {monthLabel}
        </h2>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/agenda?vue=mois&mois=${prevMois}&date=${date}`}
            onClick={() => setSelectedDay(null)}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-rose-600 border border-gray-200 rounded-lg transition-colors"
          >
            ←
          </Link>
          <Link
            href={`/admin/agenda?vue=mois&mois=${nextMois}&date=${date}`}
            onClick={() => setSelectedDay(null)}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-rose-600 border border-gray-200 rounded-lg transition-colors"
          >
            →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"].map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-2">
            {d}
          </div>
        ))}
      </div>

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
                  isToday ? "bg-rose-600 text-white" : "text-gray-700"
                }`}
              >
                {day}
              </span>
              <div className="space-y-0.5">
                {dayRdvs.slice(0, 3).map((rdv) => {
                  const c = getA(rdv.activite);
                  return (
                    <div key={rdv.id} className={`flex items-center gap-1 ${c.text} overflow-hidden`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
                      <span className="text-xs truncate leading-tight">{rdv.titre}</span>
                    </div>
                  );
                })}
                {dayRdvs.length > 3 && (
                  <p className="text-xs text-gray-400">+{dayRdvs.length - 3}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedDay && selectedDateStr && (
        <DayPanel
          rdvs={rdvByDay.get(selectedDay) ?? []}
          dateStr={selectedDateStr}
        />
      )}
    </div>
  );
}

// ─── Vue Semaine ─────────────────────────────────────────────────────────────

function VueSemaine({
  rendezVous,
  semaineStart,
}: {
  rendezVous: RendezVous[];
  semaineStart: string;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const prevDate = dateStrAddDays(semaineStart, -7);
  const nextDate = dateStrAddDays(semaineStart, 7);

  const days = Array.from({ length: 7 }, (_, i) => {
    const dateStr = dateStrAddDays(semaineStart, i);
    const d = new Date(dateStr + "T00:00:00");
    return {
      dateStr,
      dayNum: d.getDate(),
      dayName: d.toLocaleDateString("fr-FR", { weekday: "short" }),
    };
  });

  const start = new Date(semaineStart + "T00:00:00");
  const end = new Date(dateStrAddDays(semaineStart, 6) + "T00:00:00");
  const weekLabel = `${start.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} – ${end.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`;

  const rdvByDate = new Map<string, RendezVous[]>();
  rendezVous.forEach((rdv) => {
    rdvByDate.set(rdv.date, [...(rdvByDate.get(rdv.date) ?? []), rdv]);
  });

  const colonnes = days.map((d) => ({
    dateStr: d.dateStr,
    rdvs: rdvByDate.get(d.dateStr) ?? [],
    label: (
      <div>
        <span className="block text-[10px] capitalize">{d.dayName}</span>
        <span
          className={`inline-flex items-center justify-center w-6 h-6 text-sm font-medium rounded-full mx-auto ${
            d.dateStr === today
              ? "bg-rose-600 text-white"
              : "text-gray-700"
          }`}
        >
          {d.dayNum}
        </span>
      </div>
    ),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800 capitalize">
          {weekLabel}
        </h2>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/agenda?vue=semaine&date=${prevDate}`}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-rose-600 border border-gray-200 rounded-lg transition-colors"
          >
            ←
          </Link>
          <Link
            href={`/admin/agenda?vue=semaine&date=${nextDate}`}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-rose-600 border border-gray-200 rounded-lg transition-colors"
          >
            →
          </Link>
        </div>
      </div>
      <TimeGrid colonnes={colonnes} />
    </div>
  );
}

// ─── Vue Jour ─────────────────────────────────────────────────────────────────

function VueJour({
  rendezVous,
  date,
}: {
  rendezVous: RendezVous[];
  date: string;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const prevDate = dateStrAddDays(date, -1);
  const nextDate = dateStrAddDays(date, 1);

  const d = new Date(date + "T00:00:00");
  const dayLabel = d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const colonnes = [
    {
      dateStr: date,
      rdvs: rendezVous.filter((r) => r.date === date),
      label: (
        <div>
          <span
            className={`inline-flex items-center justify-center w-7 h-7 text-sm font-medium rounded-full mx-auto ${
              date === today ? "bg-rose-600 text-white" : "text-gray-700"
            }`}
          >
            {d.getDate()}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800 capitalize">
          {dayLabel}
        </h2>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/agenda?vue=jour&date=${prevDate}`}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-rose-600 border border-gray-200 rounded-lg transition-colors"
          >
            ←
          </Link>
          <Link
            href={`/admin/agenda?vue=jour&date=${nextDate}`}
            className="px-3 py-1.5 text-sm text-gray-400 hover:text-rose-600 border border-gray-200 rounded-lg transition-colors"
          >
            →
          </Link>
        </div>
      </div>
      <TimeGrid colonnes={colonnes} />
      <DayPanel rdvs={rendezVous.filter((r) => r.date === date)} dateStr={date} />
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

export function AgendaCalendar({
  rendezVous,
  vue,
  mois,
  date,
  semaineStart,
}: AgendaCalendarProps) {
  return (
    <div>
      {/* Sélecteur de vue */}
      <div className="flex items-center justify-between mb-5">
        <ViewSwitcher vue={vue} mois={mois} date={date} semaineStart={semaineStart} />
      </div>

      {vue === "mois" && (
        <VueMois rendezVous={rendezVous} mois={mois} date={date} />
      )}
      {vue === "semaine" && (
        <VueSemaine rendezVous={rendezVous} semaineStart={semaineStart} />
      )}
      {vue === "jour" && (
        <VueJour rendezVous={rendezVous} date={date} />
      )}
    </div>
  );
}
