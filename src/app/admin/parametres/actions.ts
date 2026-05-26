"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseForEmail, DEMO_EMAIL, getUserEmail, isDemoUser } from "@/lib/getDb";
import { redirect } from "next/navigation";
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

export async function changerMotDePasse(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || (user.email !== ADMIN_EMAIL && user.email !== DEMO_EMAIL)) {
    throw new Error("Non autorisé");
  }
  const mdp = (formData.get("mot_de_passe") as string) ?? "";
  const confirm = (formData.get("confirmation") as string) ?? "";

  if (mdp.length < 8) redirect("/admin/parametres?erreur_mdp=trop_court");
  if (mdp !== confirm) redirect("/admin/parametres?erreur_mdp=mismatch");

  const { error } = await supabase.auth.updateUser({ password: mdp });
  if (error) redirect(`/admin/parametres?erreur_mdp=${encodeURIComponent(error.message)}`);

  redirect("/admin/parametres?succes=mdp");
}

export async function sauvegarderInfos(formData: FormData) {
  const db = await assertAdmin();

  const { error } = await db.from("piloto_parametres").upsert({
    id: "singleton",
    raison_sociale: (formData.get("raison_sociale") as string) || null,
    siret: (formData.get("siret") as string) || null,
    adresse: (formData.get("adresse") as string) || null,
    cp_ville: (formData.get("cp_ville") as string) || null,
    telephone: (formData.get("telephone") as string) || null,
    email: (formData.get("email") as string) || null,
    site_web: (formData.get("site_web") as string) || null,
    mentions: (formData.get("mentions") as string) || null,
    updated_at: new Date().toISOString(),
  });

  if (error) redirect(`/admin/parametres?erreur_infos=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin/parametres");
  redirect("/admin/parametres?succes=infos");
}

export async function uploadLogo(formData: FormData): Promise<{ error?: string }> {
  const db = await assertAdmin();
  const email = await getUserEmail();
  if (isDemoUser(email)) return { error: "Upload non disponible en mode démonstration." };

  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) return { error: "Aucun fichier sélectionné." };
  if (!["image/png", "image/jpeg"].includes(file.type)) return { error: "PNG ou JPG uniquement." };
  if (file.size > 2 * 1024 * 1024) return { error: "Fichier trop lourd (2 Mo max)." };

  const { data: par } = await db
    .from("piloto_parametres")
    .select("logo_path")
    .eq("id", "singleton")
    .single();
  const oldPath = (par as { logo_path?: string | null } | null)?.logo_path ?? null;

  const ext = file.type === "image/png" ? "png" : "jpg";
  const newPath = `logos/logo_${Date.now()}.${ext}`;

  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await supabaseAdmin.storage
    .from("piloto-branding")
    .upload(newPath, bytes, { contentType: file.type, upsert: false });
  if (uploadError) return { error: uploadError.message };

  if (oldPath) {
    await supabaseAdmin.storage.from("piloto-branding").remove([oldPath]);
  }

  await db.from("piloto_parametres").upsert({
    id: "singleton",
    logo_path: newPath,
    updated_at: new Date().toISOString(),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/parametres");
  return {};
}

export async function supprimerLogo(): Promise<void> {
  const db = await assertAdmin();
  const email = await getUserEmail();
  if (isDemoUser(email)) return;

  const { data: par } = await db
    .from("piloto_parametres")
    .select("logo_path")
    .eq("id", "singleton")
    .single();
  const oldPath = (par as { logo_path?: string | null } | null)?.logo_path ?? null;

  if (oldPath) {
    await supabaseAdmin.storage.from("piloto-branding").remove([oldPath]);
  }

  await db.from("piloto_parametres").upsert({
    id: "singleton",
    logo_path: null,
    updated_at: new Date().toISOString(),
  });

  revalidatePath("/admin");
  revalidatePath("/admin/parametres");
}
