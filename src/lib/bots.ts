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

export class LimitExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LimitExceededError";
  }
}

/** users ცხრილიდან წამოღება/შექმნა პაკეტის (plan) და სტატუსის გათვალისწინებით. */
async function getUserDetails(clerkUserId: string): Promise<{ dbUserId: string; isPaid: boolean; plan: string } | null> {
  const { data: userByClerk } = await supabaseAdmin
    .from("users")
    .select("id, is_paid, plan")
    .ilike("clerk_id", clerkUserId)
    .maybeSingle();

  if (userByClerk) {
    return { 
      dbUserId: userByClerk.id, 
      isPaid: Boolean(userByClerk.is_paid), 
      plan: userByClerk.plan || 'free' 
    };
  }

  const clerkUser = await currentUser();
  const primaryEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;

  if (primaryEmail) {
    const { data: userByEmail } = await supabaseAdmin
      .from("users")
      .select("id, is_paid, plan, clerk_id")
      .ilike("email", primaryEmail)
      .maybeSingle();

    if (userByEmail) {
      if (!userByEmail.clerk_id) {
        await supabaseAdmin.from("users").update({ clerk_id: clerkUserId }).eq("id", userByEmail.id);
      }
      return { 
        dbUserId: userByEmail.id, 
        isPaid: Boolean(userByEmail.is_paid), 
        plan: userByEmail.plan || 'free' 
      };
    }
  }

  const { data: newUser, error: createErr } = await supabaseAdmin
    .from("users")
    .insert({ 
      clerk_id: clerkUserId, 
      email: primaryEmail || `${clerkUserId}@placeholder.com`, 
      is_paid: false,
      plan: 'free'
    })
    .select("id, is_paid, plan")
    .single();

  if (createErr || !newUser) return null;
  return { 
    dbUserId: newUser.id, 
    isPaid: Boolean(newUser.is_paid), 
    plan: newUser.plan || 'free' 
  };
}

/** ამოწმებს paywall-ს და პაკეტის ლიმიტებს ახალი ბოტის შექმნამდე. */
export async function requirePaidDbUserId(clerkUserId: string): Promise<string> {
  const details = await getUserDetails(clerkUserId);
  if (!details) throw new Error("მომხმარებელი users ბაზაში ვერ მოიძებნა და ვერც შეიქმნა.");
  if (!details.isPaid) throw new NotPaidError();
  
  // აქ ვამოწმებთ უკვე რამდენი ბოტი აქვს შექმნილი მომხმარებელს
  const { count, error: countError } = await supabaseAdmin
    .from("bots")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", details.dbUserId);

  if (countError) {
    throw new Error("ბოტების რაოდენობის შემოწმება ვერ მოხერხდა.");
  }

  const currentBotsCount = count || 0;

  // ვამოწმებთ ლიმიტებს პაკეტების მიხედვით:
  // - starter: მაქსიმუმ 1 ბოტი
  // - pro: მაქსიმუმ 3 ბოტი
  // - scale: ულიმიტო
  if (details.plan === 'starter' && currentBotsCount >= 1) {
    throw new LimitExceededError("თქვენი Starter პაკეტი იძლევა მხოლოდ 1 ბოტის შექმნის უფლებას.");
  }
  if (details.plan === 'pro' && currentBotsCount >= 3) {
    throw new LimitExceededError("თქვენი Pro პაკეტი იძლევა მაქსიმუმ 3 ბოტის შექმნის უფლებას.");
  }

  return details.dbUserId;
}

/** ქმნის ახალ ბოტს პროექტისთვის, თუ ლიმიტი არ არის დარღვეული. */
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