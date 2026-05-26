import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { DemoBanner } from "@/components/admin/DemoBanner";
import { DEMO_EMAIL, supabaseForEmail } from "@/lib/getDb";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = supabaseForEmail(user.email!);
  const { data: par } = await db
    .from("piloto_parametres")
    .select("logo_path")
    .eq("id", "singleton")
    .single();
  const logoPath = (par as { logo_path?: string | null } | null)?.logo_path ?? null;
  const logoUrl = logoPath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/piloto-branding/${logoPath}`
    : null;

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
          <Link href="/admin" className="flex items-center pr-5 mr-2">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Logo"
                className="h-8 w-auto max-w-[140px] object-contain"
              />
            ) : (
              <span className="text-lg font-bold text-gray-900">Piloto</span>
            )}
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
      <DemoBanner isDemo={user.email === DEMO_EMAIL} />
      {children}
    </div>
  );
}
