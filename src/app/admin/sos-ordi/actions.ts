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

export async function creerClient(formData: FormData) {
  const supabase = await assertAdmin();
  const { error } = await supabase.from("piloto_clients").insert({
    civilite: (formData.get("civilite") as string) || null,
    nom: formData.get("nom") as string,
    prenom: formData.get("prenom") as string,
    email: formData.get("email") as string,
    telephone: (formData.get("telephone") as string) || null,
    adresse: (formData.get("adresse") as string) || null,
  });
  if (error) throw new Error(error.message);
  redirect("/admin/sos-ordi");
}

export async function modifierClient(formData: FormData) {
  const supabase = await assertAdmin();
  const id = formData.get("id") as string;
  const { error } = await supabase
    .from("piloto_clients")
    .update({
      civilite: (formData.get("civilite") as string) || null,
      nom: formData.get("nom") as string,
      prenom: formData.get("prenom") as string,
      email: formData.get("email") as string,
      telephone: (formData.get("telephone") as string) || null,
      adresse: (formData.get("adresse") as string) || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/sos-ordi");
  redirect(`/admin/sos-ordi/${id}`);
}

export async function modifierIntervention(formData: FormData) {
  const supabase = await assertAdmin();
  const id = formData.get("id") as string;
  const clientId = formData.get("client_id") as string;
  const dureeRaw = formData.get("duree_minutes") as string;
  const montantRaw = formData.get("montant") as string;
  const { error } = await supabase
    .from("piloto_interventions")
    .update({
      date: formData.get("date") as string,
      duree_minutes: dureeRaw ? parseInt(dureeRaw, 10) : null,
      description: (formData.get("description") as string) || null,
      statut: formData.get("statut") as string,
      montant: montantRaw ? parseFloat(montantRaw) : null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/sos-ordi/${clientId}`);
  redirect(`/admin/sos-ordi/${clientId}`);
}

export async function creerIntervention(formData: FormData) {
  const supabase = await assertAdmin();
  const clientId = formData.get("client_id") as string;
  const dureeRaw = formData.get("duree_minutes") as string;
  const montantRaw = formData.get("montant") as string;
  const { error } = await supabase.from("piloto_interventions").insert({
    client_id: clientId,
    date: formData.get("date") as string,
    duree_minutes: dureeRaw ? parseInt(dureeRaw, 10) : null,
    description: (formData.get("description") as string) || null,
    statut: formData.get("statut") as string,
    montant: montantRaw ? parseFloat(montantRaw) : null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/sos-ordi/${clientId}`);
  redirect(`/admin/sos-ordi/${clientId}`);
}
