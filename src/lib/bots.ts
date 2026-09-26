import { createClient } from "@supabase/supabase-js";
import { currentUser } from "@clerk/nextjs/server";

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
 * იღებს users ცხრილიდან Supabase-ის UUID-ს (id).
 * ჯერ ეძებს clerk_id-ით, თუ ვერ იპოვა — email-ით, ხოლო თუ არ არსებობს — ქმნის ახალს.
 */
async function getUserDetails(clerkUserId: string): Promise<{ dbUserId: string; isPaid: boolean } | null> {
  // 1. მეთოდი: ეძებს clerk_id-ით (case-insensitive)
  const { data: userByClerk } = await supabaseAdmin
    .from("users")
    .select("id, is_paid")
    .ilike("clerk_id", clerkUserId)
    .maybeSingle();

  if (userByClerk) {
    return {
      dbUserId: userByClerk.id,
      isPaid: Boolean(userByClerk.is_paid),
    };
  }

  // 2. მეთოდი: Clerk-იდან იღებს მომხმარებლის ელფოსტას და ეძებს email-ით
  const clerkUser = await currentUser();
  const primaryEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;

  if (primaryEmail) {
    const { data: userByEmail } = await supabaseAdmin
      .from("users")
      .select("id, is_paid, clerk_id")
      .ilike("email", primaryEmail)
      .maybeSingle();

    if (userByEmail) {
      // თუ email-ით იპოვა, განაახლებს clerk_id-ს, რომ შემდეგში სწრაფად იპოვოს
      if (!userByEmail.clerk_id) {
        await supabaseAdmin
          .from("users")
          .update({ clerk_id: clerkUserId })
          .eq("id", userByEmail.id);
      }

      return {
        dbUserId: userByEmail.id,
        isPaid: Boolean(userByEmail.is_paid),
      };
    }
  }

  // 3. მეთოდი: თუ ბაზაში საერთოდ არ არის, ქმნის ახალ იუზერს
  const { data: newUser, error: createErr } = await supabaseAdmin
    .from("users")
    .insert({ 
      clerk_id: clerkUserId, 
      email: primaryEmail || `${clerkUserId}@placeholder.com`,
      is_paid: true 
    })
    .select("id, is_paid")
    .single();

  if (createErr || !newUser) {
    console.error("Failed to create user in Supabase:", createErr);
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

  // 1. ვეძებთ არსებულ ბოტს
  const { data: existing, error: selectError } = await supabaseAdmin
    .from("bots")
    .select("id")
    .eq("owner_id", dbUserId)
    .maybeSingle();

  if (selectError) {
    throw new Error(`bots select failed: ${selectError.message}`);
  }
  if (existing) return existing.id;

  // 2. ვქმნით ახალ ბოტს
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