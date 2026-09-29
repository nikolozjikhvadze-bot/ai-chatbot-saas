import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimits, rateLimitResponse } from '@/lib/rate-limits';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();
    console.log("LOG - Current Clerk userId from auth():", userId);

    if (!userId) {
      return NextResponse.json({ isPaid: false }, { status: 401 });
    }

    let { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .maybeSingle();

    console.log("LOG - Supabase query result data:", data);
    console.log("LOG - Supabase query error:", error);

    if (error) {
      console.error("LOG - Database select error:", error);
      return NextResponse.json({ isPaid: false });
    }

    // თუ მომხმარებელი არ არსებობს ბაზაში, ავტომატურად ვქმნით
    if (!data) {
      const { data: newData, error: insertError } = await supabase
        .from('users')
        .upsert(
          [
            {
              clerk_id: userId,
              is_paid: false,
            }
          ],
          { onConflict: 'clerk_id' }
        )
        .select()
        .single();

      if (insertError) {
        console.error("LOG - Database upsert error:", insertError);
        return NextResponse.json({ isPaid: false });
      }

      data = newData;
      console.log("LOG - New user automatically created in Supabase:", data);
    }

    if (!data) {
      return NextResponse.json({ isPaid: false });
    }

    return NextResponse.json({ isPaid: !!data.is_paid });
  } catch (err) {
    console.error("LOG - Catch error:", err);
    return NextResponse.json({ isPaid: false });
  }
}