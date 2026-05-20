"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const ADMIN_EMAIL = "contact@anthonychesnier.fr";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) throw new Error("Non autorisé");
  return supabase;
}

export async function creerRadio(formData: FormData) {
  const supabase = await assertAdmin();
  const jours = formData.getAll("jours_travailles") as string[];
  const { error } = await supabase.from("piloto_radios").insert({
    nom_radio: formData.get("nom_radio") as string,
    nom_contact: (formData.get("nom_contact") as string) || null,
    telephone: (formData.get("telephone") as string) || null,
    tranche_debut: formData.get("tranche_debut") as string,
    tranche_fin: formData.get("tranche_fin") as string,
    tarif_horaire: parseFloat(formData.get("tarif_horaire") as string),
    jours_travailles: jours,
  });
  if (error) throw new Error(error.message);
  redirect("/admin/radio");
}

export async function modifierRadio(formData: FormData) {
  const supabase = await assertAdmin();
  const id = formData.get("id") as string;
  const jours = formData.getAll("jours_travailles") as string[];
  const { error } = await supabase
    .from("piloto_radios")
    .update({
      nom_radio: formData.get("nom_radio") as string,
      nom_contact: (formData.get("nom_contact") as string) || null,
      telephone: (formData.get("telephone") as string) || null,
      tranche_debut: formData.get("tranche_debut") as string,
      tranche_fin: formData.get("tranche_fin") as string,
      tarif_horaire: parseFloat(formData.get("tarif_horaire") as string),
      jours_travailles: jours,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/radio/${id}`);
  redirect(`/admin/radio/${id}`);
}
