"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseForEmail, DEMO_EMAIL, ADMIN_EMAIL, getUserEmail, isDemoUser } from "@/lib/getDb";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type LigneInput = {
  catalogue_id?: string | null;
  libelle: string;
  description?: string;
  quantite: number;
  prix_unitaire_ht: number;
  total_ligne: number;
  ordre: number;
};

async function assertAdmin() {
  const email = await getUserEmail();
  if (email !== ADMIN_EMAIL && email !== DEMO_EMAIL) throw new Error("Non autorisé");
  return { db: supabaseForEmail(email), isDemo: isDemoUser(email) };
}

export async function creerDevis(formData: FormData): Promise<{ id?: string; error?: string }> {
  const email = await getUserEmail();
  if (email !== ADMIN_EMAIL && email !== DEMO_EMAIL) return { error: "Non autorisé" };

  const isDemo = isDemoUser(email);
  const rpcName = isDemo ? "next_demo_piloto_devis_numero" : "next_piloto_devis_numero";
  const { data: numero, error: rpcError } = await supabaseAdmin.rpc(rpcName);
  if (rpcError || !numero) return { error: rpcError?.message ?? "Erreur numérotation" };

  const db = supabaseForEmail(email);
  const lignes: LigneInput[] = JSON.parse((formData.get("lignes_json") as string) || "[]");
  const remise = parseFloat((formData.get("remise_montant") as string) || "0") || 0;
  const totalLignes = lignes.reduce((s, l) => s + l.total_ligne, 0);
  const total_ht = Math.max(0, totalLignes - remise);

  const { data: devis, error: devisError } = await db
    .from("piloto_devis")
    .insert({
      numero,
      date_emission: (formData.get("date_emission") as string) || new Date().toISOString().slice(0, 10),
      date_validite: (formData.get("date_validite") as string) || "",
      client_nom: (formData.get("client_nom") as string)?.trim() || null,
      client_adresse: (formData.get("client_adresse") as string)?.trim() || null,
      client_cp_ville: (formData.get("client_cp_ville") as string)?.trim() || null,
      client_tel: (formData.get("client_tel") as string)?.trim() || null,
      client_email: (formData.get("client_email") as string)?.trim() || null,
      objet: (formData.get("objet") as string)?.trim() || null,
      statut: "brouillon",
      remise_libelle: (formData.get("remise_libelle") as string)?.trim() || null,
      remise_montant: remise,
      notes: (formData.get("notes") as string)?.trim() || null,
      total_ht,
      prospect_id: (formData.get("prospect_id") as string) || null,
      builder_client_id: (formData.get("builder_client_id") as string) || null,
    })
    .select("id")
    .single();

  if (devisError || !devis) return { error: devisError?.message ?? "Erreur création" };

  if (lignes.length > 0) {
    await db.from("piloto_devis_lignes").insert(
      lignes.map((l, i) => ({ ...l, devis_id: devis.id, ordre: l.ordre ?? i }))
    );
  }

  revalidatePath("/admin/devis");
  return { id: devis.id };
}

export async function mettreAJourDevis(id: string, formData: FormData): Promise<{ error?: string }> {
  const { db } = await assertAdmin();
  const lignes: LigneInput[] = JSON.parse((formData.get("lignes_json") as string) || "[]");
  const remise = parseFloat((formData.get("remise_montant") as string) || "0") || 0;
  const totalLignes = lignes.reduce((s, l) => s + l.total_ligne, 0);
  const total_ht = Math.max(0, totalLignes - remise);

  const { error } = await db.from("piloto_devis").update({
    date_emission: formData.get("date_emission") as string,
    date_validite: formData.get("date_validite") as string,
    client_nom: (formData.get("client_nom") as string)?.trim() || null,
    client_adresse: (formData.get("client_adresse") as string)?.trim() || null,
    client_cp_ville: (formData.get("client_cp_ville") as string)?.trim() || null,
    client_tel: (formData.get("client_tel") as string)?.trim() || null,
    client_email: (formData.get("client_email") as string)?.trim() || null,
    objet: (formData.get("objet") as string)?.trim() || null,
    statut: (formData.get("statut") as string) || "brouillon",
    remise_libelle: (formData.get("remise_libelle") as string)?.trim() || null,
    remise_montant: remise,
    notes: (formData.get("notes") as string)?.trim() || null,
    total_ht,
    prospect_id: (formData.get("prospect_id") as string) || null,
    builder_client_id: (formData.get("builder_client_id") as string) || null,
    updated_at: new Date().toISOString(),
  }).eq("id", id);

  if (error) return { error: error.message };

  await db.from("piloto_devis_lignes").delete().eq("devis_id", id);
  if (lignes.length > 0) {
    await db.from("piloto_devis_lignes").insert(
      lignes.map((l, i) => ({ ...l, devis_id: id, ordre: l.ordre ?? i }))
    );
  }

  revalidatePath("/admin/devis");
  revalidatePath(`/admin/devis/${id}`);
  return {};
}

export async function changerStatutDevis(id: string, statut: string) {
  const { db } = await assertAdmin();
  await db.from("piloto_devis").update({ statut, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/devis");
  revalidatePath(`/admin/devis/${id}`);
}

export async function supprimerDevis(id: string) {
  const { db } = await assertAdmin();
  await db.from("piloto_devis").delete().eq("id", id);
  revalidatePath("/admin/devis");
  redirect("/admin/devis");
}
