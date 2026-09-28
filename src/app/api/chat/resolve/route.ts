import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { chatId } = await req.json();

    await supabase
      .from('chats')
      .update({ status: 'BOT_MODE' })
      .eq('id', chatId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}