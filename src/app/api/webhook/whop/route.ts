import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("LOG - Whop webhook received:", JSON.stringify(body, null, 2));

    if (
      body.action === 'payment.succeeded' || 
      body.action === 'membership.go_live' ||
      body.action === 'subscription.renewed'
    ) {
      const customerEmail = body.data?.customer_email || body.data?.user?.email;
      
      const productName = (
        body.data?.product?.name || 
        body.data?.pass?.name || 
        body.data?.plan?.name || 
        ""
      ).toLowerCase();

      let assignedPlan = 'starter';
      if (productName.includes('scale')) {
        assignedPlan = 'scale';
      } else if (productName.includes('pro')) {
        assignedPlan = 'pro';
      } else if (productName.includes('starter')) {
        assignedPlan = 'starter';
      }

      if (customerEmail) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            is_paid: true, 
            plan: assignedPlan 
          })
          .eq('email', customerEmail);

        if (updateError) {
          console.error("LOG - Supabase webhook update error:", updateError);
          return NextResponse.json({ error: 'db_update_failed' }, { status: 500 });
        }

        console.log(`LOG - User ${customerEmail} upgraded to plan: ${assignedPlan} via Whop!`);
      }
    } 
    else if (body.action === 'membership.went_terminated' || body.action === 'payment.failed') {
      const customerEmail = body.data?.customer_email || body.data?.user?.email;
      if (customerEmail) {
        await supabase
          .from('users')
          .update({ 
            is_paid: false, 
            plan: 'free' 
          })
          .eq('email', customerEmail);
        console.log(`LOG - User ${customerEmail} subscription terminated.`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("LOG - Whop webhook catch error:", err);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}