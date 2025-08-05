import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import SupabaseProvider from "@/components/supabase-provider"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AniHub - Смотри аниме онлайн бесплатно",
  description:
    "Смотри любимое аниме онлайн бесплатно в высоком качестве на AniHub. Большая коллекция аниме сериалов и фильмов.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SupabaseProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">
                <ErrorBoundary>
                  <Suspense fallback={<div>Загрузка...</div>}>{children}</Suspense>
                </ErrorBoundary>
              </main>
              <Footer />
            </div>
            <Toaster />
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
