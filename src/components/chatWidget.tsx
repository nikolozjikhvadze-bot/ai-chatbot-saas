'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// შენი ბოტის Public Key / ID
const BOT_KEY = '11111111-1111-1111-1111-111111111111';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'გამარჯობა! მე AI ასისტენტი ვარ. რით შემიძლია დაგეხმაროთ?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [visitorId, setVisitorId] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Visitor ID-ის გენერაცია ან წამოღება localStorage-იდან
  useEffect(() => {
    let vid = localStorage.getItem('chat_visitor_id');
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem('chat_visitor_id', vid);
    }
    setVisitorId(vid);
  }, []);

  // 2. ჩატის ავტომატური ჩამოქაჩვა ბოლო შეტყობინებაზე
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // ინარჩუნებს გვერდს გადატვირთვისგან
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setLoading(true);

    // მომხმარებლის შეტყობინების დამატება ეკრანზე
    const newMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(newMessages);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botKey: BOT_KEY,
          message: userMsg,
          visitorId: visitorId || 'anonymous_visitor',
          conversationId: conversationId,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${res.status}`);
      }

      if (!res.body) {
        throw new Error('სერვერიდან პასუხის ნაკადი ვერ მიიღო');
      }

      // ასისტენტის ცარიელი შეტყობინების მომზადება სตรีმისთვის
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = '';
      let buffer = '';

      // SSE Stream-ის წაკითხვა Real-time-ში
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // არასრული ხაზის შენახვა ბუფერში

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));

              if (event.type === 'text_delta') {
                accumulatedResponse += event.text;

                // ბოლო (ასისტენტის) შეტყობინების განახლება
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    role: 'assistant',
                    content: accumulatedResponse,
                  };
                  return updated;
                });
              } else if (event.type === 'done') {
                if (event.conversationId) {
                  setConversationId(event.conversationId);
                }
              } else if (event.type === 'error') {
                throw new Error(event.message);
              }
            } catch (e) {
              console.error('SSE JSON parsing error:', e);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: error.message || 'შეცდომა შეტყობინების გაგზავნისას.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.5)] cursor-pointer text-xl"
        >
          💬
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[360px] h-[500px] rounded-3xl border border-white/10 bg-[#0d0c14]/90 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-semibold text-sm text-white">AI ასისტენტი</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs text-white/60 hover:text-white cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white rounded-br-none'
                        : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-none font-sans whitespace-pre-wrap'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 text-white/60 p-3 rounded-2xl rounded-bl-none animate-pulse">
                    პასუხს აგენერირებს...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-3 border-t border-white/10 bg-white/[0.02] flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="დაწერეთ შეკითხვა..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 transition"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-500 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                გაგზავნა
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}