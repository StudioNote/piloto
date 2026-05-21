import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";

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
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
            >
              Déconnexion
            </button>
          </form>
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
