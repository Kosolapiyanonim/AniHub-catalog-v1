"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Создаём контекст, где будет храниться экземпляр Supabase-клиента.
 */
const SupabaseContext = createContext<SupabaseClient | null>(null)

interface SupabaseProviderProps {
  children: ReactNode
}

/**
 * Провайдер инициализирует клиент только один раз на стороне клиента
 * и делает его доступным всему React-дереву через контекст.
 */
export default function SupabaseProvider({ children }: SupabaseProviderProps) {
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
      throw new Error(
        "Supabase URL или ключ не заданы. Проверьте переменные окружения NEXT_PUBLIC_SUPABASE_URL и NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      )
    }

    return createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }, [])

  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>
}

/**
 * Хук для доступа к экземпляру Supabase-клиента.
 * Обязательно должен вызываться внутри SupabaseProvider.
 */
export function useSupabase(): SupabaseClient {
  const client = useContext(SupabaseContext)
  if (!client) {
    throw new Error("useSupabase должен вызываться внутри <SupabaseProvider>")
  }
  return client
}
