import type React from "react";
import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Suspense } from "react";
import { MobileBottomNav } from "@/components/mobile-bottom-nav"; // Импортируем MobileBottomNav

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AniHub - Лучший сайт для просмотра аниме онлайн. Совместный просмотр аниме, лучшие новинки, уникальный аниме дизайн и аниме коммьюнити.",
  description: "Лучший сайт для просмотра аниме онлайн. Надоели однотипные сайты? Мы проведём тебя в незабываемый опыт просмотра аниме. Найди своё комьюнити и смотри аниме онлайн со своими друзьями. Совместный просмотр аниме, лучшие новинки, уникальный аниме дизайн и аниме коммьюнити.",
    generator: 'v0.dev'
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
            {/* Добавляем отступ снизу для мобильной навигации */}
            <main className="flex-1 pb-20 md:pb-0">{children}</main> 
            <Footer />
          </div>
          <MobileBottomNav /> {/* Добавляем мобильную нижнюю навигацию */}
        </Providers>
      </body>
    </html>
  );
}
