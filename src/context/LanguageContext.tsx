'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'geo' | 'eng';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// აქ ჩაწერე შენი ლექსიკონები (translations)
const translations: Record<Language, Record<string, string>> = {
  geo: {
    // მენიუ და ავტორიზაცია
    navFeatures: "შესაძლებლობები",
    navHowItWorks: "როგორ მუშაობს",
    navPricing: "ფასები",
    navContact: "კონტაქტი",
    authSignIn: "შესვლა",
    authGetStarted: "დაიწყე ახლავე",
    dashboardLink: "პანელი (Dashboard)",
    
    // დაშბორდი
    dashLoading: "იტვირთება მონაცემები...",
    dashGreeting: "გამარჯობა",
    dashDefaultUser: "მომხმარებელო",
    dashSubscriptionRequired: "გამოწერა საჭიროა პროექტების შესაქმნელად.",
    dashMyProjects: "ჩემი პროექტები",
    dashAddProject: "+ Add Project",
    dashLoadingProjects: "იტვირთება...",
    dashNoProjects: "ჯერ არცერთი პროექტი არ გაქვთ შექმნილი.",
    
    // Pricing სექცია
    pricingBadge: "მარტივი და გამჭვირვალე ტარიფი",
    pricingTitle: "შეარჩიე შენზე მორგებული გეგმა",
    pricingSubtitle: "გადაიხადე მხოლოდ იმისთვის, რაც რეალურად სჭირდება შენს ბიზნესს",
    pricingMonthly: "თვიური",
    pricingAnnual: "წლიური",
    pricingSave: "დაზოგე $100",
    pricingPlanTitle: "Pro Plan",
    pricingPopular: "პოპულარული",
    pricingPlanDesc: "სრული ავტომატიზაცია მცირე და საშუალო ბიზნესისთვის",
    pricingPerMonth: "/თვე",
    pricingPerYear: "/წელი",
    pricingMonthlySub: "გაუქმება ნებისმიერ დროს",
    pricingAnnualSub: "$91.6/თვეში (ერთჯერადი გადახდა)",
    pricingFeature1: "ყველა AI მოდელთან წვდომა (GPT-4o, Claude 3.5)",
    pricingFeature2: "უტილიმიტო ჩატის ისტორია & Knowledge Base",
    pricingFeature3: "ინტეგრაცია: Web, WhatsApp, Instagram, Telegram",
    pricingFeature4: "ავტომატური ჯავშნები & CRM სინქრონიზაცია",
    pricingFeature5: "24/7 პრიორიტეტული ტექნიკური მხარდაჭერა",
    pricingFeature6: "პერსონალური AI ასისტენტის მორგება",
    pricingTrial: "14 დღიანი უფასო საცდელი პერიოდი",
    pricingCta: "დაიწყე ახლავე",
  },
  eng: {
    // მენიუ და ავტორიზაცია
    navFeatures: "Features",
    navHowItWorks: "How It Works",
    navPricing: "Pricing",
    navContact: "Contact",
    authSignIn: "Sign In",
    authGetStarted: "Get Started",
    dashboardLink: "Dashboard",
    
    // დაშბორდი
    dashLoading: "Loading data...",
    dashGreeting: "Hello",
    dashDefaultUser: "User",
    dashSubscriptionRequired: "Subscription is required to create projects.",
    dashMyProjects: "My Projects",
    dashAddProject: "+ Add Project",
    dashLoadingProjects: "Loading...",
    dashNoProjects: "You haven't created any projects yet.",
    
    // Pricing სექცია
    pricingBadge: "Simple & Transparent Pricing",
    pricingTitle: "Choose the Plan That Fits You",
    pricingSubtitle: "Pay only for what your business actually needs",
    pricingMonthly: "Monthly",
    pricingAnnual: "Annual",
    pricingSave: "Save $100",
    pricingPlanTitle: "Pro Plan",
    pricingPopular: "Popular",
    pricingPlanDesc: "Full automation for small and medium businesses",
    pricingPerMonth: "/mo",
    pricingPerYear: "/yr",
    pricingMonthlySub: "Cancel anytime",
    pricingAnnualSub: "$91.6/mo (billed annually)",
    pricingFeature1: "Access to all AI models (GPT-4o, Claude 3.5)",
    pricingFeature2: "Unlimited chat history & Knowledge Base",
    pricingFeature3: "Integration: Web, WhatsApp, Instagram, Telegram",
    pricingFeature4: "Automated bookings & CRM sync",
    pricingFeature5: "24/7 priority technical support",
    pricingFeature6: "Personal AI assistant customization",
    pricingTrial: "14-day free trial",
    pricingCta: "Get Started Now",
  }
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('geo');

  // აპლიკაციის ჩატვირთვისას ვამოწმებთ localStorage-ს
  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang && (savedLang === 'geo' || savedLang === 'eng')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang); // ვინახავთ მახსოვრობაში
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}