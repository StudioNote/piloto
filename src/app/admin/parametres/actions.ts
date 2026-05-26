"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseForEmail, DEMO_EMAIL } from "@/lib/getDb";
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
