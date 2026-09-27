import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "საჭიროა ავტორიზაცია." }, { status: 401 });
  }
  const { id } = await params;

  const { data: project, error } = await supabaseAdmin
    .from("projects")
    .select("id, title, ai_review, generated_code, bot_id, created_at, user_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !project) {
    return NextResponse.json({ error: "პროექტი ვერ მოიძებნა." }, { status: 404 });
  }
  // მფლობელობის შემოწმება — RLS-ის ნაცვლად, service-role client-ით ხელით.
  if (project.user_id !== userId) {
    return NextResponse.json({ error: "წვდომა აკრძალულია." }, { status: 403 });
  }

  return NextResponse.json({ success: true, project });
}