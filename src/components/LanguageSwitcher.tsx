"use client";

import React from "react";
import { useTranslation } from "@/context/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useTranslation();

  return (
    <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 p-1 rounded-lg">
      <button
        onClick={() => setLang("geo")}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
          lang === "geo"
            ? "bg-blue-600 text-white shadow"
            : "text-gray-400 hover:text-white"
        }`}
      >
        GEO
      </button>
      <button
        onClick={() => setLang("eng")}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
          lang === "eng"
            ? "bg-blue-600 text-white shadow"
            : "text-gray-400 hover:text-white"
        }`}
      >
        ENG
      </button>
    </div>
  );
}