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

interface Chip {
  label: string;
  icon: LucideIcon;
}

interface Step {
  index: string;
  title: string;
  description: string;
  icon: LucideIcon;
  chips: Chip[];
}

const steps: Step[] = [
  {
    index: '01',
    title: 'AI სწავლობს შენს ბიზნესს',
    description:
      'მიუთითე ვებსაიტი ან ატვირთე დოკუმენტები — AI ავტომატურად გადაიკითხავს და ისწავლის შენს პროდუქტებსა და სერვისებს 1 წუთში.',
    icon: Globe2,
    chips: [
      { label: 'ვებსაიტის სკანირება', icon: Globe2 },
      { label: 'დოკუმენტების ატვირთვა', icon: FileUp },
    ],
  },
  {
    index: '02',
    title: 'ავტომატური ინტეგრაცია',
    description:
      'AI თავად აერთებს ჩატბოტს Web, WhatsApp, Instagram და Telegram არხებზე — ერთი დაწკაპუნებით, ყოველგვარი კოდის გარეშე.',
    icon: Webhook,
    chips: [
      { label: 'WhatsApp', icon: MessagesSquare },
      { label: 'Instagram', icon: Share2 },
      { label: 'Telegram', icon: Send },
    ],
  },
  {
    index: '03',
    title: 'ბიზნეს პროცესების ავტომატიზაცია',
    description:
      'ავტომატური ჯავშნები და შეხვედრები, ლიდების შეგროვება CRM-ში, შეკვეთების მიღება და 24/7 მხარდაჭერა — ყველაფერი თავისით მუშაობს.',
    icon: CalendarCheck2,
    chips: [
      { label: 'ჯავშნები', icon: CalendarCheck2 },
      { label: 'CRM ლიდები', icon: Users },
      { label: '24/7 მხარდაჭერა', icon: Headset },
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
  const containerRef = useRef<HTMLDivElement>(null);

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

  // ჩვეულებრივი მიმართულება (0-დან 1000-მდე და 0%-დან 100%-მდე)
  const strokeDashoffset = useTransform(smoothProgress, [0, 1], [1000, 0]);
  const offsetDistance = useTransform(smoothProgress, [0, 1], ['0%', '100%']);

  return (
    // h-[250vh] აჩერებს სექციას სქროლვისას
    <div id="how-it-works" ref={containerRef} className="relative h-[250vh] bg-[#08070c]">
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden px-6">
        
        {/* ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[140px]" />
          <div className="absolute bottom-0 right-0 h-[400px] w-[500px] translate-x-1/4 translate-y-1/4 rounded-full bg-fuchsia-500/10 blur-[120px]" />
        </div>

        <div className="relative mx-auto w-full max-w-6xl">
          
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
                rx="1.5"
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
                rx="1.5"
                fill="none"
                stroke="url(#glow-gradient-how)"
                strokeWidth="1"
                pathLength="1000"
                style={{ strokeDasharray: 1000, strokeDashoffset }}
              />
              <defs>
                <linearGradient id="glow-gradient-how" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>

            {/* მბზინავი კვადრატი ჩვეულებრივი მიმართულებით ('0%' -> '100%') */}
            <motion.div
              className="absolute h-3 w-3 rounded-sm bg-violet-400 shadow-[0_0_15px_#a855f7]"
              style={{
                offsetPath: 'rect(0% 100% 100% 0% round 16px)',
                offsetDistance,
              }}
            />
          </div>

          {/* heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              როგორ ავტომატიზებს{' '}
              <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                YourBot
              </span>{' '}
              შენს ბიზნესს?
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/60 sm:text-lg">
              ნულოვანი კოდი. AI თავად იბარებს ტექნიკურ ნაწილს, აწყობს
              ავტომატიზაციებს და 3 მარტივ ნაბიჯში ინტეგრირდება შენს სისტემაში.
            </p>
          </motion.div>

          {/* steps */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative z-10 mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6"
          >
            {/* connecting line (desktop only) */}
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
                  {/* node on the line */}
                  <div className="relative z-10 mb-8 hidden md:block">
                    <div className="flex h-20 w-20 items-center justify-center">
                      <div className="absolute h-20 w-20 rounded-full bg-violet-500/10 blur-xl transition-opacity duration-300 group-hover:bg-fuchsia-500/20" />
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-[#0d0c14] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] transition-transform duration-300 group-hover:scale-105 group-hover:border-violet-400/40">
                        <StepIcon className="h-6 w-6 text-violet-300 transition-colors duration-300 group-hover:text-fuchsia-300" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7 backdrop-blur-md transition-colors duration-300 group-hover:border-violet-400/25 group-hover:bg-white/[0.04]">
                    <div className="mb-4 flex items-center gap-3 md:hidden">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#0d0c14]">
                        <StepIcon className="h-5 w-5 text-violet-300" />
                      </div>
                      <span className="font-mono text-sm text-white/30">
                        {step.index}
                      </span>
                    </div>

                    <span className="hidden font-mono text-sm text-white/30 md:block">
                      {step.index}
                    </span>
                    <h3 className="mt-2 text-lg font-medium text-white">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/55">
                      {step.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {step.chips.map((chip) => {
                        const ChipIcon = chip.icon;
                        return (
                          <span
                            key={chip.label}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/60"
                          >
                            <ChipIcon className="h-3.5 w-3.5" />
                            {chip.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {step.index !== '03' && (
                    <div className="mt-6 flex justify-center md:hidden">
                      <ArrowRight className="h-5 w-5 rotate-90 text-white/20" />
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