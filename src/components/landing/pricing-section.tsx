'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/context/LanguageContext'; // გადაამოწმე შენი პათი (Path) სად გაქვს კონტექსტი
import { Check, Sparkles } from 'lucide-react';

export default function PricingSection() {
  const { t } = useTranslation();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // ფასები პაკეტების მიხედვით (შეგიძლია შეცვალო შენი სურვილისამებრ)
  const prices = {
    starter: { monthly: 15, annual: 12 },
    pro: { monthly: 39, annual: 32 },
    scale: { monthly: 99, annual: 85 },
  };

  return (
    <section id="pricing" className="py-24 relative overflow-hidden bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* სათაური და აღწერა */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm mb-4">
            <Sparkles className="w-4 h-4" />
            <span>{t('pricingBadge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            {t('pricingTitle')}
          </h2>
          <p className="text-slate-400 text-lg">
            {t('pricingSubtitle')}
          </p>

          {/* თვიური / წლიური გადამრთველი */}
          <div className="mt-8 inline-flex items-center p-1.5 rounded-full bg-slate-900 border border-slate-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('pricingMonthly')}
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'annual'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('pricingAnnual')}
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-300 font-semibold">
                {t('pricingSave')}
              </span>
            </button>
          </div>
        </div>

        {/* ქარდების ბადე (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* 1. Starter Plan */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between transition-all hover:border-slate-700">
            <div>
              <h3 className="text-xl font-bold mb-2">{t('planStarterTitle')}</h3>
              <p className="text-slate-400 text-sm mb-6">{t('planStarterDesc')}</p>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold">
                  ${billingCycle === 'monthly' ? prices.starter.monthly : prices.starter.annual}
                </span>
                <span className="text-slate-400 text-sm">
                  {billingCycle === 'monthly' ? t('pricingPerMonth') : t('pricingPerYear')}
                </span>
              </div>

              <ul className="space-y-4 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-purple-400 shrink-0" /> {t('featureStarter1')}</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-purple-400 shrink-0" /> {t('featureStarter2')}</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-purple-400 shrink-0" /> {t('featureStarter3')}</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-purple-400 shrink-0" /> {t('featureStarter4')}</li>
              </ul>
            </div>

            <a
              href="https://whop.com" // შენი Whop ლინკი ჩასვი აქ
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-center transition-all block"
            >
              {t('pricingCta')}
            </a>
          </div>

          {/* 2. Pro Plan (Popular - გამოყოფილი დიზაინით) */}
          <div className="bg-gradient-to-b from-purple-900/40 to-slate-900/80 border-2 border-purple-500 rounded-3xl p-8 flex flex-col justify-between relative shadow-xl shadow-purple-950/50">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-purple-600 text-white text-xs font-bold uppercase tracking-wider">
              {t('pricingPopular')}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-2">{t('planProTitle')}</h3>
              <p className="text-slate-300 text-sm mb-6">{t('planProDesc')}</p>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold">
                  ${billingCycle === 'monthly' ? prices.pro.monthly : prices.pro.annual}
                </span>
                <span className="text-slate-400 text-sm">
                  {billingCycle === 'monthly' ? t('pricingPerMonth') : t('pricingPerYear')}
                </span>
              </div>

              <ul className="space-y-4 text-sm text-slate-200 mb-8">
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-purple-400 shrink-0" /> {t('featurePro1')}</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-purple-400 shrink-0" /> {t('featurePro2')}</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-purple-400 shrink-0" /> {t('featurePro3')}</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-purple-400 shrink-0" /> {t('featurePro4')}</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-purple-400 shrink-0" /> {t('featurePro5')}</li>
              </ul>
            </div>

            <a
              href="https://whop.com" // შენი Whop ლინკი ჩასვი აქ
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-center transition-all shadow-lg shadow-purple-600/30 block"
            >
              {t('pricingCta')}
            </a>
          </div>

          {/* 3. Scale Plan */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between transition-all hover:border-slate-700">
            <div>
              <h3 className="text-xl font-bold mb-2">{t('planScaleTitle')}</h3>
              <p className="text-slate-400 text-sm mb-6">{t('planScaleDesc')}</p>
              
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-extrabold">
                  ${billingCycle === 'monthly' ? prices.scale.monthly : prices.scale.annual}
                </span>
                <span className="text-slate-400 text-sm">
                  {billingCycle === 'monthly' ? t('pricingPerMonth') : t('pricingPerYear')}
                </span>
              </div>

              <ul className="space-y-4 text-sm text-slate-300 mb-8">
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-purple-400 shrink-0" /> {t('featureScale1')}</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-purple-400 shrink-0" /> {t('featureScale2')}</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-purple-400 shrink-0" /> {t('featureScale3')}</li>
                <li className="flex items-center gap-3"><Check className="w-4 h-4 text-purple-400 shrink-0" /> {t('featureScale4')}</li>
              </ul>
            </div>

            <a
              href="https://whop.com" // შენი Whop ლინკი ჩასვი აქ
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-center transition-all block"
            >
              {t('pricingCta')}
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}