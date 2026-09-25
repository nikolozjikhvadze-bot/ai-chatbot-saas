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

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const clerkId = session.metadata?.clerkId;

    if (clerkId) {
      // ვამოწმებთ არსებობს თუ არა მომხმარებელი, თუ არა - ვქმნით, თუ კი - ვუახლებთ სტატუსს
      await supabase.from('users').upsert({
        clerk_id: clerkId,
        is_paid: true,
        stripe_customer_id: session.customer as string,
        subscription_id: session.subscription as string,
      }, { onConflict: 'clerk_id' });
    }
  }

  return NextResponse.json({ received: true });
}