import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ApiStatus } from "@/components/api-status"
import { Header } from "@/components/header"

const inter = Inter({ subsets: ["latin", "cyrillic"] })

export const metadata: Metadata = {
  title: "AnimeSite - Смотреть аниме онлайн",
  description: "Лучшая коллекция аниме в высоком качестве. Смотрите любимые аниме бесплатно.",
  keywords: "аниме, смотреть онлайн, бесплатно, HD качество",
  verification: {
    google: "XkUCPjQmoapTDDjIMH0zRCUkEE_Cr2bgltjo-ZlnDDs",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <Header />
        {children}
        <ApiStatus />
      </body>
    </html>
  )
}
