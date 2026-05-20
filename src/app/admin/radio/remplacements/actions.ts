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

export async function creerRemplacement(formData: FormData) {
  const supabase = await assertAdmin();
  const radioId = (formData.get("radio_id") as string) || null;
  const { error } = await supabase.from("piloto_radio_remplacements").insert({
    radio_id: radioId,
    nom_radio: formData.get("nom_radio") as string,
    date_debut: formData.get("date_debut") as string,
    date_fin: formData.get("date_fin") as string,
    tranche_debut: formData.get("tranche_debut") as string,
    tranche_fin: formData.get("tranche_fin") as string,
    tarif_horaire: parseFloat(formData.get("tarif_horaire") as string),
    notes: (formData.get("notes") as string) || null,
  });
  if (error) throw new Error(error.message);
  redirect("/admin/radio/remplacements");
}

export async function supprimerRemplacement(id: string) {
  const supabase = await assertAdmin();
  await supabase.from("piloto_radio_remplacements").delete().eq("id", id);
  revalidatePath("/admin/radio/remplacements");
}
