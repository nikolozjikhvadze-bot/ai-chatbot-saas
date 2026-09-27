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

  const { data, error } = await supabaseAdmin
    .from("projects")
    .select("id, title, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, projects: data });
}