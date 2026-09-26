'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Sparkles, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const contactInfo = [
  {
    icon: Mail,
    title: 'ელ.ფოსტა',
    value: 'support@yourbot.ge',
    href: 'mailto:support@yourbot.ge',
  },
  {
    icon: Phone,
    title: 'ტელეფონი',
    value: '+995 555 00 00 00',
    href: 'tel:+995555000000',
  },
  {
    icon: MapPin,
    title: 'ოფისი',
    value: 'თბილისი, საქართველო',
    href: '#',
  },
];

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="contact" className="relative z-10 overflow-hidden bg-[#08070c] pt-24 pb-12 text-white border-t border-white/5">
      {/* Background Ambient Glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[140px]" />
        <div className="absolute -bottom-20 left-1/4 h-[300px] w-[300px] rounded-full bg-fuchsia-500/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
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
            <span>დაგვიკავშირდით</span>
          </div>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            მზად ხართ{' '}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              გააზრდოთ ბიზნესი
            </span>{' '}
            AI-თან ერთად?
          </h2>
          <p className="mt-3 text-base text-white/60">
            მოგვწერეთ ნებისმიერი კითხვა ან მოითხოვეთ პერსონალური დემო პრეზენტაცია.
          </p>
        </motion.div>

        {/* Contact Grid: Info + Form */}
        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Side: Contact Cards */}
          <div className="flex flex-col justify-between gap-4 lg:col-span-5">
            <div className="space-y-4">
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
                    className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md transition-all duration-300 hover:border-violet-500/40 hover:bg-white/[0.04]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0d0c14] text-violet-400 transition-colors duration-300 group-hover:border-violet-500/30 group-hover:text-fuchsia-400">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-white/40">{item.title}</p>
                        <p className="mt-0.5 text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">
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
              className="rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-500/10 to-transparent p-6 backdrop-blur-md"
            >
              <h4 className="text-sm font-semibold text-violet-300">24/7 მხარდაჭერის გუნდი</h4>
              <p className="mt-1 text-xs leading-relaxed text-white/60">
                ჩვენი ტექნიკური გუნდი მზადაა დაგეხმაროთ AI ასისტენტის გამართვასა და ბიზნეს-პროცესების ავტომატიზაციაში.
              </p>
            </motion.div>
          </div>

          {/* Right Side: Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative rounded-3xl border border-white/10 bg-white/[0.02] p-8 backdrop-blur-xl lg:col-span-7"
          >
            {/* Glowing Accent Border inside Form */}
            <div className="pointer-events-none absolute -inset-px rounded-3xl border border-violet-500/20 opacity-0 transition-opacity duration-500 hover:opacity-100" />

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-white/60">თქვენი სახელი</label>
                  <input
                    type="text"
                    required
                    placeholder="გიორგი გიორგაძე"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition duration-200 focus:border-violet-500 focus:bg-white/[0.05]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/60">ელ.ფოსტა</label>
                  <input
                    type="email"
                    required
                    placeholder="giorgi@company.ge"
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition duration-200 focus:border-violet-500 focus:bg-white/[0.05]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/60">შეტყობინება</label>
                <textarea
                  rows={4}
                  required
                  placeholder="გამარჯობა, მაინტერესებს YourBot-ის ინტეგრაცია ჩემს ვებსაიტზე..."
                  className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition duration-200 focus:border-violet-500 focus:bg-white/[0.05]"
                />
              </div>

              <button
                type="submit"
                disabled={submitted}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 p-px font-medium text-white shadow-lg transition duration-300 hover:shadow-violet-500/25 active:scale-[0.99]"
              >
                <span className="flex w-full items-center justify-center gap-2 rounded-[11px] bg-[#0d0c14] px-6 py-3.5 text-sm transition duration-300 group-hover:bg-transparent">
                  {submitted ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>შეტყობინება გაიგზავნა!</span>
                    </>
                  ) : (
                    <>
                      <span>შეტყობინების გაგზავნა</span>
                      <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </span>
              </button>
            </form>
          </motion.div>

        </div>

        {/* Footer Area */}
        <div className="mt-24 border-t border-white/10 pt-10">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            
            {/* Logo & Tagline */}
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                YourBot
              </span>
              <p className="mt-1 text-xs text-white/40">
                ავტომატური AI ასისტენტი თქვენი ბიზნესისთვის
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-white/60">
              <a href="#features" className="hover:text-white transition-colors">
                შესაძლებლობები
              </a>
              <a href="#how-it-works" className="hover:text-white transition-colors">
                როგორ მუშაობს
              </a>
              <a href="#pricing" className="hover:text-white transition-colors">
                ფასები
              </a>
              <a href="#contact" className="hover:text-white transition-colors">
                კონტაქტი
              </a>
            </div>

            {/* Copyright */}
            <p className="text-xs text-white/40">
              © {new Date().getFullYear()} YourBot. ყველა უფლება დაცულია.
            </p>

          </div>
        </div>

      </div>
    </section>
  );
}