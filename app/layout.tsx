import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script"; // <-- Важный импорт
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AniHub - Смотреть аниме онлайн",
  description: "Лучший сайт для просмотра аниме онлайн. Большая коллекция аниме с русской озвучкой и субтитрами.",
    generator: 'v0.dev'
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        {/* Google Tag Manager (noscript) - для пользователей с отключенным JS */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        
        {/* Основное содержимое приложения */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <div className="min-h-screen bg-slate-900 text-white">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </ThemeProvider>

        {/* Оптимизированная загрузка скриптов.
          strategy="afterInteractive" загружает их после того, как страница стала интерактивной.
        */}
        <Suspense fallback={null}>
          <Analytics />
          <SpeedInsights />
          <Script
            id="gtm-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer', '${process.env.NEXT_PUBLIC_GTM_ID}');
            `,
            }}
          />
        </Suspense>
      </body>
    </html>
  );
}
