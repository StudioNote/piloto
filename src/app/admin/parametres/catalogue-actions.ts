"use server";

import { supabaseForEmail, DEMO_EMAIL, ADMIN_EMAIL, getUserEmail } from "@/lib/getDb";
import { revalidatePath } from "next/cache";

async function assertAdmin() {
  const email = await getUserEmail();
  if (email !== ADMIN_EMAIL && email !== DEMO_EMAIL) throw new Error("Non autorisé");
  return supabaseForEmail(email);
}

export async function ajouterCatalogueItem(formData: FormData) {
  const db = await assertAdmin();
  const { error } = await db.from("piloto_devis_catalogue").insert({
    libelle: (formData.get("libelle") as string).trim(),
    description: (formData.get("description") as string)?.trim() || null,
    prix_ht: parseFloat(formData.get("prix_ht") as string) || 0,
    categorie: (formData.get("categorie") as string) || "autre",
    ordre: parseInt(formData.get("ordre") as string) || 999,
    actif: true,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/parametres");
}

export async function modifierCatalogueItem(id: string, formData: FormData) {
  const db = await assertAdmin();
  const { error } = await db.from("piloto_devis_catalogue").update({
    libelle: (formData.get("libelle") as string).trim(),
    description: (formData.get("description") as string)?.trim() || null,
    prix_ht: parseFloat(formData.get("prix_ht") as string) || 0,
    categorie: (formData.get("categorie") as string) || "autre",
    ordre: parseInt(formData.get("ordre") as string) || 0,
  }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/parametres");
}

export async function toggleCatalogueItem(id: string, actif: boolean) {
  const db = await assertAdmin();
  const { error } = await db.from("piloto_devis_catalogue").update({ actif }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/parametres");
}

export async function monterCatalogueItem(id: string, ordreActuel: number) {
  const db = await assertAdmin();
  const { data: voisin } = await db
    .from("piloto_devis_catalogue")
    .select("id, ordre")
    .lt("ordre", ordreActuel)
    .order("ordre", { ascending: false })
    .limit(1)
    .single();
  if (!voisin) return;
  await db.from("piloto_devis_catalogue").update({ ordre: voisin.ordre }).eq("id", id);
  await db.from("piloto_devis_catalogue").update({ ordre: ordreActuel }).eq("id", voisin.id);
  revalidatePath("/admin/parametres");
}

export async function descendreCatalogueItem(id: string, ordreActuel: number) {
  const db = await assertAdmin();
  const { data: voisin } = await db
    .from("piloto_devis_catalogue")
    .select("id, ordre")
    .gt("ordre", ordreActuel)
    .order("ordre", { ascending: true })
    .limit(1)
    .single();
  if (!voisin) return;
  await db.from("piloto_devis_catalogue").update({ ordre: voisin.ordre }).eq("id", id);
  await db.from("piloto_devis_catalogue").update({ ordre: ordreActuel }).eq("id", voisin.id);
  revalidatePath("/admin/parametres");
}
