import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "საჭიროა ავტორიზაცია." }, { status: 401 });
    }

    const { id: projectId } = await context.params;

    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('user_id, bot_id')
      .eq('id', projectId)
      .single();

    if (!project) {
      return NextResponse.json({ error: "პროექტი ვერ მოიძებნა." }, { status: 404 });
    }

    if (project.user_id !== userId) {
      return NextResponse.json({ error: "წვდომა აკრძალულია." }, { status: 403 });
    }

    const { error: deleteProjectError } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (deleteProjectError) {
      return NextResponse.json(
        { error: 'პროექტის წაშლა ვერ მოხერხდა' },
        { status: 500 }
      );
    }

    if (project.bot_id) {
      await supabaseAdmin.from('bots').delete().eq('id', project.bot_id);
    }

    return NextResponse.json({ success: true, message: 'პროექტი წარმატებით წაიშალა' });
  } catch (err) {
    return NextResponse.json(
      { error: 'სერვერული შეცდომა წაშლისას' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "საჭიროა ავტორიზაცია." }, { status: 401 });
  }

  const { id } = await context.params;

  const { data: project, error } = await supabaseAdmin
    .from("projects")
    .select("id, title, ai_review, generated_code, bot_id, created_at, user_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !project) {
    return NextResponse.json({ error: "პროექტი ვერ მოიძებნა." }, { status: 404 });
  }

  if (project.user_id !== userId) {
    return NextResponse.json({ error: "წვდომა აკრძალულია." }, { status: 403 });
  }

  return NextResponse.json({ success: true, project });
}