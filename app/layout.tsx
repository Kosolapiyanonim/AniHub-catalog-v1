import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Header } from "@/components/header"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "AniHub - Смотри аниме онлайн бесплатно",
  description:
    "Смотри любимое аниме онлайн бесплатно в высоком качестве на AniHub. Большая коллекция, удобный поиск и регулярные обновления.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning className={inter.variable}>
      <body className="font-sans antialiased">
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-3DCGBWLNEZ" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3DCGBWLNEZ');
          `}
        </Script>
        <Providers>
          <div className="relative flex min-h-screen flex-col bg-background text-foreground">
            <Suspense>
              <Header />
            </Suspense>
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <MobileBottomNav />
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
