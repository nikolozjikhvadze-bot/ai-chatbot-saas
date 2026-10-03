import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
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
      return NextResponse.json({ isPaid: false, plan: 'free' }, { status: 401 });
    }

    let { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .maybeSingle();

    console.log("LOG - Supabase query result data:", data);
    console.log("LOG - Supabase query error:", error);

    if (error) {
      console.error("LOG - Database select error:", error);
      return NextResponse.json({ isPaid: false, plan: 'free' });
    }

    // თუ მომხმარებელი არ არსებობს ბაზაში, ვქაჩავთ მის მეილს კლერკიდან და ვარეგისტრირებთ
    if (!data) {
      const clerkUser = await currentUser();
      const userEmail = clerkUser?.emailAddresses[0]?.emailAddress || null;

      const { data: newData, error: insertError } = await supabase
        .from('users')
        .upsert(
          [
            {
              clerk_id: userId,
              email: userEmail,
              is_paid: false,
              plan: 'free',
            }
          ],
          { onConflict: 'clerk_id' }
        )
        .select()
        .single();

      if (insertError) {
        console.error("LOG - Database upsert error:", insertError);
        return NextResponse.json({ isPaid: false, plan: 'free' });
      }

      data = newData;
      console.log("LOG - New user automatically created in Supabase with email:", data);
    }

    if (!data) {
      return NextResponse.json({ isPaid: false, plan: 'free' });
    }

    return NextResponse.json({ 
      isPaid: !!data.is_paid, 
      plan: data.plan || 'free' 
    });
  } catch (err) {
    console.error("LOG - Catch error:", err);
    return NextResponse.json({ isPaid: false, plan: 'free' });
  }
}