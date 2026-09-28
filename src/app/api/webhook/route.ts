import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

async function getDbUserIdByClerkId(clerkId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .maybeSingle();

  if (error || !data) return null;
  return data.id;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Flitt-ის ქოლბექის მონაცემები
    const { status, order_id, user_id, transaction_id } = body;

    // ვამოწმებთ, რომ გადახდა წარმატებულია
    if (status === 'success' || status === 'completed') {
      const clerkId = user_id;

      if (clerkId) {
        // ვაახლებთ მომხმარებლის სტატუსს Supabase-ში
        await supabase.from('users').upsert(
          {
            clerk_id: clerkId,
            is_paid: true,
            subscription_id: transaction_id || order_id,
          },
          { onConflict: 'clerk_id' }
        );

        // ვპოულობთ ბაზის მომხმარებელს და ვუაქტიურებთ ბოტებს
        const dbUserId = await getDbUserIdByClerkId(clerkId);
        if (dbUserId) {
          await supabase.from('bots').update({ is_active: true }).eq('owner_id', dbUserId);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Flitt Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}