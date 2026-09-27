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

/** users ცხრილიდან წამოღება/შექმნა — იგივე ლოგიკა, რაც აქამდე გვქონდა. */
async function getUserDetails(clerkUserId: string): Promise<{ dbUserId: string; isPaid: boolean } | null> {
  const { data: userByClerk } = await supabaseAdmin
    .from("users")
    .select("id, is_paid")
    .ilike("clerk_id", clerkUserId)
    .maybeSingle();

  if (userByClerk) {
    return { dbUserId: userByClerk.id, isPaid: Boolean(userByClerk.is_paid) };
  }

  const clerkUser = await currentUser();
  const primaryEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;

  if (primaryEmail) {
    const { data: userByEmail } = await supabaseAdmin
      .from("users")
      .select("id, is_paid, clerk_id")
      .ilike("email", primaryEmail)
      .maybeSingle();

    if (userByEmail) {
      if (!userByEmail.clerk_id) {
        await supabaseAdmin.from("users").update({ clerk_id: clerkUserId }).eq("id", userByEmail.id);
      }
      return { dbUserId: userByEmail.id, isPaid: Boolean(userByEmail.is_paid) };
    }
  }

  const { data: newUser, error: createErr } = await supabaseAdmin
    .from("users")
    .insert({ clerk_id: clerkUserId, email: primaryEmail || `${clerkUserId}@placeholder.com`, is_paid: false })
    .select("id, is_paid")
    .single();

  if (createErr || !newUser) return null;
  return { dbUserId: newUser.id, isPaid: Boolean(newUser.is_paid) };
}

/** ამოწმებს paywall-ს და აბრუნებს users.id-ს — აგდებს NotPaidError-ს, თუ გადახდილი არ არის. */
export async function requirePaidDbUserId(clerkUserId: string): Promise<string> {
  const details = await getUserDetails(clerkUserId);
  if (!details) throw new Error("მომხმარებელი users ბაზაში ვერ მოიძებნა და ვერც შეიქმნა.");
  if (!details.isPaid) throw new NotPaidError();
  return details.dbUserId;
}

/**
 * ყოველთვის ქმნის ახალ ბოტს ერთი კონკრეტული პროექტისთვის — ბოტები აღარ
 * არის "ერთი მომხმარებელზე ერთი", რადგან თითოეულ პროექტს თავისი, ცალკე
 * ინგესტირებული ცოდნის ბაზა და ჩატბოტი სჭირდება.
 */
export async function createBotForProject(dbUserId: string, title: string): Promise<string> {
  const { data: created, error } = await supabaseAdmin
    .from("bots")
    .insert({
      owner_id: dbUserId,
      name: title,
      system_prompt: DEFAULT_SYSTEM_PROMPT,
    })
    .select("id")
    .single();

  if (error || !created) {
    throw new Error(`bots insert failed: ${error?.message}`);
  }
  return created.id;
}