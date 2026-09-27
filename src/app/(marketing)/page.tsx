'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';
import HeroTunnel from '@/components/landing/hero-tunnel';
import FeaturesSection from '@/components/landing/features-section';
import HowItWorksSection from '@/components/landing/how-it-works-section';
import PricingSection from '@/components/landing/pricing-section';
import ContactSection from '@/components/landing/contact-section';
import ChatbotWidget from '@/components/chatWidget';

const navItems = [
  { name: 'შესაძლებლობები', href: '#features' },
  { name: 'როგორ მუშაობს', href: '#how-it-works' },
  { name: 'ფასები', href: '#pricing' },
  { name: 'კონტაქტი', href: '#contact' },
];

export default function LandingPage() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { isSignedIn } = useAuth();

  return (
    <main className="bg-[#08070c] text-white antialiased selection:bg-violet-500/40">
      {/* NAV */}
      <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-white/5 bg-[#08070c]/60 px-6 py-4 backdrop-blur-xl md:px-12">
        {/* ლოგო / ტექსტი — დაჭერისას რიფრეში და მთავარზე დაბრუნება */}
        <a
          href="/"
          className="cursor-pointer text-lg font-semibold tracking-tight transition hover:opacity-80"
        >
          YourBot
        </a>

        {/* Dynamic Hover Line Nav Items */}
        <div
          className="hidden gap-2 rounded-full border border-white/10 bg-white/[0.03] p-1.5 md:flex"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {navItems.map((item, index) => (
            <a
              key={item.name}
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

        {/* Auth Buttons / User Profile */}
        <div className="flex items-center gap-4">
          {!isSignedIn ? (
            <>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-white/70 transition hover:text-white cursor-pointer">
                  შესვლა
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-sm font-medium text-white shadow-[0_0_20px_rgba(139,92,246,0.5)] transition hover:opacity-90 cursor-pointer">
                  დაიწყე ახლავე
                </button>
              </SignUpButton>
            </>
          ) : (
            <>
              <a
                href="/dashboard"
                className="text-sm font-medium text-violet-300 transition hover:text-white"
              >
                პანელი (Dashboard)
              </a>
              <UserButton />
            </>
          )}
        </div>
      </nav>

      {/* 1. HERO TUNNEL */}
      <HeroTunnel />

      {/* 2. FEATURES */}
      <FeaturesSection />

      {/* 3. HOW IT WORKS */}
      <HowItWorksSection />

      {/* 4. PRICING */}
      <PricingSection />

      {/* 5. CONTACT & FOOTER */}
      <ContactSection />

      <ChatbotWidget />
    </main>
  );
}