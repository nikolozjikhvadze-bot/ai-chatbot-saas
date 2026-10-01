'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';

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
  const router = useRouter();
  const { t } = useTranslation();
  
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedTerminal, setCopiedTerminal] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t('projectInitialGreeting') || 'გამარჯობა! რით შემიძლია დაგეხმაროთ ამ პროექტთან დაკავშირებით?' },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/projects/${id}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || t('projectLoadError') || 'პროექტის ჩატვირთვა ვერ მოხერხდა.');
          return;
        }
        setProject(data.project);
      } catch {
        setError(t('projectFetchError') || 'შეცდომა პროექტის ჩატვირთვისას.');
      }
    }
    load();
  }, [id, t]);

  const handleCopyCode = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopyTerminal = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedTerminal(true);
    setTimeout(() => setCopiedTerminal(false), 2000);
  };

  const handleDeleteProject = async () => {
    if (!project) return;
    const confirmDelete = confirm(t('projectDeleteConfirm') || 'ნამდვილად გსურთ პროექტისა და მასთან დაკავშირებული ბოტის წაშლა?');
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || t('projectDeleteError') || 'პროექტის წაშლა ვერ მოხერხდა.');
        setIsDeleting(false);
        return;
      }

      router.push('/dashboard');
    } catch {
      alert(t('serverConnectionError') || 'შეცდომა სერვერთან დაკავშირებისას.');
      setIsDeleting(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isChatLoading || !project) return;

    const userMsg = inputMessage;
    const updated: Message[] = [...messages, { role: 'user', content: userMsg }];
    setInputMessage('');
    setMessages(updated);
    setIsChatLoading(true);

    try {
      const res = await fetch(`/api/relay/${project.bot_id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: updated }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || t('chatFallbackReply') || 'ბოდიში, პასუხი ვერ მოხერხდა.' },
      ]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: t('chatConnectionError') || 'სერვერთან კავშირის შეცდომა.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen w-full bg-[#07060a] text-red-400 p-8 flex items-center justify-center">
        {error}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen w-full bg-[#07060a] text-white/50 p-8 flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
          <span>⚡</span> {t('projectLoading') || 'იტვირთება პროექტი...'}
        </div>
      </div>
    );
  }

  const terminalCommand = "rm -rf .next && npm run dev";

  return (
    <div className="min-h-screen w-full bg-[#07060a] text-white p-4 md:p-10 relative overflow-x-hidden">
      {/* ფონის გრადიენტული ეფექტი */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-violet-600/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto space-y-8 relative z-10">
        
        {/* Navigation & Actions Top Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <Link
            href="/dashboard"
            className="text-xs text-white/60 hover:text-white flex items-center gap-2 transition"
          >
            ← {t('backToDashboard') || 'დაშბორდზე დაბრუნება'}
          </Link>

          {/* 🗑️ წაშლის ღილაკი */}
          <button
            onClick={handleDeleteProject}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? ('🗑️ ' + (t('projectDeleting') || 'იშლება...')) : ('🗑️ ' + (t('projectDelete') || 'პროექტის წაშლა'))}
          </button>
        </div>

        {/* Project Title */}
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
            {project.title}
          </h1>
        </div>

        {/* AI Review Box */}
        <div className="p-6 md:p-8 rounded-3xl border border-violet-500/30 bg-gradient-to-b from-violet-950/20 to-violet-900/10 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-2 text-violet-400 font-semibold text-base mb-4">
            <span>✨</span>
            <h2>{t('aiReviewTitle') || 'AI Review & ანალიზი'}</h2>
          </div>
          <p className="text-sm md:text-base text-white/80 leading-relaxed whitespace-pre-wrap font-sans">
            {project.ai_review}
          </p>
        </div>

        {/* Generated Code Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white/90 flex items-center gap-2">
            <span>💻</span> {t('generatedCodeTitle') || 'დაგენერირებული კოდი'}
          </h2>

          <div className="grid grid-cols-1 gap-6">
            {project.generated_code?.map((file, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-[#0d0c14] overflow-hidden shadow-2xl"
              >
                {/* Code Block Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.03]">
                  <span className="text-xs font-mono text-violet-300 flex items-center gap-2">
                    📄 {file.path}
                  </span>
                  <button
                    onClick={() => handleCopyCode(file.content, idx)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedIndex === idx ? ('✓ ' + (t('copied') || 'დაკოპირდა')) : ('📋 ' + (t('copy') || 'Copy'))}
                  </button>
                </div>

                {/* Code Content */}
                <div className="p-4 overflow-x-auto bg-black/50">
                  <pre className="text-xs font-mono text-emerald-400 leading-relaxed whitespace-pre font-normal">
                    {file.content}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🛠️ Terminal / Fix Commands Box */}
        <div className="p-6 rounded-3xl border border-amber-500/30 bg-amber-500/[0.03] backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <span>🛠️</span>
              <h3>{t('terminalBoxTitle') || 'თუ კოდის ჩასმის შემდეგ ხარვეზი წარმოიქმნა:'}</h3>
            </div>
            <button
              onClick={() => handleCopyTerminal(terminalCommand)}
              className="text-xs px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 transition border border-amber-500/20 cursor-pointer"
            >
              {copiedTerminal ? ('✓ ' + (t('copied') || 'დაკოპირდა')) : ('📋 ' + (t('copyTerminal') || 'ბრძანების კოპირება'))}
            </button>
          </div>
          <p className="text-xs text-white/60">
            {t('terminalBoxDesc') || 'გახსენით ტერმინალი თქვენს პროექტში, გასწმინდეთ დროებითი ქეში და გადატვირთეთ სერვერი:'}
          </p>
          <div className="p-3.5 rounded-xl bg-black/70 border border-white/10 font-mono text-xs text-amber-300/90 flex items-center justify-between overflow-x-auto">
            <code>{terminalCommand}</code>
          </div>
        </div>
      </div>

      {/* Floating Chatbot Component */}
      <div className="fixed bottom-6 right-6 z-50">
        {isChatOpen && (
          <div className="mb-4 w-[90vw] sm:w-[380px] h-[520px] rounded-3xl border border-white/15 bg-[#0d0c14]/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20">
              <span className="font-semibold text-sm text-white flex items-center gap-2">
                <span>🤖</span> AI Assistant
              </span>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-white/70 hover:text-white text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-br-none'
                        : 'bg-white/10 text-white/90 rounded-bl-none border border-white/5'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="text-xs text-white/40 animate-pulse flex items-center gap-2">
                  <span>⚡</span> {t('chatLoadingReply') || 'იწერება პასუხი...'}
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="p-3.5 border-t border-white/10 bg-black/40 flex gap-2">
              <input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={t('chatInputPlaceholder') || 'დაწერეთ შეტყობინება...'}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition"
              />
              <button
                type="submit"
                disabled={isChatLoading}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-xs font-medium hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
              >
                {t('chatSendBtn') || 'გაგზავნა'}
              </button>
            </form>
          </div>
        )}

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_0_30px_rgba(139,92,246,0.6)] flex items-center justify-center text-xl text-white hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          {isChatOpen ? '✕' : '💬'}
        </button>
      </div>
    </div>
  );
}