"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    const ADMIN_EMAILS = ["contact@anthonychesnier.fr", "demo@anthonychesnier.fr"];
    router.push(ADMIN_EMAILS.includes(email) ? "/admin" : "/client");
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-sos-bg px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image
            src="/logo-sosordipf.png"
            alt="SOS ORDI Pays Fouesnantais"
            width={280}
            height={64}
            priority
            className="h-16 w-auto"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-sos-border p-8">
          <h1 className="text-xl font-bold text-sos-text mb-1 text-center">
            Espace client
          </h1>
          <p className="text-sm text-gray-500 mb-8 text-center">
            Connectez-vous pour accéder à vos documents.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-base font-medium text-sos-text mb-2">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="vous@exemple.fr"
                className="w-full px-4 py-3 border border-sos-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-sos-primary focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-base font-medium text-sos-text mb-2">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-sos-border rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-sos-primary focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-base text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sos-btn hover:bg-sos-btn-hover disabled:opacity-50 text-white font-semibold py-4 px-4 rounded-xl text-base transition-colors"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          SOS ORDI Pays Fouesnantais — Assistance informatique à domicile — 06 85 65 74 65
        </p>
      </div>
    </main>
  );
}
