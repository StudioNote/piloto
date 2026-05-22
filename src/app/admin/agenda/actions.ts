"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
}

export async function creerRendezVous(formData: FormData) {
  await requireAdmin();

  const date = formData.get("date") as string;
  const heureDebut = formData.get("heure_debut") as string;
  const heureFin = (formData.get("heure_fin") as string) || null;

  const { error } = await supabaseAdmin.from("piloto_rendezvous").insert({
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
  redirect(`/admin/agenda?mois=${mois}`);
}

export async function modifierRendezVous(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const date = formData.get("date") as string;

  const { error } = await supabaseAdmin
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
  redirect(`/admin/agenda?mois=${mois}`);
}

export async function supprimerRendezVous(formData: FormData) {
  await requireAdmin();

  const id = formData.get("id") as string;
  const mois = formData.get("mois") as string;

  await supabaseAdmin.from("piloto_rendezvous").delete().eq("id", id);

  redirect(`/admin/agenda?mois=${mois}`);
}

export async function regenererTokenCal() {
  await requireAdmin();

  const token = randomBytes(32).toString("hex");

  await supabaseAdmin.from("piloto_calendar_token").upsert({
    id: "singleton",
    token,
    updated_at: new Date().toISOString(),
  });

  redirect("/admin/agenda");
}
