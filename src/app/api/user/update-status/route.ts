import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    console.log('Clerk User ID:', userId);

    if (!userId) {
      return NextResponse.json({ error: 'არ ხართ ავტორიზებული' }, { status: 401 });
    }

    const email = user?.emailAddresses[0]?.emailAddress || null;

    // 1. ვცადოთ UPSERT (თუ არსებობს განაახლებს, თუ არა - შექმნის ავტომატურად)
    // ყურადღება მიაქციე: clerk_id უნდა იყოს უნიკალური ველი (Unique constraint) Supabase-ში
    const { data, error } = await supabase
      .from('users')
      .upsert(
        { 
          clerk_id: userId, 
          email: email, 
          is_paid: true 
        },
        { onConflict: 'clerk_id' } // თუ ეს clerk_id უკვე არსებობს, მოხდება update
      )
      .select();

    if (error) {
      console.error('Supabase Upsert Error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Database updated successfully:', data);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Catch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}