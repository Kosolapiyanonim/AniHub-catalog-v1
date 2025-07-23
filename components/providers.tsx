// components/providers.tsx

'use client'

import React, { useState } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import { SupabaseProvider } from '@/components/supabase-provider'
import { Toaster } from '@/components/ui/sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query' // <-- 1. Импортируем нужное
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export function Providers({ children }: { children: React.ReactNode }) {
  // 2. Создаем клиент для React Query
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  )

  return (
    // 3. Оборачиваем все в QueryClientProvider
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute='class' defaultTheme='dark' enableSystem={false}>
        <SupabaseProvider>
          {children}
          <Toaster />
        </SupabaseProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
