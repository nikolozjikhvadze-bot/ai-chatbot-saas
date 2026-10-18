'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, type Variants } from 'framer-motion';
import {
  Globe2,
  FileUp,
  Webhook,
  MessagesSquare,
  Share2,
  Send,
  CalendarCheck2,
  Users,
  Headset,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

interface Chip {
  labelKey: string;
  icon: LucideIcon;
}

interface Step {
  index: string;
  titleKey: string;
  descKey: string;
  icon: LucideIcon;
  chips: Chip[];
}

const steps: Step[] = [
  {
    index: '01',
    titleKey: 'howStep1Title',
    descKey: 'howStep1Desc',
    icon: Globe2,
    chips: [
      { labelKey: 'howChip1_1', icon: Globe2 },
      { labelKey: 'howChip1_2', icon: FileUp },
    ],
  },
  {
    index: '02',
    titleKey: 'howStep2Title',
    descKey: 'howStep2Desc',
    icon: Webhook,
    chips: [
      { labelKey: 'howChip2_1', icon: MessagesSquare },
      { labelKey: 'howChip2_2', icon: Share2 },
      { labelKey: 'howChip2_3', icon: Send },
    ],
  },
  {
    index: '03',
    titleKey: 'howStep3Title',
    descKey: 'howStep3Desc',
    icon: CalendarCheck2,
    chips: [
      { labelKey: 'howChip3_1', icon: CalendarCheck2 },
      { labelKey: 'howChip3_2', icon: Users },
      { labelKey: 'howChip3_3', icon: Headset },
    ],
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HowItWorksSection() {
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
    <div id="how-it-works" ref={containerRef} className="relative h-auto py-16 md:h-[250vh] md:py-0 bg-transparent">
      <div className="relative flex min-h-screen w-full flex-col items-center justify-center px-4 sm:px-6 md:sticky md:top-0 md:h-screen md:overflow-hidden">
        
        {/* ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[300px] sm:h-[500px] w-full max-w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[140px]" />
          <div className="absolute bottom-0 right-0 h-[300px] w-[300px] sm:w-[500px] translate-x-1/4 translate-y-1/4 rounded-full bg-fuchsia-500/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl">
          
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
                stroke="url(#glow-gradient-how)"
                strokeWidth="1"
                pathLength="1000"
                style={{ strokeDasharray: 1000, strokeDashoffset }}
              />

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
                <linearGradient id="glow-gradient-how" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mx-auto max-w-2xl text-center"
          >
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl md:text-4xl">
              {t('howTitlePrefix' as any)}{' '}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                YourBot
              </span>{' '}
              {t('howTitleSuffix' as any)}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60 sm:text-base">
              {t('howSubtitle' as any)}
            </p>
          </motion.div>

          {/* steps */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative z-10 mt-8 grid grid-cols-1 gap-6 md:mt-16 md:grid-cols-3"
          >
            <div className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px md:block">
              <div className="absolute inset-0 bg-white/10" />
            </div>

            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <motion.div
                  key={step.index}
                  variants={cardVariants}
                  className="group relative"
                >
                  <div className="relative z-10 mb-8 hidden md:block">
                    <div className="flex h-20 w-20 items-center justify-center">
                      <div className="absolute h-20 w-20 rounded-full bg-violet-500/10 blur-xl transition-opacity duration-300 group-hover:bg-fuchsia-500/20" />
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#0d0c14]/80 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-transform duration-300 group-hover:scale-105 group-hover:border-violet-400/40">
                        <StepIcon className="h-6 w-6 text-violet-300 transition-colors duration-300 group-hover:text-fuchsia-300" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-7 backdrop-blur-md transition-colors duration-300 group-hover:border-violet-400/25 group-hover:bg-white/[0.04]">
                    <div className="mb-3 flex items-center gap-3 md:hidden">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0d0c14]/80">
                        <StepIcon className="h-5 w-5 text-violet-300" />
                      </div>
                      <span className="font-mono text-xs text-white/30">
                        {step.index}
                      </span>
                    </div>

                    <span className="hidden font-mono text-sm text-white/30 md:block">
                      {step.index}
                    </span>
                    <h3 className="mt-1 text-base font-medium text-white sm:text-lg">
                      {t(step.titleKey as any)}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-white/55 sm:text-sm">
                      {t(step.descKey as any)}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2">
                      {step.chips.map((chip) => {
                        const ChipIcon = chip.icon;
                        return (
                          <span
                            key={chip.labelKey}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-white/60 sm:text-xs"
                          >
                            <ChipIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            {t(chip.labelKey as any)}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {step.index !== '03' && (
                    <div className="mt-4 flex justify-center md:hidden">
                      <ArrowRight className="h-4 w-4 rotate-90 text-white/20" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}