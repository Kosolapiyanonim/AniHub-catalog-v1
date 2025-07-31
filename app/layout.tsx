import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import { GoogleAnalytics } from "@next/third-parties/google"
import { SupabaseProvider } from "@/components/supabase-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AniHub",
  description: "Your ultimate anime streaming hub",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Suspense fallback={<div>Loading...</div>}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SupabaseProvider>{children}</SupabaseProvider>
            <Toaster />
          </ThemeProvider>
        </Suspense>
      </body>
      <GoogleAnalytics gaId="G-3DCGBWLNEZ" />
    </html>
  )
}
