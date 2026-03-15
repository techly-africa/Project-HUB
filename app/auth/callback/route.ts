import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Accept users whose email domain matches a registered organization.
      // The handle_new_user trigger sets organization_id on the profile automatically;
      // a null organization_id means the domain isn't registered.
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id")
        .eq("id", data.user.id)
        .single();

      if (!profile?.organization_id) {
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=unauthorised`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=callback`);
}
