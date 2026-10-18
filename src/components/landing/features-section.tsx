'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';
import { Hotel, ShoppingBag, ShieldCheck, Cpu, Zap, Lock } from 'lucide-react';

export default function FeaturesSection() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);

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
    <div id="features" ref={containerRef} className="relative h-auto py-16 md:h-[280vh] md:py-0 bg-transparent">
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 sm:px-6 md:sticky md:top-0 md:h-screen md:overflow-hidden md:px-12">
        
        {/* სათაური */}
        <h2 className="mb-6 text-center text-2xl font-semibold tracking-tight sm:text-3xl md:mb-10 md:text-4xl text-white">
          {t('featuresMainTitle')}
        </h2>

        {/* BENTO GRID Wrapper */}
        <div className="relative mx-auto w-full max-w-5xl p-1">
          
          {/* SVG Border Frame & Synced Glowing Tracer */}
          <div className="pointer-events-none absolute -inset-2 hidden md:block">
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
                rx="1.5"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="0.5"
              />
              <motion.rect
                x="0.5"
                y="0.5"
                width="99"
                height="99"
                rx="1.5"
                fill="none"
                stroke="url(#glow-gradient)"
                strokeWidth="1"
                pathLength="1000"
                style={{ strokeDasharray: 1000, strokeDashoffset }}
              />

              {/* სინქრონული მანათობელი გარეთა წერტილი */}
              <motion.rect
                x="0.5"
                y="0.5"
                width="99"
                height="99"
                rx="1.5"
                fill="none"
                stroke="#c084fc"
                strokeWidth="3.5"
                strokeLinecap="round"
                pathLength="1000"
                style={{ strokeDasharray: '16 1000', strokeDashoffset: tracerGlowOffset }}
                className="drop-shadow-[0_0_12px_#a855f7]"
              />

              {/* სინქრონული შიდა თეთრი გული */}
              <motion.rect
                x="0.5"
                y="0.5"
                width="99"
                height="99"
                rx="1.5"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                pathLength="1000"
                style={{ strokeDasharray: '8 1000', strokeDashoffset: tracerCoreOffset }}
              />

              <defs>
                <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* BENTO GRID CARDS (6 ბარათიანი ოპტიმიზებული ბადე) */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3 md:grid-rows-3">
            {/* 1. სასტუმროების სექტორი (Use Case 1) */}
            <BentoCard
              className="md:col-span-2"
              icon={<Hotel className="h-5 w-5 text-violet-400" />}
              title={t('featureHotelTitle')}
              description={t('featureHotelDesc')}
              glow="from-violet-500/20"
              badge={t('useCaseBadge1')}
            />

            {/* 2. E-Commerce სექტორი (Use Case 2) */}
            <BentoCard
              icon={<ShoppingBag className="h-5 w-5 text-fuchsia-400" />}
              title={t('featureEcomTitle')}
              description={t('featureEcomDesc')}
              glow="from-fuchsia-500/20"
              badge={t('useCaseBadge2')}
            />

            {/* 3. AI მოდელები */}
            <BentoCard
              icon={<Cpu className="h-5 w-5 text-cyan-400" />}
              title={t('feature1Title')}
              description={t('feature1Desc')}
              glow="from-cyan-400/20"
            />

            {/* 4. ინტეგრაცია */}
            <BentoCard
              icon={<Zap className="h-5 w-5 text-amber-400" />}
              title={t('feature2Title')}
              description={t('feature2Desc')}
              glow="from-amber-400/20"
            />

            {/* 5. უსაფრთხოება & GDPR (Trust Signal) */}
            <BentoCard
              icon={<ShieldCheck className="h-5 w-5 text-emerald-400" />}
              title={t('feature3Title')}
              description={t('feature3Desc')}
              glow="from-emerald-400/20"
              badge="GDPR Compliant"
            />

            {/* 6. 24/7 მხარდაჭერა */}
            <BentoCard
              className="md:col-span-3"
              icon={<Lock className="h-5 w-5 text-blue-400" />}
              title={t('feature4Title')}
              description={t('feature4Desc')}
              glow="from-blue-500/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function BentoCard({
  title,
  description,
  glow,
  icon,
  badge,
  className = '',
}: {
  title: string;
  description: string;
  glow: string;
  icon?: React.ReactNode;
  badge?: string;
  className?: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 backdrop-blur-md transition hover:border-white/20 flex flex-col justify-between ${className}`}
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${glow} to-transparent opacity-0 blur-2xl transition group-hover:opacity-100`}
      />
      <div>
        <div className="flex items-center justify-between mb-2">
          {icon && <div className="p-2 rounded-lg bg-white/5 border border-white/10 w-fit">{icon}</div>}
          {badge && (
            <span className="rounded-full bg-violet-500/10 border border-violet-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-violet-300">
              {badge}
            </span>
          )}
        </div>
        <h3 className="text-sm font-semibold sm:text-base text-white">{title}</h3>
        <p className="mt-1 text-xs text-white/60 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}