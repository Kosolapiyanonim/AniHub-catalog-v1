"use client"

import type React from "react"
import { createContext, useContext, useRef } from "react"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Create a singleton Supabase client so we don’t instantiate it
 * on every render.
 */
let browserSupabaseClient: SupabaseClient | null = null
function getBrowserClient() {
  if (!browserSupabaseClient) {
    browserSupabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return browserSupabaseClient
}

const SupabaseContext = createContext<SupabaseClient | null>(null)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const clientRef = useRef<SupabaseClient>(getBrowserClient())
  return <SupabaseContext.Provider value={clientRef.current}>{children}</SupabaseContext.Provider>
}

export function useSupabase() {
  return useContext(SupabaseContext)
}

/* provide a default export too */
export default SupabaseProvider
