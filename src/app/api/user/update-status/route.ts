import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkRateLimits, rateLimitResponse } from '@/lib/rate-limits';

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'არ ხართ ავტორიზებული' }, { status: 401 });
  }

  const rateLimit = await checkRateLimits([
    { policy: 'accountWrite', key: userId },
  ]);
  if (!rateLimit.success) return rateLimitResponse(rateLimit.retryAfter);

  return NextResponse.json(
    { error: 'Payment status is managed by verified Stripe webhooks.' },
    { status: 410 },
  );
}