'use client';

import { useState, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const { user } = useUser();
  const [isPaid, setIsPaid] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [files, setFiles] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // 1. გვერდის ჩატვირთვისას ვამოწმებთ URL-ს (?success=true) და სტატუსს ბაზიდან
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
        
        // აქ ვანიჭებთ რეალურ მნიშვნელობას და ვტოვებთ სტატუსს
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

  // 2. Stripe Checkout-ზე გადამისამართების ფუნქცია
  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ billingCycle }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // გადაჰყავს მომხმარებელი Stripe-ის გადახდის გვერდზე
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setIsUploading(true);
      setTimeout(() => {
        setFiles((prev) => [...prev, fileName]);
        setIsUploading(false);
      }, 1000);
    }
  };

  if (loadingStatus) {
    return (
      <div className="min-h-screen bg-[#08070c] text-white flex items-center justify-center">
        <div className="animate-pulse text-violet-400">იტვირთება მონაცემები...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08070c] text-white flex flex-col relative overflow-hidden">
      
      {/* --- სრულეკრანიანი ფუტურისტული მოძრავი ფონი --- */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
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
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
      </div>

      {/* Dashboard Header */}
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

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full flex flex-col justify-center items-center">
        {!isPaid ? (
          /* --- FREE / LOCKED STATE (გადახდაა საჭირო) --- */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center py-16 px-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-xl relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] w-full max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-6 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
              🔒 პანელი დაბლოკილია
            </div>

            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
              განბლოკეთ თქვენი პერსონალური <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">AI დეველოპერი</span>
            </h1>

            <p className="text-white/60 text-base md:text-lg max-w-xl mb-8">
              იმისათვის, რომ AI-მ შეისწავლოს თქვენი ვებსაიტის კოდი და ავტომატურად დაგიწეროთ ინტეგრაციის სკრიპტი, საჭიროა აქტიური გამოწერა.
            </p>

            <button 
              onClick={() => setShowPricingModal(true)}
              className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-sm font-medium text-white shadow-[0_0_25px_rgba(139,92,246,0.5)] transition hover:opacity-90 cursor-pointer"
            >
              გადახდა და პანელის გახსნა ($100)
            </button>
          </motion.div>
        ) : (
          /* --- PRO / UNLOCKED STATE (გადახდილია - სამუშაო პანელი) --- */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 w-full"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">პროექტების ფაილების მართვა</h1>
                <p className="text-white/60 text-sm mt-1">ატვირთეთ საიტის კოდი/ფაილები, რომ AI-მ მოამზადოს ინტეგრაცია.</p>
              </div>
            </div>

            {/* ფაილების ატვირთვის ზონა */}
            <div className="p-8 rounded-3xl border border-dashed border-violet-500/30 bg-violet-500/[0.02] backdrop-blur-md flex flex-col items-center justify-center text-center relative hover:border-violet-500/60 transition group">
              <input 
                type="file" 
                onChange={handleFileUpload} 
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4 group-hover:scale-110 transition shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                📂
              </div>
              <h3 className="font-semibold text-base mb-1">აირჩიეთ ფაილები ან ჩააგდეთ აქ</h3>
              <p className="text-xs text-white/50 max-w-sm">მხარდაჭერილია კოდის ფაილები, HTML, JS, ZIP არქივები ან ბიზნეს დოკუმენტაცია.</p>
              
              {isUploading && (
                <p className="text-xs text-violet-400 mt-4 animate-pulse">იტვირთება და ანალიზდება AI-ს მიერ...</p>
              )}
            </div>

            {/* ატვირთული ფაილების სია */}
            {files.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-white/70">ატვირთული ფაილები ({files.length}):</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {files.map((file, idx) => (
                    <div key={idx} className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex items-center justify-between">
                      <span className="text-sm truncate text-violet-200">{file}</span>
                      <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">მზადაა</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* --- ფასების მოდალური ფანჯარა (Pricing Modal Popup) --- */}
      <AnimatePresence>
        {showPricingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* ფონის დაბურვა */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPricingModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* მოდალური ფანჯრის კონტენტი */}
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

              {/* თვიური / წლიური გადამრთველი (Toggle) */}
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
                  წლიური <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">უმეტესად არჩეული</span>
                </button>
              </div>

              <div className="p-6 rounded-2xl border border-violet-500/40 bg-violet-500/[0.05] mb-6 relative">
                <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs">
                  პოპულარული
                </div>
                <h4 className="text-lg font-semibold mb-1">Pro Developer</h4>
                <p className="text-xs text-white/60 mb-4">სრული წვდომა AI კოდის გენერაციასა და ფაილების ანალიზზე.</p>
                
                {/* ფასის დინამიკური ცვლილება (100$ თვეში / 1100$ წელში) */}
                <div className="text-3xl font-bold mb-4">
                  {billingCycle === 'monthly' ? '$100' : '$1100'} 
                  <span className="text-sm font-normal text-white/50">
                    {billingCycle === 'monthly' ? ' / თვეში' : ' / წელიწადში'}
                  </span>
                </div>
                
                <ul className="text-xs text-white/70 space-y-2 mb-6">
                  <li>✓ შეუზღუდავი ფაილების ატვირთვა</li>
                  <li>✓ ავტომატური სკრიპტის გენერაცია</li>
                  <li>✓ 24/7 მხარდაჭერა</li>
                </ul>

                <button 
                  onClick={handleCheckout}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-medium text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] transition hover:opacity-90 cursor-pointer"
                >
                  გადახდა და პანელის გახსნა
                </button>
              </div>

              <p className="text-center text-xs text-white/40">
                უსაფრთხო გადახდა Stripe-ის მეშვეობით. თანხის დაბრუნების გარანტია 14 დღის განმავლობაში.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}