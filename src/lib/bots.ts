import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const DEFAULT_SYSTEM_PROMPT =
  "შენ ხარ დამხმარე ასისტენტი, რომელიც პასუხობს კითხვებს ამ საიტის შესახებ.";

export class NotPaidError extends Error {
  constructor() {
    super("მომხმარებელს არ აქვს აქტიური გამოწერა.");
    this.name = "NotPaidError";
  }
}

/** ამოწმებს `users.is_paid`-ს, იმავე ცხრილიდან რასაც /api/user/status კითხულობს. */
async function isPaidUser(clerkUserId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("is_paid")
    .eq("clerk_id", clerkUserId)
    .single();

  if (error || !data) return false;
  return Boolean(data.is_paid);
}

/**
 * აბრუნებს Clerk userId-ზე მიბმულ bot-ის ჩანაწერს, ან ქმნის ახალს, თუ ჯერ
 * არ არსებობს. აგდებს NotPaidError-ს, თუ მომხმარებელს გამოწერა არ აქვს —
 * ეს ერთადერთი ადგილია, სადაც botId "იბადება", ამიტომ ყველა paywall-შემოწმება
 * აქ, ცენტრალიზებულადაა, და არა თითოეულ route-ში ცალ-ცალკე.
 */
export async function getOrCreateBotForUser(userId: string): Promise<string> {
  const paid = await isPaidUser(userId);
  if (!paid) throw new NotPaidError();

  const { data: existing, error: selectError } = await supabaseAdmin
    .from("bots")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();

  if (selectError) {
    throw new Error(`bots select failed: ${selectError.message}`);
  }
  if (existing) return existing.id;

  const { data: created, error: insertError } = await supabaseAdmin
    .from("bots")
    .insert({
      owner_id: userId,
      status: "active",
      system_prompt: DEFAULT_SYSTEM_PROMPT,
    })
    .select("id")
    .single();

  if (insertError || !created) {
    throw new Error(`bots insert failed: ${insertError?.message}`);
  }
  return created.id;
}