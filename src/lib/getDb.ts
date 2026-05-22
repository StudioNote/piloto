import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const DEMO_EMAIL = "demo@anthonychesnier.fr";
export const ADMIN_EMAIL = "contact@anthonychesnier.fr";

export const getUserEmail = cache(async (): Promise<string> => {
  try {
    const client = await createClient();
    const { data: { user } } = await client.auth.getUser();
    return user?.email ?? "";
  } catch {
    return "";
  }
});

export function isDemoUser(email: string): boolean {
  return email === DEMO_EMAIL;
}

export function supabaseForEmail(email: string): typeof supabaseAdmin {
  if (email === DEMO_EMAIL) {
    return new Proxy(supabaseAdmin, {
      get(target, prop, receiver) {
        if (prop === "from") {
          return (table: string) => target.from(`demo_${table}`);
        }
        return Reflect.get(target, prop, receiver);
      },
    }) as typeof supabaseAdmin;
  }
  return supabaseAdmin;
}

export async function getDb(): Promise<typeof supabaseAdmin> {
  const email = await getUserEmail();
  return supabaseForEmail(email);
}
