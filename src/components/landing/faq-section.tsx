'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext'; // თუ შენი LanguageContext სხვა ფაილშია, შეცვალე იმპორტის გზა

export default function FAQSection() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqList = [
    { q: t('faqQ1'), a: t('faqA1') },
    { q: t('faqQ2'), a: t('faqA2') },
    { q: t('faqQ3'), a: t('faqA3') },
    { q: t('faqQ4'), a: t('faqA4') },
    { q: t('faqQ5'), a: t('faqA5') },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-white" id="faq">
      {/* სათაურის ბლოკი */}
      <div className="text-center mb-12 sm:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-purple-300 mb-4 backdrop-blur-md">
          <span>✨ FAQ</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-3">
          {t('faqTitle')}
        </h2>
        <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
          {t('faqSubtitle')}
        </p>
      </div>

      {/* აკორდეონის კითხვა-პასუხები */}
      <div className="space-y-4">
        {faqList.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden backdrop-blur-md ${
                isOpen
                  ? 'bg-white/[0.08] border-purple-500/40 shadow-lg shadow-purple-500/5'
                  : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full py-4 px-5 sm:py-5 sm:px-6 text-left flex justify-between items-center gap-4 group cursor-pointer focus:outline-none"
              >
                <span className="text-base sm:text-lg font-semibold text-gray-100 group-hover:text-white transition-colors">
                  {item.q}
                </span>
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 bg-purple-500/20 border-purple-400/40' : ''
                  }`}
                >
                  <svg
                    className={`w-4 h-4 transition-colors ${
                      isOpen ? 'text-purple-300' : 'text-gray-400 group-hover:text-white'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {/* პასუხის ბლოკი */}
              {isOpen && (
                <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-gray-300 text-sm sm:text-base leading-relaxed border-t border-white/5 pt-4">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}