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
    
    // Features სექცია
    featuresMainTitle: "შესაძლებლობები, რომლებიც ზრდის შენს ბიზნესს",
    feature1Title: "ჭკვიანი AI მოდელები",
    feature1Desc: "მუშაობს უახლესი და ყველაზე მძლავრი ენობრივი მოდელების ბაზაზე მაქსიმალური სიზუსტისთვის.",
    feature2Title: "მსუბუქი და სწრაფი ინტეგრაცია",
    feature2Desc: "დააკავშირე შენი პლატფორმა ან ვებსაიტი რამდენიმე მარტივი ნაბიჯით.",
    feature3Title: "უსაფრთხოება და კონტროლი",
    feature3Desc: "შენი მონაცემები მკაცრად დაცულია და სრულ კონტროლქვეშ იმყოფება.",
    feature4Title: "24/7 ავტომატური მხარდაჭერა",
    feature4Desc: "უპასუხე მომხმარებელთა კითხვებს და შეასრულე დავალებები შეფერხებების გარეშე, დღისა და ღამის ნებისმიერ დროს.",

    // How It Works სექცია
    howTitlePrefix: "როგორ შევქმნათ",
    howTitleSuffix: "მარტივად",
    howSubtitle: "სამი მარტივი ნაბიჯი შენი პერსონალური AI ასისტენტის გასაშვებად",
    howStep1Title: "ატვირთე მონაცემები",
    howStep1Desc: "მიაწოდე ბოტს შენი დოკუმენტები, ფოლდერები ან ვებსაიტის ლინკი ცოდნის ბაზის შესაქმნელად.",
    howChip1_1: "კოდის ფაილები",
    howChip1_2: "დოკუმენტები",
    howStep2Title: "დააკონფიგურირე",
    howStep2Desc: "აირჩიე სასურველი AI მოდელი, მიეცი ინსტრუქციები და მოარგე ბოტის ხასიათი.",
    howChip2_1: "GPT-4o / Claude",
    howChip2_2: "პერსონალიზაცია",
    howChip2_3: "ინსტრუქციები",
    howStep3Title: "გაუშვი და მართე",
    howStep3Desc: "ინტეგრირე ბოტი შენს ვებსაიტზე ან მესენჯერებში და მიიღე შედეგები.",
    howChip3_1: "ვებ ჩატი",
    howChip3_2: "მესენჯერები",
    howChip3_3: "ანალიტიკა",

    // Chatbot ვიჯეტი (მთავარ გვერდზე)
    chatbotTitle: "AI ასისტენტი",
    chatbotOnline: "ონლაინ არის",
    chatbotWelcome: "გამარჯობა! მე შენი AI ასისტენტი ვარ. რით შემიძლია დაგეხმარო დღეს?",
    chatbotPlaceholder: "დაწერე შეტყობინება...",
    chatbotSend: "გაგზავნა",
    chatbotToggle: "ჩატის გახსნა",

    // Contact სექცია
    contactTitle1: "დაგვიკავშირდი",
    contactTitleHighlight: "ნებისმიერ დროს",
    contactTitle2: "ჩვენ მზად ვართ დასახმარებლად",
    contactSubtitle: "გაქვს კითხვები ან გჭირდება დახმარება ინტეგრაციაში? მოგვწერე!",
    contactEmailTitle: "ელ-ფოსტა",
    contactPhoneTitle: "ტელეფონი",
    contactOfficeTitle: "ოფისი",
    contactOfficeValue: "თბილისი, საქართველო",
    supportBoxTitle: "24/7 ტექნიკური მხარდაჭერა",
    supportBoxText: "ჩვენი გუნდი მზადაა უპასუხოს შენს ნებისმიერ ტექნიკურ კითხვას.",
    formNameLabel: "სახელი",
    formNamePlaceholder: "მაგ. გიორგი",
    formEmailLabel: "ელ-ფოსტა",
    formMessageLabel: "შეტყობინება",
    formMessagePlaceholder: "დაწერე შენი შეტყობინება აქ...",
    formSubmit: "გაგზავნა",

    // Footer სექცია
    footerBrandDesc: "შენი AI ასისტენტი და ავტომატიზაციის პლატფორმა.",
    footerNavTitle: "ნავიგაცია",
    footerNavFeatures: "შესაძლებლობები",
    footerNavHowItWorks: "როგორ მუშაობს",
    footerNavPricing: "ფასები",
    footerNavContact: "კონტაქტი",
    footerLegalTitle: "კონფიდენციალურობა",
    footerLegalPrivacy: "მონაცემთა დაცვა",
    footerLegalTerms: "მომსახურების პირობები",
    footerLegalCookies: "ქუქი ფაილები",
    footerSocialTitle: "სოციალური ქსელები",
    footerAllRights: "ყველა უფლება დაცულია.",
    footerMadeWith: "შექმნილია სიყვარულით",

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
    
    // Features სექცია
    featuresMainTitle: "Features That Scale Your Business",
    feature1Title: "Smart AI Models",
    feature1Desc: "Powered by the latest and most advanced language models for maximum accuracy.",
    feature2Title: "Seamless Integration",
    feature2Desc: "Connect your platform or website in just a few simple steps.",
    feature3Title: "Security & Control",
    feature3Desc: "Your data is strictly protected and remains under your full control.",
    feature4Title: "24/7 Automated Support",
    feature4Desc: "Answer customer queries and handle tasks smoothly, day or night.",

    // How It Works სექცია
    howTitlePrefix: "How to Build",
    howTitleSuffix: "Easily",
    howSubtitle: "Three simple steps to launch your personal AI assistant",
    howStep1Title: "Upload Data",
    howStep1Desc: "Provide the bot with your documents, folders, or website link to build a knowledge base.",
    howChip1_1: "Code Files",
    howChip1_2: "Documents",
    howStep2Title: "Configure",
    howStep2Desc: "Choose your preferred AI model, provide instructions, and customize the bot's persona.",
    howChip2_1: "GPT-4o / Claude",
    howChip2_2: "Personalization",
    howChip2_3: "Instructions",
    howStep3Title: "Launch & Manage",
    howStep3Desc: "Integrate the bot into your website or messengers and review results.",
    howChip3_1: "Web Chat",
    howChip3_2: "Messengers",
    howChip3_3: "Analytics",

    // Chatbot ვიჯეტი (მთავარ გვერდზე)
    chatbotTitle: "AI Assistant",
    chatbotOnline: "Online",
    chatbotWelcome: "Hello! I am your AI assistant. How can I help you today?",
    chatbotPlaceholder: "Type a message...",
    chatbotSend: "Send",
    chatbotToggle: "Open Chat",

    // Contact სექცია
    contactTitle1: "Get in Touch",
    contactTitleHighlight: "Anytime",
    contactTitle2: "We are ready to help",
    contactSubtitle: "Have questions or need integration assistance? Drop us a line!",
    contactEmailTitle: "Email",
    contactPhoneTitle: "Phone",
    contactOfficeTitle: "Office",
    contactOfficeValue: "Tbilisi, Georgia",
    supportBoxTitle: "24/7 Tech Support",
    supportBoxText: "Our team is ready to answer any technical questions you have.",
    formNameLabel: "Name",
    formNamePlaceholder: "e.g., Giorgi",
    formEmailLabel: "Email",
    formMessageLabel: "Message",
    formMessagePlaceholder: "Type your message here...",
    formSubmit: "Send Message",

    // Footer სექცია
    footerBrandDesc: "Your AI assistant and automation platform.",
    footerNavTitle: "Navigation",
    footerNavFeatures: "Features",
    footerNavHowItWorks: "How It Works",
    footerNavPricing: "Pricing",
    footerNavContact: "Contact",
    footerLegalTitle: "Legal",
    footerLegalPrivacy: "Privacy Policy",
    footerLegalTerms: "Terms of Service",
    footerLegalCookies: "Cookie Policy",
    footerSocialTitle: "Socials",
    footerAllRights: "All rights reserved.",
    footerMadeWith: "Made with",

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