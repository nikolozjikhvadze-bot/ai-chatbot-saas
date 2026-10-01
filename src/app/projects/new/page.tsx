'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';

async function safeJsonFetch(url: string, options: RequestInit): Promise<any> {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`სერვერმა დააბრუნა არა-JSON პასუხი (სტატუსი ${res.status}). დასაწყისი: ${text.slice(0, 150)}`);
  }
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `მოთხოვნა ვერ შესრულდა (სტატუსი ${res.status}).`);
  }
  return data;
}

export default function NewProjectPage() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!title.trim()) {
      setError(t('newProjNameRequired') || 'ჯერ პროექტს დაარქვით სახელი.');
      return;
    }

    const selectedFiles = Array.from(e.target.files).filter((file: any) => {
      const path = file.webkitRelativePath || file.name;
      return !(
        path.includes('node_modules') ||
        path.includes('.git') ||
        path.includes('.next') ||
        path.includes('dist') ||
        path.includes('build') ||
        path.match(/\.(png|jpg|jpeg|gif|ico|svg|mp4|zip|pdf)$/i)
      );
    });

    if (selectedFiles.length === 0) {
      setError(t('newProjNoFiles') || 'ფოლდერში შესაბამისი კოდის ფაილები ვერ მოიძებნა.');
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title.trim());
    selectedFiles.forEach((file) => {
      formData.append('files', file, (file as any).webkitRelativePath || file.name);
    });

    try {
      const data = await safeJsonFetch('/api/ai/analyze', { method: 'POST', body: formData });
      router.push(`/projects/${data.projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : (t('newProjGeneralError') || 'მოხდა შეცდომა სერვერთან კავშირისას.'));
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#07060a] text-white flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* ფონის გრადიენტული ეფექტი */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* უკან დაბრუნების ღილაკი */}
      <Link
        href="/dashboard"
        className="absolute top-6 left-6 md:top-8 md:left-8 text-sm text-white/60 hover:text-white flex items-center gap-2 transition"
      >
        ← {t('backToDashboard') || 'დაშბორდზე დაბრუნება'}
      </Link>

      <div className="w-full max-w-xl bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-xl relative z-10 shadow-2xl">
        <h1 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          {t('newProjHeading') || 'ახალი პროექტის დამატება'}
        </h1>
        <p className="text-xs text-white/50 text-center mb-8">
          {t('newProjSubheading') || 'ატვირთეთ პროექტის ფოლდერი AI ანალიზისა და კოდის გენერაციისთვის'}
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-2">
              {t('newProjNameLabel') || 'პროექტის სახელი'}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('newProjNamePlaceholder') || "მაგ. Max's Portfolio"}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition"
            />
          </div>

          <div className="p-8 rounded-2xl border border-dashed border-violet-500/40 bg-violet-500/[0.03] flex flex-col items-center justify-center text-center relative hover:border-violet-500 hover:bg-violet-500/[0.05] transition cursor-pointer group">
            <input
              type="file"
              multiple
              // @ts-ignore
              webkitdirectory=""
              directory=""
              onChange={handleFileUpload}
              disabled={isUploading}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
            />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20 group-hover:scale-110 transition">
              📁
            </div>
            <h3 className="font-semibold text-base mb-1">{t('newProjSelectFolderTitle') || 'აირჩიეთ პროექტის ფოლდერი'}</h3>
            <p className="text-xs text-white/50 max-w-xs">
              {t('newProjSelectFolderDesc') || 'დააჭირეთ აქ და აირჩიეთ საქაღალდე'}
            </p>

            {isUploading && (
              <div className="mt-4 flex items-center gap-2 text-violet-400 text-xs animate-pulse">
                <span>⚡</span>
                <span>{t('newProjAnalyzing') || 'მიმდინარეობს ანალიზი და AI კოდის გენერაცია...'}</span>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}