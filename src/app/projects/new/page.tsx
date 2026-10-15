'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { Sparkles, Globe, FileText, FolderGit2, Loader2, Hotel, ShoppingBag } from 'lucide-react';

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
  const [businessType, setBusinessType] = useState<'hotel' | 'ecom' | 'general'>('hotel');
  const [activeTab, setActiveTab] = useState<'url' | 'files' | 'folder'>('url');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [checkingAuth, setCheckingAuth] = useState(true);

  // 🛑 უსაფრთხოების შემოწმება: თუ გადახდილი არ აქვს, არ ვუშვებთ ამ გვერდზე!
  useEffect(() => {
    async function verifyPaidStatus() {
      try {
        const res = await fetch('/api/user/status');
        const data = await res.json();
        if (!data.isPaid) {
          router.replace('/#pricing'); // გადამისამართება ფასების სექციაზე
        } else {
          setCheckingAuth(false);
        }
      } catch (err) {
        console.error('Failed to verify subscription status:', err);
        router.replace('/#pricing');
      }
    }
    verifyPaidStatus();
  }, [router]);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(t('newProjNameRequired'));
      return;
    }
    if (!websiteUrl.trim()) {
      setError(t('newProjNoFiles'));
      return;
    }

    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('websiteUrl', websiteUrl.trim());
    formData.append('businessType', businessType);

    try {
      const data = await safeJsonFetch('/api/ai/analyze', { method: 'POST', body: formData });
      router.push(`/projects/${data.projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('newProjGeneralError'));
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!title.trim()) {
      setError(t('newProjNameRequired'));
      return;
    }

    const selectedFiles = Array.from(e.target.files);
    setIsUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('businessType', businessType);
    selectedFiles.forEach((file) => {
      formData.append('files', file, file.name);
    });

    try {
      const data = await safeJsonFetch('/api/ai/analyze', { method: 'POST', body: formData });
      router.push(`/projects/${data.projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('newProjGeneralError'));
      setIsUploading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#07060a] text-white flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500 mb-3" />
        <p className="text-xs text-white/50">მოწმდება გამოწერის სტატუსი...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#07060a] text-white flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 blur-[140px] rounded-full pointer-events-none" />

      <Link
        href="/dashboard"
        className="absolute top-6 left-6 md:top-8 md:left-8 text-sm text-white/60 hover:text-white flex items-center gap-2 transition"
      >
        ← {t('backToDashboard')}
      </Link>

      <div className="w-full max-w-xl bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-xl relative z-10 shadow-2xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-300 mx-auto mb-4">
          <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
          <span>AI Assistant Setup</span>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
          {t('newProjHeading')}
        </h1>
        <p className="text-xs text-white/50 text-center mb-6">
          {t('newProjSubheading')}
        </p>

        {/* Business Type Selector */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            type="button"
            onClick={() => setBusinessType('hotel')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition ${
              businessType === 'hotel'
                ? 'border-violet-500 bg-violet-500/15 text-white shadow-lg shadow-violet-500/10'
                : 'border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.05]'
            }`}
          >
            <Hotel className="h-4 w-4 mb-1 text-violet-400" />
            {t('bizHotel')}
          </button>
          <button
            type="button"
            onClick={() => setBusinessType('ecom')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition ${
              businessType === 'ecom'
                ? 'border-violet-500 bg-violet-500/15 text-white shadow-lg shadow-violet-500/10'
                : 'border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.05]'
            }`}
          >
            <ShoppingBag className="h-4 w-4 mb-1 text-fuchsia-400" />
            {t('bizEcommerce')}
          </button>
          <button
            type="button"
            onClick={() => setBusinessType('general')}
            className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition ${
              businessType === 'general'
                ? 'border-violet-500 bg-violet-500/15 text-white shadow-lg shadow-violet-500/10'
                : 'border-white/10 bg-white/[0.02] text-white/60 hover:bg-white/[0.05]'
            }`}
          >
            <Sparkles className="h-4 w-4 mb-1 text-cyan-400" />
            {t('bizGeneral')}
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">
              {t('newProjNameLabel')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('newProjNamePlaceholder')}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition"
            />
          </div>

          {/* Source Tabs */}
          <div className="flex border-b border-white/10 pb-2 gap-4">
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`text-xs font-medium pb-2 transition flex items-center gap-1.5 border-b-2 -mb-2 ${
                activeTab === 'url' ? 'border-violet-500 text-white' : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              <Globe className="h-3.5 w-3.5" /> {t('tabWebsiteUrl')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('files')}
              className={`text-xs font-medium pb-2 transition flex items-center gap-1.5 border-b-2 -mb-2 ${
                activeTab === 'files' ? 'border-violet-500 text-white' : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              <FileText className="h-3.5 w-3.5" /> {t('tabDocuments')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('folder')}
              className={`text-xs font-medium pb-2 transition flex items-center gap-1.5 border-b-2 -mb-2 ${
                activeTab === 'folder' ? 'border-violet-500 text-white' : 'border-transparent text-white/40 hover:text-white/70'
              }`}
            >
              <FolderGit2 className="h-3.5 w-3.5" /> {t('tabCodeFolder')}
            </button>
          </div>

          {/* Tab 1: URL Input */}
          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  {t('lblWebsiteUrl')}
                </label>
                <input
                  type="url"
                  required
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourhotel.ge"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={isUploading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-medium text-white shadow-lg shadow-violet-500/20 hover:opacity-90 transition disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {t('newProjAnalyzing')}
                  </>
                ) : (
                  t('btnGenerateBot')
                )}
              </button>
            </form>
          )}

          {/* Tab 2: Document Upload */}
          {activeTab === 'files' && (
            <div className="pt-2">
              <div className="p-6 rounded-2xl border border-dashed border-violet-500/40 bg-violet-500/[0.03] flex flex-col items-center justify-center text-center relative hover:border-violet-500 hover:bg-violet-500/[0.05] transition cursor-pointer group">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed z-20"
                />
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center mb-3 shadow-lg shadow-violet-500/20 group-hover:scale-110 transition">
                  📄
                </div>
                <h3 className="font-semibold text-sm mb-1">{t('lblUploadFiles')}</h3>
                <p className="text-[11px] text-white/50 max-w-xs">
                  {t('descUploadFiles')}
                </p>

                {isUploading && (
                  <div className="mt-3 flex items-center gap-2 text-violet-400 text-xs animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('newProjAnalyzing')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Folder Upload */}
          {activeTab === 'folder' && (
            <div className="pt-2">
              <div className="p-6 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] flex flex-col items-center justify-center text-center relative hover:border-white/40 transition cursor-pointer group">
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
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                  📁
                </div>
                <h3 className="font-semibold text-sm mb-1">{t('newProjSelectFolderTitle')}</h3>
                <p className="text-[11px] text-white/50 max-w-xs">
                  {t('newProjSelectFolderDesc')}
                </p>

                {isUploading && (
                  <div className="mt-3 flex items-center gap-2 text-violet-400 text-xs animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('newProjAnalyzing')}</span>
                  </div>
                )}
              </div>
            </div>
          )}

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