// /components/supabase-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient, Session } from "@supabase/supabase-js";

type SupabaseContextType = {
  supabase: SupabaseClient;
  session: Session | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
};

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => 
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to manually refresh session (exposed to components)
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session: refreshedSession } } = await supabase.auth.getSession();
      setSession(refreshedSession);
    } catch (error) {
      console.error("Error refreshing session:", error);
    }
  }, [supabase]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error("Error getting initial session:", error);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };
    
    getInitialSession();

    // Listen for auth state changes and auto-refresh
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setLoading(false);
    });

    // Auto-refresh session periodically to prevent JWT expiration
    // Refresh every 50 minutes (before 1 hour expiration)
    const refreshInterval = setInterval(async () => {
      try {
        const { data: { session: refreshedSession } } = await supabase.auth.getSession();
        if (refreshedSession) {
          setSession(refreshedSession);
        }
      } catch (error) {
        console.error("Error refreshing session:", error);
      }
    }, 50 * 60 * 1000); // 50 minutes

    // Listen for focus events to refresh session when user returns to tab
    // This helps sync session after token refresh on server
    const handleFocus = async () => {
      try {
        const { data: { session: refreshedSession } } = await supabase.auth.getSession();
        if (refreshedSession) {
          setSession(refreshedSession);
        }
      } catch (error) {
        console.error("Error refreshing session on focus:", error);
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [supabase]);

  return (
    <SupabaseContext.Provider value={{ supabase, session, loading, refreshSession }}>
      {children}
    </SupabaseContext.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === null) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};
