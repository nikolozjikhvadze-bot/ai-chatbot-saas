'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { useTranslation } from '@/context/LanguageContext';

// R3F/Three.js მხოლოდ client-ზე
const HeroTunnelScene = dynamic(() => import('@/components/landing/hero-tunnel-scene'), {
  ssr: false,
});

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export default function HeroTunnel() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { openSignUp } = useClerk();
  const { t } = useTranslation();

  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const textRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // ღილაკზე დაჭერის ლოგიკა Clerk-ის მოდალით
  const handleCreateBot = () => {
    if (isSignedIn) {
      router.push('/dashboard');
    } else {
      openSignUp();
    }
  };

  useEffect(() => {
    const update = () => {
      const el = containerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        const p = total > 0 ? clamp(-rect.top / total, 0, 1) : 0;
        progressRef.current = p;

        // ტექსტი სრულად ჩანს 0 -> 0.12, მერე 0.12 -> 0.3 ქრება ტუნელის სიღრმეში
        if (textRef.current) {
          const textOpacity = 1 - clamp((p - 0.12) / 0.18, 0, 1);
          textRef.current.style.opacity = String(textOpacity);
          textRef.current.style.transform = `translateY(${p * -40}px)`;
        }

        // პორტალის გარღვევის ფლეშ-ეფექტი: 0.85 -> 1.0
        if (flashRef.current) {
          const flash = clamp((p - 0.85) / 0.15, 0, 1);
          flashRef.current.style.opacity = String(flash * 0.9);
        }
      }
      rafRef.current = requestAnimationFrame(update);
    };

    rafRef.current = requestAnimationFrame(update);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    // 400vh: sticky ბავშვის "ვირტუალური pin" + საკმარისი დისტანცია
    // ტუნელის სრული გავლისთვის, სანამ ჩვეულებრივი სქროლი გაგრძელდება
    <div ref={containerRef} className="relative h-[400vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#08070c]">
        <div className="absolute inset-0">
          <HeroTunnelScene progressRef={progressRef} />
        </div>

        {/* ვინიეტები კონტრასტისთვის */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#08070c] via-[#08070c]/30 to-[#08070c]/70" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#08070c]/40 via-transparent to-[#08070c]" />

        {/* პორტალის ფლეშ-ეფექტი */}
        <div
          ref={flashRef}
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,#e9d5ff_0%,transparent_70%)] opacity-0"
        />

        {/* ასიმეტრიული ტექსტი, მარცხნივ */}
        <div
          ref={textRef}
          className="relative z-10 flex h-full max-w-2xl flex-col justify-center px-6 md:px-16 lg:px-24"
        >
          <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/50">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {t('heroBadge')}
          </span>

          <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
            {t('heroTitleLine1')}
            <br />
            {t('heroTitleLine2')}
          </h1>

          <p className="mt-6 max-w-md text-lg text-white/50">
            {t('heroDescription')}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <button
              onClick={handleCreateBot}
              className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-medium text-white shadow-[0_0_40px_-10px_rgba(139,92,246,0.7)] transition hover:opacity-90 active:scale-95 cursor-pointer"
            >
              {t('heroCtaButton')}
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs uppercase tracking-widest text-white/30">
          {t('heroScrollLabel')}
        </div>
      </div>
    </div>
  );
}