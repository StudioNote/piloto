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

export async function creerClientBuilder(formData: FormData) {
  const supabase = await assertAdmin();
  const societe = (formData.get("societe") as string) || null;
  const nom = (formData.get("nom") as string) || null;
  const prenom = (formData.get("prenom") as string) || null;
  if (!societe && !nom) throw new Error("Renseignez au moins la société ou le nom.");
  const { error } = await supabase.from("piloto_builder_clients").insert({
    societe,
    nom,
    prenom,
    email: (formData.get("email") as string) || null,
    telephone: (formData.get("telephone") as string) || null,
    adresse: (formData.get("adresse") as string) || null,
  });
  if (error) throw new Error(error.message);
  redirect("/admin/builder");
}

export async function modifierClientBuilder(formData: FormData) {
  const supabase = await assertAdmin();
  const id = formData.get("id") as string;
  const societe = (formData.get("societe") as string) || null;
  const nom = (formData.get("nom") as string) || null;
  const prenom = (formData.get("prenom") as string) || null;
  if (!societe && !nom) throw new Error("Renseignez au moins la société ou le nom.");
  const { error } = await supabase
    .from("piloto_builder_clients")
    .update({
      societe,
      nom,
      prenom,
      email: (formData.get("email") as string) || null,
      telephone: (formData.get("telephone") as string) || null,
      adresse: (formData.get("adresse") as string) || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/builder");
  redirect(`/admin/builder/${id}`);
}

export async function creerPrestationBuilder(formData: FormData) {
  const supabase = await assertAdmin();
  const clientId = formData.get("client_id") as string;
  const montantRaw = formData.get("montant") as string;
  const { error } = await supabase.from("piloto_builder_prestations").insert({
    client_id: clientId,
    date: formData.get("date") as string,
    description: (formData.get("description") as string) || null,
    montant: montantRaw ? parseFloat(montantRaw) : null,
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/builder/${clientId}`);
  redirect(`/admin/builder/${clientId}`);
}
