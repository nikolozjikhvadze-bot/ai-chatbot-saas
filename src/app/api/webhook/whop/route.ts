import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase სერვისის ქლაიენტი ბაზაში ჩასაწერად
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
    console.log("LOG - Whop webhook received:", body);

    // ვამოწმებთ Whop-ის ივენთს (როცა გადახდა წარმატებულია)
    if (body.action === 'payment.succeeded' || body.action === 'membership.go_live') {
      const customerEmail = body.data?.customer_email || body.data?.user?.email;

      if (customerEmail) {
        // რადგან Whop-მა შეიძლება ელფოსტა მოგვცეს, ხოლო Supabase-ში clerk_id გვაქვს, 
        // ან უნდა ვეძებოთ ემაილით (თუ ინახავ) ან კავშირი დავამყაროთ.
        // მარტივად რომ ვთქვათ, თუ Whop-ის მეტადაში ინახავ Clerk ID-ს ან ემაილს:
        
        // მაგალითად, თუ ბაზაში ემაილიც გაქვს შენახული:
        const { error: updateError } = await supabase
          .from('users')
          .update({ is_paid: true })
          .eq('email', customerEmail); // ან შესაბამისი ველით

        if (updateError) {
          console.error("LOG - Supabase webhook update error:", updateError);
          return NextResponse.json({ error: 'db_update_failed' }, { status: 500 });
        }

        console.log(`LOG - User with email ${customerEmail} successfully upgraded to paid via Whop!`);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("LOG - Whop webhook catch error:", err);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}