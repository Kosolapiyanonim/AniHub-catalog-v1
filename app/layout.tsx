import type React from "react";
import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav"; // Импортируем MobileBottomNav
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AniHub - Смотри аниме онлайн бесплатно",
  description: "Смотри любимое аниме онлайн бесплатно в высоком качестве на AniHub. Большая коллекция, удобный поиск и регулярные обновления.",
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-900 text-white`}>
        {/* --- Google Analytics (gtag.js) --- */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=G-3DCGBWLNEZ`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3DCGBWLNEZ');
          `}
        </Script>
        {/* --- Конец Google Analytics --- */}
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Suspense>
              <Header />
            </Suspense>
            <main className="flex-1 pb-16">{children}</main> {/* Добавлен padding-bottom для нижней навигации */}
            <Suspense>
              <MobileBottomNav /> {/* Добавлена мобильная нижняя навигация */}
            </Suspense>
          </div>
        </Providers>
      </body>
    </html>
  );
}
