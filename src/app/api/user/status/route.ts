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

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .maybeSingle();

    console.log("LOG - Supabase query result data:", data);
    console.log("LOG - Supabase query error:", error);

    if (error || !data) {
      return NextResponse.json({ isPaid: false });
    }

    return NextResponse.json({ isPaid: !!data.is_paid });
  } catch (err) {
    console.error("LOG - Catch error:", err);
    return NextResponse.json({ isPaid: false });
  }
}