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
 * თუ იუზერი არ არსებობს, ავტომატურად ქმნის მას users ცხრილში.
 */
async function getUserDetails(clerkUserId: string): Promise<{ dbUserId: string; isPaid: boolean } | null> {
  // 1. ვეძებთ არსებულ ჩანაწერს users ცხრილში
  const { data: existingUser, error: fetchErr } = await supabaseAdmin
    .from("users")
    .select("id, is_paid")
    .eq("clerk_id", clerkUserId)
    .maybeSingle();

  if (fetchErr) {
    console.error("Error fetching user:", fetchErr);
  }

  if (existingUser) {
    return {
      dbUserId: existingUser.id,
      isPaid: Boolean(existingUser.is_paid),
    };
  }

  // 2. თუ users ცხრილში ჩანაწერი არ არის, ვქმნით ახალ იუზერს
  const { data: newUser, error: createErr } = await supabaseAdmin
    .from("users")
    .insert({ 
      clerk_id: clerkUserId, 
      is_paid: true // დროებით გადახდილად ვნიშნავთ ტესტირებისთვის
    })
    .select("id, is_paid")
    .single();

  if (createErr || !newUser) {
    console.error("Failed to create user in users table:", createErr);
    return null;
  }

  return {
    dbUserId: newUser.id,
    isPaid: Boolean(newUser.is_paid),
  };
}

/**
 * აბრუნებს Clerk userId-ზე მიბმულ bot-ის ჩანაწერს, ან ქმნის ახალს.
 */
export async function getOrCreateBotForUser(clerkUserId: string): Promise<string> {
  const userDetails = await getUserDetails(clerkUserId);

  if (!userDetails) {
    throw new Error("მომხმარებელი users ბაზაში ვერ მოიძებნა და ვერც შეიქმნა.");
  }

  if (!userDetails.isPaid) {
    throw new NotPaidError();
  }

  const { dbUserId } = userDetails;

  // 1. ვეძებთ ბოტს owner_id-ით (რომელიც ზუსტად ემთხვევა users.id-ს)
  const { data: existing, error: selectError } = await supabaseAdmin
    .from("bots")
    .select("id")
    .eq("owner_id", dbUserId)
    .maybeSingle();

  if (selectError) {
    throw new Error(`bots select failed: ${selectError.message}`);
  }
  if (existing) return existing.id;

  // 2. ვქმნით ახალ ბოტს owner_id-ით
  const { data: created, error: insertError } = await supabaseAdmin
    .from("bots")
    .insert({
      owner_id: dbUserId,
      name: "AI Assistant",
      system_prompt: DEFAULT_SYSTEM_PROMPT,
    })
    .select("id")
    .single();

  if (insertError || !created) {
    throw new Error(`bots insert failed: ${insertError?.message}`);
  }

  return created.id;
}