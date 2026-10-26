'use client';

import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { useTranslation } from '@/context/LanguageContext';
import Image from 'next/image';
import heroGraphic from '../../public/yourbot-hero-graphic.png';

export default function HeroTunnel() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { openSignUp } = useClerk();
  const { t } = useTranslation();

  const handleCreateBot = () => {
    if (isSignedIn) {
      router.push('/dashboard');
    } else {
      openSignUp();
    }
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-transparent px-4 sm:px-6 md:px-12 lg:px-20 pt-28 pb-16">
      {/* ვინიეტები კონტრასტისთვის */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#08070c]/80 via-[#08070c]/40 to-transparent z-0" />

      {/* მთავარი კონტეინერი - 2 კოლონა */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-12">
        
        {/* მარცხენა მხარე: ტექსტის სექცია */}
        <div className="flex flex-col justify-center w-full lg:w-1/2 max-w-xl">
          <span className="mb-4 sm:mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs text-white/70 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {t('heroBadge')}
          </span>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.2] tracking-tight text-white mb-6">
            {t('heroTitleLine1')}
            <br />
            {t('heroTitleLine2')}
          </h1>

          <p className="text-sm sm:text-base text-white/60 mb-8 leading-relaxed">
            {t('heroDescription')}
          </p>

          <div className="flex flex-col items-start gap-4 w-full max-w-md">
            <button
              onClick={handleCreateBot}
              className="rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-purple-600 px-8 py-4 text-sm font-semibold text-white shadow-[0_0_50px_-8px_rgba(168,85,247,0.8)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_-5px_rgba(168,85,247,0.9)] active:scale-95 cursor-pointer"
            >
              {t('heroCtaButton')}
            </button>

            <div className="inline-flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/10 px-4 py-2.5 text-xs sm:text-sm text-violet-200 backdrop-blur-md text-left leading-relaxed w-full">
              <span>{t('heroDemoNotice')}</span>
            </div>
          </div>
        </div>

        {/* მარჯვენა მხარე: ოპტიმიზებული Next.js Image Component */}
        <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-2xl rounded-2xl p-1 bg-gradient-to-br from-violet-500/30 via-fuchsia-500/10 to-transparent shadow-[0_0_50px_-10px_rgba(139,92,246,0.3)]">
            <Image 
              src={heroGraphic} 
              alt="YourBot AI Dashboard & Results Preview" 
              className="w-full h-auto rounded-xl object-contain shadow-2xl border border-white/10"
              priority
            />
          </div>
        </div>

      </div>
    </section>
  );
}