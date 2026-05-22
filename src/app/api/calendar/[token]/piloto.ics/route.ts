import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface RendezVous {
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

function escapeICS(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

function formatICSDateTime(date: string, time: string): string {
  const dateStr = date.replace(/-/g, "");
  const timeStr = time.replace(/:/g, "").slice(0, 6).padEnd(6, "0");
  return `${dateStr}T${timeStr}`;
}

function addOneHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${String((h + 1) % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

function generateICS(rdvList: RendezVous[]): string {
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\..+/, "") + "Z";

  const events = rdvList
    .map((rdv) => {
      const heureFinEffective = rdv.heure_fin ?? addOneHour(rdv.heure_debut);
      const dtstart = formatICSDateTime(rdv.date, rdv.heure_debut);
      const dtend = formatICSDateTime(rdv.date, heureFinEffective);

      const lines: string[] = [
        "BEGIN:VEVENT",
        `UID:piloto-rdv-${rdv.id}@piloto.anthonychesnier.fr`,
        `DTSTAMP:${now}`,
        `DTSTART;TZID=Europe/Paris:${dtstart}`,
        `DTEND;TZID=Europe/Paris:${dtend}`,
        `SUMMARY:${escapeICS(rdv.titre)}`,
      ];

      if (rdv.adresse) lines.push(`LOCATION:${escapeICS(rdv.adresse)}`);

      const descParts: string[] = [];
      if (rdv.client_nom) descParts.push(`Client : ${rdv.client_nom}`);
      if (rdv.description) descParts.push(rdv.description);
      if (descParts.length > 0) {
        lines.push(`DESCRIPTION:${escapeICS(descParts.join("\n"))}`);
      }

      lines.push("END:VEVENT");
      return lines.join("\r\n");
    })
    .join("\r\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Piloto//Agenda//FR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Agenda Piloto",
    "X-WR-TIMEZONE:Europe/Paris",
    events,
    "END:VCALENDAR",
  ].join("\r\n");
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  const { token } = params;

  const { data: tokenRow } = await supabaseAdmin
    .from("piloto_calendar_token")
    .select("token")
    .eq("id", "singleton")
    .single();

  if (!tokenRow || tokenRow.token !== token) {
    return new NextResponse("Non trouvé", { status: 404 });
  }

  const { data: rdvList } = await supabaseAdmin
    .from("piloto_rendezvous")
    .select("*")
    .order("date")
    .order("heure_debut");

  const icsContent = generateICS(rdvList ?? []);

  return new NextResponse(icsContent, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="piloto.ics"',
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
