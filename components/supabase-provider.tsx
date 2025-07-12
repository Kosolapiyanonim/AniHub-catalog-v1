"use client"

import { createContext, useContext, type ReactNode } from "react"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/* -------------------------------------------------
   1.  Singleton Supabase browser client
   ------------------------------------------------- */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

let _client: SupabaseClient | null = null
function getBrowserClient() {
  if (_client) return _client
  // you can pass additional options if needed
  _client = createClient(supabaseUrl, supabaseAnonKey)
  return _client
}

/* -------------------------------------------------
   2.  React Context
   ------------------------------------------------- */
const SupabaseContext = createContext<SupabaseClient | null>(null)

/**
 * Provider that makes a singleton Supabase browser client
 * available to all child components.
 */
export function SupabaseProvider({ children }: { children: ReactNode }) {
  const supabase = getBrowserClient()

  return <SupabaseContext.Provider value={supabase}>{children}</SupabaseContext.Provider>
}

/**
 * Convenience hook to access the client.
 */
export function useSupabase() {
  return useContext(SupabaseContext)
}

/* default export for easier importing */
export default SupabaseProvider
