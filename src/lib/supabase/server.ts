import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * სერვერის (Server Component / Route Handler / Server Action) Supabase კლიენტი.
 * მუშაობს შესული მომხმარებლის სესიით, ამიტომ RLS პოლიტიკები მოქმედებს:
 * მომხმარებელი მხოლოდ თავის ბოტებს ხედავს და ცვლის.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component-იდან cookie-ს დაწერა შეუძლებელია.
            // უპრობლემოა, თუ middleware/proxy სესიას აახლებს.
          }
        },
      },
    },
  );
}