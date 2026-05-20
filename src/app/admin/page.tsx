import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">Piloto — Admin</h1>
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
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Bienvenue sur Piloto</h2>
        <p className="text-gray-500">Tableau de bord administrateur — les modules arrivent bientôt.</p>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {["Clients", "Documents", "Paramètres"].map((module) => (
            <div
              key={module}
              className="bg-white rounded-xl border border-gray-100 p-6 opacity-50"
            >
              <p className="font-medium text-gray-700">{module}</p>
              <p className="text-xs text-gray-400 mt-1">Module à venir</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
