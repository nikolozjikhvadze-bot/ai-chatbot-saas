import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimits, rateLimitResponse } from "@/lib/rate-limits";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET() {
  try {
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

    // 2. ვამოწმებთ და ვქაჩავთ იუზერის სტატუსს ზუსტად ისე, როგორც /api/user/status-შია
    let { data: userData, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("clerk_id", userId)
      .maybeSingle();

    if (userError) {
      console.error("LOG - Database select error in projects API:", userError);
    }

    // თუ ბაზაში არ ჰყავს, ვარეგისტრირებთ ავტომატურად (როგორც /api/user/status აკეთებს)
    if (!userData) {
      const clerkUser = await currentUser();
      const userEmail = clerkUser?.emailAddresses[0]?.emailAddress || null;

      const { data: newData, error: insertError } = await supabaseAdmin
        .from("users")
        .upsert(
          [
            {
              clerk_id: userId,
              email: userEmail,
              is_paid: false,
              plan: "free",
            },
          ],
          { onConflict: "clerk_id" }
        )
        .select()
        .single();

      if (!insertError && newData) {
        userData = newData;
      }
    }

    const isPaid = Boolean(userData?.is_paid);

    return NextResponse.json({ 
      success: true, 
      projects: projects || [], 
      isPaid: isPaid 
    });

  } catch (err: any) {
    console.error("LOG - Projects API Error:", err);
    return NextResponse.json({ error: err.message || "სერვერის შეცდომა" }, { status: 500 });
  }
}