import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";

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
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white border-b border-gray-100 shadow-sm px-6 flex items-stretch justify-between">
        <div className="flex items-stretch gap-0.5">
          <Link href="/admin" className="flex items-center text-lg font-bold text-gray-900 pr-5 mr-2">
            Piloto
          </Link>
          <AdminNav />
        </div>
        <div className="flex items-center gap-4 py-3.5">
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
