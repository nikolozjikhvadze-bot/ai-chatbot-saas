import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import ChatWidget from "@/components/chatWidget";
import GlobalBackground from "@/components/landing/global-background";
import ClarityTracker from "@/components/ClarityTracker";
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

const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || 'yourbot.site';
const baseUrl = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);

export const metadata: Metadata = {
  metadataBase: baseUrl,
  title: {
    default: 'YourBot - Custom AI Chatbot Platform for Business',
    template: '%s | YourBot',
  },
  description: 'Automate customer support, capture leads, and boost sales 24/7 with intelligent AI chatbots tailored for your business.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'YourBot - Custom AI Chatbot Platform for Business',
    description: 'Automate customer support, capture leads, and boost sales 24/7 with intelligent AI chatbots tailored for your business.',
    url: baseUrl,
    siteName: 'YourBot',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'YourBot AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YourBot - AI Chatbot Platform',
    description: 'Automate your customer support and drive sales 24/7 with custom AI assistants.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <LanguageProvider>
        <html
          lang="en"
          className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
        >
          <head>
            {/* Meta Pixel Base Code */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  fbq('init', '1495178899193431');
                  fbq('track', 'PageView');
                `,
              }}
            />

            {/* DataFast Analytics */}
            <script
              defer
              data-website-id="dfid_M6IwFQqIB8h0ZTkJimOIh"
              data-domain="yourbot.site"
              src="https://datafa.st/js/script.js"
            />

            {/* Google Analytics */}
            <script
              async
              src="https://www.googletagmanager.com/gtag/js?id=G-GQBVB2JHSX"
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-GQBVB2JHSX');
                `,
              }}
            />

            {/* Whop Pixel */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  !function(w,d,s,u,n,a,b){if(w[n])return;a=w[n]={q:[],t:+new Date,s:[],o:u,track:function(){a.q.push([+new Date].concat([].slice.call(arguments)))},setScope:function(){a.s=[].slice.call(arguments).filter(function(x){return typeof x==="string"});a.q.push([+new Date,"setScope"].concat(a.s))},scope:function(){var c=[].slice.call(arguments);return{track:function(){a.q.push([+new Date].concat([].slice.call(arguments)).concat([{__scope:c}]))}}}};b=d.createElement(s);b.async=1;b.src=u+"/s.js";d.getElementsByTagName(s)[0].parentNode.insertBefore(b,d.getElementsByTagName(s)[0])}(window,document,"script","https://t.whop.tw","whop");
                  whop.setScope("biz_hM707CrozReVAm");
                  whop.track("page");
                  whop.track("view_content");
                `,
              }}
            />
          </head>
          <body className="min-h-full flex flex-col bg-[#08070c] text-white relative">
            <ClarityTracker />
            <GlobalBackground />
            <div className="relative z-10 flex-1 flex flex-col">
              {children}
            </div>
            <ChatWidget />
          </body>
        </html>
      </LanguageProvider>
    </ClerkProvider>
  );
}