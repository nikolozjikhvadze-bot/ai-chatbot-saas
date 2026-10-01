'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'geo' | 'eng';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

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
    
    // ჰერო სექცია (მთავარი გვერდი)
    heroBadge: "ახალი თაობის AI ავტომატიზაცია",
    heroTitleLine1: "ავტომატიზირე შენი ბიზნესი",
    heroTitleLine2: "ინტელექტუალური AI-ით",
    heroDescription: "შექმენი მძლავრი AI ასისტენტები და ბოტები რამდენიმე წუთში, ყოველგვარი კოდის წერის გარეშე.",
    heroCtaButton: "უფასოდ დაწყება",
    
    // დაშბორდი
    dashLoading: "იტვირთება მონაცემები...",
    dashGreeting: "გამარჯობა",
    dashDefaultUser: "მომხმარებელო",
    dashSubscriptionRequired: "გამოწერა საჭიროა პროექტების შესაქმნელად.",
    dashMyProjects: "ჩემი პროექტები",
    dashAddProject: "+ პროექტის დამატება",
    dashLoadingProjects: "იტვირთება...",
    dashNoProjects: "ჯერ არცერთი პროექტი არ გაქვთ შექმნილი.",
    
    // ახალი პროექტის შექმნა (/projects/new)
    newProjNameRequired: "ჯერ პროექტს დაარქვით სახელი.",
    newProjNoFiles: "ფოლდერში შესაბამისი კოდის ფაილები ვერ მოიძებნა.",
    newProjGeneralError: "მოხდა შეცდომა სერვერთან კავშირისას.",
    newProjHeading: "ახალი პროექტის დამატება",
    newProjSubheading: "ატვირთეთ პროექტის ფოლდერი AI ანალიზისა და კოდის გენერაციისთვის",
    newProjNameLabel: "პროექტის სახელი",
    newProjNamePlaceholder: "მაგ. Max's Portfolio",
    newProjSelectFolderTitle: "აირჩიეთ პროექტის ფოლდერი",
    newProjSelectFolderDesc: "დააჭირეთ აქ და აირჩიეთ საქაღალდე",
    newProjAnalyzing: "მიმდინარეობს ანალიზი და AI კოდის გენერაცია...",
    
    // პროექტის დეტალები / ჩატი (/projects/[id])
    projectInitialGreeting: "გამარჯობა! რით შემიძლია დაგეხმაროთ ამ პროექტთან დაკავშირებით?",
    projectLoadError: "პროექტის ჩატვირთვა ვერ მოხერხდა.",
    projectFetchError: "შეცდომა პროექტის ჩატვირთვისას.",
    projectDeleteConfirm: "ნამდვილად გსურთ პროექტისა და მასთან დაკავშირებული ბოტის წაშლა?",
    projectDeleteError: "პროექტის წაშლა ვერ მოხერხდა.",
    serverConnectionError: "შეცდომა სერვერთან დაკავშირებისას.",
    chatFallbackReply: "ბოდიში, პასუხი ვერ მოხერხდა.",
    chatConnectionError: "სერვერთან კავშირის შეცდომა.",
    projectLoading: "იტვირთება პროექტი...",
    backToDashboard: "დაშბორდზე დაბრუნება",
    projectDeleting: "იშლება...",
    projectDelete: "პროექტის წაშლა",
    aiReviewTitle: "AI Review & ანალიზი",
    generatedCodeTitle: "დაგენერირებული კოდი",
    copied: "დაკოპირდა",
    copy: "Copy",
    copyTerminal: "ბრძანების კოპირება",
    terminalBoxTitle: "თუ კოდის ჩასმის შემდეგ ხარვეზი წარმოიქმნა:",
    terminalBoxDesc: "გახსენით ტერმინალი თქვენს პროექტში, გასწმინდეთ დროებითი ქეში და გადატვირთეთ სერვერი:",
    chatLoadingReply: "იწერება პასუხი...",
    chatInputPlaceholder: "დაწერეთ შეტყობინება...",
    chatSendBtn: "გაგზავნა",
    
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
    
    // ჰერო სექცია (მთავარი გვერდი)
    heroBadge: "Next-Gen AI Automation",
    heroTitleLine1: "Automate Your Business",
    heroTitleLine2: "With Intelligent AI",
    heroDescription: "Build powerful AI assistants and bots in minutes, without writing any code.",
    heroCtaButton: "Get Started Free",
    
    // დაშბორდი
    dashLoading: "Loading data...",
    dashGreeting: "Hello",
    dashDefaultUser: "User",
    dashSubscriptionRequired: "Subscription is required to create projects.",
    dashMyProjects: "My Projects",
    dashAddProject: "+ Add Project",
    dashLoadingProjects: "Loading...",
    dashNoProjects: "You haven't created any projects yet.",
    
    // ახალი პროექტის შექმნა (/projects/new)
    newProjNameRequired: "Please name your project first.",
    newProjNoFiles: "No valid code files found in the folder.",
    newProjGeneralError: "An error occurred while connecting to the server.",
    newProjHeading: "Add New Project",
    newProjSubheading: "Upload your project folder for AI analysis and code generation",
    newProjNameLabel: "Project Name",
    newProjNamePlaceholder: "e.g., Max's Portfolio",
    newProjSelectFolderTitle: "Select Project Folder",
    newProjSelectFolderDesc: "Click here to choose a folder",
    newProjAnalyzing: "Analyzing and generating AI code...",
    
    // პროექტის დეტალები / ჩატი (/projects/[id])
    projectInitialGreeting: "Hello! How can I help you with this project?",
    projectLoadError: "Failed to load project.",
    projectFetchError: "Error fetching project.",
    projectDeleteConfirm: "Are you sure you want to delete this project and its associated bot?",
    projectDeleteError: "Failed to delete project.",
    serverConnectionError: "Server connection error.",
    chatFallbackReply: "Sorry, failed to get a response.",
    chatConnectionError: "Server connection error.",
    projectLoading: "Loading project...",
    backToDashboard: "Back to Dashboard",
    projectDeleting: "Deleting...",
    projectDelete: "Delete Project",
    aiReviewTitle: "AI Review & Analysis",
    generatedCodeTitle: "Generated Code",
    copied: "Copied",
    copy: "Copy",
    copyTerminal: "Copy Command",
    terminalBoxTitle: "If an error occurs after pasting the code:",
    terminalBoxDesc: "Open your project terminal, clean the temporary cache, and restart the server:",
    chatLoadingReply: "Typing response...",
    chatInputPlaceholder: "Type a message...",
    chatSendBtn: "Send",
    
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

  useEffect(() => {
    const savedLang = localStorage.getItem('app_language') as Language;
    if (savedLang && (savedLang === 'geo' || savedLang === 'eng')) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage, 
        lang: language, 
        setLang: setLanguage, 
        t 
      }}
    >
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