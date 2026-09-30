"tsx";
"use client";

import React, { createContext, useContext, useState } from "react";
import ka from "@/dictionaries/ka.json";
import en from "@/dictionaries/en.json";

const dictionaries = { ka, en };

type Language = "ka" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: keyof typeof ka) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("ka");

  const t = (key: keyof typeof ka) => {
    return dictionaries[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}