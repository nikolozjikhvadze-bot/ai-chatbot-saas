import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";


const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 1. ჯერ ამოვიღოთ პროექტის მონაცემები bot_id-ის მისაღებად
    const { data: project } = await supabase
      .from('projects')
      .select('bot_id')
      .eq('id', id)
      .single();

    if (project?.bot_id) {
      // 2. წავშალოთ ბოტი ბაზიდან / Relay სერვისიდან
      await supabase.from('bots').delete().eq('id', project.bot_id);
    }

    // 3. წავშალოთ პროექტი
    const { error } = await supabase.from('projects').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'პროექტის წაშლა ვერ მოხერხდა' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'სერვერის შეცდომა' }, { status: 500 });
  }
}

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