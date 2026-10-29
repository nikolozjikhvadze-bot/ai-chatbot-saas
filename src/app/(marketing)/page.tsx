'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import HeroTunnel from '@/components/landing/hero-tunnel';
import FeaturesSection from '@/components/landing/features-section';
import HowItWorksSection from '@/components/landing/how-it-works-section';
import PricingSection from '@/components/landing/pricing-section';
import FAQSection from '@/components/landing/faq-section';
import ContactSection from '@/components/landing/contact-section';
import Logo from '@/components/Logo';
import Footer from '@/components/landing/footer';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from '@/context/LanguageContext';

const ChatbotWidget = dynamic(() => import('@/components/chatWidget'), {
  ssr: false,
});

export default function LandingPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSignedIn, isLoaded, user } = useUser();
  const { t } = useTranslation();

  const [isPaid, setIsPaid] = useState(false);

  // Meta Pixel CompleteRegistration თრექინგი
  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      const trackingKey = `fb_reg_tracked_${user.id}`;
      const hasTracked = localStorage.getItem(trackingKey);
      
      if (!hasTracked && typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'CompleteRegistration');
        localStorage.setItem(trackingKey, 'true');
        console.log("LOG - CompleteRegistration tracked for user ID:", user.id);
      }
    }
  }, [isLoaded, isSignedIn, user?.id]);

  useEffect(() => {
    async function checkPaidStatus() {
      try {
        const res = await fetch('/api/user/status');
        const data = await res.json();
        setIsPaid(Boolean(data.isPaid));
      } catch (err) {
        console.error("Failed to fetch user status:", err);
      }
    }

    if (isLoaded) {
      checkPaidStatus();
    }
  }, [isLoaded, isSignedIn]);

  const navItems = [
    { name: t('navFeatures' as any), href: '#features' },
    { name: t('navHowItWorks' as any), href: '#how-it-works' },
    { name: t('navPricing' as any), href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
    { name: t('navContact' as any), href: '#contact' },
  ];

  return (
    <main className="bg-transparent text-white antialiased selection:bg-violet-500/45 relative">
      {/* NAV */}
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#08070c]/80 px-4 py-3.5 backdrop-blur-xl sm:px-6 md:px-12">
        <a
          href="/"
          className="flex items-center cursor-pointer transition hover:opacity-80 shrink-0 z-50"
        >
          <Logo variant="full" className="h-6 sm:h-8 w-auto" />
        </a>

        {/* DESKTOP NAV */}
        <div
          className="hidden gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5 md:flex"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {navItems.map((item, index) => (
            <a
              key={index}
              href={item.href}
              onMouseEnter={() => setHoveredIndex(index)}
              className="relative px-4 py-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              {hoveredIndex === index && (
                <motion.div
                  layoutId="nav-hover-indicator"
                  className="absolute inset-0 rounded-full bg-white/10 shadow-[0_0_12px_rgba(255,255,255,0.2)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-3/5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                </motion.div>
              )}
              <span className="relative z-10">{item.name}</span>
            </a>
          ))}
        </div>

        {/* RIGHT CONTROLS & MOBILE TOGGLE */}
        <div className="flex items-center gap-2 sm:gap-3 z-50">
          <div className="scale-75 sm:scale-100 origin-right">
            <LanguageSwitcher />
          </div>

          {/* DESKTOP AUTH */}
          <div className="hidden md:flex items-center gap-3">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-white/70 transition hover:text-white cursor-pointer px-2 py-1">
                    {t('authSignIn' as any)}
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-sm font-medium text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] transition hover:opacity-90 cursor-pointer">
                    {t('authGetStarted' as any)}
                  </button>
                </SignUpButton>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <a
                  href="/dashboard"
                  className="text-sm font-medium text-violet-300 transition hover:text-white"
                >
                  {t('dashboardLink' as any)}
                </a>
                <UserButton />
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center p-2 text-white/80 hover:text-white md:hidden cursor-pointer focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>

        {/* MOBILE FULL-SCREEN DRAWER / MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="fixed inset-x-0 top-0 pt-20 pb-8 px-6 bg-[#08070c]/98 backdrop-blur-2xl border-b border-white/10 md:hidden z-40 shadow-2xl flex flex-col gap-2"
            >
              {/* NAV LINKS WITH SEPARATORS */}
              <div className="flex flex-col">
                {navItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-4 text-base font-normal text-white/90 border-b border-white/5 transition hover:text-white hover:pl-1"
                  >
                    {item.name}
                  </a>
                ))}
              </div>

              {/* MOBILE BOTTOM CTA BUTTON */}
              <div className="pt-6 mt-2">
                {!isSignedIn ? (
                  <div className="flex flex-col gap-3">
                    <SignUpButton mode="modal">
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full flex items-center justify-between rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] transition active:scale-[0.98] cursor-pointer"
                      >
                        <span>{t('authGetStarted' as any)}</span>
                        <span className="text-base">→</span>
                      </button>
                    </SignUpButton>

                    <SignInButton mode="modal">
                      <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-center py-2.5 text-xs font-medium text-white/60 hover:text-white transition"
                      >
                        {t('authSignIn' as any)}
                      </button>
                    </SignInButton>
                  </div>
                ) : (
                  <a
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-between rounded-xl bg-violet-600/30 border border-violet-500/40 px-5 py-3.5 text-sm font-semibold text-violet-200 shadow-lg"
                  >
                    <span>{t('dashboardLink' as any)}</span>
                    <span className="text-base">→</span>
                  </a>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* SECTIONS */}
      <HeroTunnel />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection isPaid={isPaid} />
      <FAQSection />
      <ContactSection />
      <Footer />

      <ChatbotWidget />
    </main>
  );
}