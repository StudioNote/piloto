"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseForEmail, DEMO_EMAIL, getUserEmail, isDemoUser } from "@/lib/getDb";
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

export async function creerClient(formData: FormData) {
  const db = await assertAdmin();
  const { error } = await db.from("piloto_clients").insert({
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
  const db = await assertAdmin();
  const id = formData.get("id") as string;
  const { error } = await db
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
  const db = await assertAdmin();
  const id = formData.get("id") as string;
  const clientId = formData.get("client_id") as string;
  const dureeRaw = formData.get("duree_minutes") as string;
  const montantRaw = formData.get("montant") as string;
  const { error } = await db
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
  const db = await assertAdmin();
  const clientId = formData.get("client_id") as string;
  const dureeRaw = formData.get("duree_minutes") as string;
  const montantRaw = formData.get("montant") as string;
  const { error } = await db.from("piloto_interventions").insert({
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

// ── Documents ─────────────────────────────────────────────────────────────────

export async function deposerDocument(
  prevState: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  await assertAdmin();
  const email = await getUserEmail();
  if (isDemoUser(email)) return { error: "Stockage non disponible en mode démonstration." };
  const file = formData.get("fichier") as File | null;
  const clientId = formData.get("client_id") as string;
  const description = (formData.get("description") as string) || null;

  if (!file || file.size === 0) return { error: "Aucun fichier sélectionné." };

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${clientId}/${Date.now()}_${safeName}`;

  const bytes = await file.arrayBuffer();
  const { error: uploadError } = await supabaseAdmin.storage
    .from("piloto-documents")
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (uploadError) return { error: uploadError.message };

  const { error: dbError } = await supabaseAdmin.from("piloto_documents").insert({
    client_id: clientId,
    nom_fichier: file.name,
    description,
    url_storage: path,
  });
  if (dbError) {
    await supabaseAdmin.storage.from("piloto-documents").remove([path]);
    return { error: dbError.message };
  }

  revalidatePath(`/admin/sos-ordi/${clientId}`);
  return {};
}

export async function supprimerDocument(formData: FormData) {
  await assertAdmin();
  const email = await getUserEmail();
  if (isDemoUser(email)) return;
  const id = formData.get("id") as string;
  const clientId = formData.get("client_id") as string;
  const path = formData.get("path") as string;

  await supabaseAdmin.storage.from("piloto-documents").remove([path]);
  await supabaseAdmin.from("piloto_documents").delete().eq("id", id);

  revalidatePath(`/admin/sos-ordi/${clientId}`);
}

// ── Accès espace client ───────────────────────────────────────────────────────

type AccessState = { password?: string; error?: string } | null;

function genTempPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function creerAccesClient(
  _prev: AccessState,
  formData: FormData
): Promise<AccessState> {
  await assertAdmin();
  const currentUserEmail = await getUserEmail();
  if (isDemoUser(currentUserEmail)) return { error: "Fonctionnalité non disponible en mode démonstration." };
  const clientId = formData.get("client_id") as string;
  const email = formData.get("email") as string;

  if (!email) return { error: "Email client manquant." };

  const tempPassword = genTempPassword();

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
  });
  if (error) return { error: error.message };

  const { error: updateError } = await supabaseAdmin
    .from("piloto_clients")
    .update({ auth_user_id: data.user.id })
    .eq("id", clientId);
  if (updateError) return { error: updateError.message };

  revalidatePath(`/admin/sos-ordi/${clientId}`);
  return { password: tempPassword };
}

export async function regenererMotDePasse(
  _prev: AccessState,
  formData: FormData
): Promise<AccessState> {
  await assertAdmin();
  const email = await getUserEmail();
  if (isDemoUser(email)) return { error: "Fonctionnalité non disponible en mode démonstration." };
  const authUserId = formData.get("auth_user_id") as string;
  const clientId = formData.get("client_id") as string;

  if (!authUserId) return { error: "Identifiant d'accès manquant." };

  const tempPassword = genTempPassword();

  const { error } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
    password: tempPassword,
  });
  if (error) return { error: error.message };

  revalidatePath(`/admin/sos-ordi/${clientId}`);
  return { password: tempPassword };
}
