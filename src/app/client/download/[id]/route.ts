import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  // La RLS garantit que le document appartient bien à ce client
  const { data: doc } = await supabase
    .from("piloto_documents")
    .select("url_storage, nom_fichier")
    .eq("id", id)
    .single();

  if (!doc) {
    return new NextResponse("Document non trouvé.", { status: 404 });
  }

  // URL signée valide 60 secondes (via service role, hors RLS storage)
  const { data: signed } = await supabaseAdmin.storage
    .from("piloto-documents")
    .createSignedUrl(doc.url_storage, 60, {
      download: doc.nom_fichier,
    });

  if (!signed) {
    return new NextResponse("Erreur lors de la génération du lien.", { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
