'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sparkles, X, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/context/LanguageContext';

export default function TrialSuccessModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // ვამოწმებთ არის თუ არა URL-ში ?success=true ან ?trial=success
    const isSuccess = searchParams.get('success') === 'true' || searchParams.get('trial') === 'success';
    if (isSuccess) {
      setIsOpen(true);
    }
  }, [searchParams]);

  const handleClose = () => {
    setIsOpen(false);
    // ვასუფთავებთ URL-ს პარამეტრებისგან
    router.replace('/dashboard', { scroll: false });
  };

  const handleCreateBot = () => {
    setIsOpen(false);
    router.push('/projects/new');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-violet-500/30 bg-[#0d0c14] p-6 sm:p-8 text-white shadow-2xl shadow-violet-500/20">
        
        {/* ფონის ნათება */}
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-violet-600/30 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-fuchsia-600/20 blur-3xl pointer-events-none" />

        {/* დახურვის ღილაკი */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-xl p-2 text-white/50 hover:bg-white/5 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/30 mb-5">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white mb-2">
            {t('modalTrialTitle')}
          </h3>
          
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-6">
            {t('modalTrialDesc')}
          </p>

          <div className="flex flex-col w-full gap-3">
            <button
              onClick={handleCreateBot}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 hover:opacity-95 transition transform active:scale-95"
            >
              <Sparkles className="h-4 w-4" />
              {t('modalTrialBtn')}
            </button>
            
            <button
              onClick={handleClose}
              className="w-full rounded-xl py-2.5 text-xs font-medium text-white/40 hover:text-white/70 transition"
            >
              {t('modalTrialClose')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}