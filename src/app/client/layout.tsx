import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Home } from "lucide-react";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
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
    <div className="min-h-screen bg-sos-bg flex flex-col">
      <header className="bg-white border-b border-sos-border px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Image
            src="/logo-sosordipf.png"
            alt="SOS ORDI Pays Fouesnantais"
            width={210}
            height={48}
            className="h-12 w-auto"
            priority
          />
          <div className="flex items-center gap-4">
            <a
              href="https://sosordipf.fr"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-sos-primary border border-sos-primary hover:bg-sos-primary hover:text-white transition-colors"
            >
              <Home size={18} />
              Retour au site
            </a>
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors px-2 py-2"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t border-sos-border bg-white py-5 px-6">
        <p className="text-center text-sm text-gray-400">
          SOS ORDI Pays Fouesnantais — Assistance informatique à domicile — 06 85 65 74 65
        </p>
      </footer>
    </div>
  );
}
