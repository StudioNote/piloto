import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface Document {
  id: string;
  nom_fichier: string;
  description: string | null;
  url_storage: string;
  created_at: string;
}

export default async function ClientPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: documents } = await supabase
    .from("piloto_documents")
    .select("id, nom_fichier, description, url_storage, created_at")
    .order("created_at", { ascending: false });

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Piloto</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes documents</h2>
        {!documents || documents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400">Aucun document disponible pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc: Document) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-800">{doc.nom_fichier}</p>
                  {doc.description && (
                    <p className="text-sm text-gray-500 mt-0.5">{doc.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(doc.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <a
                  href={doc.url_storage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Télécharger
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
