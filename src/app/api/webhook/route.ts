import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-28.acacia' as any,
});

export async function POST(req: Request) {
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

        // თუ ბოტი ადრე უკვე არსებობდა (მაგ. მომხმარებელმა გააუქმა და
        // ხელახლა გამოიწერა), ხელახლა ვააქტიურებთ. თუ ბოტი ჯერ არ
        // შექმნილა (პირველი ატვირთვა ჯერ არ მომხდარა), ეს update
        // უბრალოდ 0 row-ს შეეხება — უვნებელია.
        await supabase.from('bots').update({ status: 'active' }).eq('owner_id', clerkId);
      }
      break;
    }

    // -----------------------------------------------------------------
    // გამოწერის გაუქმება (მომხმარებელმა გააუქმა, ან ბოლო გადახდაც
    // ჩაიშალა და Stripe-მა subscription საბოლოოდ დახურა)
    // -----------------------------------------------------------------
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = subscription.customer as string;

      const { data: user, error } = await supabase
        .from('users')
        .select('clerk_id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();

      if (error) {
        console.error('[stripe-webhook] user lookup failed', error);
        break;
      }

      if (user?.clerk_id) {
        await supabase.from('users').update({ is_paid: false }).eq('clerk_id', user.clerk_id);
        await supabase.from('bots').update({ status: 'suspended' }).eq('owner_id', user.clerk_id);
      }
      break;
    }

    // -----------------------------------------------------------------
    // გადახდის ჩავარდნა (ბარათი უარყოფილია და ა.შ.) — subscription ჯერ
    // არ დახურულა (Stripe-ს retry-ლოგიკა ჯერ ცდის), მაგრამ ღირს
    // მომხმარებელს ბოტი დროებით შევუჩეროთ, სანამ გადაწყდება.
    // -----------------------------------------------------------------
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      const { data: user } = await supabase
        .from('users')
        .select('clerk_id')
        .eq('stripe_customer_id', customerId)
        .maybeSingle();

      if (user?.clerk_id) {
        await supabase.from('bots').update({ status: 'suspended' }).eq('owner_id', user.clerk_id);
      }
      break;
    }

    default:
      // სხვა ივენთები (invoice.paid, customer.updated და ა.შ.) — არ გვჭირდება.
      break;
  }

  return NextResponse.json({ received: true });
}