"use server";

import { createClient } from "@/lib/supabase/server";
import { supabaseForEmail, DEMO_EMAIL } from "@/lib/getDb";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";

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

export async function creerRendezVous(formData: FormData) {
  const db = await assertAdmin();

  const date = formData.get("date") as string;
  const heureDebut = formData.get("heure_debut") as string;
  const heureFin = (formData.get("heure_fin") as string) || null;

  const { error } = await db.from("piloto_rendezvous").insert({
    titre: formData.get("titre") as string,
    activite: formData.get("activite") as string,
    client_nom: (formData.get("client_nom") as string) || null,
    adresse: (formData.get("adresse") as string) || null,
    date,
    heure_debut: heureDebut,
    heure_fin: heureFin || null,
    description: (formData.get("description") as string) || null,
  });

  if (error) throw new Error(error.message);

  const mois = date.slice(0, 7);
  revalidatePath("/admin/agenda");
  redirect(`/admin/agenda?mois=${mois}`);
}

export async function modifierRendezVous(formData: FormData) {
  const db = await assertAdmin();

  const id = formData.get("id") as string;
  const date = formData.get("date") as string;

  const { error } = await db
    .from("piloto_rendezvous")
    .update({
      titre: formData.get("titre") as string,
      activite: formData.get("activite") as string,
      client_nom: (formData.get("client_nom") as string) || null,
      adresse: (formData.get("adresse") as string) || null,
      date,
      heure_debut: formData.get("heure_debut") as string,
      heure_fin: (formData.get("heure_fin") as string) || null,
      description: (formData.get("description") as string) || null,
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  const mois = date.slice(0, 7);
  revalidatePath("/admin/agenda");
  redirect(`/admin/agenda?mois=${mois}`);
}

export async function supprimerRendezVous(formData: FormData) {
  const db = await assertAdmin();

  const id = formData.get("id") as string;
  const mois = formData.get("mois") as string;

  await db.from("piloto_rendezvous").delete().eq("id", id);

  revalidatePath("/admin/agenda");
  redirect(`/admin/agenda?mois=${mois}`);
}

export async function regenererTokenCal() {
  const db = await assertAdmin();

  const token = randomBytes(32).toString("hex");

  await db.from("piloto_calendar_token").upsert({
    id: "singleton",
    token,
  });

  revalidatePath("/admin/agenda");
  redirect("/admin/agenda");
}
