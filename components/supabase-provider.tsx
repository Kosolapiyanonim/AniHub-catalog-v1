"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types"

type SupabaseContext = {
  supabase: SupabaseClient<Database>
}

export const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClientSupabaseClient())

  return (
    <Context.Provider value={{ supabase }}>
      <>{children}</>
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}
