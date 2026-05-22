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

export async function creerProspect(formData: FormData) {
  const db = await assertAdmin();
  const societe = (formData.get("societe") as string) || null;
  const nom = (formData.get("nom") as string) || null;
  if (!societe && !nom) throw new Error("Renseignez au moins la société ou le nom.");
  const montantRaw = formData.get("montant_estime") as string;
  const { data, error } = await db
    .from("piloto_builder_prospects")
    .insert({
      societe,
      nom,
      prenom: (formData.get("prenom") as string) || null,
      email: (formData.get("email") as string) || null,
      telephone: (formData.get("telephone") as string) || null,
      adresse: (formData.get("adresse") as string) || null,
      source: (formData.get("source") as string) || null,
      besoin: (formData.get("besoin") as string) || null,
      notes: (formData.get("notes") as string) || null,
      montant_estime: montantRaw ? parseFloat(montantRaw) : null,
      statut: (formData.get("statut") as string) || "a_contacter",
      prochaine_action_date: (formData.get("prochaine_action_date") as string) || null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/prospects");
  redirect(`/admin/prospects/${data.id}`);
}

export async function modifierProspect(formData: FormData) {
  const db = await assertAdmin();
  const id = formData.get("id") as string;
  const societe = (formData.get("societe") as string) || null;
  const nom = (formData.get("nom") as string) || null;
  if (!societe && !nom) throw new Error("Renseignez au moins la société ou le nom.");
  const montantRaw = formData.get("montant_estime") as string;
  const { error } = await db
    .from("piloto_builder_prospects")
    .update({
      societe,
      nom,
      prenom: (formData.get("prenom") as string) || null,
      email: (formData.get("email") as string) || null,
      telephone: (formData.get("telephone") as string) || null,
      adresse: (formData.get("adresse") as string) || null,
      source: (formData.get("source") as string) || null,
      besoin: (formData.get("besoin") as string) || null,
      notes: (formData.get("notes") as string) || null,
      montant_estime: montantRaw ? parseFloat(montantRaw) : null,
      statut: formData.get("statut") as string,
      prochaine_action_date: (formData.get("prochaine_action_date") as string) || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/prospects");
  revalidatePath(`/admin/prospects/${id}`);
  redirect(`/admin/prospects/${id}`);
}

export async function supprimerProspect(id: string) {
  const db = await assertAdmin();
  const { error } = await db
    .from("piloto_builder_prospects")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/prospects");
  redirect("/admin/prospects");
}

export async function changerStatutProspect(id: string, statut: string) {
  const db = await assertAdmin();
  const { error } = await db
    .from("piloto_builder_prospects")
    .update({ statut })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/prospects");
  revalidatePath(`/admin/prospects/${id}`);
}

export async function convertirEnClient(prospectId: string) {
  const db = await assertAdmin();

  const { data: prospect, error: fetchError } = await db
    .from("piloto_builder_prospects")
    .select("*")
    .eq("id", prospectId)
    .single();

  if (fetchError || !prospect) throw new Error("Prospect introuvable");
  if (prospect.converted_client_id) {
    redirect(`/admin/builder/${prospect.converted_client_id}`);
  }

  const { data: client, error: clientError } = await db
    .from("piloto_builder_clients")
    .insert({
      societe: prospect.societe,
      nom: prospect.nom,
      prenom: prospect.prenom,
      email: prospect.email,
      telephone: prospect.telephone,
      adresse: prospect.adresse,
    })
    .select("id")
    .single();

  if (clientError) throw new Error(clientError.message);

  const { error: updateError } = await db
    .from("piloto_builder_prospects")
    .update({ statut: "gagne", converted_client_id: client.id })
    .eq("id", prospectId);

  if (updateError) throw new Error(updateError.message);

  revalidatePath("/admin/prospects");
  revalidatePath(`/admin/prospects/${prospectId}`);
  revalidatePath("/admin/builder");
  redirect(`/admin/builder/${client.id}`);
}
