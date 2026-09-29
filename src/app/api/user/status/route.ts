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

    if (!userId) {
      return NextResponse.json({ isPaid: false }, { status: 401 });
    }

    const rateLimit = await checkRateLimits([
      { policy: 'authenticatedRead', key: userId },
    ]);
    if (!rateLimit.success) return rateLimitResponse(rateLimit.retryAfter);

    const { data, error } = await supabase
      .from('users')
      .select('is_paid')
      .eq('clerk_id', userId)
      .maybeSingle(); // .single()-ის ნაცვლად ვიყენებთ maybeSingle()-ს

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ isPaid: false });
    }

    if (!data) {
      return NextResponse.json({ isPaid: false });
    }

    return NextResponse.json({ isPaid: !!data.is_paid });
  } catch (err) {
    console.error('Status check catch error:', err);
    return NextResponse.json({ isPaid: false });
  }
}