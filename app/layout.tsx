import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import Script from "next/script"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Suspense } from "react"
import { Providers } from "@/components/providers"

const inter = Inter({ subsets: ["latin", "cyrillic"], display: "swap" })

export const metadata: Metadata = {
  title: "AniHub - Лучший сайт для просмотра аниме онлайн. Совместный просмотр аниме, лучшие новинки, уникальный аниме дизайн и аниме коммьюнити.",
  description: "Лучший сайт для просмотра аниме онлайн. Надоели однотипные сайты? Мы проведём тебя в незабываемый опыт просмотра аниме. Найди своё комьюнити и смотри аниме онлайн со своими друзьями. Совместный просмотр аниме, лучшие новинки, уникальный аниме дизайн и аниме коммьюнити.",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-900 text-white`}>
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Suspense>
              <Header />
            </Suspense>
            {/* Добавляем отступ снизу для мобильной навигации */}
            <main className="flex-1 mt-16 pb-20 md:pb-0">{children}</main>
            
            {/* Десктопный футер */}
            <div className="hidden md:block">
              <Footer />
            </div>
            
            {/* Мобильная нижняя навигация */}
            <MobileBottomNav />
          </div>
        </Providers>

        <Analytics />
        <SpeedInsights />
        
        {/* Google Tag Manager */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer', '${process.env.NEXT_PUBLIC_GTM_ID}');
          `}
        </Script>
        
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3DCGBWLNEZ"
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
      </body>
    </html>
  )
}
