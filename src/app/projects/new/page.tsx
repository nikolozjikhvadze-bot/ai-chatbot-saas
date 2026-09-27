'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!title.trim()) {
      setError('jer პროექტს დაარქვით სახელი.');
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
      setError('ფოლდერში შესაბამისი კოდის ფაილები ვერ მოიძებნა.');
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
      setError(err instanceof Error ? err.message : 'მოხდა შეცდომა სერვერთან კავშირისას.');
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07060a] text-white p-6 md:p-12 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">ახალი პროექტი</h1>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="პროექტის სახელი (მაგ. Max's Blog)"
        className="w-full mb-6 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/40 focus:outline-none focus:border-violet-500"
      />

      <div className="p-8 rounded-3xl border border-dashed border-violet-500/30 bg-violet-500/[0.02] flex flex-col items-center justify-center text-center relative hover:border-violet-500/60 transition group">
        <input
          type="file"
          multiple
          // @ts-ignore
          webkitdirectory=""
          directory=""
          onChange={handleFileUpload}
          disabled={isUploading}
          className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4 group-hover:scale-110 transition">
          📁
        </div>
        <h3 className="font-semibold text-base mb-1">დააჭირეთ და აირჩიეთ პროექტის ფოლდერი</h3>
        <p className="text-xs text-white/50 max-w-sm">ავტომატურად გააანალიზებს კოდს და შექმნის ახალ პროექტს.</p>
        {isUploading && (
          <p className="text-xs text-violet-400 mt-4 animate-pulse">მიმდინარეობს ანალიზი და AI კოდის გენერაცია...</p>
        )}
      </div>

      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
    </div>
  );
}