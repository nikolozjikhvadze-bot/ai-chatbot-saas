'use client';

import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Check, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export default function PricingSection() {
  const { t, language } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAnnual, setIsAnnual] = useState(false);

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

  const plans = [
    {
      name: t('planStarterTitle'),
      priceMonthly: "$29",
      priceAnnual: "$290",
      desc: t('planStarterDesc'),
      features: [
        t('featureStarter1'),
        t('featureStarter2'),
        t('featureStarter3'),
        t('featureStarter4')
      ],
      popular: false,
      trialDays: 3,
      ctaLink: "https://whop.com/yourbot/yourbot-starter/"
    },
    {
      name: t('planProTitle'),
      priceMonthly: "$79",
      priceAnnual: "$790",
      desc: t('planProDesc'),
      features: [
        t('featurePro1'),
        t('featurePro2'),
        t('featurePro3'),
        t('featurePro4'),
        t('featurePro5')
      ],
      popular: true,
      trialDays: 3,
      ctaLink: "https://whop.com/yourbot/yourbot-pro-plan/"
    },
    {
      name: t('planScaleTitle'),
      priceMonthly: "$149",
      priceAnnual: "$1,490",
      desc: t('planScaleDesc'),
      features: [
        t('featureScale1'),
        t('featureScale2'),
        t('featureScale3'),
        t('featureScale4')
      ],
      popular: false,
      trialDays: 7,
      ctaLink: "https://whop.com/yourbot/yourbot-scale/"
    }
  ];

  return (
    <div id="pricing" ref={containerRef} className="relative h-auto py-20 md:h-[220vh] bg-[#08070c]">
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 sm:px-6 md:sticky md:top-0 md:h-screen md:overflow-hidden">
        
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/2 h-[300px] sm:h-[500px] w-full max-w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/15 blur-[140px]" />
          <div className="absolute bottom-10 right-10 h-[250px] w-[250px] sm:w-[400px] rounded-full bg-fuchsia-500/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl py-6">
          
          {/* SVG Border Frame & Synced Glowing Tracer */}
          <div className="pointer-events-none absolute -inset-4 z-0 hidden md:block">
            <svg
              className="h-full w-full overflow-visible"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
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

              <motion.rect
                x="0.5"
                y="0.5"
                width="99"
                height="99"
                rx="2"
                fill="none"
                stroke="#c084fc"
                strokeWidth="3.5"
                strokeLinecap="round"
                pathLength="1000"
                style={{ strokeDasharray: '16 1000', strokeDashoffset: tracerGlowOffset }}
                className="drop-shadow-[0_0_12px_#a855f7]"
              />

              <motion.rect
                x="0.5"
                y="0.5"
                width="99"
                height="99"
                rx="2"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                pathLength="1000"
                style={{ strokeDasharray: '8 1000', strokeDashoffset: tracerCoreOffset }}
              />

              <defs>
                <linearGradient id="glow-gradient-pricing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Header */}
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-violet-500/35 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 sm:px-4 sm:py-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
              <span>{t('pricingBadge')}</span>
            </motion.div>

            <h2 className="mt-2.5 text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
              {t('pricingTitle')}
            </h2>
            <p className="mt-1 text-xs text-white/60 sm:text-sm">
              {t('pricingSubtitle')}
            </p>

            {/* Toggle Switch */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <span className={`text-xs sm:text-sm font-medium ${!isAnnual ? 'text-white' : 'text-white/40'}`}>
                {t('pricingMonthly')}
              </span>
              <button
                type="button"
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative h-6 w-12 rounded-full bg-white/10 p-1 transition-colors duration-300 hover:bg-white/20"
              >
                <motion.div
                  className="h-4 w-4 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-md"
                  animate={{ x: isAnnual ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              </button>
              <div className="flex items-center gap-2">
                <span className={`text-xs sm:text-sm font-medium ${isAnnual ? 'text-white' : 'text-white/40'}`}>
                  {t('pricingAnnual')}
                </span>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  {t('pricingSave')}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="relative z-10 mt-6 grid grid-cols-1 gap-4 md:grid-cols-3 sm:mt-6">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`relative flex flex-col justify-between rounded-2xl border ${
                  plan.popular 
                    ? 'border-violet-500/50 bg-gradient-to-b from-violet-500/[0.08] to-white/[0.02] shadow-xl shadow-violet-500/10' 
                    : 'border-white/10 bg-white/[0.02]'
                } p-5 backdrop-blur-xl sm:p-6`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                    {t('pricingPopular')}
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="mt-1 text-[11px] text-white/50 min-h-[28px]">
                    {plan.desc}
                  </p>

                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tracking-tight text-white">
                      {isAnnual ? plan.priceAnnual : plan.priceMonthly}
                    </span>
                    <span className="text-[11px] text-white/50">
                      {isAnnual ? t('pricingPerYear') : t('pricingPerMonth')}
                    </span>
                  </div>

                  {/* Dynamic Trial Notice Badge */}
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-violet-500/10 border border-violet-500/30 px-2 py-1 text-[11px] font-medium text-violet-300">
                    <Sparkles className="h-3 w-3 text-fuchsia-400" />
                    <span>
                      {language === 'geo' 
                        ? `${plan.trialDays}-დღიანი უფასო ტრიალი` 
                        : `${plan.trialDays}-day free trial included`}
                    </span>
                  </div>

                  <div className="mt-4 border-t border-white/10 pt-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-white/80">
                          <div className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-400">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-2">
                  <a 
                    href={plan.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl p-px font-medium text-white transition duration-300 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 shadow-lg shadow-violet-500/25' 
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <span className={`flex w-full items-center justify-center gap-2 rounded-[11px] px-4 py-2.5 text-xs sm:text-sm transition duration-300 ${
                      plan.popular ? 'bg-[#0d0c14] group-hover:bg-transparent' : 'bg-transparent'
                    }`}>
                      {t('pricingCtaFreeTrial')}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </a>

                  {/* Whop Payment Secure Notice */}
                  <div className="flex items-center justify-center gap-1.5 text-[10px] text-white/40 pt-1">
                    <ShieldCheck className="h-3 w-3 text-violet-400" />
                    <span>{t('whopSecurePayment')}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}