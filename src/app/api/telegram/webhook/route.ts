import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // შენი Supabase Client-ის იმპორტი

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.message && body.message.text?.startsWith('/start')) {
      const telegramChatId = body.message.chat.id.toString();
      const botId = body.message.text.split(' ')[1]; // იღებს BOT_ID-ს ბმულიდან

      if (botId) {
        // 1. ინახავს Telegram Chat ID-ს Supabase-ში
        await supabase
          .from('bots')
          .update({ telegram_chat_id: telegramChatId })
          .eq('id', botId);

        // 2. უგზავნის დადასტურებას Telegram-ში
        await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: '✅ შენი Telegram წარმატებით დაუკავშირდა ბოტს! შეტყობინებებს ოპერატორთან გადამისამართებაზე მიიღებ აქ.',
          }),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram Webhook error:', error);
    return NextResponse.json({ error: 'Webhook Error' }, { status: 500 });
  }
}