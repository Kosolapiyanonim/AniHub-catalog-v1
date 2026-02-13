import type React from "react";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from 'next/font/google';
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { ScrollToTop } from "@/components/scroll-to-top";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://anihub.wtf"),
  title: {
    default: "AniHub — аниме онлайн бесплатно",
    template: "%s | AniHub",
  },
  description:
    "AniHub — сайт для просмотра аниме онлайн бесплатно. Смотрите Магическая битва, Магическая битва 3 сезон и другие тайтлы в хорошем качестве.",
  keywords: [
    "анихаб",
    "аниме",
    "аниме онлайн",
    "аниме магическая битва",
    "магическая битва",
    "магическая битва 3 сезон",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AniHub — аниме онлайн бесплатно",
    description:
      "Смотрите аниме онлайн на AniHub: Магическая битва, Магическая битва 3 сезон и другие популярные аниме-сериалы.",
    url: "/",
    siteName: "AniHub",
    locale: "ru_RU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AniHub — аниме онлайн бесплатно",
    description:
      "AniHub: аниме онлайн, включая Магическая битва и Магическая битва 3 сезон.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  generator: "v0.app",
};

export default function RootLayout({ children }: { children: React.ReactNode; }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased bg-background text-foreground`}>
        {/* --- Google Analytics (gtag.js) --- */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        {/* --- Конец Google Analytics --- */}
        <Providers>
          <div className="relative flex min-h-screen flex-col">
            <Suspense>
              <Header />
            </Suspense>
            <div className="h-16" /> {/* Spacer for fixed header */}
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Suspense>
              <MobileBottomNav />
            </Suspense>
            <ScrollToTop />
          </div>
        </Providers>
      </body>
    </html>
  );
}
