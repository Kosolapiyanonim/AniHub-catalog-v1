import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster" // Импортируем Toaster
import SupabaseProvider from "@/components/supabase-provider"
import { MobileBottomNav } from "@/components/mobile-bottom-nav" // Импортируем MobileBottomNav

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AniHub - Каталог аниме",
  description: "Ваш центральный хаб для просмотра и отслеживания аниме.",
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
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <SupabaseProvider>
            <Header />
            {children}
            <MobileBottomNav /> {/* Добавляем MobileBottomNav */}
            <Toaster /> {/* Добавляем Toaster в корневой макет */}
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
