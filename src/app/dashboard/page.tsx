'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { Sparkles, Plus, Folder, Loader2 } from 'lucide-react';
import TrialSuccessModal from '@/components/TrialSuccessModal';

interface Project {
  id: string;
  title: string;
  created_at: string;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/projects');
        const data = await res.json();
        if (data.success && data.projects) {
          setProjects(data.projects);
        }
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-[#07060a] text-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-[#08070c]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 font-bold text-white shadow-md shadow-violet-500/20">
              Y
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              YourBot
            </span>
          </Link>
          <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300">
            {t('dashboardLink')}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/projects/new"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-90 transition"
          >
            <Plus className="h-4 w-4" />
            {t('dashAddProject')}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t('dashMyProjects')}
            </h1>
            <p className="text-xs sm:text-sm text-white/50 mt-1">
              {t('dashSubtitle')}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/50">
            <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-3" />
            <p className="text-xs">{t('dashLoadingProjects')}</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400 mb-4">
              <Folder className="h-8 w-8" />
            </div>
            <h3 className="text-base font-semibold mb-1">{t('dashNoProjects')}</h3>
            <p className="text-xs text-white/40 max-w-sm mb-6">
              {t('dashNoProjectsDesc')}
            </p>
            <Link
              href="/projects/new"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-90 transition"
            >
              <Sparkles className="h-4 w-4" />
              {t('dashAddProject')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur-md transition hover:border-violet-500/40 hover:bg-white/[0.04]"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20 group-hover:scale-110 transition">
                      🤖
                    </div>
                    <span className="text-[10px] text-white/40">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base text-white group-hover:text-violet-300 transition">
                    {project.title}
                  </h3>
                </div>
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-white/50">
                  <span>AI Assistant</span>
                  <span className="text-violet-400 font-medium group-hover:translate-x-1 transition">
                    {t('dashManage')} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Trial / Payment Success Modal */}
      <TrialSuccessModal />
    </div>
  );
}