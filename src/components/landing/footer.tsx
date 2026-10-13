'use client';

import { Sparkles, Globe, MessageSquare, ShieldCheck } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative z-10 border-t border-white/10 bg-[#08070c] py-12 text-white">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 bottom-0 h-[150px] w-full max-w-[800px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          {/* Brand Info */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 font-bold text-white shadow-md shadow-violet-500/20">
                Y
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
                YourBot
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-white/50">
              {t('footerBrandDesc')}
            </p>
            {/* GDPR / Security Trust Badge */}
            <div className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>{t('footerSecurityNotice')}</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/80">
              {t('footerNavTitle')}
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-white/60">
              <li>
                <a href="#features" className="transition hover:text-white">
                  {t('footerNavFeatures')}
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="transition hover:text-white">
                  {t('footerNavHowItWorks')}
                </a>
              </li>
              <li>
                <a href="#pricing" className="transition hover:text-white">
                  {t('footerNavPricing')}
                </a>
              </li>
              <li>
                <a href="#contact" className="transition hover:text-white">
                  {t('footerNavContact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/80">
              {t('footerLegalTitle')}
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-white/60">
              <li>
                <a href="/privacy" className="transition hover:text-white">
                  {t('footerLegalPrivacy')}
                </a>
              </li>
              <li>
                <a href="/terms" className="transition hover:text-white">
                  {t('footerLegalTerms')}
                </a>
              </li>
              <li>
                <a href="/cookies" className="transition hover:text-white">
                  {t('footerLegalCookies')}
                </a>
              </li>
            </ul>
          </div>

          {/* Socials / Contact Info */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white/80">
              {t('footerSocialTitle')}
            </h4>
            <p className="mt-3 text-xs text-white/50 leading-relaxed">
              {t('footerSocialDesc')}
            </p>
            <div className="mt-4 flex gap-2.5 text-white/60">
              <a
                href="https://whop.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Whop Platform"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-violet-500/40 hover:bg-white/[0.06] hover:text-white"
                title="Whop Platform"
              >
                <Globe className="h-4 w-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Community"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-violet-500/40 hover:bg-white/[0.06] hover:text-white"
                title="Community"
              >
                <MessageSquare className="h-4 w-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row text-xs text-white/40">
          <p>© {new Date().getFullYear()} YourBot. {t('footerAllRights')}</p>
          <p className="flex items-center gap-1.5">
            {t('footerMadeWith')} <Sparkles className="h-3 w-3 text-fuchsia-400" />
          </p>
        </div>
      </div>
    </footer>
  );
}