'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes'
import { SupabaseProvider } from './supabase-provider'

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark" // Устанавливаем темную тему по умолчанию
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <SupabaseProvider>
        {children}
      </SupabaseProvider>
    </NextThemesProvider>
  )
}
