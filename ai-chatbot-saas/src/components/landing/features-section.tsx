'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

export default function FeaturesSection() {
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

  // კვადრატის/წერტილის პოზიცია SVG Path-ზე
  const strokeDashoffset = useTransform(smoothProgress, [0, 1], [1000, 0]);

  return (
    // h-[250vh] უზრუნველყოფს იმას, რომ სექციაზე სქროლვა დაპაუზდეს და ანიმაციამ ჩაიაროს
    <div id="features" ref={containerRef} className="relative h-[250vh] bg-[#08070c]">
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden px-6 md:px-12">
        
        {/* სათაური */}
        <h2 className="mb-12 text-center text-3xl font-semibold tracking-tight md:text-4xl">
          ყველაფერი, რაც გჭირდებათ ერთ პლატფორმაზე
        </h2>

        {/* BENTO GRID Wrapper ერთიან ჩარჩოსთან ერთად */}
        <div className="relative mx-auto w-full max-w-5xl p-1">
          
          {/* SVG Border Frame & Glowing Tracer */}
          <div className="pointer-events-none absolute -inset-2">
            <svg
              className="h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* მუქი ფონური ხაზი */}
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
              {/* აქტიური მბზინავი ხაზი, რომელიც სქროლთან ერთად ივსება */}
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
              <defs>
                <linearGradient id="glow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>

            {/* მბზინავი კვადრატი/Glowing Square Tracer */}
            <motion.div
              className="absolute h-3 w-3 rounded-sm bg-violet-400 shadow-[0_0_15px_#a855f7]"
              style={{
                offsetPath: 'rect(0% 100% 100% 0% round 16px)',
                offsetDistance: useTransform(smoothProgress, [0, 1], ['0%', '100%']),
              }}
            />
          </div>

          {/* BENTO GRID CARDS */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
            <BentoCard
              className="md:col-span-2"
              title="Retrieval-Augmented Generation"
              description="თქვენი Knowledge Base ავტომატურად ინდექსირდება pgvector-ში და ყოველ პასუხს ეხმარება რეალურ დოკუმენტებზე დაყრდნობით."
              glow="from-violet-500/20"
            />
            <BentoCard
              title="Omnichannel Sync"
              description="ერთი საუბრის ისტორია ყველა არხზე."
              glow="from-cyan-400/20"
            />
            <BentoCard
              title="Human Handoff"
              description="საჭიროებისას ავტომატურად გადადის ცოცხალ ოპერატორზე."
              glow="from-emerald-400/20"
            />
            <BentoCard
              className="md:col-span-2"
              title="Knowledge Gap Detection"
              description="ბოტი აღნიშნავს კითხვებს, რომლებზეც ცოდნა აკლია, რომ მუდმივად გაუმჯობესდეს."
              glow="from-amber-400/20"
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
  className = '',
}: {
  title: string;
  description: string;
  glow: string;
  className?: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm transition hover:border-white/20 ${className}`}
    >
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${glow} to-transparent opacity-0 blur-2xl transition group-hover:opacity-100`}
      />
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm text-white/50">{description}</p>
    </div>
  );
}