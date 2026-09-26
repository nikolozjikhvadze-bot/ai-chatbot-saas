'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Check, Sparkles, Zap, ShieldCheck, ArrowRight } from 'lucide-react';

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

  // სქროლის პროგრესის თრექინგი Pinned კონტეინერისთვის
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 20,
    restDelta: 0.001,
  });

  // კვადრატის და მბზინავი ხაზის ანიმაცია (საათის ისრის მიმართულებით)
  const strokeDashoffset = useTransform(smoothProgress, [0, 1], [1000, 0]);
  const offsetDistance = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  return (
    <div id="pricing" ref={containerRef} className="relative h-[250vh] bg-[#08070c]">
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden px-6">
        
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[140px]" />
          <div className="absolute bottom-10 right-10 h-[350px] w-[400px] rounded-full bg-fuchsia-500/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto w-full max-w-4xl">
          
          {/* SVG Border Frame & Glowing Tracer ჩარჩო */}
          <div className="pointer-events-none absolute -inset-4 z-0">
            <svg
              className="h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* მუქი ფონური ჩარჩოს ხაზი */}
              <rect
                x="0.5"
                y="0.5"
                width="99"
                height="99"
                rx="2"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="0.5"
              />
              {/* აქტიური მბზინავი ხაზი */}
              <motion.rect
                x="0.5"
                y="0.5"
                width="99"
                height="99"
                rx="2"
                fill="none"
                stroke="url(#glow-gradient-pricing)"
                strokeWidth="1"
                pathLength="1000"
                style={{ strokeDasharray: 1000, strokeDashoffset }}
              />
              <defs>
                <linearGradient id="glow-gradient-pricing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>

            {/* მბზინავი კვადრატი */}
            <motion.div
              className="absolute h-3 w-3 rounded-sm bg-violet-400 shadow-[0_0_15px_#a855f7]"
              style={{
                offsetPath: 'rect(0% 100% 100% 0% round 20px)',
                offsetDistance,
              }}
            />
          </div>

          {/* Header */}
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300"
            >
              <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
              <span>მარტივი და გამჭვირვალე ტარიფი</span>
            </motion.div>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              შეარჩიე შენზე მორგებული გეგმა
            </h2>
            <p className="mt-2 text-base text-white/60">
              გადაიხადე მხოლოდ იმისთვის, რაც რეალურად სჭირდება შენს ბიზნესს
            </p>

            {/* Toggle Switch (თვიური / წლიური) */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className={`text-sm font-medium ${!isAnnual ? 'text-white' : 'text-white/40'}`}>
                თვიური
              </span>
              <button
                type="button"
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative h-7 w-14 rounded-full bg-white/10 p-1 transition-colors duration-300 hover:bg-white/20"
              >
                <motion.div
                  className="h-5 w-5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-md"
                  animate={{ x: isAnnual ? 28 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isAnnual ? 'text-white' : 'text-white/40'}`}>
                  წლიური
                </span>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                  დაზოგე $100
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="relative z-10 mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl sm:p-10">
            <div className="flex flex-col items-center justify-between gap-6 border-b border-white/10 pb-8 md:flex-row">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-white">Pro Plan</h3>
                  <span className="inline-flex items-center gap-1 rounded-md bg-violet-500/20 border border-violet-500/40 px-2.5 py-0.5 text-xs font-medium text-violet-300">
                    <Zap className="h-3 w-3" /> პოპულარული
                  </span>
                </div>
                <p className="mt-1 text-sm text-white/50">
                  სრული ავტომატიზაცია მცირე და საშუალო ბიზნესისთვის
                </p>
              </div>

              {/* Price display */}
              <div className="text-center md:text-right">
                <div className="flex items-baseline justify-center md:justify-end gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                    ${isAnnual ? '1,100' : '100'}
                  </span>
                  <span className="text-white/50">{isAnnual ? '/წელი' : '/თვე'}</span>
                </div>
                <p className="mt-1 text-xs text-white/40">
                  {isAnnual ? '$91.6/თვეში (ერთჯერადი გადახდა)' : 'გაუქმება ნებისმიერ დროს'}
                </p>
              </div>
            </div>

            {/* Features List */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm text-white/80">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>14 დღიანი უფასო საცდელი პერიოდი</span>
              </div>

              <button className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 p-px font-medium text-white shadow-lg transition duration-300 hover:shadow-violet-500/25 sm:w-auto">
                <span className="flex w-full items-center justify-center gap-2 rounded-[11px] bg-[#0d0c14] px-8 py-3.5 transition duration-300 group-hover:bg-transparent">
                  დაიწყე ახლავე
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}