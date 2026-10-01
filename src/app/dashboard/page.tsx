'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserButton, useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { useTranslation } from '@/context/LanguageContext';

interface Project {
  id: string;
  title: string;
  created_at: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const { t } = useTranslation(); // ამოვიღეთ language, რადგან ტიპებში არ იყო
  const [isPaid, setIsPaid] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('success') === 'true') {
          window.history.replaceState({}, document.title, '/dashboard');
        }
        const res = await fetch('/api/user/status');
        const data = await res.json();
        if (data.isPaid) setIsPaid(true);
      } finally {
        setLoadingStatus(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!isPaid) return;
    async function loadProjects() {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        setProjects(data.projects || []);
      } finally {
        setLoadingProjects(false);
      }
    }
    loadProjects();
  }, [isPaid]);

  if (loadingStatus) {
    return (
      <div className="min-h-screen bg-[#07060a] text-white flex items-center justify-center">
        <p className="text-sm text-violet-400 animate-pulse">{t('dashLoading' as any)}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07060a] text-white">
      <header className="flex items-center justify-between border-b border-white/5 bg-[#08070c]/40 px-6 py-4 backdrop-blur-xl md:px-12">
        <a href="/" className="text-lg font-semibold tracking-tight hover:opacity-80">
          YourBot <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 font-normal">Dashboard</span>
        </a>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/60 hidden sm:inline">
            {t('dashGreeting' as any)}, <span className="text-white font-medium">{user?.firstName || t('dashDefaultUser' as any)}</span>!
          </span>
          <UserButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto w-full p-6 md:p-12">
        {!isPaid ? (
          <div className="text-center py-16 text-white/60">
            {t('dashSubscriptionRequired' as any)}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('dashMyProjects' as any)}</h1>
              <button
                onClick={() => router.push('/projects/new')}
                className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-medium text-white shadow-[0_0_20px_rgba(139,92,246,0.4)] transition hover:opacity-90"
              >
                {t('dashAddProject' as any)}
              </button>
            </div>

            {loadingProjects ? (
              <p className="text-white/50 text-sm">{t('dashLoadingProjects' as any)}</p>
            ) : projects.length === 0 ? (
              <div className="text-center py-16 rounded-3xl border border-dashed border-white/10 text-white/50">
                {t('dashNoProjects' as any)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {projects.map((p) => (
                  <motion.a
                    key={p.id}
                    href={`/projects/${p.id}`}
                    whileHover={{ y: -4 }}
                    className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-violet-500/40 transition block"
                  >
                    <h3 className="font-semibold text-base mb-1 truncate">{p.title}</h3>
                    <p className="text-xs text-white/40">
                      {new Date(p.created_at).toLocaleDateString()}
                    </p>
                  </motion.a>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}