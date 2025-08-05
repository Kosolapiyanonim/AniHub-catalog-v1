"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import SupabaseProvider from "@/components/supabase-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { Suspense } from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <SupabaseProvider>
        <ErrorBoundary>
          <Suspense fallback={<div>Загрузка...</div>}>{children}</Suspense>
        </ErrorBoundary>
        <Toaster />
      </SupabaseProvider>
    </ThemeProvider>
  )
}
