'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  // სატესტოდ ვმალავთ მთლიან გადამრთველს, რომ საიტი მუდმივად ინგლისურზე იყოს
  // ორიგინალური კოდი ინახება ქვემოთ კომენტარში:
  /*
  return (
    <div className="relative inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] p-1 backdrop-blur-md">
      <motion.div
        className="absolute bottom-1 top-1 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 shadow-[0_0_12px_rgba(139,92,246,0.5)]"
        initial={false}
        animate={{
          x: language === 'geo' ? 0 : '100%',
          width: 'calc(50% - 4px)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
      <button
        type="button"
        onClick={() => setLanguage('geo')}
        className={`relative z-10 px-3 py-1 text-xs font-semibold tracking-wider transition-colors duration-200 cursor-pointer ${
          language === 'geo' ? 'text-white' : 'text-white/50 hover:text-white/80'
        }`}
      >
        GEO
      </button>
      <button
        type="button"
        onClick={() => setLanguage('eng')}
        className={`relative z-10 px-3 py-1 text-xs font-semibold tracking-wider transition-colors duration-200 cursor-pointer ${
          language === 'eng' ? 'text-white' : 'text-white/50 hover:text-white/80'
        }`}
      >
        ENG
      </button>
    </div>
  );
  */

  return null;
}