import { supabaseAdmin } from "@/lib/supabase/admin";
import { Breadcrumb } from "@/components/admin/Breadcrumb";
import { AgendaCalendar } from "@/components/admin/agenda/AgendaCalendar";
import { CopyLinkButton } from "@/components/admin/agenda/CopyLinkButton";
import { RegenerateTokenButton } from "@/components/admin/agenda/RegenerateTokenButton";
import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import { randomBytes } from "crypto";
import { headers } from "next/headers";

function getMondayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const dow = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dow);
  return d.toISOString().slice(0, 10);
}

function dateAddDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ mois?: string; vue?: string; date?: string }>;
}) {
  const sp = await searchParams;

  const vue =
    sp.vue === "semaine" || sp.vue === "jour" ? sp.vue : "mois";
  const today = new Date().toISOString().slice(0, 10);
  const date = sp.date ?? today;
  const mois =
    sp.mois ?? (vue === "mois" ? today.slice(0, 7) : date.slice(0, 7));
  const semaineStart = getMondayOfWeek(vue === "mois" ? today : date);

  const [year, month] = mois.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();

  // Assurer l'existence du token iCal
  let { data: tokenRow } = await supabaseAdmin
    .from("piloto_calendar_token")
    .select("token")
    .eq("id", "singleton")
    .single();

  if (!tokenRow) {
    const token = randomBytes(32).toString("hex");
    await supabaseAdmin.from("piloto_calendar_token").insert({
      id: "singleton",
      token,
    });
    tokenRow = { token };
  }

  // RDV pour la vue active
  let fetchStart: string;
  let fetchEnd: string;
  if (vue === "semaine") {
    fetchStart = semaineStart;
    fetchEnd = dateAddDays(semaineStart, 6);
  } else if (vue === "jour") {
    fetchStart = date;
    fetchEnd = date;
  } else {
    fetchStart = `${mois}-01`;
    fetchEnd = `${mois}-${String(lastDay).padStart(2, "0")}`;
  }

  const { data: rdvView } = await supabaseAdmin
    .from("piloto_rendezvous")
    .select("*")
    .gte("date", fetchStart)
    .lte("date", fetchEnd)
    .order("heure_debut");

  // RDV des 7 prochains jours (depuis aujourd'hui)
  const todayPlus7 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const { data: rdvUpcoming } = await supabaseAdmin
    .from("piloto_rendezvous")
    .select("*")
    .gte("date", today)
    .lte("date", todayPlus7)
    .order("date")
    .order("heure_debut");

  // URL d'abonnement
  const headersList = await headers();
  const host = headersList.get("host") ?? "piloto.anthonychesnier.fr";
  const proto = host.includes("localhost") ? "http" : "https";
  const calUrl = `${proto}://${host}/api/calendar/${tokenRow.token}/piloto.ics`;

  const ACTIVITE_LABELS: Record<string, string> = {
    sos_ordi: "SOS Ordi",
    builder: "Builder",
    radio: "Radio",
    autre: "Autre",
  };

  const ACTIVITE_BADGE: Record<string, string> = {
    sos_ordi: "bg-blue-100 text-blue-700",
    builder: "bg-amber-100 text-amber-700",
    radio: "bg-emerald-100 text-emerald-700",
    autre: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <Breadcrumb
        items={[{ label: "Admin", href: "/admin" }, { label: "Agenda" }]}
      />

      <div className="flex items-center gap-3 mb-8">
        <div className="w-1 h-7 bg-rose-600 rounded-full shrink-0" />
        <Calendar size={20} className="text-rose-600" />
        <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
        <Link
          href={`/admin/agenda/nouveau`}
          className="ml-auto bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          + Nouveau RDV
        </Link>
      </div>

      {/* Calendrier (vue active) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
        <AgendaCalendar
          rendezVous={rdvView ?? []}
          vue={vue}
          mois={mois}
          date={date}
          semaineStart={semaineStart}
        />
      </div>

      {/* Prochains RDV (7 jours) */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-rose-300 rounded-full" />
          <h2 className="text-base font-semibold text-gray-800">
            Prochains rendez-vous
          </h2>
          <span className="text-xs text-gray-400">(7 jours)</span>
        </div>

        {!rdvUpcoming || rdvUpcoming.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-6 text-center">
            <p className="text-sm text-gray-400">
              Aucun rendez-vous dans les 7 prochains jours.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-rose-100 bg-rose-50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-rose-600">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-rose-600">
                    Horaire
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-rose-600">
                    Titre
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-rose-600 hidden sm:table-cell">
                    Activité
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rdvUpcoming.map((rdv) => {
                  const dateLabel = new Date(
                    rdv.date + "T00:00:00"
                  ).toLocaleDateString("fr-FR", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  });
                  const badge =
                    ACTIVITE_BADGE[rdv.activite] ?? ACTIVITE_BADGE.autre;
                  const label =
                    ACTIVITE_LABELS[rdv.activite] ?? "Autre";
                  return (
                    <tr
                      key={rdv.id}
                      className="hover:bg-rose-50/40 transition-colors"
                    >
                      <td className="px-5 py-3 text-gray-700 font-medium capitalize whitespace-nowrap">
                        {dateLabel}
                      </td>
                      <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                        {rdv.heure_debut.slice(0, 5)}
                        {rdv.heure_fin
                          ? ` – ${rdv.heure_fin.slice(0, 5)}`
                          : ""}
                      </td>
                      <td className="px-5 py-3">
                        <p className="font-medium text-gray-800">
                          {rdv.titre}
                        </p>
                        {rdv.client_nom && (
                          <p className="text-xs text-gray-400">
                            {rdv.client_nom}
                          </p>
                        )}
                        {rdv.adresse && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rdv.adresse)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 mt-0.5 transition-colors"
                          >
                            <MapPin size={11} />
                            {rdv.adresse}
                          </a>
                        )}
                      </td>
                      <td className="px-5 py-3 hidden sm:table-cell">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md ${badge}`}
                        >
                          {label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/agenda/${rdv.id}/modifier`}
                          className="text-gray-400 hover:text-rose-600 transition-colors"
                          title="Modifier"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Flux iCal */}
      <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-base font-semibold text-gray-800">
            Abonnement Calendrier (iCal)
          </h2>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Lien privé — ne pas partager. À ajouter dans Calendrier Apple via{" "}
          <em>Fichier → Nouvel abonnement à un calendrier</em>.
        </p>

        <div className="flex items-stretch gap-2 mb-4">
          <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-xs text-gray-600 break-all">
            {calUrl}
          </code>
          <CopyLinkButton url={calUrl} />
        </div>

        <RegenerateTokenButton />
      </section>
    </div>
  );
}
