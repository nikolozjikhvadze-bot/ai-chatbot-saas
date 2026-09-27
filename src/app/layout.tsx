import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import ChatWidget from "@/components/chatWidget"; // 👈 შეამოწმე რომ ფაილის გზა სწორია (მაგ. @/components/ChatWidget)
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YourBot — AI ასისტენტი თქვენი ბიზნესისთვის",
  description: "შექმენით თქვენი AI ბოტი მარტივად",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html
        lang="ka"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      >
        <body className="min-h-full flex flex-col bg-[#08070c] text-white">
          {children}
          {/* ლოკალური და პროდაქშენ საიტის გლობალური AI ჩატბოტი */}
          <ChatWidget botId="3c5f43d0-eb9d-48dc-88f3-708939606dff" />
        </body>
      </html>
    </ClerkProvider>
  );
}