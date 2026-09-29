import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { userId } = await auth();
    console.log("LOG - Current Clerk userId from auth():", userId);

    if (!userId) {
      return NextResponse.json({ isPaid: false }, { status: 401 });
    }

    // ვცდილობთ მოვძებნოთ მომხმარებელი ბაზაში
    let { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .maybeSingle();

    console.log("LOG - Supabase query result data:", data);
    console.log("LOG - Supabase query error:", error);

    // თუ მომხმარებელი საერთოდ არ არსებობს ბაზაში, ავტომატურად ვარეგისტრირებთ (ვამატებთ)
    if (!data && !error) {
      const { data: newData, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            clerk_id: userId,
            is_paid: false, // თავიდან არის ფოლსი, სანამ არ გადაიხდის
          }
        ])
        .select()
        .single();

      if (!insertError && newData) {
        data = newData;
        console.log("LOG - New user automatically created in Supabase:", data);
      }
    }

    if (error || !data) {
      return NextResponse.json({ isPaid: false });
    }

    return NextResponse.json({ isPaid: !!data.is_paid });
  } catch (err) {
    console.error("LOG - Catch error:", err);
    return NextResponse.json({ isPaid: false });
  }
}