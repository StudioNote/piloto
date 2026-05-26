import { type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { createClient } from "@/lib/supabase/server";
import { supabaseForEmail, DEMO_EMAIL, ADMIN_EMAIL } from "@/lib/getDb";
import { DevisPDF } from "@/components/admin/devis/DevisPDF";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email || (user.email !== ADMIN_EMAIL && user.email !== DEMO_EMAIL)) {
    return new Response("Non autorisé", { status: 401 });
  }

  // db proxy gère automatiquement le préfixe demo_ si besoin
  const db = supabaseForEmail(user.email);

  const [{ data: devis }, { data: lignes }, { data: par }] = await Promise.all([
    db.from("piloto_devis").select("*").eq("id", id).single(),
    db.from("piloto_devis_lignes").select("*").eq("devis_id", id).order("ordre"),
    db.from("piloto_parametres").select("*").eq("id", "singleton").single(),
  ]);

  if (!devis) return new Response("Devis introuvable", { status: 404 });

  const parExt = par as Record<string, unknown> | null;
  const prestataire = {
    raison_sociale: par?.raison_sociale ?? null,
    siret: par?.siret ?? null,
    adresse: par?.adresse ?? null,
    cp_ville: parExt?.cp_ville as string | null ?? null,
    telephone: par?.telephone ?? null,
    email: par?.email ?? null,
    site_web: parExt?.site_web as string | null ?? null,
    mentions: par?.mentions ?? null,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = React.createElement(DevisPDF, { devis, lignes: lignes ?? [], prestataire }) as any;
  const buffer = await renderToBuffer(element);
  const uint8 = new Uint8Array(buffer);

  return new Response(uint8, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${devis.numero}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
