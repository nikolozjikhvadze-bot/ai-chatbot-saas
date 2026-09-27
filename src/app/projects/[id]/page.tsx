'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface GeneratedFile { path: string; content: string; }
interface Project {
  id: string;
  title: string;
  ai_review: string;
  generated_code: GeneratedFile[];
  bot_id: string;
}
interface Message { role: 'user' | 'assistant'; content: string; }

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState('');

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'გამარჯობა! რით შემიძლია დაგეხმაროთ ამ პროექტთან დაკავშირებით?' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'პროექტის ჩატვირთვა ვერ მოხერხდა.');
        return;
      }
      setProject(data.project);
    }
    load();
  }, [id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isChatLoading || !project) return;

    const userMsg = inputMessage;
    const updated: Message[] = [...messages, { role: 'user', content: userMsg }];
    setInputMessage('');
    setMessages(updated);
    setIsChatLoading(true);

    try {
      // საკუთარ დომენზეა ჩაშენებული (dashboard-ის ნაწილია) — Relay-ს
      // პირდაპირ, relative path-ით მიმართავს, absolute URL-ის გარეშე.
      const res = await fetch(`/api/relay/${project.bot_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: updated }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'ბოდიში, პასუხი ვერ მოხერხდა.' },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'სერვერთან კავშირის შეცდომა.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (error) return <div className="min-h-screen bg-[#07060a] text-red-400 p-12">{error}</div>;
  if (!project) return <div className="min-h-screen bg-[#07060a] text-white/50 p-12">იტვირთება...</div>;

  return (
    <div className="min-h-screen bg-[#07060a] text-white p-6 md:p-12 max-w-4xl mx-auto space-y-8 relative">
      <h1 className="text-2xl font-bold">{project.title}</h1>

      <div className="p-6 rounded-2xl border border-violet-500/30 bg-violet-950/20">
        <h2 className="text-sm font-semibold text-violet-400 mb-3">✨ AI Review</h2>
        <p className="text-sm text-white/80 whitespace-pre-wrap">{project.ai_review}</p>
      </div>

      <div className="space-y-3">
        {project.generated_code.map((file, idx) => (
          <div key={idx} className="p-4 rounded-2xl border border-white/10 bg-black/40">
            <span className="text-xs font-mono text-violet-300">{file.path}</span>
            <pre className="mt-2 text-[11px] font-mono text-white/70 bg-black/60 p-3 rounded-xl overflow-x-auto max-h-60">
              {file.content}
            </pre>
          </div>
        ))}
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen && (
          <div className="mb-4 w-[380px] h-[520px] rounded-3xl border border-white/15 bg-[#0d0c14]/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20">
              <span className="font-semibold text-sm">AI Assistant</span>
              <button onClick={() => setIsChatOpen(false)} className="text-white/70 hover:text-white text-xs">✕</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-xs ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white'
                      : 'bg-white/10 text-white/90'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isChatLoading && <div className="text-xs text-white/40 animate-pulse">იწერს...</div>}
            </div>
            <form onSubmit={handleSend} className="p-3.5 border-t border-white/10 bg-black/40 flex gap-2">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="დაწერეთ შეტყობინება..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-violet-500"
              />
              <button type="submit" disabled={isChatLoading} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-xs font-medium disabled:opacity-50">
                გაგზავნა
              </button>
            </form>
          </div>
        )}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_0_30px_rgba(139,92,246,0.6)] flex items-center justify-center text-xl"
        >
          {isChatOpen ? '✕' : '💬'}
        </button>
      </div>
    </div>
  );
}