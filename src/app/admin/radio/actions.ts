"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseForEmail, DEMO_EMAIL } from "@/lib/getDb";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const ADMIN_EMAIL = "contact@anthonychesnier.fr";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || (user.email !== ADMIN_EMAIL && user.email !== DEMO_EMAIL)) {
    throw new Error("Non autorisé");
  }
  return supabaseForEmail(user.email!);
}

export async function creerRadio(formData: FormData) {
  const db = await assertAdmin();
  const { error } = await db.from("piloto_radios").insert({
    nom_radio: formData.get("nom_radio") as string,
    nom_contact: (formData.get("nom_contact") as string) || null,
    telephone: (formData.get("telephone") as string) || null,
  });
  if (error) throw new Error(error.message);
  redirect("/admin/radio");
}

export async function modifierRadio(formData: FormData) {
  const db = await assertAdmin();
  const id = formData.get("id") as string;
  const { error } = await db
    .from("piloto_radios")
    .update({
      nom_radio: formData.get("nom_radio") as string,
      nom_contact: (formData.get("nom_contact") as string) || null,
      telephone: (formData.get("telephone") as string) || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/radio/${id}`);
  redirect(`/admin/radio/${id}`);
}
