// /components/supabase-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient, Session } from "@supabase/supabase-js";

// Определяем тип для нашего контекста
type SupabaseContextType = {
  supabase: SupabaseClient;
  session: Session | null;
};

// Создаем сам контекст
const SupabaseContext = createContext<SupabaseContextType | null>(null);

// Создаем компонент-провайдер
export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase] = useState(() => createClientComponentClient());
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Получаем первоначальную сессию
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    getInitialSession();

    // Подписываемся на изменения состояния аутентификации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    // Отписываемся при размонтировании компонента
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <SupabaseContext.Provider value={{ supabase, session }}>
      {children}
    </SupabaseContext.Provider>
  );
}

// Создаем наш собственный хук useSupabase
export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (context === null) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};
