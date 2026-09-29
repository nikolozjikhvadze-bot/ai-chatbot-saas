import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import ChatWidget from "@/components/chatWidget"; // შეამოწმე ფაილის გზა
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// დაემატა fallback, რათა undefined-ის შემთხვევაში new URL()-მა შეცდომა არ ამოაგდოს
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'AI ასისტენტი - ჭკვიანი ჩატ-ბოტი',
    template: '%s | AI ასისტენტი',
  },
  description: 'ინტელექტუალური AI ჩატ-ასისტენტი თქვენი ბიზნესისთვის.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AI ასისტენტი - ჭკვიანი ჩატ-ბოტი',
    description: 'ინტელექტუალური AI ჩატ-ასისტენტი თქვენი ბიზნესისთვის.',
    url: baseUrl,
    siteName: 'AI ასისტენტი',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI ასისტენტი',
      },
    ],
    locale: 'ka_GE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI ასისტენტი',
    description: 'ინტელექტუალური AI ჩატ-ასისტენტი თქვენი ბიზნესისთვის.',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'your-google-verification-code', // შეცვალე რეალური კოდით, როცა Google Search Console-ზე დაამატებ
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html
        lang="ka"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark overflow-x-hidden`}
      >
        <body className="min-h-full flex flex-col bg-[#08070c] text-white overflow-x-hidden relative">
          {children}
          {/* გლობალური AI ჩატბოტი */}
          <ChatWidget />
        </body>
      </html>
    </ClerkProvider>
  );
}