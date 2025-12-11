"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import type { SupabaseClient, Session } from "@supabase/supabase-js"
import type { Database } from "@/lib/types"

type SupabaseContext = {
  supabase: SupabaseClient<Database>
  session: Session | null
}

export const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClientSupabaseClient())
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return <Context.Provider value={{ supabase, session }}>{children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}
