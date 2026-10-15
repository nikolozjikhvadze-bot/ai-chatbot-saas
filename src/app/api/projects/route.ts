import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimits, rateLimitResponse } from "@/lib/rate-limits";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "საჭიროა ავტორიზაცია." }, { status: 401 });
  }

  const rateLimit = await checkRateLimits([
    { policy: "authenticatedRead", key: userId },
  ]);
  if (!rateLimit.success) return rateLimitResponse(rateLimit.retryAfter);

  // 1. იღებს მომხმარებლის პროექტების სიას
  const { data: projects, error: projectsError } = await supabaseAdmin
    .from("projects")
    .select("id, title, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (projectsError) {
    return NextResponse.json({ error: projectsError.message }, { status: 500 });
  }

  // 2. ამოწმებს მომხმარებლის გადახდის სტატუსს (users / profiles ცხრილიდან)
  const { data: userData, error: userError } = await supabaseAdmin
    .from("users") // ⚠️ თუ ცხრილს "profiles" ჰქვია, ჩაანაცვლე profiles-ით
    .select("is_paid, trial_ends_at")
    .eq("clerk_user_id", userId) // ⚠️ დარწმუნდი, რომ სვეტის სახელი სწორია (მაგ. user_id ან clerk_id)
    .maybeSingle();

  // ლოგიკა: გადახდილი აქვს თუ active trial აქვს?
  const isPaid = Boolean(
    userData?.is_paid || 
    (userData?.trial_ends_at && new Date(userData.trial_ends_at) > new Date())
  );

  return NextResponse.json({ 
    success: true, 
    projects: projects || [], 
    isPaid: isPaid 
  });
}