"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseForEmail, DEMO_EMAIL, getUserEmail, isDemoUser } from "@/lib/getDb";
import { revalidatePath } from "next/cache";

const ADMIN_EMAIL = "contact@anthonychesnier.fr";

async function assertAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || (user.email !== ADMIN_EMAIL && user.email !== DEMO_EMAIL)) {
    throw new Error("Non autorisé");
  }
  return supabaseForEmail(user.email!);
}

export async function ajouterModele(
  _prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const db = await assertAdmin();
  const email = await getUserEmail();
  if (isDemoUser(email)) return { error: "Upload non disponible en mode démonstration." };

  const file = formData.get("fichier") as File | null;
  const nom = ((formData.get("nom") as string) ?? "").trim();
  const description = (formData.get("description") as string) || null;
  const categorie = (formData.get("categorie") as string) || null;

  if (!file || file.size === 0) return { error: "Aucun fichier sélectionné." };
  if (!nom) return { error: "Le nom est requis." };

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}_${safeName}`;

  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await supabaseAdmin.storage
    .from("piloto-modeles")
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (uploadError) return { error: uploadError.message };

  const { error: dbError } = await db.from("piloto_modeles").insert({
    nom,
    description,
    url_storage: path,
    categorie,
  });
  if (dbError) {
    await supabaseAdmin.storage.from("piloto-modeles").remove([path]);
    return { error: dbError.message };
  }

  revalidatePath("/admin/modeles");
  return {};
}

export async function supprimerModele(formData: FormData) {
  const db = await assertAdmin();
  const email = await getUserEmail();
  if (isDemoUser(email)) return;

  const id = formData.get("id") as string;
  const path = formData.get("path") as string;

  await supabaseAdmin.storage.from("piloto-modeles").remove([path]);
  await db.from("piloto_modeles").delete().eq("id", id);

  revalidatePath("/admin/modeles");
}
