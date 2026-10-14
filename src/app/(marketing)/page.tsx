'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';
import HeroTunnel from '@/components/landing/hero-tunnel';
import FeaturesSection from '@/components/landing/features-section';
import HowItWorksSection from '@/components/landing/how-it-works-section';
import PricingSection from '@/components/landing/pricing-section';
import FAQSection from '@/components/landing/faq-section'; // ახალი FAQ კომპონენტის იმპორტი
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
  const { isSignedIn, isLoaded } = useAuth();
  const { t } = useTranslation();

  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    async function checkPaidStatus() {
      console.log("LOG - Checking user status, isLoaded:", isLoaded, "isSignedIn:", isSignedIn);
      
      try {
        const res = await fetch('/api/user/status');
        const data = await res.json();
        console.log("LOG - API Status Response:", data);
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
    { name: 'FAQ', href: '#faq' }, // FAQ დაემატა ნავიგაციაში
    { name: t('navContact' as any), href: '#contact' },
  ];

  return (
    <main className="bg-[#08070c] text-white antialiased selection:bg-violet-500/45">
      {/* NAV */}
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#08070c]/70 px-3 py-3 backdrop-blur-xl sm:px-6 md:px-12">
        <a
          href="/"
          className="flex items-center cursor-pointer transition hover:opacity-80 shrink-0"
        >
          <Logo variant="full" className="h-6 sm:h-8 w-auto" />
        </a>

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

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="scale-75 sm:scale-100 origin-right">
            <LanguageSwitcher />
          </div>

          {!isSignedIn ? (
            <div className="flex items-center gap-1.5 sm:gap-3">
              <SignInButton mode="modal">
                <button className="text-[11px] sm:text-sm font-medium text-white/70 transition hover:text-white cursor-pointer px-1 py-1 shrink-0">
                  {t('authSignIn' as any)}
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-sm font-medium text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] transition hover:opacity-90 cursor-pointer shrink-0">
                  {t('authGetStarted' as any)}
                </button>
              </SignUpButton>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="/dashboard"
                className="text-xs sm:text-sm font-medium text-violet-300 transition hover:text-white"
              >
                {t('dashboardLink' as any)}
              </a>
              <UserButton />
            </div>
          )}
        </div>
      </nav>

      {/* SECTIONS */}
      <HeroTunnel />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection isPaid={isPaid} />
      <FAQSection /> {/* FAQ სექცია დაემატა ფასებსა და კონტაქტს შორის */}
      <ContactSection />
      <Footer />

      <ChatbotWidget />
    </main>
  );
}