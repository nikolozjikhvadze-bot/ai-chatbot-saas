import { createBrowserClient } from "@supabase/ssr";

/**
 * ბრაუზერის (Client Component) Supabase კლიენტი.
 * იყენებს anon/publishable გასაღებს — წვდომას RLS აკონტროლებს.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}