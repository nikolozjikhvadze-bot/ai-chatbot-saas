import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { checkRateLimits, rateLimitResponse } from '@/lib/rate-limits';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'არ ხართ ავტორიზებული' }, { status: 401 });
    }

    const rateLimit = await checkRateLimits([
      { policy: 'checkoutHour', key: userId },
    ]);
    if (!rateLimit.success) return rateLimitResponse(rateLimit.retryAfter);

    const { billingCycle } = await req.json();

    // ფასები ლარებში (შეგიძლია შენი სურვილისამებრ შეცვალო)
    // მაგალითად: ყოველთვიური 10 ლარი, წლიური 100 ლარი
    const amount = billingCycle === 'yearly' ? 100 : 10; 

    const merchantId = process.env.FLITT_MERCHANT_ID;
    const secretKey = process.env.FLITT_SECRET_KEY;

    if (!merchantId || !secretKey) {
      return NextResponse.json({ error: 'Flitt credentials are missing' }, { status: 500 });
    }

    const orderId = `ORDER_${userId}_${Date.now()}`;
    const currency = 'GEL';
    const amountInTetri = amount * 100; // თანხა თეთრებში

    // Flitt-ის მოთხოვნის სტრუქტურა
    const payload = {
      merchant_id: Number(merchantId),
      order_id: orderId,
      amount: amountInTetri,
      currency: currency,
      description: `SaaS Pro Subscription (${billingCycle})`,
      result_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      server_callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/flitt`,
      user_id: userId,
    };

    // მოთხოვნა Flitt-ის სერვერზე გადახდის სესიის შესაქმნელად
    const response = await fetch('https://api.flitt.com/v1/checkout/invoice', { // შეამოწმე ზუსტი URL შენი Flitt დეშბორდიდან/დოკუმენტაციიდან
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secretKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || !data.redirect_url) {
      console.error('Flitt Error Response:', data);
      return NextResponse.json({ error: 'გადახდის ინიციალიზაცია ვერ მოხერხდა' }, { status: 500 });
    }

    return NextResponse.json({ url: data.redirect_url });
  } catch (error: any) {
    console.error('Flitt Checkout Error:', error);
    return NextResponse.json({ error: error.message || 'სერვერის შეცდომა' }, { status: 500 });
  }
}