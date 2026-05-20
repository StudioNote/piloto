import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;

  const isAdminRoute = pathname.startsWith("/admin");
  const isClientRoute = pathname.startsWith("/client");
  const isLoginRoute = pathname === "/login";
  const isAuthCallback = pathname.startsWith("/auth");

  if (isAuthCallback) return supabaseResponse;

  if (!user) {
    if (isAdminRoute || isClientRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const isAdmin = user.email === ADMIN_EMAIL;

  if (isAdminRoute && !isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/client";
    return NextResponse.redirect(url);
  }

  if (isLoginRoute) {
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/admin" : "/client";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
