'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Sparkles, ArrowUpRight, Loader2, ShieldCheck } from 'lucide-react';
import { sendEmailAction } from '@/app/actions/send-email';
import { useTranslation } from '@/context/LanguageContext';

export default function ContactSection() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  const contactInfo = [
    {
      icon: Mail,
      title: t('contactEmailTitle'),
      value: 'yourbot95@gmail.com',
      href: 'mailto:yourbot95@gmail.com',
    },
    {
      icon: Phone,
      title: t('contactPhoneTitle'),
      value: '+995 501 44 46 65',
      href: 'tel:+995501444665',
    },
    {
      icon: MapPin,
      title: t('contactOfficeTitle'),
      value: t('contactOfficeValue'),
      href: '#',
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    const res = await sendEmailAction(formData);

    setLoading(false);
    if (res.success) {
      setStatus({ type: 'success', message: t('contactSuccess') });
      setFormData({ name: '', email: '', message: '' });
    } else {
      setStatus({ type: 'error', message: res.error || t('contactError') });
    }
  };

  return (
    <section id="contact" className="relative z-10 overflow-hidden bg-[#08070c] pt-16 pb-12 text-white border-t border-white/5 sm:pt-24">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[300px] sm:h-[400px] w-full max-w-[600px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute -bottom-20 left-1/4 h-[250px] w-[250px] sm:h-[300px] sm:w-[300px] rounded-full bg-fuchsia-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300">
            <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
            <span>{t('contactBadge')}</span>
          </div>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
            {t('contactTitle1')}{' '}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              {t('contactTitleHighlight')}
            </span>{' '}
            {t('contactTitle2')}
          </h2>
          <p className="mt-3 text-xs sm:text-base text-white/60">
            {t('contactSubtitle')}
          </p>
        </motion.div>

        {/* Contact Grid: Info + Form */}
        <div className="mt-12 grid grid-cols-1 gap-8 sm:mt-16 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Side: Contact Cards */}
          <div className="flex flex-col justify-between gap-4 lg:col-span-5">
            <div className="space-y-3 sm:space-y-4">
              {contactInfo.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.a
                    key={item.title}
                    href={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 backdrop-blur-md transition-all duration-300 hover:border-violet-500/40 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0d0c14] text-violet-400 transition-colors duration-300 group-hover:border-violet-500/30 group-hover:text-fuchsia-400">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] sm:text-xs font-medium text-white/40">{item.title}</p>
                        <p className="mt-0.5 text-xs sm:text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">
                          {item.value}
                        </p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-white/30 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                  </motion.a>
                );
              })}
            </div>

            {/* Support Callout Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/10 to-transparent p-5 backdrop-blur-md"
            >
              <h4 className="text-xs sm:text-sm font-semibold text-violet-300">{t('supportBoxTitle')}</h4>
              <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-white/60">
                {t('supportBoxText')}
              </p>
            </motion.div>
          </div>

          {/* Right Side: Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 backdrop-blur-xl lg:col-span-7"
          >
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div>
                  <label className="block text-xs font-medium text-white/60">{t('formNameLabel')}</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('formNamePlaceholder')}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 sm:py-3 text-sm text-white placeholder-white/20 outline-none transition duration-200 focus:border-violet-500 focus:bg-white/[0.05]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60">{t('formEmailLabel')}</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="giorgi@company.ge"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 sm:py-3 text-sm text-white placeholder-white/20 outline-none transition duration-200 focus:border-violet-500 focus:bg-white/[0.05]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60">{t('formMessageLabel')}</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t('formMessagePlaceholder')}
                  className="mt-1.5 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 sm:py-3 text-sm text-white placeholder-white/20 outline-none transition duration-200 focus:border-violet-500 focus:bg-white/[0.05]"
                />
              </div>

              {/* Status Message */}
              {status.message && (
                <div
                  className={`rounded-xl p-3 text-xs font-medium ${
                    status.type === 'success'
                      ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                      : 'border border-rose-500/30 bg-rose-500/10 text-rose-400'
                  }`}
                >
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 p-px font-medium text-white shadow-lg transition duration-300 hover:shadow-violet-500/25 disabled:opacity-50"
              >
                <span className="flex w-full items-center justify-center gap-2 rounded-[11px] bg-[#0d0c14] px-6 py-3 text-sm transition duration-300 group-hover:bg-transparent">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> {t('formSending')}
                    </>
                  ) : (
                    <>
                      {t('formSubmit')}
                      <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </button>

              {/* Security Assurance under form */}
              <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-white/40">
                <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
                <span>{t('formPrivacyNote')}</span>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}