import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_SYSTEM_PROMPT =
  "შენ ხარ დამხმარე ასისტენტი, რომელიც პასუხობს კითხვებს ამ საიტის შესახებ.";

export class NotPaidError extends Error {
  constructor() {
    super("მომხმარებელს არ აქვს აქტიური გამოწერა.");
    this.name = "NotPaidError";
  }
}

/** 
 * იღებს users ცხრილიდან Supabase-ის UUID-ს (id) clerk_id-ის მიხედვით.
 * თუ იუზერი არ არსებობს, ავტომატურად ქმნის მას.
 */
async function getUserDetails(clerkUserId: string): Promise<{ dbUserId: string; isPaid: boolean } | null> {
  // 1. ვეძებთ არსებულ ჩანაწერს users ცხრილში
  let { data } = await supabaseAdmin
    .from("users")
    .select("id, is_paid")
    .eq("clerk_id", clerkUserId)
    .maybeSingle();

  // 2. თუ users ცხრილში ჩანაწერი არ არის, ვქმნით ახალს
  if (!data) {
    const { data: newUser, error: createErr } = await supabaseAdmin
      .from("users")
      .insert({ clerk_id: clerkUserId, is_paid: true })
      .select("id, is_paid")
      .single();

    if (createErr || !newUser) {
      console.error("Failed to create user in DB:", createErr);
      return null;
    }
    data = newUser;
  }

  return {
    dbUserId: data.id,
    isPaid: Boolean(data.is_paid),
  };
}

/**
 * აბრუნებს Clerk userId-ზე მიბმულ bot-ის ჩანაწერს, ან ქმნის ახალს.
 */
export async function getOrCreateBotForUser(clerkUserId: string): Promise<string> {
  const userDetails = await getUserDetails(clerkUserId);

  if (!userDetails) {
    throw new Error("მომხმარებელი ბაზაში ვერ მოიძებნა და ვერც შეიქმნა.");
  }

  if (!userDetails.isPaid) {
    throw new NotPaidError();
  }

  const { dbUserId } = userDetails;

  // ვეძებთ ბოტს owner_id-ით
  const { data: existing, error: selectError } = await supabaseAdmin
    .from("bots")
    .select("id")
    .eq("owner_id", dbUserId)
    .maybeSingle();

  if (selectError) {
    throw new Error(`bots select failed: ${selectError.message}`);
  }
  if (existing) return existing.id;

  // ვქმნით ახალ ბოტს owner_id-ით და name-ით
  const { data: created, error: insertError } = await supabaseAdmin
    .from("bots")
    .insert({
      owner_id: dbUserId,
      name: "AI Assistant", // <-- ჩაემატა სავალდებულო name ველი
      system_prompt: DEFAULT_SYSTEM_PROMPT,
    })
    .select("id")
    .single();

  if (insertError || !created) {
    throw new Error(`bots insert failed: ${insertError?.message}`);
  }
  return created.id;
}