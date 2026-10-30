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
    
    // ჰერო სექცია
    heroBadge: "⚡ ჩააშენე 2 წუთში • არ სჭირდება კოდი",
    heroTitleLine1: "მიიღე ჯავშნები და გაყიდვები",
    heroTitleLine2: "24/7 რეჟიმში, AI ჩატბოტით",
    heroDescription: "ჩააშენე ჭკვიანი AI ასისტენტი შენს ვებსაიტზე 2 წუთში. უპასუხე სტუმრებისა და მყიდველების კითხვებს ავტომატურად — ყოველგვარი კოდის წერის გარეშე.",
    heroCtaButton: "დაიწყე 7-დღიანი უფასო ტრიალი",
    heroDemoNotice: "✨ გამოსცადე AI ასისტენტი რეალურ დროში — გახსენი ჩატი მარჯვენა ქვედა კუთხეში!",
    heroScrollLabel: "ასქროლე",
    contactBadge: "კონტაქტი",
    
    // Features სექცია & Use Cases
    featuresMainTitle: "შესაძლებლობები, რომლებიც ზრდის შენს ბიზნესს",
    useCaseBadge1: "სასტუმროები",
    useCaseBadge2: "E-Commerce",
    featureHotelTitle: "AI ასისტენტი სასტუმროებისთვის",
    featureHotelDesc: "ავტომატური პასუხები ნომრების ფასებზე, ჯავშნის პირობებსა და სერვისებზე. სტუმრები იღებენ პასუხს მყისიერად, 24/7-ზე.",
    featureEcomTitle: "ონლაინ მაღაზიების ავტომატიზაცია",
    featureEcomDesc: "ეხმარება მომხმარებელს პროდუქტის შერჩევაში, პასუხობს მიწოდების კითხვებს და ზრდის გაყიდვების კონვერსიას.",
    feature1Title: "ჭკვიანი AI მოდელები",
    feature1Desc: "მუშაობს უახლესი და ყველაზე მძლავრი ენობრივი მოდელების ბაზაზე მაქსიმალური სიზუსტისთვის.",
    feature2Title: "მსუბუქი და სწრაფი ინტეგრაცია",
    feature2Desc: "დააკავშირე შენი პლატფორმა ან ვებსაიტი რამდენიმე მარტივი ნაბიჯით.",
    feature3Title: "უსაფრთხოება და კონტროლი",
    feature3Desc: "შენი მონაცემები მკაცრად დაცულია და სრულ კონტროლქვეშ იმყოფება.",
    feature4Title: "24/7 ავტომატური მხარდაჭერა",
    feature4Desc: "უპასუხე მომხმარებელთა კითხვებს და შეასრულე დავალებები შეფერხებების გარეშე, დღისა და ღამის ნებისმიერ დროს.",

    // FAQ სექცია
    faqTitle: "ხშირად დასმული კითხვები",
    faqSubtitle: "ყველაფერი, რაც გჭირდებათ YourBot-ის შესახებ ცოდნისთვის",
    faqQ1: "როგორ ჩავსვა AI ბოტი ჩემს საიტზე?",
    faqA1: "ძალიან მარტივად! რეგისტრაციის შემდეგ პლატფორმა მოგცემთ კოდის 1 მოკლე სტრიქონს. დააკოპირეთ ის და ჩასვით თქვენი საიტის (WordPress, Shopify, Webflow თუ HTML) HTML კოდში. პროცესს 1 წუთზე ნაკლები სჭირდება და არ მოითხოვს დეველოპერის დახმარებას.",
    faqQ2: "რა მონაცემებზე შემიძლია ვასწავლო AI ასისტენტი?",
    faqA2: "თქვენ შეგიძლიათ ატვირთოთ ნებისმიერი ტექსტური დოკუმენტი (PDF, Word), მიუთითოთ თქვენი ვებსაიტის ბმული (URL) ან ხელით ჩაწიროთ კითხვა-პასუხები. ბოტი წამებში ისწავლის ამ ინფორმაციას და მხოლოდ თქვენს მონაცემებზე დაყრდნობით უპასუხებს მომხმარებლებს.",
    faqQ3: "შემიძლია თუ არა უფასოდ გამოვცადო?",
    faqA3: "დიახ! თქვენ იღებთ 7-დღიან უფასო საცდელ პერიოდს (Free Trial), რათა სრულად გამოსცადოთ პლატფორმის შესაძლებლობები და ნახოთ, როგორ ეხმარება ის თქვენს ბიზნესს.",
    faqQ4: "უსაფრთხოა თუ არა ჩემი ბიზნესის მონაცემები?",
    faqA4: "დიახ, სრულად უსაფრთხოა. თქვენი მონაცემები გამოიყენება მხოლოდ თქვენივე ჩატბოტის საპასუხოდ და არასოდეს გადაეცემა მესამე პირებს ან ზოგადი AI მოდელების დასატრენინგებლად.",
    faqQ5: "შემიძლია თუ არა გამოიწერის გაუქმება ნებისმიერ დროს?",
    faqA5: "დიახ, არანაირი გრძელვადიანი კონტრაქტი არ არის. გამოიწერის გაუქმება ან შეცვლა შეგიძლიათ ნებისმიერ დროს, 1 დაწკაპუნებით Whop-ის მართვის პანელიდან.",

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
    howChip2_1: "უახლესი მოდელები",
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
    chatbotWelcome: "გამარჯობა! 👋 მე ვარ YourBot-ის AI ასისტენტი. შემიძლია გიპასუხო ამ საიტთან დაკავშირებით ყველა კითხვაზე და გაჩვენო, როგორ ვუპასუხებ შენი სასტუმროს ან ონლაინ მაღაზიის მომხმარებლებს 24/7-ზე. დასვი ნებისმიერი კითხვა!",
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
    formSending: "იგზავნება...",
    contactSuccess: "შეტყობინება წარმატებით გაიგზავნა! მალე გიპასუხებთ.",
    contactError: "შეტყობინების გაგზავნა ვერ მოხერხდა. სცადეთ მოგვიანებით.",
    formPrivacyNote: "შენი მონაცემები მკაცრად დაცულია და არასოდეს გადაეცემა მესამე პირებს.",

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
    footerSocialDesc: "დაგვიკავშირდით პლატფორმის მხარდაჭერისთვის ან შემოგვიერთდით საზოგადოებაში.",
    footerAllRights: "ყველა უფლება დაცულია.",
    footerMadeWith: "შექმნილია სიყვარულით",
    footerSecurityNotice: "GDPR Compliant & Enterprise Data Security",

    // დაშბორდი
    dashLoading: "იტვირთება მონაცემები...",
    dashGreeting: "გამარჯობა",
    dashDefaultUser: "მომხმარებელო",
    dashSubscriptionRequired: "გამოწერა საჭიროა პროექტების შესაქმნელად.",
    dashMyProjects: "ჩემი პროექტები",
    dashSubtitle: "მართე შენი AI ასისტენტები და ბიზნეს პროექტები ერთ სივრცეში",
    dashAddProject: "+ პროექტის დამატება",
    dashLoadingProjects: "იტვირთება...",
    dashNoProjects: "ჯერ არცერთი პროექტი არ გაქვთ შექმნილი.",
    dashNoProjectsDesc: "შექმენი შენი პირველი AI ასისტენტი ვებსაიტის ბმულით ან ფაილების ატვირთვით.",
    dashManage: "მართვა",
    dashSubNotActiveTitle: "გამოწერა არ არის აქტიური",
    dashSubNotActiveDesc: "ახალი ბოტის შესაქმნელად და საიტზე განსათავსებლად საჭიროა 7-დღიანი უფასო ტრიალის ან პაკეტის გააქტიურება.",
    dashPayOrTrialBtn: "გადახდა / ტრიალის ჩართვა",
    dashActivateBtn: "გააქტიურება 💳",
    dashActivateTrialBtn: "გააქტიურე 7-დღიანი ტრიალი",

    // ახალი პროექტის შექმნა (/projects/new)
    newProjHeading: "შექმენი შენი AI ასისტენტი",
    newProjSubheading: "აირჩიე შენი ბიზნესის სფერო და მიაწოდე ბოტს ინფორმაცია სტუმრების მოსსახიბლად",
    newProjNameLabel: "ასისტენტის / ბიზნესის სახელი",
    newProjNamePlaceholder: "მაგ. Hotel Paragraph Batumi ან EcoShop.ge",
    newProjNameRequired: "ჯერ პროექტს დაარქვით სახელი.",
    newProjNoFiles: "შესაბამისი ფაილები ვერ მოიძებნა.",
    newProjGeneralError: "მოხდა შეცდომა სერვერთან კავშირისას.",
    newProjSelectFolderTitle: "აირჩიეთ პროექტის სრული ფოლდერი",
    newProjSelectFolderDesc: "კოდის ფაილების ანალიზისთვის (დეველოპერული რეჟიმი)",
    newProjAnalyzing: "მიმდინარეობს ანალიზი და AI ტრენინგი...",
    tabWebsiteUrl: "ვებსაიტის ბმული",
    tabDocuments: "ფაილები (PDF/FAQ)",
    tabCodeFolder: "კოდი / ფოლდერი",
    bizHotel: "სასტუმრო",
    bizEcommerce: "ონლაინ მაღაზია",
    bizGeneral: "სხვა სერვისი",
    lblWebsiteUrl: "შეიყვანეთ თქვენი ვებსაიტის ან მენიუს ბმული",
    lblUploadFiles: "ატვირთეთ ფაილები (PDF, TXT, DOCX)",
    descUploadFiles: "მოათავსეთ სასტუმროს პირობები, ფასები ან პროდუქტების კატალოგი",
    btnGenerateBot: "AI ასისტენტის გენერაცია ⚡",

    // Trial Success Modal
    modalTrialTitle: "🎉 გილოცავ! შენი 7-დღიანი ტრიალი აქტიურია",
    modalTrialDesc: "შენი პლატფორმა მზადაა. შექმენი შენი პირველი AI ასისტენტი 2 წუთში და ჩააშენე შენს ვებსაიტზე.",
    modalTrialBtn: "პირველი ბოტის შექმნა 🚀",
    modalTrialClose: "მოგვიანებით",
    
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

    // Embed Widget & Tabs (ახალი)
    tabEmbedWidget: "🌐 ვებსაიტზე ჩაშენება (Embed)",
    tabDevCode: "💻 დეველოპერული კოდი",
    embedWidgetTitle: "ჩააშენე AI ასისტენტი შენს ვებსაიტზე",
    embedWidgetDesc: "დააკოპირე ეს სკრიპტი და ჩასვი შენი ვებსაიტის მთავარ გვერდზე (<body> ტეგამდე), რომ ბოტი ავტომატურად გამოჩნდეს:",
    embedCopyBtn: "სკრიპტის კოპირება",
    
    // Pricing სექცია
    pricingManageSub: "გამოწერის მართვა / გაუქმება",
    pricingActiveSub: "აქტიური გამოწერა",
    whopSecurePayment: "გადახდა ხორციელდება უსაფრთხოდ Whop-ის პლატფორმის გავლით",
    pricingBadge: "მარტივი და გამჭვირვალე ტარიფი",
    pricingTitle: "შეარჩიე შენზე მორგებული გეგმა",
    pricingSubtitle: "გადაიხადე მხოლოდ იმისთვის, რაც რეალურად სჭირდება შენს ბიზნესს",
    pricingMonthly: "თვიური",
    pricingAnnual: "წლიური",
    pricingSave: "საუკეთესო არჩევანი",
    pricingPerMonth: "/თვე",
    pricingPerYear: "/წელი",
    pricingMonthlySub: "გაუქმება ნებისმიერ დროს",
    pricingAnnualSub: "წლიური გადახდა",
    pricingCta: "გეგმის არჩევა",
    pricingPopular: "პოპულარული",
    pricingFreeTrialBadge: "7-დღიანი უფასო ტრიალი",
    pricingCtaFreeTrial: "უფასო ტრიალის დაწყება",

    // Starter Plan
    planStarterTitle: "Starter",
    planStarterDesc: "იდეალურია დამწყებთათვის და მცირე ტესტებისთვის",
    featureStarter1: "1 AI ბოტი / პროექტი",
    featureStarter2: "1,000 შეტყობინება / თვეში",
    featureStarter3: "ვებ ჩატის ინტეგრაცია",
    featureStarter4: "საბაზისო ტექნიკური მხარდაჭერა",

    // Pro Plan
    planProTitle: "Pro",
    planProDesc: "სრული ავტომატიზაცია მცირე და საშუალო ბიზნესისთვის",
    featurePro1: "3 AI ბოტი / პროექტი",
    featurePro2: "5,000 შეტყობინება / თვეში",
    featurePro3: "ყველა მოწინავე AI მოდელთან წვდომა",
    featurePro4: "მესენჯერ ინტეგრაციები",
    featurePro5: "24/7 პრიორიტეტული მხარდაჭერა",

    // Scale Plan
    planScaleTitle: "Scale",
    planScaleDesc: "ულიმიტო შესაძლებლობები დიდი პროექტებისთვის და გუნდებისთვის",
    featureScale1: "ულიმიტო AI ბოტები",
    featureScale2: "20,000 შეტყობინება / თვეში",
    featureScale3: "VIP 24/7 მხარდაჭერა და მენეჯერი",
    featureScale4: "API სრული წვდომა და CRM სინქრონიზაცია",
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
    heroScrollLabel: "scroll",
    contactBadge: "Contact",
    
    // ჰერო სექცია (განახლებული მჭრელი ბეჯი & სათაური)
    heroBadge: "⚡ Launch in 2 Minutes • No Code Required",
    heroTitleLine1: "Automate 80% of Support",
    heroTitleLine2: "& Capture Leads 24/7",
    heroDescription: "Deploy a smart AI assistant on your website in under 2 minutes. Answer customer questions, boost conversions, and streamline support effortlessly.",
    heroCtaButton: "Start 7-Day Free Trial",
    heroDemoNotice: "✨ Try the live AI Assistant right now — open the chat in the bottom-right corner!",
    
    // Features სექცია & Use Cases
    featuresMainTitle: "Features That Scale Your Business",
    useCaseBadge1: "Hospitality",
    useCaseBadge2: "E-Commerce",
    featureHotelTitle: "AI Assistant for Hotels & Resorts",
    featureHotelDesc: "Automated answers for room availability, pricing, and guest inquiries. Increase direct bookings effortlessly.",
    featureEcomTitle: "E-Commerce Sales Automation",
    featureEcomDesc: "Guides customers through your catalog, answers shipping questions, and boosts overall conversion rates.",
    feature1Title: "Smart AI Models",
    feature1Desc: "Powered by the latest and most advanced language models for maximum accuracy.",
    feature2Title: "Seamless Integration",
    feature2Desc: "Connect your platform or website in just a few simple steps.",
    feature3Title: "Security & Control",
    feature3Desc: "Your data is strictly protected and remains under your full control.",
    feature4Title: "24/7 Automated Support",
    feature4Desc: "Answer customer queries and handle tasks smoothly, day or night.",

    // FAQ სექცია
    faqTitle: "Frequently Asked Questions",
    faqSubtitle: "Everything you need to know about YourBot",
    faqQ1: "How do I embed the AI bot on my website?",
    faqA1: "It's super simple! After signing up, the platform gives you 1 short line of code. Just copy and paste it into your website's HTML (WordPress, Shopify, Webflow, etc.). It takes less than a minute and requires no developer.",
    faqQ2: "What data can I train my AI assistant on?",
    faqA2: "You can upload text documents (PDF, Word), provide your website URL, or manually enter Q&As. The bot learns your content in seconds and only answers based on your data.",
    faqQ3: "Can I try it for free?",
    faqA3: "Yes! You get a 7-day free trial to test all features and see how it works for your business.",
    faqQ4: "Is my business data secure?",
    faqA4: "Yes, completely secure. Your data is used strictly to power your chatbot and is never shared with third parties or used to train public AI models.",
    faqQ5: "Can I cancel my subscription anytime?",
    faqA5: "Yes, there are no long-term contracts. You can cancel or change your plan anytime with 1 click from your Whop dashboard.",

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
    howChip2_1: "New models",
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
    chatbotWelcome: "Hello! 👋 I'm YourBot's AI assistant. I can answer any questions you have about this website and show you how I handle customer queries for your hotel or store 24/7. Ask me anything!",
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
    formSending: "Sending...",
    contactSuccess: "Message sent successfully! We'll get back to you shortly.",
    contactError: "Failed to send message. Please try again later.",
    formPrivacyNote: "Your data is strictly protected and will never be shared with third parties.",

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
    footerSocialDesc: "Reach out to platform support or join our community.",
    footerAllRights: "All rights reserved.",
    footerMadeWith: "Made with",
    footerSecurityNotice: "GDPR Compliant & Enterprise Data Security",

    // დაშბორდი
    dashLoading: "Loading data...",
    dashGreeting: "Hello",
    dashDefaultUser: "User",
    dashSubscriptionRequired: "Subscription is required to create projects.",
    dashMyProjects: "My Projects",
    dashSubtitle: "Manage your AI assistants and business projects in one place",
    dashAddProject: "+ Add Project",
    dashLoadingProjects: "Loading...",
    dashNoProjects: "You haven't created any projects yet.",
    dashNoProjectsDesc: "Create your first AI assistant by providing a website link or uploading files.",
    dashManage: "Manage",
    dashSubNotActiveTitle: "Subscription is not active",
    dashSubNotActiveDesc: "To create a new bot and deploy it on your website, you need to activate a 7-day free trial or choose a plan.",
    dashPayOrTrialBtn: "Payment / Activate Trial",
    dashActivateBtn: "Activate 💳",
    dashActivateTrialBtn: "Activate 7-Day Trial",
    
    // ახალი პროექტის შექმნა (/projects/new)
    newProjHeading: "Create Your AI Assistant",
    newProjSubheading: "Select your business type and provide data to engage your visitors",
    newProjNameLabel: "Assistant / Business Name",
    newProjNamePlaceholder: "e.g., Hotel Paragraph Batumi or EcoShop.ge",
    newProjNameRequired: "Please name your project first.",
    newProjNoFiles: "No valid files found.",
    newProjGeneralError: "An error occurred while connecting to the server.",
    newProjSelectFolderTitle: "Select Complete Project Folder",
    newProjSelectFolderDesc: "For code files analysis (developer mode)",
    newProjAnalyzing: "Analyzing and training AI...",
    tabWebsiteUrl: "Website Link",
    tabDocuments: "Files (PDF/FAQ)",
    tabCodeFolder: "Code / Folder",
    bizHotel: "Hotel & Resort",
    bizEcommerce: "E-Commerce",
    bizGeneral: "Other Service",
    lblWebsiteUrl: "Enter your website or menu URL",
    lblUploadFiles: "Upload Files (PDF, TXT, DOCX)",
    descUploadFiles: "Upload hotel policies, prices, or product catalogs",
    btnGenerateBot: "Generate AI Assistant ⚡",

    // Trial Success Modal
    modalTrialTitle: "🎉 Congratulations! Your 7-day trial is active",
    modalTrialDesc: "Your platform is ready. Create your first AI assistant in 2 minutes and embed it on your website.",
    modalTrialBtn: "Create First Bot 🚀",
    modalTrialClose: "Later",

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

    // Embed Widget & Tabs
    tabEmbedWidget: "🌐 Website Embed Widget",
    tabDevCode: "💻 Developer Code",
    embedWidgetTitle: "Embed AI Assistant on Your Website",
    embedWidgetDesc: "Copy this script and paste it into your website's main page (before the <body> tag) to make the bot appear automatically:",
    embedCopyBtn: "Copy Script",
    
    // Pricing სექცია
    whopSecurePayment: "Secured & processed safely via Whop",
    pricingBadge: "Simple & Transparent Pricing",
    pricingTitle: "Choose the Plan That Fits You",
    pricingSubtitle: "Pay only for what your business actually needs",
    pricingMonthly: "Monthly",
    pricingAnnual: "Annual",
    pricingSave: "Best Value",
    pricingPerMonth: "/mo",
    pricingPerYear: "/yr",
    pricingMonthlySub: "Cancel anytime",
    pricingAnnualSub: "Billed annually",
    pricingCta: "Choose Plan",
    pricingPopular: "Popular",
    pricingFreeTrialBadge: "7-day free trial included",
    pricingCtaFreeTrial: "Start Free Trial",
    pricingManageSub: "Manage / Cancel Subscription",
    pricingActiveSub: "Active Subscription",

    // Starter Plan
    planStarterTitle: "Starter",
    planStarterDesc: "Ideal for beginners and small tests",
    featureStarter1: "1 AI Bot / Project",
    featureStarter2: "1,000 messages / month",
    featureStarter3: "Web chat integration",
    featureStarter4: "Basic technical support",

    // Pro Plan
    planProTitle: "Pro",
    planProDesc: "Full automation for small and medium businesses",
    featurePro1: "3 AI Bots / Projects",
    featurePro2: "5,000 messages / month",
    featurePro3: "Access to all advanced AI models",
    featurePro5: "24/7 priority support",

    // Scale Plan
    planScaleTitle: "Scale",
    planScaleDesc: "Unlimited capabilities for large projects and teams",
    featureScale1: "Unlimited AI bots",
    featureScale2: "20,000 messages / month",
    featureScale3: "VIP 24/7 support & manager",
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