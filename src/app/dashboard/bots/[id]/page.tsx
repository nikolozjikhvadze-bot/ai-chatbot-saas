'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase'; // <--- შეცვლილია: იყენებს შენს არსებულ კლიენტს

interface BotData {
  id: string;
  name: string;
  system_prompt: string;
  telegram_chat_id: string | null;
}

export default function BotSettingsPage() {
  const params = useParams();
  const botId = params.id as string;

  const [bot, setBot] = useState<BotData | null>(null);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 1. ბოტის მონაცემების წამოღება Supabase-იდან
  useEffect(() => {
    async function fetchBot() {
      const { data, error } = await supabase
        .from('bots')
        .select('*')
        .eq('id', botId)
        .single();

      if (data) {
        setBot(data);
        setSystemPrompt(data.system_prompt || '');
      }
      setLoading(false);
    }

    if (botId) fetchBot();
  }, [botId]);

  // 2. System Prompt-ის განახლება
  const handleSavePrompt = async () => {
    setSaving(true);
    await supabase
      .from('bots')
      .update({ system_prompt: systemPrompt })
      .eq('id', botId);

    setSaving(false);
    alert('პარამეტრები შენახულია!');
  };

  if (loading) {
    return <div className="p-8 text-white">იტვირთება...</div>;
  }

  if (!bot) {
    return <div className="p-8 text-white">ბოტი ვერ მოიძებნა</div>;
  }

  const telegramBotUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;
  const telegramConnectUrl = `https://t.me/${telegramBotUsername}?start=${bot.id}`;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 text-white">
      <div>
        <h1 className="text-3xl font-bold">{bot.name} — პარამეტრები</h1>
        <p className="text-zinc-400 mt-1 text-sm">
          მართე შენი AI ბოტის ინსტრუქციები და ინტეგრაციები
        </p>
      </div>

      {/* სექცია 1: Telegram ინტეგრაცია */}
      <div className="p-6 rounded-xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-blue-400">✈️</span> Telegram შეტყობინებები
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              როცა ბოტი ვერ უპასუხებს კითხვას, შეტყობინება მომენტალურად მოგივა Telegram-ში
            </p>
          </div>

          <div>
            {bot.telegram_chat_id ? (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                დაკავშირებულია
              </span>
            ) : (
              <a
                href={telegramConnectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-blue-600/20 inline-flex items-center gap-2"
              >
                დააკავშირე Telegram
              </a>
            )}
          </div>
        </div>
      </div>

      {/* სექცია 2: AI System Prompt */}
      <div className="p-6 rounded-xl border border-white/10 bg-zinc-900/50 backdrop-blur-sm space-y-4">
        <div>
          <h2 className="text-lg font-semibold">AI ბოტის ინსტრუქცია (System Prompt)</h2>
          <p className="text-xs text-zinc-400 mt-1">
            განსაზღვრე, როგორ უნდა მოიქცეს ბოტი, რა ტონით ისაუბროს და რა წესებს მიჰყვეს.
          </p>
        </div>

        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows={6}
          className="w-full p-4 rounded-lg bg-zinc-950 border border-white/10 text-white text-sm focus:outline-none focus:border-violet-500 transition resize-none"
          placeholder="მაგალითად: შენ ხარ კომპანია X-ის ასისტენტი. უპასუხე ზრდილობიანად..."
        />

        <button
          onClick={handleSavePrompt}
          disabled={saving}
          className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 rounded-lg text-sm font-medium transition disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'ინახება...' : 'ცვლილებების შენახვა'}
        </button>
      </div>
    </div>
  );
}