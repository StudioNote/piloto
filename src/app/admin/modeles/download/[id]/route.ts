import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getDb } from "@/lib/getDb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const db = await getDb();
  const { data: modele } = await db
    .from("piloto_modeles")
    .select("url_storage, nom")
    .eq("id", id)
    .single();

  if (!modele) return new NextResponse("Modèle non trouvé.", { status: 404 });

  const { data: signed } = await supabaseAdmin.storage
    .from("piloto-modeles")
    .createSignedUrl(modele.url_storage, 60, { download: modele.nom });

  if (!signed) return new NextResponse("Erreur lors de la génération du lien.", { status: 500 });

  return NextResponse.redirect(signed.signedUrl);
}
