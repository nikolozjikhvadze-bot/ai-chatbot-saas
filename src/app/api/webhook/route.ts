import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { 
    auth: { 
      persistSession: false, 
      autoRefreshToken: false 
    } 
  }
);

export async function GET() {
  try {
    const { userId } = await auth();
    console.log("LOG - Current Clerk userId from auth():", userId);

    if (!userId) {
      return NextResponse.json({ isPaid: false }, { status: 401 });
    }

    // 1. ვცდილობთ მოვძებნოთ მომხმარებელი ბაზაში
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .maybeSingle();

    console.log("LOG - Supabase query result data:", data);
    console.log("LOG - Supabase query error:", error);

    if (error) {
      console.error("LOG - Database select error:", error);
      return NextResponse.json({ isPaid: false, error: 'db_error' }, { status: 500 });
    }

    // თუ მომხმარებელი უკვე არსებობს, ვაბრუნებთ მის სტატუსს
    if (data) {
      return NextResponse.json({ isPaid: !!data.is_paid });
    }

    // 2. თუ მომხმარებელი არ არსებობს, ვქმნით ავტომატურად upsert-ით
    const { error: upsertError } = await supabase
      .from('users')
      .upsert(
        { 
          clerk_id: userId, 
          is_paid: false 
        },
        { 
          onConflict: 'clerk_id', 
          ignoreDuplicates: true 
        }
      );

    if (upsertError) {
      console.error("LOG - Database upsert error:", upsertError);
      return NextResponse.json({ isPaid: false, error: 'db_error' }, { status: 500 });
    }

    console.log("LOG - New user automatically created in Supabase with clerk_id:", userId);
    return NextResponse.json({ isPaid: false });

  } catch (err) {
    console.error("LOG - Catch error:", err);
    return NextResponse.json({ isPaid: false }, { status: 500 });
  }
}