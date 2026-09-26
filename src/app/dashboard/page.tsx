'use client';

import { useState, useEffect, useRef } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratedFile {
  path: string;
  code: string;
  content?: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// -----------------------------------------------------------------------------
// safeJsonFetch: ორივე API გამოძახება (/api/ai/analyze და /api/project-chat)
// ამის გავლით გადის. თუ სერვერმა HTML დააბრუნა JSON-ის ნაცვლად (route ვერ
// მოიძებნა, ან route-ში დაუჭერავი შეცდომა მოხდა try/catch-ის მიღმა), აქ ეს
// კონტროლირებადად ტყდება ნათელი შეტყობინებით, ნაცვლად "Unexpected token '<'"
// crash-ისა res.json()-ზე. ასევე ამოწმებს ბექენდის `success` ველს.
// -----------------------------------------------------------------------------
async function safeJsonFetch(url: string, options: RequestInit): Promise<any> {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(
      `სერვერმა დააბრუნა არა-JSON პასუხი (სტატუსი ${res.status}). დასაწყისი: ${text.slice(0, 150)}`,
    );
  }

  const data = await res.json();

  if (!res.ok || data.success === false) {
    throw new Error(data.error || `მოთხოვნა ვერ შესრულდა (სტატუსი ${res.status}).`);
  }

  return data;
}

