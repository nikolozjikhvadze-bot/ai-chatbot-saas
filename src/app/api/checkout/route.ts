import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'არ ხართ ავტორიზებული' }, { status: 401 });
    }

    const { billingCycle } = await req.json();

    const priceId = 
      billingCycle === 'yearly' 
        ? process.env.STRIPE_YEARLY_PRICE_ID 
        : process.env.STRIPE_MONTHLY_PRICE_ID;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
      metadata: { clerkId: userId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.log('Stripe Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}