import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';
import { checkRateLimits, getClientIp, rateLimitResponse } from '@/lib/rate-limits';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-28.acacia' as any,
});

/**
 * bots.owner_id ინახავს users.id-ს (Supabase UUID), არა Clerk userId-ს
 * პირდაპირ — ამიტომ ყოველ ჯერზე, სანამ bots-ს განვაახლებთ, jer
 * clerk_id-დან/customer_id-დან უნდა ვიპოვოთ შესაბამისი users.id.
 */
async function getDbUserIdByClerkId(clerkId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .maybeSingle();

  if (error || !data) return null;
  return data.id;
}

async function getDbUserIdByCustomerId(customerId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  if (error || !data) return null;
  return data.id;
}

export async function POST(req: Request) {
  const rateLimit = await checkRateLimits([
    { policy: 'stripeWebhookIp', key: getClientIp(req) },
  ]);
  if (!rateLimit.success) return rateLimitResponse(rateLimit.retryAfter);

  const body = await req.text();
  const signature = (await headers()).get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  switch (event.type) {
    // -----------------------------------------------------------------
    // გამოწერის დაწყება/გადახდის დადასტურება
    // -----------------------------------------------------------------
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const clerkId = session.metadata?.clerkId;

      if (clerkId) {
        await supabase.from('users').upsert(
          {
            clerk_id: clerkId,
            is_paid: true,
            stripe_customer_id: session.customer as string,
            subscription_id: session.subscription as string,
          },
          { onConflict: 'clerk_id' },
        );

        // ბოტის (თუ უკვე არსებობს) ხელახლა გააქტიურება — owner_id
        // ეძებება users.id-ის მიხედვით, არა clerkId-ით პირდაპირ.
        const dbUserId = await getDbUserIdByClerkId(clerkId);
        if (dbUserId) {
          await supabase.from('bots').update({ is_active: true }).eq('owner_id', dbUserId);
        }
      }
      break;
    }

    // -----------------------------------------------------------------
    // გამოწერის გაუქმება
    // -----------------------------------------------------------------
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: user, error } = await supabase
        .from('users')
        .select('id, clerk_id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();

      if (error) {
        console.error('[stripe-webhook] user lookup failed', error);
        break;
      }

      if (user?.clerk_id) {
        await supabase.from('users').update({ is_paid: false }).eq('clerk_id', user.clerk_id);
      }
      if (user?.id) {
        await supabase.from('bots').update({ is_active: false }).eq('owner_id', user.id);
      }
      break;
    }

    // -----------------------------------------------------------------
    // გადახდის ჩავარდნა — ბოტს დროებით ვაჩერებთ, subscription.deleted-ის
    // მოლოდინის გარეშე.
    // -----------------------------------------------------------------
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const dbUserId = await getDbUserIdByCustomerId(customerId);
      if (dbUserId) {
        await supabase.from('bots').update({ is_active: false }).eq('owner_id', dbUserId);
      }
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}