import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";

export default async function ClientPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: clientProfile }, { data: documents }] = await Promise.all([
    supabase
      .from("piloto_clients")
      .select("prenom, nom")
      .eq("auth_user_id", user.id)
      .single(),
    supabase
      .from("piloto_documents")
      .select("id, nom_fichier, description, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const prenom = clientProfile?.prenom ?? clientProfile?.nom ?? "vous";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Message d'accueil */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-sos-text mb-1">
          Bonjour {prenom},
        </h1>
        <p className="text-lg text-gray-500">voici vos documents</p>
      </div>

      {/* Liste des documents */}
      {!documents || documents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-sos-border p-12 text-center">
          <p className="text-lg text-gray-400">
            Aucun document pour le moment.
          </p>
          <p className="text-base text-gray-400 mt-2">
            Anthony déposera ici vos récapitulatifs et fiches dès qu&apos;ils seront disponibles.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-sos-border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
            >
              <div className="flex-1">
                <p className="text-lg font-semibold text-sos-text">{doc.nom_fichier}</p>
                {doc.description && (
                  <p className="text-base text-gray-500 mt-1">{doc.description}</p>
                )}
                <p className="text-sm text-gray-400 mt-2">
                  Déposé le{" "}
                  {new Date(doc.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <a
                href={`/client/download/${doc.id}`}
                className="flex items-center justify-center gap-2 bg-sos-btn hover:bg-sos-btn-hover text-white font-semibold px-6 py-4 rounded-xl text-base transition-colors shrink-0"
              >
                <Download size={20} />
                Télécharger
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
