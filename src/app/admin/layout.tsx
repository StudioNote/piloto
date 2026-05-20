import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="text-lg font-bold text-gray-900">
            Piloto
          </Link>
          <Link
            href="/admin/sos-ordi"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            SOS Ordi
          </Link>
          <Link
            href="/admin/radio"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Radio
          </Link>
          <Link
            href="/admin/radio/remplacements"
            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            Remplacements
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{user.email}</span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              Déconnexion
            </button>
          </form>
        </div>
      </nav>
      {children}
    </div>
  );
}