export default function DashboardPage() {
  const { user } = useUser();
  const [isPaid, setIsPaid] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [terminalCommands, setTerminalCommands] = useState('');
  const [filesToCreate, setFilesToCreate] = useState<GeneratedFile[]>([]);
  const [copiedTerminal, setCopiedTerminal] = useState(false);

  // კოპირების სტატუსის State-ები
  const [copiedFileIndex, setCopiedFileIndex] = useState<number | null>(null);
  const [copiedFixCmd, setCopiedFixCmd] = useState<string | null>(null);

  // ჩათბოტის მდგომარეობები (State)
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'გამარჯობა! მე შენი პროექტის AI ასისტენტი ვარ. რით შემიძლია დაგეხმარო?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function checkUserStatus() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const isSuccess = urlParams.get('success');

        if (isSuccess === 'true') {
          await fetch('/api/user/update-status', { method: 'POST' });
          window.history.replaceState({}, document.title, '/dashboard');
        }

        const res = await fetch('/api/user/status');
        const data = await res.json();
        if (data.isPaid) {
          setIsPaid(true);
        }
      } catch (err) {
        console.error('Error checking status:', err);
      } finally {
        setLoadingStatus(false);
      }
    }
    checkUserStatus();
  }, []);

  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isChatOpen, isChatLoading]);

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingCycle }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const selectedFiles = Array.from(e.target.files).filter((file: any) => {
      const path = file.webkitRelativePath || file.name;
      if (
        path.includes('node_modules') ||
        path.includes('.git') ||
        path.includes('.next') ||
        path.includes('dist') ||
        path.includes('build') ||
        path.match(/\.(png|jpg|jpeg|gif|ico|svg|mp4|zip|pdf)$/i)
      ) {
        return false;
      }
      return true;
    });

    if (selectedFiles.length === 0) {
      alert('ფოლდერში შესაბამისი კოდის ფაილები ვერ მოიძებნა.');
      return;
    }

    setIsUploading(true);
    setAiAnalysis('');
    setTerminalCommands('');
    setFilesToCreate([]);

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      const filePath = (file as any).webkitRelativePath || file.name;
      formData.append('files', file, filePath);
    });

    try {
      const data = await safeJsonFetch('/api/ai/analyze', {
        method: 'POST',
        body: formData,
      });

      setUploadedFilesCount(selectedFiles.length);
      setAiAnalysis(data.analysis);
      setTerminalCommands(data.terminalCommands || '');
      setFilesToCreate(data.filesToCreate || []);
    } catch (err) {
      console.error('Upload error:', err);
      const message = err instanceof Error ? err.message : 'მოხდა შეცდომა სერვერთან კავშირისას.';
      alert('შეცდომა ატვირთვისას: ' + message);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadFile = (path: string, code: string) => {
    const blob = new Blob([code || ""], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = path.split('/').pop() || 'file.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllFiles = () => {
    filesToCreate.forEach((file, index) => {
      setTimeout(() => {
        downloadFile(file.path, file.content || file.code || "");
      }, index * 300);
    });
  };

  const copyTerminalToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTerminal(true);
    setTimeout(() => setCopiedTerminal(false), 2000);
  };

  const copyFileToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedFileIndex(index);
    setTimeout(() => setCopiedFileIndex(null), 2000);
  };

  const copyFixCmdToClipboard = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedFixCmd(cmd);
    setTimeout(() => setCopiedFixCmd(null), 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isChatLoading) return;

    const userMsg = inputMessage;
    const updatedMessages: Message[] = [...messages, { role: 'user', content: userMsg }];

    setInputMessage('');
    setMessages(updatedMessages);
    setIsChatLoading(true);

    try {
      // მნიშვნელოვანი: route ფაილი მდებარეობს src/app/api/project-chat/route.ts-ზე,
      // ამიტომ URL აქაც ზუსტად ეს უნდა იყოს — წინააღმდეგ შემთხვევაში Next.js
      // 404 HTML გვერდს დააბრუნებს "/api/ai/chat"-ზე.
      const data = await safeJsonFetch('/api/project-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: updatedMessages }),
      });

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'ბოდიში, პასუხის გენერაცია ვერ მოხერხდა.' },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      const message = err instanceof Error ? err.message : 'სერვერთან კავშირის შეცდომა.';
      setMessages((prev) => [...prev, { role: 'assistant', content: message }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  if (loadingStatus) {
    return (
      <div className="min-h-screen bg-[#07060a] text-white flex items-center justify-center">
        <p className="text-sm text-violet-400 animate-pulse">იტვირთება მონაცემები...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07060a] text-white flex flex-col relative overflow-hidden">
      {/* ფუტურისტული ფონი */}
      <motion.div
        animate={{
          x: ['0%', '30%', '-20%', '0%'],
          y: ['0%', '-40%', '20%', '0%'],
          scale: [1, 1.3, 0.8, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[150px]"
      />
      <motion.div
        animate={{
          x: ['0%', '-30%', '20%', '0%'],
          y: ['0%', '40%', '-30%', '0%'],
          scale: [1, 0.8, 1.4, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 -right-40 w-[700px] h-[700px] bg-fuchsia-600/15 rounded-full blur-[170px]"
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/5 bg-[#08070c]/40 px-6 py-4 backdrop-blur-xl md:px-12">
        <div className="flex items-center gap-3">
          <a href="/" className="text-lg font-semibold tracking-tight hover:opacity-80 flex items-center gap-2">
            YourBot <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-normal">Dashboard</span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/60 hidden sm:inline">
            გამარჯობა, <span className="text-white font-medium">{user?.firstName || 'მომხმარებელო'}</span>!
          </span>
          <UserButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 p-6 md:p-12 max-w-5xl mx-auto w-full flex flex-col justify-center items-center">
        {!isPaid ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-16 px-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-6 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              🔒 პანელი დაბლოკილია
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
              განბლოკეთ თქვენი პროექტის ავტომატური <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">AI ინტეგრაცია</span>
            </h1>

            <p className="text-white/60 text-base md:text-lg max-w-xl mb-8">
              აატვირთეთ თქვენი საიტის ფოლდერი, და Gemini AI ავტომატიზებულად შეგიქმნით მუშა ჩათბოტის ფაილებსა და API-ს თქვენი კოდბაზის მიხედვით.
            </p>

            <button
              onClick={() => setShowPricingModal(true)}
              className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-sm font-medium text-white shadow-[0_0_25px_rgba(139,92,246,0.5)] transition hover:opacity-90 cursor-pointer"
            >
              გადახდა და პანელის გახსნა ($100)
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 w-full"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">პროექტის ატვირთვა & AI ავტომატიზაცია</h1>
                <p className="text-white/60 text-sm mt-1">აირჩიეთ მთლიანი ფოლდერი, რომ AI-მ დაგიგენერიროთ საიტისთვის საჭირო ჩათბოტის ფაილები.</p>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-dashed border-violet-500/30 bg-violet-500/[0.02] backdrop-blur-md flex flex-col items-center justify-center text-center relative hover:border-violet-500/60 transition group">
              <input
                type="file"
                multiple
                // @ts-ignore
                webkitdirectory=""
                directory=""
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                📁
              </div>
              <h3 className="font-semibold text-base mb-1">დააჭირეთ და აირჩიეთ პროექტის ფოლდერი</h3>
              <p className="text-xs text-white/50 max-w-sm">ავტომატურად გააანალიზებს კოდს და მოამზადებს ინტეგრაციას.</p>

              {isUploading && (
                <p className="text-xs text-violet-400 mt-4 animate-pulse">მიმდინარეობს ფაილების ანალიზი და AI კოდის გენერაცია...</p>
              )}
            </div>

            {uploadedFilesCount > 0 && (
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                <span className="text-xs text-white/70">ატვირთული ფაილების რაოდენობა პროექტიდან:</span>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">{uploadedFilesCount} ფაილი</span>
              </div>
            )}

            {aiAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl border border-violet-500/30 bg-violet-950/20 backdrop-blur-md space-y-3 w-full"
              >
                <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm">
                  ✨ Gemini AI-ს შეფასება:
                </div>
                <div className="text-sm text-white/80 leading-relaxed bg-black/30 p-4 rounded-2xl border border-white/5 font-mono">
                  {aiAnalysis}
                </div>
              </motion.div>
            )}

            {/* ტერმინალის ბრძანებების ფანჯარა */}
            {terminalCommands && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl border border-emerald-500/30 bg-black/80 backdrop-blur-md space-y-3 w-full shadow-2xl"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-semibold ml-2">
                      💻 ტერმინალის ბრძანებები (Terminal)
                    </span>
                  </div>
                  <button
                    onClick={() => copyTerminalToClipboard(terminalCommands)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono transition border border-emerald-500/30 cursor-pointer"
                  >
                    {copiedTerminal ? '✓ კოპირებულია' : '📋 კოპირება'}
                  </button>
                </div>

                <p className="text-xs text-white/50">
                  გაუშვით ეს ბრძანებები პროექტის ტერმინალში საჭირო ბიბლიოთეკების დასაყენებლად:
                </p>

                <pre className="text-xs font-mono text-emerald-400 bg-black p-4 rounded-xl border border-white/10 whitespace-pre-wrap break-all selection:bg-emerald-500/30">
                  {terminalCommands}
                </pre>
              </motion.div>
            )}

            {/* გენერირებული ფაილების სია */}
            {filesToCreate.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl border border-emerald-500/30 bg-emerald-950/10 backdrop-blur-md space-y-4 w-full"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-base font-semibold text-emerald-400">🚀 ინტეგრაციისთვის მზა ფაილები</h3>
                    <p className="text-xs text-white/60 mt-0.5">ჩამოტვირთეთ ან დააკოპირეთ ეს ფაილები და ჩააგდეთ თქვენს პროექტში.</p>
                  </div>
                  <button
                    onClick={downloadAllFiles}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white transition shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer shrink-0"
                  >
                    ყველა ფაილის გადმოწერა
                  </button>
                </div>

                <div className="space-y-3">
                  {filesToCreate.map((file, idx) => {
                    const fileCode = file.content || file.code || "";
                    return (
                      <div key={idx} className="p-4 rounded-2xl border border-white/10 bg-black/40 flex flex-col gap-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <span className="text-xs font-mono text-violet-300 font-semibold">{file.path}</span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyFileToClipboard(fileCode, idx)}
                              className="px-3 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-xs font-mono border border-violet-500/30 transition cursor-pointer flex items-center gap-1.5"
                            >
                              {copiedFileIndex === idx ? '✓ დაკოპირდა' : '📋 დაკოპირება'}
                            </button>

                            <button
                              onClick={() => downloadFile(file.path, fileCode)}
                              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white transition cursor-pointer flex items-center gap-1"
                            >
                              📥 გადმოწერა
                            </button>
                          </div>
                        </div>

                        <pre className="text-[11px] font-mono text-white/70 bg-black/60 p-3 rounded-xl overflow-x-auto max-h-60 border border-white/5 whitespace-pre-wrap break-words">
                          {fileCode}
                        </pre>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ⚠️ პრობლემის გადაჭრის (Troubleshooting) სექცია */}
            {filesToCreate.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-md space-y-4 w-full"
              >
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                  ⚠️ პრობლემის გადაჭრა (Troubleshooting)
                </div>
                <p className="text-xs text-white/70 leading-relaxed">
                  თუ პროექტის გაშვებისას ან ბიბლიოთეკების დაყენებისას ამოგიგდოთ შეცდომა (Dependency Conflict / peer deps error), გაუშვით ეს ბრძანება:
                </p>

                <div className="flex items-center justify-between bg-black/60 p-3 rounded-xl border border-amber-500/20 gap-2">
                  <code className="text-xs font-mono text-amber-300 break-all">
                    npm install --legacy-peer-deps
                  </code>
                  <button
                    onClick={() => copyFixCmdToClipboard('npm install --legacy-peer-deps')}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-mono transition border border-amber-500/30 cursor-pointer shrink-0"
                  >
                    {copiedFixCmd === 'npm install --legacy-peer-deps' ? '✓ დაკოპირდა' : '📋 დაკოპირება'}
                  </button>
                </div>

                <p className="text-xs text-white/50">
                  ბრძანების შესრულების შემდეგ ხელახლა გაუშვით პროექტი:
                </p>

                <div className="flex items-center justify-between bg-black/60 p-3 rounded-xl border border-white/10 gap-2">
                  <code className="text-xs font-mono text-emerald-300">
                    npm run dev
                  </code>
                  <button
                    onClick={() => copyFixCmdToClipboard('npm run dev')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-mono transition border border-emerald-500/30 cursor-pointer shrink-0"
                  >
                    {copiedFixCmd === 'npm run dev' ? '✓ დაკოპირდა' : '📋 დაკოპირება'}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>

      {/* ჩაშენებული მცურავი ჩათბოტი */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-4 w-[380px] h-[520px] rounded-3xl border border-white/15 bg-[#0d0c14]/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                  <span className="font-semibold text-sm tracking-wide">AI Assistant</span>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[82%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-br-xs shadow-[0_4px_15px_rgba(139,92,246,0.3)]'
                          : 'bg-white/10 text-white/90 rounded-bl-xs border border-white/5'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 text-white/50 px-4 py-3 rounded-2xl text-xs animate-pulse border border-white/5">
                      ასისტენტი აბრუნებს პასუხს...
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-3.5 border-t border-white/10 bg-black/40 flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="სცადე შეკითხვის დასმა..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-white/40 focus:outline-none focus:border-violet-500 transition"
                />
                <button
                  type="submit"
                  disabled={isChatLoading}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90 text-xs font-medium text-white transition cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                >
                  გაგზავნა
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-[0_0_30px_rgba(139,92,246,0.6)] flex items-center justify-center cursor-pointer transition text-xl border border-white/20"
        >
          {isChatOpen ? '✕' : '💬'}
        </motion.button>
      </div>

      {/* Pricing Modal */}
      <AnimatePresence>
        {showPricingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPricingModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-lg p-8 rounded-3xl border border-white/10 bg-[#0d0c14] shadow-2xl overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">აირჩიეთ პაკეტი</h3>
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center justify-center mb-6 bg-white/[0.03] p-1.5 rounded-2xl border border-white/10">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 py-2 text-xs font-medium rounded-xl transition cursor-pointer ${
                    billingCycle === 'monthly'
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  თვიური
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`flex-1 py-2 text-xs font-medium rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    billingCycle === 'yearly'
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  წლიური <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">-15%</span>
                </button>
              </div>

              <div className="p-6 rounded-2xl border border-violet-500/40 bg-violet-500/[0.05] mb-6 relative">
                <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs">
                  პოპულარული
                </div>
                <h4 className="text-lg font-semibold mb-1">Pro Developer</h4>
                <p className="text-xs text-white/60 mb-4">სრული წვდომა AI ფაილების გენერაციასა და ავტომატიზაციაზე.</p>

                <div className="text-3xl font-bold mb-4">
                  {billingCycle === 'monthly' ? '$100' : '$1100'}
                  <span className="text-sm font-normal text-white/50">
                    {billingCycle === 'monthly' ? ' / თვეში' : ' / წელიწადში'}
                  </span>
                </div>

                <ul className="text-xs text-white/70 space-y-2 mb-6">
                  <li>✓ შეუზღუდავი ფოლდერების ატვირთვა და AI ანალიზი</li>
                  <li>✓ მზა ჩათბოტის ფაილებისა და API-ს ავტომატური გენერაცია</li>
                  <li>✓ 24/7 ტექნიკური მხარდაჭერა</li>
                </ul>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-medium text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] transition hover:opacity-90 cursor-pointer"
                >
                  გადახდა და პანელის გახსნა
                </button>
              </div>

              <p className="text-center text-xs text-white/40">
                უსაფრთხო გადახდა Stripe-ის მეშვეობით.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}