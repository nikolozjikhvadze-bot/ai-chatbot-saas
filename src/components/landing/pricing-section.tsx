'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Check, Sparkles, Zap, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

const features = [
  'ყველა AI მოდელთან წვდომა (GPT-4o, Claude 3.5)',
  'უტილიმიტო ჩატის ისტორია & Knowledge Base',
  'ინტეგრაცია: Web, WhatsApp, Instagram, Telegram',
  'ავტომატური ჯავშნები & CRM სინქრონიზაცია',
  '24/7 პრიორიტეტული ტექნიკური მხარდაჭერა',
  'პერსონალური AI ასისტენტის მორგება',
];

export default function PricingSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billingCycle: isAnnual ? 'yearly' : 'monthly',
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url; // გადამისამართება Flitt-ის გადახდის გვერდზე
      } else {
        alert(data.error || 'გადახდის ინიციალიზაცია ვერ მოხერხდა');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('დაფიქსირდა შეცდომა');
    } finally {
      setLoading(false);
    }
  };

  // ... (შენი არსებული animation და hook-ები უცვლელად რჩება)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    restDelta: 0.001,
  });

  const strokeDashoffset = useTransform(smoothProgress, [0, 1], [1000, 0]);
  const tracerGlowOffset = useTransform(smoothProgress, [0, 1], [8, -992]);
  const tracerCoreOffset = useTransform(smoothProgress, [0, 1], [4, -996]);

  return (
    <div id="pricing" ref={containerRef} className="relative h-auto py-16 md:h-[250vh] md:py-0 bg-[#08070c]">
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 sm:px-6 md:sticky md:top-0 md:h-screen md:overflow-hidden">
        
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[300px] sm:h-[500px] w-full max-w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[140px]" />
          <div className="absolute bottom-10 right-10 h-[250px] w-[250px] sm:w-[400px] rounded-full bg-fuchsia-500/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto w-full max-w-4xl">
          
          {/* Header */}
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 sm:px-4 sm:py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
              <span>მარტივი და გამჭვირვალე ტარიფი</span>
            </div>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
              შეარჩიე შენზე მორგებული გეგმა
            </h2>
            <p className="mt-1.5 text-xs text-white/60 sm:text-base">
              გადაიხადე მხოლოდ იმისთვის, რაც რეალურად სჭირდება შენს ბიზნესს
            </p>

            {/* Toggle Switch */}
            <div className="mt-6 flex items-center justify-center gap-3 sm:gap-4">
              <span className={`text-xs sm:text-sm font-medium ${!isAnnual ? 'text-white' : 'text-white/40'}`}>
                თვიური
              </span>
              <button
                type="button"
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative h-6 w-12 sm:h-7 sm:w-14 rounded-full bg-white/10 p-1 transition-colors duration-300 hover:bg-white/20"
              >
                <motion.div
                  className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-md"
                  animate={{ x: isAnnual ? 28 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-xs sm:text-sm font-medium ${isAnnual ? 'text-white' : 'text-white/40'}`}>
                  წლიური
                </span>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-emerald-400">
                  დაზოგე
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="relative z-10 mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-xl sm:mt-10 sm:p-10">
            <div className="flex flex-col items-center justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:gap-6 md:pb-8">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center gap-2 md:justify-start">
                  <h3 className="text-xl font-bold text-white sm:text-2xl">Pro Plan</h3>
                  <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/20 border border-violet-500/40 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-violet-300">
                    <Zap className="h-3 w-3" /> პოპულარული
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/50 sm:text-sm">
                  სრული ავტომატიზაცია მცირე და საშუალო ბიზნესისთვის
                </p>
              </div>

              {/* Price display */}
              <div className="text-center md:text-right">
                <div className="flex items-baseline justify-center md:justify-end gap-1">
                  <span className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                    {isAnnual ? '100₾' : '10₾'}
                  </span>
                  <span className="text-xs text-white/50 sm:text-sm">{isAnnual ? '/წელი' : '/თვე'}</span>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2.5">
                  <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-400 sm:h-5 sm:w-5">
                    <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </div>
                  <span className="text-xs text-white/80 sm:text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:pt-8">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>უსაფრთხო გადახდა ადგილობრივი ბარათებით</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 p-px font-medium text-white shadow-lg transition duration-300 hover:shadow-violet-500/25 sm:w-auto disabled:opacity-50"
              >
                <span className="flex w-full items-center justify-center gap-2 rounded-[11px] bg-[#0d0c14] px-6 py-3 text-sm transition duration-300 group-hover:bg-transparent sm:px-8 sm:py-3.5">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      დაიწყე ახლავე
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}