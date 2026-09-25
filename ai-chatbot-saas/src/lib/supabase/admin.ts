import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role კლიენტი: RLS-ს გვერდს უვლის.
 * გამოიყენე მხოლოდ სანდო სერვერულ კონტექსტში, სადაც მომხმარებლის სესია არ არსებობს:
 * ვიჯეტის /api/chat, channel webhooks (Telegram/Messenger), ფონური job-ები.
 * არასდროს import-ო Client Component-იდან ("server-only" ამას build-ზე დაბლოკავს).
 *
 * ყოველთვის თავად გადაამოწმე bot_id-ის კუთვნილება/გასაღები, რადგან RLS აქ არ გიცავს.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}