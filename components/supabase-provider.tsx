"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// -------- helpers -----------------------------------------------------------
let browserClient: SupabaseClient | null = null
function getBrowserClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }
  return browserClient
}

// -------- context -----------------------------------------------------------
const SupabaseContext = createContext<SupabaseClient | null>(null)

/**
 * SupabaseProvider – wraps the React tree and injects a browser-side Supabase client.
 */
export function SupabaseProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getBrowserClient(), [])
  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>
}

/**
 * useSupabase – access the singleton Supabase client from React components.
 */
export function useSupabase() {
  const ctx = useContext(SupabaseContext)
  if (!ctx) throw new Error("useSupabase must be used inside <SupabaseProvider>")
  return ctx
}

// optional default export for convenience
export default SupabaseProvider
