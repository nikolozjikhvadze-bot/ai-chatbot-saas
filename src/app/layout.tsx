import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import ChatWidget from "@/components/chatWidget"; // შეამოწმე ფაილის გზა
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <LanguageProvider>
      <html
        lang="ka"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      >
        <head>
          {/* Google Analytics სკრიპტი */}
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-GQBVB2JHSX"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-GQBVB2JHSX');
            `}
          </Script>

          {/* Whop Pixel სკრიპტი */}
          <Script id="whop-pixel" strategy="afterInteractive">
            {`
              !function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");
              whop.setScope("biz_hM707CrozReVAm");
              whop.track("page");
            `}
          </Script>
        </head>
        <body className="min-h-full flex flex-col bg-[#08070c] text-white">
          {children}
          {/* გლობალური AI ჩატბოტი */}
          <ChatWidget />
        </body>
      </html>
      </LanguageProvider>
    </ClerkProvider>
  );
}